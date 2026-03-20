# Polyphony AI Web

AI-powered polyphonic music generation system based on Google Magenta.js - Pure frontend implementation

[中文文档](./README_CN.md) | [日本語](./README_JA.md)

## 🎵 Features

- ✅ Pure frontend implementation, no backend server required
- ✅ Support MusicXML and MXL file formats
- ✅ Four music styles: Classical, Jazz, Modern, Experimental
- ✅ 2-4 voice polyphonic generation
- ✅ Complete music rule engine (6 independent rules)
- ✅ Export to MusicXML, MXL, MIDI formats
- ✅ Service Worker caching for offline use
- ✅ Multi-language support (English/中文/日本語)

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Browser will automatically open at **http://localhost:3000/**

### Test Files

Test files are available in `test-files/` directory:
- Simple Test (simple_test.musicxml, simple_test.mxl)
- Twinkle Twinkle Little Star (twinkle-twinkle-little-star.mxl)
- Jasmine Flower 茉莉花 (jasmine-flower.mxl)
- Lightly Row (lightly-row.mxl)

### Build for Production

```bash
npm run build
```

## 📖 How to Use

1. **Upload Music File**
   - Support `.musicxml` and `.mxl` formats
   - Drag and drop or click to upload

2. **Configure Parameters**
   - Select music style (Classical/Jazz/Modern/Experimental)
   - Select voice count (2/3/4 voices)
   - Set generation length (4/8/16/32/64 measures)
   - Adjust temperature (0.5-2.0)

3. **Generate Polyphony**
   - Click "Generate Polyphony" button
   - First use requires downloading model (~100MB)
   - Wait for generation to complete

4. **Download Results**
   - MXL format (recommended, MuseScore default)
   - MusicXML format (plain text XML)
   - MIDI format (universal format)

## 🎼 Music Generation System

### Counterpoint Engine

The system uses a sophisticated counterpoint generation approach:

1. **Harmonic Framework on Strong Beats**
   - Establishes chord progressions on beats 1 and 3
   - Checks chord degrees (I, ii, iii, IV, V, vi, vii°)
   - Ensures harmonic stability

2. **Variations on Weak Beats**
   - Uses Magenta.js to generate melodic material
   - Adds passing tones and neighbor tones
   - Creates rhythmic independence

3. **Voice Leading Rules**
   - Avoids parallel fifths/octaves (Classical style)
   - Maintains smooth melodic lines
   - Prevents voice crossing
   - Ensures proper voice ranges

### Music Rule Engine

Complete rule engine with 6 independent rules:

- **VoiceRangeRule** - Voice range constraints
- **HarmonyRule** - Harmonic legality detection
- **VoiceLeadingRule** - Voice leading rules
- **ParallelFifthsRule** - Parallel fifths detection (Classical only)
- **ParallelOctavesRule** - Parallel octaves detection (Classical only)
- **VoiceCrossingRule** - Voice crossing detection

## 🌐 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Important**: The project root is `polyphony-web/`, not a subdirectory. The `vercel.json` is already configured correctly.

### GitHub Pages Deployment

```bash
# Build project
npm run build

# Deploy dist directory to gh-pages branch
```

## 📁 Project Structure

```
polyphony-web/
├── src/
│   ├── components/          # React components
│   ├── services/
│   │   ├── magenta/        # AI model integration
│   │   ├── musicxml/       # File parsing and building
│   │   ├── polyphony/      # Counterpoint engine
│   │   └── rules/          # Music rule engine (8 files)
│   ├── i18n/               # Internationalization
│   ├── utils/              # Utility functions
│   └── styles/             # Style files
├── public/                 # Static assets
├── test-files/             # Test music files
├── vercel.json             # Vercel configuration
└── package.json
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript 5 + Vite 5
- **AI Model**: Google Magenta.js (MusicRNN, MusicVAE)
- **UI Framework**: Bootstrap 5
- **Music Processing**: @tonejs/midi, JSZip
- **Deployment**: Vercel / GitHub Pages

## ⚠️ Notes

1. First use requires downloading ~100MB AI model, ensure good network connection
2. Recommended browsers: Chrome/Edge for best experience
3. Generation quality depends on input melody quality
4. AI-generated results may need manual adjustment

## 📄 License

MIT License

## 🙏 Acknowledgments

- Google Magenta.js - AI music generation
- lilypoint-main - Counterpoint rules reference

---

**Local Debug Link**: http://localhost:3000/

**GitHub Repository**: Upload all files except `node_modules/`, `dist/`, and `.DS_Store`

```bash
npm run build
```

## 📖 使用说明

1. **上传音乐文件**
   - 支持 `.musicxml` 和 `.mxl` 格式
   - 可以拖拽文件或点击上传

2. **配置参数**
   - 选择音乐风格（古典/流行/爵士/现代）
   - 选择声部数量（2/3/4声部）
   - 设置生成长度（4/8/16小节）
   - 调整温度参数（0.5-2.0）

3. **生成复调**
   - 点击"生成复调音乐"按钮
   - 首次使用需要下载模型（约100MB）
   - 等待生成完成

4. **下载结果**
   - MXL格式（推荐，MuseScore默认格式）
   - MusicXML格式（纯文本XML）
   - MIDI格式（通用格式）

## 🎼 音乐规则引擎

系统包含完整的音乐规则引擎，根据不同音乐风格应用相应规则：

- **VoiceRangeRule** - 声部范围限制
- **HarmonyRule** - 和声合法性检测
- **VoiceLeadingRule** - 声部进行规则
- **ParallelFifthsRule** - 平行五度检测（仅古典）
- **ParallelOctavesRule** - 平行八度检测（仅古典）
- **VoiceCrossingRule** - 声部交叉检测

## 🌐 部署

### Vercel 部署（推荐）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### GitHub Pages 部署

```bash
# 构建项目
npm run build

# 将 dist 目录部署到 gh-pages 分支
```

## 📁 项目结构

```
polyphony-web/
├── src/
│   ├── components/          # React组件
│   ├── services/
│   │   ├── magenta/        # AI模型集成
│   │   ├── musicxml/       # 文件解析和构建
│   │   └── rules/          # 音乐规则引擎（8个文件）
│   ├── utils/              # 工具函数
│   └── styles/             # 样式文件
├── public/                 # 静态资源
└── package.json
```

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript 5 + Vite 5
- **AI模型**: Google Magenta.js
- **UI框架**: Bootstrap 5
- **音乐处理**: @tonejs/midi, JSZip
- **部署**: Vercel / GitHub Pages

## 📝 开发文档

- [部署指南](DEPLOY.md) - 详细的部署说明
- [实现报告](IMPLEMENTATION_REPORT.md) - 技术实现细节

## ⚠️ 注意事项

1. 首次使用需要下载约100MB的AI模型，请确保网络连接良好
2. 推荐使用 Chrome/Edge 浏览器以获得最佳体验
3. 生成质量依赖于输入旋律的质量
4. AI生成的结果可能需要人工调整

## 📄 许可证

MIT License

## 🙏 致谢

- Google Magenta.js - AI音乐生成
- lilypoint-main - 复调规则参考
