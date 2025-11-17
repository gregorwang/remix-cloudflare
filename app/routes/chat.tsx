import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { pageMeta } from "~/utils/seo";
// Replaced heroicons with simple emoji symbols for better performance

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPageData {
  content: {
    title: string;
    description: string;
    welcome_title: string;
    welcome_subtitle: string;
    preset_questions: {
      question1: string;
      question2: string;
      question3: string;
      question4: string;
    };
    user_label: string;
    assistant_label: string;
    actions: {
      helpful: string;
      not_helpful: string;
      copy: string;
    };
    thinking: string;
    placeholder: string;
    upload_files: string;
    enter_to_send: string;
    shift_enter_newline: string;
    privacy_notice: string;
    initial_message: string;
  };
}

// 优化的Links函数 - 减少不必要的预加载
export const links: LinksFunction = () => [];

// Meta function
export const meta: MetaFunction = () => pageMeta.chat();

// 优化的Loader函数 - 静态数据，更长的缓存时间
export async function loader() {
  const data: ChatPageData = {
    content: {
      title: "聊天室",
      description: "与我交流想法和观点",
      welcome_title: "聊天室 - 与Nemesis对话",
      welcome_subtitle: "你好，我是Nemesis，一个基于汪家俊意识构建的AI助手",
      preset_questions: {
        question1: "什么是汪家俊的疯狂自我意识？",
        question2: "为什么这个AI对话角色叫做Nemesis？",
        question3: "汪家俊是谁？他来自何方？",
        question4: "汪家俊现在在做什么工作？"
      },
      user_label: "您",
      assistant_label: "Nemesis",
      actions: {
        helpful: "有帮助",
        not_helpful: "没有帮助",
        copy: "复制"
      },
      thinking: "思考中...",
      placeholder: "输入你想了解的问题...",
      upload_files: "上传文件",
      enter_to_send: "按回车发送",
      shift_enter_newline: "Shift+回车换行",
      privacy_notice: "网站会记录您的IP地址和账户，请不要输入任何非法有害信息。",
      initial_message: "你好！我是Nemesis，基于汪家俊意识构建的AI助手。有什么想了解的吗？"
    }
  };

  // 由于这是静态数据，可以设置更长的缓存时间
  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=172800", // 24小时缓存
      "Vary": "Accept-Encoding",
    },
  });
}

export default function ChatPage() {
  const { content } = useLoaderData<typeof loader>();
  
  // State management - 为RSC准备，最小化客户端状态
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: content.initial_message }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整文本区域高度
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  // 处理回车键
  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.shiftKey) {
      // Shift+Enter 换行
      return;
    } else {
      // 只有Enter键，发送消息
      e.preventDefault();
      sendMessage();
    }
  };

  // 使用预设问题
  const handlePresetQuestion = (question: string) => {
    setInputMessage(question);
    // 移除不必要的setTimeout，直接执行
    adjustTextareaHeight();
    sendMessage(question);
  };

  // ASCII艺术回复库
  const getRandomAsciiResponse = () => {
    const responses = [
      `
╔═══════════════════════════════════════╗
║   汪家俊工作进度查询系统 v2.0         ║
╠═══════════════════════════════════════╣
║                                       ║
║   █████████████████████░░  99.99%     ║
║                                       ║
║   当前状态: 正在思考人生               ║
║   预计完成: ∞ 天后                     ║
║   工作效率: 极低                       ║
║                                       ║
╚═══════════════════════════════════════╝`,
      `
    ╭─────────────────────╮
    │   汪家俊の日常      │
    ╰─────────────────────╯

       ___
      /   \\      今日活动:
     | O O |
      \\___/      [ ] 写代码
       | |       [√] 喝咖啡
      /| |\\      [√] 摸鱼
     / |_| \\     [√] 发呆
                 [ ] 加班

    结论: 今日份摸鱼完成✓`,
      `
╔════════════════════════════════════╗
║  Nemesis AI 系统状态               ║
╠════════════════════════════════════╣
║                                    ║
║  🎯 训练进度:  [░░░░░░░░░░] 0.01%  ║
║  🧠 智能等级:  计算中...            ║
║  💬 对话能力:  开发中               ║
║  📊 数据集量:  需要更多咖啡          ║
║                                    ║
║  预计上线时间: 假的喵，上线时间待定 ║
║  当前状态: 咕咕咕中...              ║
║                                    ║
╚════════════════════════════════════╝`,
      `
    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    █                    █
    █   汪家俊在哪里？    █
    █                    █
    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

       /\\_/\\
      ( o.o )   搜索中...
       > ^ <
      /|   |\\
     (_|   |_)

    [█████░░░░░] 50%

    系统分析:
    可能在摸鱼 (概率 89%)
    可能在写代码 (概率 10%)
    可能在加班 (概率 1%)

    错误: 目标太过神秘, 无法定位`,
      `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚡ Nemesis 意识流分析 ⚡  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                            ┃
┃  检测到好奇心 +100         ┃
┃  ┏━━━━━━━━━━━━━━━━━┓      ┃
┃  ┃  █▓▒░ 分析中  ┃      ┃
┃  ┗━━━━━━━━━━━━━━━━━┛      ┃
┃                            ┃
┃  核心特征:                 ┃
┃  ▸ 代码是他的武器           ┃
┃  ▸ 咖啡是他的燃料           ┃
┃  ▸ Bug是他的宿敌            ┃
┃  ▸ 创造是他的追求           ┃
┃                            ┃
┃  [数据加载中...]           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
      `
    ╔══════════════════════╗
    ║  404 NOT FOUND       ║
    ╚══════════════════════╝

         _____
        |     |    您查询的信息
        |  ?  |
        |_____|    暂时无法访问...
          | |
         /   \\
        /     \\

    可能原因:
    1. 数据库维护中
    2. AI正在摸鱼
    3. 服务器去喝咖啡了

    ═══ 请稍后再试 ═══`,
      `
╔═══════════════════════════════════════╗
║         汪家俊档案系统                ║
╠═══════════════════════════════════════╣
║                                       ║
║        ___                            ║
║       /   \\                           ║
║      | o_o |    身份: 学徒（代码小工）       ║
║       \\___/                           ║
║        | |      爱好: 写代码、摸鱼    ║
║       /| |\\                           ║
║                                       ║
║  ⚙️  技能树:                          ║
║  ├─ 前端开发 ████████░░ 10%           ║
║  ├─ 后端开发 ███████░░░ 10%           ║
║  ├─ 摸鱼技能 ██████████ 100%          ║
║  └─ 调试能力 █████░░░░░ 10%           ║
║                                       ║
║  💭 当前想法: 代码能跑就行...          ║
║                                       ║                                       ║
╚═══════════════════════════════════════╝`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // 发送消息（模拟版本 - 不调用真实API）
  const sendMessage = async (messageToSend?: string) => {
    const message = messageToSend || inputMessage;
    if (!message.trim() || isLoading) return;

    // 添加用户消息
    const newUserMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setError(null);
    setIsLoading(true);

    // 重置textarea高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    scrollToBottom();

    // 模拟API延迟 (1-2.5秒)
    const delay = 1000 + Math.random() * 1500;

    await new Promise(resolve => setTimeout(resolve, delay));

    // 获取随机ASCII艺术回复
    const asciiResponse = getRandomAsciiResponse();

    // 添加AI回复
    const newAssistantMessage: Message = {
      role: 'assistant',
      content: asciiResponse
    };

    setMessages(prev => [...prev, newAssistantMessage]);
    setIsLoading(false);
    scrollToBottom();
  };

  // 复制消息内容 - 简化逻辑
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content).catch(() => {
      // 如果复制失败，用户在控制台能看到，不需要复杂错误处理
    });
  };

  // 监听输入变化
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  // 页面加载时聚焦输入框 - 简化逻辑
  useEffect(() => {
    textareaRef.current?.focus();
    scrollToBottom();
  }, []);

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="flex flex-col min-h-screen font-sans">
        {/* 顶部导航栏 */}
        <header className="py-3 px-4 border-b border-primary-100">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center group" prefetch="intent">
              <div className="h-8 w-8 mr-2 bg-accent rounded-lg flex items-center justify-center transition-all duration-300 ease-expo-out hover:bg-accent-hover group-hover:-translate-y-0.5 group-hover:shadow-lg">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <h1 className="text-lg font-semibold text-primary-950 transition-colors duration-300 ease-expo-out group-hover:text-accent">Nemesis</h1>
            </Link>
            <div className="flex items-center gap-2">
              <button className="p-2 text-primary-950/70 hover:text-primary-950 rounded hover:bg-primary-100 transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0">
                <span className="text-lg">➕</span>
              </button>
              <button className="p-2 text-primary-950/70 hover:text-primary-950 rounded hover:bg-primary-100 transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0">
                <span className="text-lg">⋯</span>
              </button>
            </div>
          </div>
        </header>

        {/* 主体区域 */}
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6">
          {/* 欢迎信息 */}
          {messages.length <= 1 && (
            <div className="mb-8 text-center py-16">
              <h2 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950 mb-3">{content.welcome_title}</h2>
              <p className="text-base leading-relaxed text-primary-950/70 mb-6">{content.welcome_subtitle}</p>
              
              {/* 建议问题 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <button
                  onClick={() => handlePresetQuestion(content.preset_questions.question1)}
                  className="bg-primary-100 hover:bg-primary-100/80 text-primary-950 py-3 px-4 rounded-xl text-left transition-all duration-300 ease-expo-out text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm animate-fade-in"
                  style={{ animationDelay: '100ms' }}
                >
                  {content.preset_questions.question1}
                </button>
                <button
                  onClick={() => handlePresetQuestion(content.preset_questions.question2)}
                  className="bg-primary-100 hover:bg-primary-100/80 text-primary-950 py-3 px-4 rounded-xl text-left transition-all duration-300 ease-expo-out text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm animate-fade-in"
                  style={{ animationDelay: '150ms' }}
                >
                  {content.preset_questions.question2}
                </button>
                <button
                  onClick={() => handlePresetQuestion(content.preset_questions.question3)}
                  className="bg-primary-100 hover:bg-primary-100/80 text-primary-950 py-3 px-4 rounded-xl text-left transition-all duration-300 ease-expo-out text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm animate-fade-in"
                  style={{ animationDelay: '200ms' }}
                >
                  {content.preset_questions.question3}
                </button>
                <button
                  onClick={() => handlePresetQuestion(content.preset_questions.question4)}
                  className="bg-primary-100 hover:bg-primary-100/80 text-primary-950 py-3 px-4 rounded-xl text-left transition-all duration-300 ease-expo-out text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm animate-fade-in"
                  style={{ animationDelay: '250ms' }}
                >
                  {content.preset_questions.question4}
                </button>
              </div>
            </div>
          )}

                   {/* 聊天记录区域 */}
           <div ref={chatWindowRef} className="flex-1 overflow-y-auto space-y-6 mb-6 chat-scrollbar">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* 消息标签 */}
                <div className="mb-1 px-2 text-sm text-primary-950/70">
                  {message.role === 'user' ? content.user_label : content.assistant_label}
                </div>
                
                {/* 消息内容 */}
                <div className={`max-w-[90%] rounded-2xl p-4 transition-all duration-300 ease-expo-out ${
                  message.role === 'user' 
                    ? 'bg-accent text-white' 
                    : 'bg-primary-100 text-primary-950'
                }`}>
                  <p className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</p>
                </div>
                
                {/* 消息底部操作 */}
                {message.role === 'assistant' && index > 0 && (
                  <div className="mt-2 flex space-x-2">
                    <button className="p-1 text-primary-950/50 hover:text-accent text-xs flex items-center transition-colors duration-300 ease-expo-out">
                      <span className="mr-1">👍</span>
                      {content.actions.helpful}
                    </button>
                    <button className="p-1 text-primary-950/50 hover:text-accent text-xs flex items-center transition-colors duration-300 ease-expo-out">
                      <span className="mr-1">👎</span>
                      {content.actions.not_helpful}
                    </button>
                    <button 
                      onClick={() => copyMessage(message.content)}
                      className="p-1 text-primary-950/50 hover:text-accent text-xs flex items-center transition-colors duration-300 ease-expo-out"
                    >
                      <span className="mr-1">📋</span>
                      {content.actions.copy}
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* 加载状态 */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="mb-1 px-2 text-sm text-primary-950/70">
                  {content.assistant_label}
                </div>
                <div className="bg-primary-100 rounded-2xl p-4 max-w-[90%]">
                  <div className="flex items-center space-x-2">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="text-primary-950/70 text-sm">{content.thinking}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 错误提示 */}
            {error && (
              <div className="flex justify-center">
                <div className="bg-accent/10 border border-accent rounded-xl p-3 text-accent-hover text-sm">
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="border border-primary-100 rounded-xl bg-primary-100 shadow-sm">
            <div className="relative">
              <textarea 
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleEnter}
                placeholder={content.placeholder}
                className="w-full p-4 pr-24 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-accent min-h-[60px] max-h-[200px] bg-primary-100 text-primary-950 placeholder:text-primary-950/50"
                rows={1}
              />
              <div className="absolute right-3 bottom-3 flex gap-2">
                <button 
                  className="p-2 text-primary-950/50 hover:text-accent rounded transition-colors duration-300 ease-expo-out"
                  title={content.upload_files}
                >
                  <span className="text-lg">📤</span>
                </button>
                <button 
                  onClick={() => sendMessage()}
                  className="bg-accent text-white p-2 rounded hover:bg-accent-hover transition-colors duration-300 ease-expo-out disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputMessage.trim() || isLoading}
                >
                  <span className="text-lg">✈️</span>
                </button>
              </div>
            </div>
            <div className="px-4 py-2 text-xs text-primary-950/70 border-t border-primary-100 flex justify-between items-center">
              <span>{content.enter_to_send}</span>
              <span>{content.shift_enter_newline}</span>
            </div>
          </div>
          
          {/* 底部提示 */}
          <p className="text-center text-primary-950/70 text-xs mt-4">
            {content.privacy_notice}
          </p>

          {/* 返回首页链接 */}
          <div className="text-center mt-4">
            <Link
              to="/"
              prefetch="intent"
              className="text-accent hover:text-accent-hover transition-colors duration-300 ease-expo-out text-sm font-medium"
            >
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="bg-primary-100 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold leading-tight tracking-tight text-primary-950 mb-2">聊天室错误</h1>
          <p className="text-base leading-relaxed text-primary-950/70 mb-4">抱歉，聊天室暂时无法使用。</p>
          <Link
            to="/"
            prefetch="intent"
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-300 ease-expo-out inline-block"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 