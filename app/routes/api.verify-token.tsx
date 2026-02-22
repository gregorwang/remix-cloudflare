import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { verifyImageToken } from "~/utils/imageToken.server";

// 验证token的响应类型
interface VerifyTokenResponse {
  valid: boolean;
  error?: string;
  expires?: number;
  expiresAt?: string;
  currentTime?: number;
  remainingTime?: number;
}

// Loader function for token verification - following Remix best practices
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const imageName = url.searchParams.get('imageName');

  // 验证必需参数
  if (!token || !imageName) {
    return json<VerifyTokenResponse>(
      { 
        valid: false, 
        error: 'Token and image name are required' 
      },
      { 
        status: 400,
        headers: {
          // 错误响应不缓存
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      }
    );
  }

  try {
    const verification = verifyImageToken(token, imageName);
    if (!verification.valid) {
      const status = verification.error === 'Invalid token format' ? 400 : 401;
      return json<VerifyTokenResponse>(
        {
          valid: false,
          error: verification.error || 'Invalid token'
        },
        {
          status,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          }
        }
      );
    }

    // 成功验证 - 可以短时间缓存验证结果
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresTimestamp = verification.expires!;
    const remainingTime = verification.remainingTime ?? Math.max(0, expiresTimestamp - currentTime);
    const cacheTime = Math.min(60, remainingTime); // 缓存时间不超过1分钟且不超过token剩余时间
    
    return json<VerifyTokenResponse>(
      {
        valid: true,
        expires: expiresTimestamp,
        expiresAt: new Date(expiresTimestamp * 1000).toISOString(),
        remainingTime
      },
      {
        headers: {
          // 验证成功可以短时间缓存，但不超过token剩余时间
          "Cache-Control": `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
          "Content-Type": "application/json",
        }
      }
    );
    
  } catch (error) {
    // TypeScript error handling
    const errorMessage = error instanceof Error ? error.message : 'Token validation failed';
    
    return json<VerifyTokenResponse>(
      {
        valid: false,
        error: errorMessage
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      }
    );
  }
}

// Error Boundary as required by ruler2.md
export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Token验证服务错误</h1>
          <p className="text-gray-600 mb-4">抱歉，token验证服务暂时不可用。</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    </div>
  );
} 

