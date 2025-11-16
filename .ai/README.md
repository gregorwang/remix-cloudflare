# AI 配置文件夹

此文件夹包含专门为AI编程助手准备的工作流程指南和规则。

---

## 📁 文件说明

### `design-system-rules.md`
**用途**: 简洁版规则，适合AI快速加载
**适用场景**: 设计系统相关的修改任务
**目标读者**: Trae, Cursor, Copilot等AI IDE

### 详细指南（在 `docs/ai-workflows/` 目录）
`DESIGN_SYSTEM_MODIFICATION_GUIDE.md` - 完整的工作流程文档，包含案例分析

---

## 🚀 如何让Trae使用这些规则

### 方法1: 在Prompt中引用（推荐）

当你要修改设计系统相关代码时，这样提问：

```
@.ai/design-system-rules.md

请按照设计规则，根据 docs/design-system/01-colors.md 修改 app/routes/xiao.tsx
```

### 方法2: 添加到Trae配置文件

如果Trae支持自定义规则文件：

1. 打开Trae设置
2. 找到"Custom Instructions"或"Rules File"
3. 添加路径：`.ai/design-system-rules.md`

### 方法3: 复制到项目根目录

某些AI IDE会自动读取根目录的 `.cursorrules` 或 `.aiconfig`：

```bash
# 复制规则到根目录
cp .ai/design-system-rules.md .cursorrules

# 或者
cp .ai/design-system-rules.md .aiconfig
```

---

## 💡 使用技巧

### 技巧1: 明确任务类型

告诉AI你的任务属于哪个类别：

```markdown
# ✅ 好的提问
"这是一个设计系统修改任务：根据 01-colors.md 修改 xiao.tsx"

# ❌ 模糊的提问
"改一下背景色"
```

### 技巧2: 提供完整上下文

```markdown
# ✅ 好的提问
"按照 docs/design-system/01-colors.md 的颜色规范，
 修改 app/routes/xiao.tsx，
 替换所有非设计系统颜色（如 slate-50, gray-700）
 为设计系统颜色（primary-50, primary-950, accent）"

# ❌ 不够明确
"把背景改成设计系统的颜色"
```

### 技巧3: 要求AI自检

```markdown
在开始修改前，请：
1. 读取设计文档
2. 用Grep找出所有需要修改的颜色
3. 告诉我预计要改多少处

修改完成后，请：
1. 运行 npm run build 验证
2. 告诉我修改了多少处
3. 确认构建成功
```

---

## 📊 效果对比

### 不使用规则文件

```
用户: "改一下背景色"
AI: "好的，已修改" (只改了1-2处)
用户: "还是白色啊"
AI: "抱歉，我再改" (又改了3-4处)
用户: "还是不对！"
AI: "让我重新看看..." (第3轮修改)
→ 结果：浪费30分钟，仍未解决
```

### 使用规则文件

```
用户: "@.ai/design-system-rules.md 按照 01-colors.md 改 xiao.tsx"
AI: "收到，按照DRCTV流程执行：
     1. 已读取设计文档和代码
     2. 找到40处需要修改的颜色
     3. 正在系统性替换..."
AI: "修改完成，已通过构建验证 ✅"
→ 结果：5分钟，一次性解决
```

---

## 🎯 适用场景

这套规则适用于：

- ✅ 修改颜色系统
- ✅ 修改字体系统
- ✅ 修改间距系统
- ✅ 统一设计风格
- ✅ 重构Tailwind类名

不适用于：

- ❌ 新增功能
- ❌ 修复Bug
- ❌ 性能优化
- ❌ API集成

---

## 🔧 故障排除

### 问题1: AI说"找不到规则文件"

**解决方法**：
```bash
# 检查文件是否存在
ls .ai/design-system-rules.md

# 使用绝对路径引用
@C:\Users\汪家俊\mynuxt\remix\.ai\design-system-rules.md
```

### 问题2: AI仍然不遵循规则

**解决方法**：
```markdown
在Prompt最前面强调：

"严格遵循 .ai/design-system-rules.md 中的规则，
特别是 DRCTV 五步法和强制验证构建。"
```

### 问题3: AI说"规则太复杂"

**解决方法**：
```markdown
"只需遵循3个核心原则：
1. 系统性修改（不允许遗漏）
2. 深色模式（每个类都要有dark:变体）
3. 构建验证（运行 npm run build）"
```

---

## 📈 进阶用法

### 创建自定义规则

你可以为其他场景创建规则文件：

```bash
.ai/
├── design-system-rules.md     # 设计系统修改
├── api-integration-rules.md   # API集成
├── performance-rules.md       # 性能优化
└── testing-rules.md           # 测试编写
```

然后在Prompt中引用：
```
@.ai/api-integration-rules.md 集成支付API
```

---

## 🤝 贡献

如果你发现规则不够完善，欢迎补充：

1. 在 `.ai/design-system-rules.md` 添加新规则
2. 在 `docs/ai-workflows/` 添加详细案例
3. 测试规则是否有效

---

## 📞 反馈

如果规则帮助你节省了时间，或者你有改进建议：

- 在项目中创建Issue
- 或者直接修改规则文件并提交PR

---

**最后提醒**：

规则文件只是工具，关键还是要让AI理解**为什么**要这样做。

如果AI仍然不遵循规则，可能是因为：
1. Prompt不够明确
2. AI的上下文窗口太小
3. AI没有能力理解设计系统

这时候，考虑：
- 使用更强的AI模型（如Claude Sonnet 4.5）
- 分步骤执行，每步确认
- 或者手动修改（有时最快）

---

**Good luck!** 🚀
