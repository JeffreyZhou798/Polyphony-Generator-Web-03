# Polyphony Music Generator

AI-powered polyphonic music generation system based on Google Magenta.js - Pure frontend implementation

---

## English | 中文 | 日本語

---

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

## 👨‍💻 Author

**Jeffrey Zhou**

Created on March 20, 2026

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Google Magenta.js - AI music generation
- lilypoint-main - Counterpoint rules reference

---

## 🇨🇳 中文说明

**Polyphony Music Generator** - 基于 Google Magenta.js 的 AI 复调音乐生成系统

### 🎵 功能特点

- ✅ 纯前端实现，无需后端服务器
- ✅ 支持 MusicXML 和 MXL 文件格式
- ✅ 四种音乐风格：古典、爵士、现代、实验
- ✅ 2-4 声部复调生成
- ✅ 完整的音乐规则引擎（6个独立规则）
- ✅ 导出为 MusicXML、MXL、MIDI 格式
- ✅ Service Worker 缓存支持离线使用
- ✅ 多语言支持（英语/中文/日本語）

### 🚀 快速开始

#### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器将自动打开 **http://localhost:3000/**

#### 测试文件

测试文件位于 `test-files/` 目录：
- 简单测试 (simple_test.musicxml, simple_test.mxl)
- 小星星 (twinkle-twinkle-little-star.mxl)
- 茉莉花 (jasmine-flower.mxl)
- Lightly Row (lightly-row.mxl)

#### 生产构建

```bash
npm run build
```

### 📖 使用说明

1. **上传音乐文件**
   - 支持 `.musicxml` 和 `.mxl` 格式
   - 拖拽文件或点击上传

2. **配置参数**
   - 选择音乐风格（古典/爵士/现代/实验）
   - 选择声部数量（2/3/4声部）
   - 设置生成长度（4/8/16/32/64小节）
   - 调整温度参数（0.5-2.0）

3. **生成复调**
   - 点击"生成复调音乐"按钮
   - 首次使用需要下载模型（约100MB）
   - 等待生成完成

4. **下载结果**
   - MXL格式（推荐，MuseScore默认格式）
   - MusicXML格式（纯文本XML）
   - MIDI格式（通用格式）

### 🎼 音乐规则引擎

系统包含完整的音乐规则引擎，根据不同音乐风格应用相应规则：

- **VoiceRangeRule** - 声部范围限制
- **HarmonyRule** - 和声合法性检测
- **VoiceLeadingRule** - 声部进行规则
- **ParallelFifthsRule** - 平行五度检测（仅古典）
- **ParallelOctavesRule** - 平行八度检测（仅古典）
- **VoiceCrossingRule** - 声部交叉检测

### 🌐 部署

#### Vercel 部署（推荐）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

**重要提示**：项目根目录是 `polyphony-web/`，不是子目录。`vercel.json` 已正确配置。

#### GitHub Pages 部署

```bash
# 构建项目
npm run build

# 将 dist 目录部署到 gh-pages 分支
```

### 📁 项目结构

```
polyphony-web/
├── src/
│   ├── components/          # React组件
│   ├── services/
│   │   ├── magenta/        # AI模型集成
│   │   ├── musicxml/       # 文件解析和构建
│   │   ├── polyphony/      # 复调引擎
│   │   └── rules/          # 音乐规则引擎（8个文件）
│   ├── i18n/               # 国际化
│   ├── utils/              # 工具函数
│   └── styles/             # 样式文件
├── public/                 # 静态资源
├── test-files/             # 测试音乐文件
├── vercel.json             # Vercel配置
└── package.json
```

### 🛠️ 技术栈

- **前端**: React 18 + TypeScript 5 + Vite 5
- **AI模型**: Google Magenta.js
- **UI框架**: Bootstrap 5
- **音乐处理**: @tonejs/midi, JSZip
- **部署**: Vercel / GitHub Pages

### ⚠️ 注意事项

1. 首次使用需要下载约100MB的AI模型，请确保网络连接良好
2. 推荐使用 Chrome/Edge 浏览器以获得最佳体验
3. 生成质量依赖于输入旋律的质量
4. AI生成的结果可能需要人工调整

### 👨‍💻 作者

**Jeffrey Zhou**

创建于 2026年3月20日

### 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

### 🙏 致谢

- Google Magenta.js - AI音乐生成
- lilypoint-main - 复调规则参考

---

## 🇯🇵 日本語

**Polyphony Music Generator** - Google Magenta.js に基づく AI 対位法音楽生成システム

### 🎵 特徴

- ✅ フロントエンドのみの実装、バックエンドサーバー不要
- ✅ MusicXML および MXL ファイル形式をサポート
- ✅ 4つの音楽スタイル：クラシック、ジャズ、モダン、実験的
- ✅ 2-4声部の対位法生成
- ✅ 完全な音楽ルールエンジン（6つの独立ルール）
- ✅ MusicXML、MXL、MIDI 形式でエクスポート
- ✅ Service Worker キャッシュによるオフライン使用サポート
- ✅ 多言語サポート（英語/中文/日本語）

### 🚀 クイックスタート

#### ローカル開発

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザが自動的に **http://localhost:3000/** で開きます

#### テストファイル

テストファイルは `test-files/` ディレクトリにあります：
- シンプルテスト (simple_test.musicxml, simple_test.mxl)
- きらきら星 (twinkle-twinkle-little-star.mxl)
- 茉莉花 (jasmine-flower.mxl)
- Lightly Row (lightly-row.mxl)

#### プロダクションビルド

```bash
npm run build
```

### 📖 使い方

1. **音楽ファイルをアップロード**
   - `.musicxml` および `.mxl` 形式をサポート
   - ドラッグ＆ドロップまたはクリックでアップロード

2. **パラメータを設定**
   - 音楽スタイルを選択（クラシック/ジャズ/モダン/実験的）
   - 声部数を選択（2/3/4声部）
   - 生成長を設定（4/8/16/32/64小節）
   - 温度パラメータを調整（0.5-2.0）

3. **対位法を生成**
   - 「対位法を生成」ボタンをクリック
   - 初回使用時にモデルのダウンロードが必要（約100MB）
   - 生成が完了するまで待つ

4. **結果をダウンロード**
   - MXL形式（推奨、MuseScore デフォルト形式）
   - MusicXML形式（プレーンテキスト XML）
   - MIDI形式（ユニバーサル形式）

### 🎼 音楽生成システム

#### 対位法エンジン

システムは高度な対位法生成アプローチを使用します：

1. **強拍での和声フレームワーク**
   - 拍 1 と 3 でコード進行を確立
   - コードディグリーをチェック（I、ii、iii、IV、V、vi、vii°）
   - 和声の安定性を確保

2. **弱拍での変奏**
   - Magenta.js を使用して旋律的な素材を生成
   - 経過音と隣接音を追加
   - リズムの独立性を作成

3. **声部進行ルール**
   - 平行五度/八度を回避（クラシックスタイル）
   - スムーズな旋律線を維持
   - 声部の交差を防止
   - 適切な声部範囲を確保

#### 音楽ルールエンジン

6つの独立ルールを含む完全なルールエンジン：

- **VoiceRangeRule** - 声部範囲制約
- **HarmonyRule** - 和声合法性検出
- **VoiceLeadingRule** - 声部進行ルール
- **ParallelFifthsRule** - 平行五度検出（クラシックのみ）
- **ParallelOctavesRule** - 平行八度検出（クラシックのみ）
- **VoiceCrossingRule** - 声部交差検出

### 🌐 デプロイ

#### Vercel デプロイ（推奨）

```bash
# Vercel CLI をインストール
npm install -g vercel

# ログイン
vercel login

# デプロイ
vercel --prod
```

**重要**：プロジェクトルートは `polyphony-web/` で、サブディレクトリではありません。`vercel.json` は既に正しく設定されています。

#### GitHub Pages デプロイ

```bash
# プロジェクトをビルド
npm run build

# dist ディレクトリを gh-pages ブランチにデプロイ
```

### 📁 プロジェクト構造

```
polyphony-web/
├── src/
│   ├── components/          # React コンポーネント
│   ├── services/
│   │   ├── magenta/        # AI モデル統合
│   │   ├── musicxml/       # ファイル解析と構築
│   │   ├── polyphony/      # 対位法エンジン
│   │   └── rules/          # 音楽ルールエンジン（8ファイル）
│   ├── i18n/               # 国際化
│   ├── utils/              # ユーティリティ関数
│   └── styles/             # スタイルファイル
├── public/                 # 静的アセット
├── test-files/             # テスト音楽ファイル
├── vercel.json             # Vercel 設定
└── package.json
```

### 🛠️ 技術スタック

- **フロントエンド**: React 18 + TypeScript 5 + Vite 5
- **AI モデル**: Google Magenta.js
- **UI フレームワーク**: Bootstrap 5
- **音楽処理**: @tonejs/midi, JSZip
- **デプロイ**: Vercel / GitHub Pages

### ⚠️ 注意事項

1. 初回使用時に約100MB の AI モデルをダウンロードする必要があります。良好なネットワーク接続を確保してください
2. 最良の体験のために Chrome/Edge ブラウザを推奨します
3. 生成品質は入力旋律の品質に依存します
4. AI で生成された結果は手動調整が必要な場合があります

### 👨‍💻 作者

**Jeffrey Zhou**

2026年3月20日に作成

### 📄 ライセンス

MIT License - [LICENSE](LICENSE) ファイルを参照してください

### 🙏 謝辞

- Google Magenta.js - AI 音楽生成
- lilypoint-main - 対位法ルール参照

---

**Local Debug Link**: http://localhost:3000/

**GitHub Repository**: Upload all files except `node_modules/`, `dist/`, and `.DS_Store`

```bash
npm run build
```

---

**Author**: Jeffrey Zhou

**Created**: March 20, 2026
