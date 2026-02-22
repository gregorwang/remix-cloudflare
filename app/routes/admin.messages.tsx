import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { getSessionCached } from "~/lib/auth.server";
import { db } from "~/lib/db.server";
import { isAdmin } from "~/lib/constants";

type MessageRow = {
  id: number;
  user_id: string;
  username: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at?: string;
};

async function requireAdmin(request: Request) {
  const session = await getSessionCached(request);

  if (!session?.user) {
    throw redirect("/auth");
  }

  if (!isAdmin(session.user.id, session.user.email)) {
    throw redirect("/");
  }

  return session;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const status = url.searchParams.get('status') || 'all';
  const limit = 50;
  const offset = (page - 1) * limit;

  // 构建查询条件
  let whereClause = '';
  const params: string[] = [];
  if (status !== 'all') {
    whereClause = 'WHERE status = ?';
    params.push(status);
  }

  // 获取消息列表
  const allMessages = await db.prepare<MessageRow>(`
    SELECT * FROM messages
    ${whereClause}
    ORDER BY
      CASE
        WHEN status = 'pending' THEN 1
        WHEN status = 'approved' THEN 2
        ELSE 3
      END,
      created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  // 获取总数
  const totalCount = await db.prepare<{ count: number }>(`
    SELECT COUNT(*) as count FROM messages ${whereClause}
  `).get(...params);

  const pendingCount = await db.prepare<{ count: number }>(`
    SELECT COUNT(*) as count FROM messages WHERE status = 'pending'
  `).get();

  const totalPages = Math.ceil((totalCount?.count || 0) / limit);

  return json({
    messages: allMessages,
    pendingCount: pendingCount?.count || 0,
    currentPage: page,
    totalPages,
    totalCount: totalCount?.count || 0,
    status,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdmin(request);

  const formData = await request.formData();
  const messageId = formData.get("messageId") as string;
  const action = formData.get("action") as string;

  if (!messageId) {
    return json({ error: "消息ID不能为空" }, { status: 400 });
  }

  try {
    if (action === "approve") {
      await db.prepare(`
        UPDATE messages
        SET status = 'approved', updated_at = datetime('now')
        WHERE id = ?
      `).run(messageId);

      return json({ success: "消息已批准" });
    } else if (action === "reject") {
      await db.prepare(`
        UPDATE messages
        SET status = 'rejected', updated_at = datetime('now')
        WHERE id = ?
      `).run(messageId);

      return json({ success: "消息已拒绝" });
    } else if (action === "delete") {
      await db.prepare(`DELETE FROM messages WHERE id = ?`).run(messageId);
      return json({ success: "消息已删除" });
    } else {
      return json({ error: "无效的操作" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing message:", error);
    return json({ error: "操作失败，请稍后重试" }, { status: 500 });
  }
};

export default function AdminMessages() {
  const { messages, pendingCount, currentPage, totalPages, totalCount, status } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleAction = (messageId: number | string, action: string) => {
    fetcher.submit(
      { messageId: String(messageId), action },
      { method: "post" }
    );
  };

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="text-purple-600 hover:text-purple-700 mb-4 inline-block text-base font-medium leading-normal">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900">消息管理</h1>
          <p className="mt-2 text-base leading-normal text-gray-600">
            待审核: <span className="font-semibold text-purple-600">{pendingCount}</span> 条
            | 总计: {totalCount} 条
          </p>
        </div>

        {/* 状态筛选 */}
        <div className="mb-4 flex gap-2">
          <Link
            to="/admin/messages?status=all"
            className={`px-4 py-2 rounded text-sm font-medium ${status === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}
          >
            全部
          </Link>
          <Link
            to="/admin/messages?status=pending"
            className={`px-4 py-2 rounded text-sm font-medium ${status === 'pending' ? 'bg-accent text-white' : 'bg-primary-100 text-primary-950'}`}
          >
            待审核
          </Link>
          <Link
            to="/admin/messages?status=approved"
            className={`px-4 py-2 rounded text-sm font-medium ${status === 'approved' ? 'bg-accent text-white' : 'bg-primary-100 text-primary-950'}`}
          >
            已批准
          </Link>
          <Link
            to="/admin/messages?status=rejected"
            className={`px-4 py-2 rounded text-sm font-medium ${status === 'rejected' ? 'bg-accent text-white' : 'bg-primary-100 text-primary-950'}`}
          >
            已拒绝
          </Link>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  内容
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-base leading-normal text-gray-500">
                    暂无消息
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} className={msg.status === 'pending' ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold leading-normal text-gray-900">{msg.username}</div>
                      <div className="text-sm leading-normal text-gray-500">{msg.user_id?.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm leading-normal text-gray-900 max-w-md">{msg.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        msg.status === 'approved' ? 'bg-green-100 text-green-800' :
                        msg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {msg.status === 'approved' ? '已批准' :
                         msg.status === 'pending' ? '待审核' : '已拒绝'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm leading-normal text-gray-500">
                      {new Date(msg.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium leading-normal">
                      <div className="flex justify-end gap-2">
                        {msg.status !== 'approved' && (
                          <button
                            onClick={() => handleAction(msg.id, 'approve')}
                            disabled={fetcher.state !== 'idle'}
                            className="text-sm font-medium leading-normal text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            批准
                          </button>
                        )}
                        {msg.status !== 'rejected' && (
                          <button
                            onClick={() => handleAction(msg.id, 'reject')}
                            disabled={fetcher.state !== 'idle'}
                            className="text-sm font-medium leading-normal text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                          >
                            拒绝
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(msg.id, 'delete')}
                          disabled={fetcher.state !== 'idle'}
                          className="text-sm font-medium leading-normal text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {currentPage > 1 && (
              <Link
                to={`?page=${currentPage - 1}&status=${status}`}
                className="px-4 py-2 bg-white rounded text-sm font-medium hover:bg-gray-100"
              >
                上一页
              </Link>
            )}
            <span className="px-4 py-2 bg-white rounded text-sm font-medium leading-normal">
              第 {currentPage} / {totalPages} 页
            </span>
            {currentPage < totalPages && (
              <Link
                to={`?page=${currentPage + 1}&status=${status}`}
                className="px-4 py-2 bg-white rounded text-sm font-medium hover:bg-gray-100"
              >
                下一页
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

