import { useState, useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { auth } from "~/lib/auth.server";
import { authClient } from "~/lib/auth-client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 检查用户是否已登录
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // 如果已登录，重定向到首页
  if (session?.user) {
    return redirect("/");
  }

  return json({});
};

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google 登录失败，请稍后重试");
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: "/",
      });

      if (result.error) {
        // 调试：打印完整的错误对象
        console.log("[Auth] Full error object:", result.error);

        // Better Auth 可能会把错误信息放在不同的字段中
        const errorMsg = result.error.message ||
                        result.error.error?.message ||
                        (typeof result.error === 'string' ? result.error : null) ||
                        "发送邮件失败，请稍后重试";

        console.log("[Auth] Extracted error message:", errorMsg);

        // 如果是冷却时间错误，提取秒数并启动倒计时
        const cooldownMatch = errorMsg.match(/请等待 (\d+) 秒/);
        if (cooldownMatch) {
          const seconds = parseInt(cooldownMatch[1]);
          setCountdown(seconds);

          // 提取剩余次数（如果有）
          const remainingMatch = errorMsg.match(/还剩 (\d+) 次/);
          const remainingText = remainingMatch ? ` · 今天还剩 ${remainingMatch[1]} 次` : "";

          setError(`请稍候，${seconds} 秒后可以重新发送${remainingText}`);
        } else {
          setError(errorMsg);
        }
      } else {
        setEmailSent(true);
      }
    } catch (err: any) {
      console.error("Magic link error:", err);
      setError(err.message || "发送邮件失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 mx-4 animate-fade-in">
        {!emailSent ? (
          <>
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-hover mb-4">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900 mb-2">欢迎登录</h2>
              <p className="text-base leading-normal text-gray-600">选择您喜欢的登录方式</p>
            </div>

            {/* Magic Link Form */}
            <form onSubmit={handleMagicLinkSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  邮箱地址
                </label>
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isSubmitting || countdown > 0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-expo-out disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className={`p-4 border rounded-lg ${
                  countdown > 0
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-sm flex items-center ${
                    countdown > 0 ? 'text-yellow-700' : 'text-red-600'
                  }`}>
                    <svg
                      className="h-4 w-4 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {countdown > 0 ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      )}
                    </svg>
                    {countdown > 0 ? (
                      <span>
                        请稍候，<span className="font-bold text-yellow-800">{countdown}</span> 秒后可以重新发送
                      </span>
                    ) : (
                      error
                    )}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !email.trim() || countdown > 0}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-expo-out shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    发送中...
                  </span>
                ) : countdown > 0 ? (
                  <span className="flex items-center justify-center">
                    ⏱️ {countdown} 秒后可重新发送
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    📧 发送登录链接
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或使用</span>
              </div>
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm text-sm font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>使用 Google 登录</span>
            </button>

            {/* Info */}
            <p className="mt-6 text-center text-xs text-gray-500">
              登录即表示您同意我们的服务条款和隐私政策
            </p>
          </>
        ) : (
          /* Email Sent Success Screen */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold leading-tight tracking-tight text-gray-900 mb-2">
              邮件已发送！
            </h3>
            <p className="text-base leading-normal text-gray-600 mb-4">
              请检查 <span className="font-medium text-blue-600">{email}</span>{" "}
              的收件箱
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>📬 查看您的邮箱</strong>
              </p>
              <p className="text-sm text-blue-600 mt-1">
                点击邮件中的链接即可登录（5分钟内有效）
              </p>
            </div>
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
                setError("");
              }}
              className="text-blue-600 hover:underline text-sm font-medium transition-all duration-300 ease-expo-out hover:-translate-y-0.5"
            >
              ← 返回重新发送
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
