# 🛍️ Fashion Hub 🛍️

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red?style=for-the-badge&logo=heart&logoColor=white" alt="Made with Love">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status">
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=30&color=%23FF4D6D&center=true&vCenter=true&width=500&height=60&lines=Your+One-Stop+Fashion+Destination" alt="Typing SVG">
</p>

---

## 📌 Table of Contents

- [🌟 About The Project](#-about-the-project)
- [🚀 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🎨 Screenshots](#-screenshots)
- [⚡ Getting Started](#-getting-started)
- [🔧 Installation](#-installation)
- [📦 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📧 Contact](#-contact)

---

## 🌟 About The Project

<p align="center">
  <img src="https://user-images.githubusercontent.com/74038190/225813768-4e6d5fae-c8df-4b35-a0ae-908546c2611e.gif" width="400">
</p>

**Fashion Hub** is a full-featured e-commerce web application that brings you the latest trends in fashion for **Men**, **Women**, and **Kids**. Built with modern web technologies, it offers a seamless shopping experience with an intelligent chatbot assistant named **Mavi**.

### Key Highlights:
- 🛒 **Shopping Cart** - Add and manage products
- 👤 **User Authentication** - Sign up, Login, Logout
- 🎯 **Product Categories** - Men's, Women's, Kids wear
- 🤖 **AI Chatbot** - Mavi, your personal fashion assistant
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast Performance** - Optimized for speed
- 🔒 **Secure** - Protected with Supabase backend

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🏠 **Home Page** | Beautiful landing page with featured products and categories |
| 👔 **Men's Collection** | Stylish outfits for the modern man |
| 👗 **Women's Collection** | Trendy and elegant wear for every occasion |
| 🧒 **Kids Collection** | Colorful and cute styles for little ones |
| 🛒 **Shopping Cart** | Persistent cart with localStorage |
| 👤 **User Authentication** | Sign up/Login with Supabase |
| 🤖 **Mavi Chatbot** | AI-powered fashion assistant |
| 📊 **Admin Panel** | Manage products and orders |
| 📞 **Contact Form** | Get in touch with the team |
| 🌐 **Responsive** | Mobile-friendly design |

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,javascript,git,docker,nginx,supabase,vscode" />
</p>

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
├─────────────────────────────────────────────────────────────┤
│  📄 HTML5      - Semantic markup                           │
│  🎨 CSS3       - Modern styling & animations               │
│  ⚙️ JavaScript - Interactive functionality                  │
│  💾 localStorage - Cart persistence                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                │
├─────────────────────────────────────────────────────────────┤
│  🔥 Supabase   - Authentication & database                  │
│  🐳 Docker     - Containerization                           │
│  🌐 Nginx      - Reverse proxy & load balancing             │
│  ☸ Kubernetes - Orchestration (optional)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
Fashion-Hub/
│
├── 📄 HTML Pages
│   ├── index.html          # Home page
│   ├── collection.html     # All products
│   ├── mens.html           # Men's wear
│   ├── womens.html         # Women's wear
│   ├── kids.html           # Kids wear
│   ├── cart.html           # Shopping cart
│   ├── login.html          # User login
│   ├── signup.html         # User registration
│   └── admin.html          # Admin dashboard
│
├── 🎨 Styles & Scripts
│   ├── style.css           # Main stylesheet
│   ├── script.js           # Core functionality
│   ├── script-new.js       # Additional features
│   ├── auth.js             # Authentication
│   ├── cart.js             # Cart management
│   └── supabase.js         # Supabase config
│
├── 🐳 Deployment
│   ├── Dockerfile          # Docker image
│   ├── nginx.conf          # Nginx config
│   ├── deployment.yaml     # K8s deployment
│   └── service.yaml        # K8s service
│
├── ⚙️ Configuration
│   ├── .gitignore          # Git ignore
│   ├── .dockerignore       # Docker ignore
│   ├── .hintrc             # Linter config
│   └── package.json        # Dependencies
│
└── 📝 Documentation
    └── README.md           # This file
```

---

## 🎨 Screenshots

### 🏠 Home Page
```
┌─────────────────────────────────────────────────────────┐
│  Fashion Hub                        [Cart] [Login] [⋮] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│           Welcome to Fashion Hub                        │
│      Discover the latest trends in clothing             │
│                                                         │
│              [ Shop Now ]                               │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Men's   │  │ Women's  │  │  Kids    │             │
│  │  Wear    │  │  Wear    │  │  Wear    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  Why Choose Us?                                         │
│  🚚 Free Shipping  ↩️ Easy Returns  💬 24/7 Support    │
└─────────────────────────────────────────────────────────┘
```

### 🤖 Mavi Chatbot
```
┌─────────────────────────────────────────────────┐
│  👗 Mavi - Your Fashion Assistant         [✕]  │
├─────────────────────────────────────────────────┤
│  👋 Hi there! I'm Mavi, your personal          │
│     fashion assistant at Fashion Hub!           │
│                                                 │
│     I can help you with:                       │
│     • 🛍️ Finding products                      │
│     • 📦 Order information                     │
│     • 📍 Navigation help                       │
│     • 💡 Style suggestions                     │
│                                                 │
├─────────────────────────────────────────────────┤
│  [ Ask Mavi anything...              ] [Send]  │
└─────────────────────────────────────────────────┘
```

---

## ⚡ Getting Started

### Prerequisites

Before you begin, ensure you have the following:

- ✅ Modern web browser (Chrome, Firefox, Edge, Safari)
- ✅ Code editor (VS Code recommended)
- ✅ Git installed
- ✅ Docker (optional, for containerization)
- ✅ Node.js (optional)

---

## 🔧 Installation

### 1️⃣ Clone the Repository

```
bash
# Clone the project
git clone https://github.com/MAHAKnigam/Fashion-hub.git

# Navigate to the project directory
cd Fashion-hub
```

### 2️⃣ Open in Browser

Simply open the `index.html` file in your browser:

```
bash
# Option 1: Open directly
start index.html          # Windows
open index.html          # MacOS
xdg-open index.html      # Linux
```

### 3️⃣ Using a Local Server

```
bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using VS Code Live Server
# Right-click index.html -> Open with Live Server
```

### 4️⃣ Configure Supabase (Optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Update the configuration in `supabase.js`:

```
javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_KEY = 'your-anon-key';
```

---

## 📦 Deployment

### 🐳 Using Docker

```
bash
# Build the Docker image
docker build -t fashion-hub:latest .

# Run the container
docker run -d -p 8080:80 fashion-hub:latest

# Or use docker-compose
docker-compose up -d
```

### ☸️ Using Kubernetes

```
bash
# Apply deployment
kubectl apply -f deployment.yaml

# Apply service
kubectl apply -f service.yaml

# Check status
kubectl get pods
kubectl get services
```

### 🌐 Using Nginx

The included `nginx.conf` provides:
- Gzip compression
- Static file caching
- Security headers
- Load balancing (for production)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. 📝 **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. 📤 **Push** to the branch (`git push origin feature/AmazingFeature`)
5. 🔃 **Open** a Pull Request

### Ideas for Contributions:
- 🎨 Improve the UI/UX design
- ⚡ Add more interactive features
- 🐛 Fix bugs
- 📚 Improve documentation
- 🌍 Add more languages

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Fashion Hub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📧 Contact

<p align="center">
  <a href="mailto:info@fashionhub.com">
    <img src="https://img.shields.io/badge/Email-FF4D6D?style=for-the-badge&logo=gmail&logoColor=white" alt="Email">
  </a>
  <a href="https://github.com/MAHAKnigam/Fashion-hub">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
</p>

---

## 🙏 Acknowledgments

<p align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212257467-8716b86b-5af6-447d-a6ba-6f6a32df0ee6.gif" width="200">
</p>

- [Unsplash](https://unsplash.com) - For beautiful images
- [Supabase](https://supabase.com) - Backend infrastructure
- [Font Awesome](https://fontawesome.com) - Icons
- [Google Fonts](https://fonts.google.com) - Typography

---

<p align="center">
  <strong>Made with ❤️ by MAHAKnigam</strong>
</p>

<p align="center">
  ⭐ Star this repo if you found it helpful!
</p>

<p align="center">
  <img src="https://komarev.com/ghpvc/?username=MAHAKnigam&repo=Fashion-hub&label=Views&color=ff4d6d&style=for-the-badge" alt="Profile Views">
</p>

---

<div align="center">

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    __  __              _   _               _    ____ ___     ║
║   |  \/  | __ _  ___ | \ | | ___  ___  __| |  / ___|_ _|    ║
║   | |\/| |/ _` |/ _ \|  \| |/ _ \/ _ \/ _` | | |    | |     ║
║   | |  | | (_| | (_) | |\  |  __/  __/ (_| | | |___ | |     ║
║   |_|  |_|\__,_|\___/|_| \_|\___|\___|\__,_|  \____|___|    ║
║                                                               ║
║                          _ _  __                              ║
║      ___  ___ _   _ ___| | ||___|                            ║
║     / _ \/ __| | | / __| | | / __|                           ║
║    |  __/\__ \ |_| \__ \ |_| \__ \                           ║
║     \___||___/\__, |___/\___/|___/                           ║
║                |___/                                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

</div>
