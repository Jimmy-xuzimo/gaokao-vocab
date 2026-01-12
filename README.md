# 🎓 Gaokao Vocab Master (高考单词大师)

一款专为高中生设计的高效英语单词记忆应用。内置完整高考 3500 词，界面美观大气，交互流畅，助你轻松攻克英语词汇关！

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)
![Vite](https://img.shields.io/badge/Vite-4.0-646CFF.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)
<img width="4400" height="2722" alt="image" src="https://github.com/user-attachments/assets/4cce53f7-beb6-49bc-9773-6f902bae4486" />

## ✨ 功能特性 (Features)

*   **📚 完整词库**：收录高考英语大纲 3500 词，包含音标、词性及详细中文释义。
*   **📊 可视化进度**：主页仪表盘实时展示背诵进度环，学习成就一目了然。
*   **🧠 沉浸式背诵 (Study Mode)**：
    *   精心设计的单词卡片，支持点击翻转查看释义。
    *   **“Mastered!”**：标记已掌握，进度条自动增加，不再重复出现。
    *   **“Review Later”**：标记待复习，放入循环队列，加深记忆。
    *   支持左右切换和防误触操作。
*   **📝 每日一测 (Daily Quiz)**：
    *   智能算法随机抽取 20 个单词。
    *   标准四选一题型，答错/答对即时颜色反馈。
    *   测验结束生成分数报告。
*   **🔍 全能词典**：
    *   支持英文单词或中文释义搜索。
    *   采用无限滚动 (Infinite Scroll) 技术，流畅加载 3500 词长列表。
    *   在列表中也可直接标记单词为“已掌握”。
*   **📱 响应式设计**：完美适配手机、平板 (iPad) 和电脑桌面端。
*   **💾 本地持久化**：学习进度自动保存到浏览器本地 (LocalStorage)，无需联网，随时随地接着背。

## 🛠️ 技术栈 (Tech Stack)

本项目采用现代前端技术栈构建，轻量且高效：

*   **Core**: [React 18](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (为了极致轻量，采用 CDN 方式引入)

## 🚀 快速开始 (Quick Start)

如果你想在本地运行或修改此项目：

1.  **克隆项目**
    ```bash
    git clone https://github.com/Jimmy-xuzimo/gaokao-vocab.git
    cd gaokao-vocab
    ```

2.  **安装依赖**
    确保你的电脑已安装 [Node.js](https://nodejs.org/)。
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    打开浏览器访问 `http://localhost:5173` 即可开始使用。

4.  **打包构建**
    ```bash
    npm run build
    ```

## ☁️ 部署 (Deployment)

本项目已针对 **Vercel** 进行优化，推荐使用 Vercel 进行免费部署：

1.  将代码上传至 GitHub。
2.  登录 [Vercel](https://vercel.com/)，点击 "Add New Project"。
3.  导入你的 GitHub 仓库。
4.  Framework Preset 保持默认 (Vite)。
5.  点击 **Deploy**，等待约 1 分钟即可获得在线访问链接。

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进这个项目。

## 📄 许可证

MIT License. 祝各位学子金榜题名！🎉
