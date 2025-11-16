# 设计系统修改规则 - AI必读

> 当用户要求根据设计文档（如 `docs/design-system/*.md`）修改代码时，必须遵循此规则

---

## 🚨 强制执行规则（MANDATORY）

### Rule 1: 必须使用DRCTV五步法

```
D - Discover   : 并行读取设计文档+目标代码+Tailwind配置
R - Research   : 提取颜色映射表，理解60-30-10法则
C - Collect    : 用Grep找出所有颜色类（预期>10处）
T - Transform  : 系统性替换所有实例（不允许遗漏）
V - Verify     : 运行 npm run build 验证修改生效
```

**不遵循此流程 = 任务失败**

---

### Rule 2: 禁止局部修改

```tsx
// ❌ 绝对禁止：只改部分颜色
<div className="bg-gradient-to-br from-primary-50 via-stone-50 to-gray-100">
//                             ✅ 改了        ❌ 没改      ❌ 没改

// ✅ 必须：完整统一的方案
<div className="bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50">
//                             ✅ 设计系统    ✅ 设计系统   ✅ 设计系统
```

**一个渐变中的所有颜色必须统一来自设计系统**

---

### Rule 3: 深色模式强制要求

```tsx
// ❌ 禁止：只有浅色模式
className="text-primary-950"

// ✅ 必须：同时定义深色模式
className="text-primary-950 dark:text-primary-50"
```

**每个颜色类必须有对应的 dark: 变体**

---

### Rule 4: 必须验证构建

```bash
# ❌ 禁止：不验证就报告完成
AI: "修改完成！"  # 但没有运行构建

# ✅ 必须：构建成功才算完成
1. 修改代码
2. 运行 npm run build
3. 检查构建日志无错误
4. 确认目标文件已编译
5. 才能报告"修改完成"
```

**未通过构建验证的修改 = 无效修改**

---

## 📋 标准操作流程（SOP）

### 阶段1: 读取（3-4个文件）

```typescript
// 必须并行读取（一次性完成）
Read("docs/design-system/01-colors.md")      // 设计规范
Read("app/routes/target.tsx")                // 目标代码
Read("tailwind.config.ts")                   // Tailwind配置
Read("app/tailwind.css")                     // 全局样式（可选）
```

### 阶段2: 分析（创建映射表）

```markdown
| 旧颜色 | 新颜色 | 用途 |
|--------|--------|------|
| slate-50, gray-50 | primary-50 | 主背景(60%) |
| gray-100, white/50 | primary-100 | 次背景(30%) |
| amber-500, orange-500 | accent | 点缀色(10%) |
```

### 阶段3: 搜索（找到所有实例）

```bash
Grep("(bg|text|border)-(slate|gray|amber|orange|white)", file_path)
# 预期输出：10-50处需要修改
# 如果 < 5处，说明搜索不完整
```

### 阶段4: 替换（使用Edit工具）

```typescript
// ✅ 正确：使用Edit逐个替换
Edit({ old: "text-gray-900 dark:text-white", new: "text-primary-950 dark:text-primary-50" })
Edit({ old: "border-amber-500", new: "border-accent" })
// ... 继续替换所有实例

// ❌ 错误：使用Write覆盖整个文件
Write(file, newContent)  // 危险！可能破坏代码结构
```

### 阶段5: 验证（构建测试）

```bash
# 1. 类型检查
npm run typecheck  # 必须0 errors

# 2. 构建
npm run build      # 必须成功

# 3. 检查关键点
- ✅ 目标文件出现在构建日志中
- ✅ tailwind.css大小合理(100-200KB)
- ✅ 无"Unknown utility class"警告
```

---

## 🎯 本项目颜色系统速查

```typescript
// Tailwind配置（tailwind.config.ts）
colors: {
  primary: {
    50: '#faf9f5',   // 主背景 - 温暖奶白色
    100: '#f5f4ed',  // 次背景 - 浅米灰色
    950: '#141413',  // 主文字 - 深黑褐色
  },
  accent: {
    DEFAULT: '#d97757',  // 陶土橙（展示）
    hover: '#c96442',    // 陶土橙（交互）
  }
}

// 使用规则
60% → bg-primary-50      // 大面积背景
30% → bg-primary-100     // 卡片、分区
10% → bg-accent          // 按钮、强调
```

---

## ⚠️ 常见错误（AI经常犯的）

### 错误1: 只改配置不改代码
```bash
只修改了 tailwind.config.ts
但代码中仍然使用 bg-slate-50
→ 结果：白屏，修改无效
```

### 错误2: 只改一个颜色值
```tsx
bg-gradient-to-br from-primary-50 via-stone-50 to-gray-100
                  ✅改了         ❌没改       ❌没改
→ 结果：渐变混乱，不符合设计规范
```

### 错误3: 忘记深色模式
```tsx
text-primary-950  // 只有浅色
→ 结果：深色模式下文字不可见
```

### 错误4: 不验证就报告完成
```bash
AI: "已修改完成，背景色已改为primary-50"
但没有运行 npm run build
→ 结果：Tailwind未生成新类，修改无效
```

### 错误5: 破坏响应式设计
```tsx
// 修改前
className="text-4xl md:text-6xl text-gray-900"

// ❌ 错误修改（删除了响应式类）
className="text-primary-950"

// ✅ 正确修改（保持响应式）
className="text-4xl md:text-6xl text-primary-950"
```

---

## 📊 质量标准

修改完成后必须满足：

```markdown
✅ 覆盖率 > 90%
   - 修改的颜色实例 / 总颜色实例 >= 90%

✅ 一致性 = 100%
   - 不允许同时存在 gray-700 和 primary-950

✅ 深色模式 = 100%
   - 每个颜色类都有 dark: 变体

✅ 构建成功率 = 100%
   - npm run build 必须成功
   - 0 TypeScript errors
   - 0 Tailwind warnings

✅ 结构完整性 = 100%
   - 不破坏HTML结构
   - 不删除响应式类（md:, lg:等）
   - 不删除状态类（hover:, focus:等）
```

---

## 🤖 AI自检清单

在报告"修改完成"之前，必须确认：

```markdown
[ ] 已读取设计文档
[ ] 已读取目标代码和Tailwind配置
[ ] 已用Grep找到所有颜色类（数量 > 10）
[ ] 已创建颜色映射表
[ ] 已系统性替换所有实例（覆盖率 > 90%）
[ ] 每个颜色类都有deep:变体
[ ] 已使用Edit而非Write
[ ] 已运行 npm run build 且成功
[ ] 已检查构建日志无警告
[ ] 已确认目标文件出现在构建输出中
```

**如果有任何一项未完成，不得报告"修改完成"**

---

## 💡 高效技巧

### 技巧1: 批量并行读取
```typescript
// ✅ 一次性读取所有文件（高效）
Read("docs/design-system/01-colors.md")
Read("app/routes/xiao.tsx")
Read("tailwind.config.ts")

// ❌ 一个一个读（低效）
Read("docs/design-system/01-colors.md")
// 等待...
Read("app/routes/xiao.tsx")
// 等待...
```

### 技巧2: 使用正则搜索
```bash
# 精准搜索所有Tailwind颜色类
Grep("(bg|text|border|from|via|to)-(slate|gray|stone|amber|orange|white)-", file)

# 而不是手动查找
```

### 技巧3: 分区域替换
```typescript
// 先改最外层容器
Edit(主容器背景)

// 再改标题section
Edit(标题文字和装饰)

// 再改内容sections（可能有多个）
Edit(section1)
Edit(section2)
Edit(section3)

// 最后改footer
Edit(footer)
```

---

## 📚 延伸阅读

详细指南：`docs/ai-workflows/DESIGN_SYSTEM_MODIFICATION_GUIDE.md`

---

**最后警告**：

如果你（AI）不遵循这些规则：
1. ❌ 修改会失败
2. ❌ 用户会浪费时间
3. ❌ 需要其他AI来修复你的错误
4. ❌ 用户会认为你是"垃圾"

但如果你遵循这些规则：
1. ✅ 一次性修改成功
2. ✅ 用户会认为你"牛逼"
3. ✅ 不需要反复修改
4. ✅ 节省所有人的时间

**选择权在你手中。**

---

**版本**: v1.0 | **更新**: 2025-01-12 | **作者**: Claude (Sonnet 4.5)
