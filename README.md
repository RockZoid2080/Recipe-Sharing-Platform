<div align="center">

# 🍳 RecipeShare

**A Modern Full-Stack Recipe Sharing Platform**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<p align="center">
  <em>Discover, create, and share your favorite recipes with a vibrant community of food lovers.</em>
</p>

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Usage](#-usage) · [Project Structure](#-project-structure) · [API Reference](#-api-reference) · [Roadmap](#-roadmap) · [Contributing](#-contributing)

---

</div>

## 📖 Overview

**RecipeShare** is a beautifully designed, full-stack web application that allows users to discover, create, and share recipes. Built with a modern tech stack featuring **Next.js 14** on the frontend and **Express.js** with **Prisma ORM** on the backend, RecipeShare delivers a fast, responsive, and visually stunning culinary experience.

### 🎯 Problem It Solves

Home cooks and food enthusiasts often struggle to find a centralized, modern platform to organize, share, and discover recipes. RecipeShare bridges this gap by providing an intuitive interface where users can publish recipes with structured ingredients and steps, browse a community feed, and build their culinary profile.

### 👥 Target Users

- 🏠 **Home Cooks** looking to organize and share family recipes
- 👨‍🍳 **Aspiring Chefs** building a portfolio of original dishes
- 🍕 **Food Enthusiasts** exploring new cuisines and techniques
- 📱 **Content Creators** sharing culinary content with a community

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Secure JWT-based login & registration with refresh tokens |
| 📝 **Recipe Creation** | Rich form with dynamic ingredients, steps, and metadata |
| 📰 **Recipe Feed** | Browse community recipes with search and filtering |
| 👤 **User Profiles** | Personal profiles with recipe listings and social stats |
| ⭐ **Ratings & Reviews** | Rate and review recipes from other users |
| 🔖 **Bookmarks** | Save favorite recipes to personal collections |
| 👥 **Social Features** | Follow/unfollow other chefs and build a network |
| 🛡️ **Security** | Helmet, CORS, rate limiting, and input validation |
| 📱 **Responsive Design** | Beautiful dark-themed UI that works on all devices |
| 🚀 **Production Ready** | Optimized builds with Railway deployment support |

---

## 🛠 Tech Stack

<table>
<tr>
<td align="center" width="50%">

### Frontend
| Technology | Purpose |
|:---|:---|
| **Next.js 14** | React framework with SSR |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **React Query** | Server state management |
| **React Hook Form** | Performant form handling |
| **Zod** | Schema validation |
| **Axios** | HTTP client |
| **Lucide React** | Modern icon library |

</td>
<td align="center" width="50%">

### Backend
| Technology | Purpose |
|:---|:---|
| **Express.js** | REST API framework |
| **TypeScript** | Type-safe development |
| **Prisma ORM** | Database toolkit |
| **PostgreSQL** | Relational database |
| **JSON Web Tokens** | Authentication |
| **bcrypt.js** | Password hashing |
| **Zod** | Input validation |
| **Helmet + CORS** | API security |

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **PostgreSQL** (local install or [Docker](https://www.docker.com/))
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RockZoid2080/Recipe-Sharing-Platform.git
   cd Recipe-Sharing-Platform
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `backend/` directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/recipeshare"

   # JWT Secrets (use strong, random strings in production!)
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Server
   PORT=4000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Set up the Database**

   **Option A — Using Docker (Recommended):**
   ```bash
   docker run --name recipeshare-db \
     -e POSTGRES_USER=recipeshare \
     -e POSTGRES_PASSWORD=recipeshare \
     -e POSTGRES_DB=recipeshare \
     -p 5432:5432 -d postgres
   ```

   **Option B — Using a cloud provider:**
   Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) and paste the connection string into `DATABASE_URL`.

5. **Push the database schema**
   ```bash
   npx prisma db push
   ```

6. **Set up the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 💻 Usage

### Development Mode

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend (http://localhost:4000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Database Studio

Explore your data visually with Prisma Studio:
```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

---

## 📁 Project Structure

```
Recipe-Sharing-Platform/
├── backend/                    # Express.js API server
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (14+ models)
│   ├── src/
│   │   ├── config/             # Environment configuration
│   │   ├── lib/                # Prisma client instance
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── routes/             # API route handlers
│   │   ├── services/           # Business logic layer
│   │   └── index.ts            # Server entry point
│   ├── Procfile                # Railway deployment config
│   └── package.json
│
├── frontend/                   # Next.js 14 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/         # Login & Register pages
│   │   │   ├── recipes/        # Feed, Create, Detail views
│   │   │   ├── profile/[id]/   # User profile page
│   │   │   ├── layout.tsx      # Root layout with providers
│   │   │   └── page.tsx        # Landing page
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # Auth context provider
│   │   └── lib/                # API client (Axios)
│   └── package.json
│
├── .env.example                # Environment variable template
├── .gitignore
└── README.md
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Log in and receive tokens |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | Log out and clear cookies |

### Recipes
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/recipes` | List all published recipes |
| `POST` | `/api/recipes` | Create a new recipe |
| `GET` | `/api/recipes/:id` | Get recipe details |
| `PATCH` | `/api/recipes/:id` | Update a recipe |
| `DELETE` | `/api/recipes/:id` | Delete a recipe |

### Users
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/users/:id` | Get user profile |
| `PATCH` | `/api/users/me` | Update own profile |
| `POST` | `/api/users/:id/follow` | Follow/unfollow a user |

### Other Endpoints
| Resource | Base Path |
|:---------|:----------|
| Search | `/api/search` |
| Collections | `/api/collections` |
| Meal Plans | `/api/meal-plans` |
| Notifications | `/api/notifications` |
| Shopping Lists | `/api/shopping-list` |

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|:------|:---------|
| `CORS policy error` | Ensure `CORS_ORIGIN` in `.env` matches your frontend URL (including port) |
| `Can't reach database server` | Check if PostgreSQL/Docker is running and `DATABASE_URL` is correct |
| `Registration failed` | Verify password is 8+ characters and email is valid |
| `Port already in use` | Kill the process: `npx kill-port 4000` or change `PORT` in `.env` |
| `Prisma client not found` | Run `npx prisma generate` in the backend directory |

---

## 🗺 Roadmap

- [x] User authentication (JWT + refresh tokens)
- [x] Recipe CRUD operations
- [x] User profiles with recipe listings
- [x] Community recipe feed
- [x] Production build optimization
- [ ] Image uploads for recipes and avatars
- [ ] Advanced search with filters (cuisine, diet, time)
- [ ] Recipe collections and meal planning UI
- [ ] Real-time notifications
- [ ] Social features (comments, likes UI)
- [ ] Dark/Light theme toggle
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Write meaningful commit messages using [Conventional Commits](https://www.conventionalcommits.org/)
- Update documentation for any new features
- Test your changes before submitting

---

## 👨‍💻 Author

<div align="center">

**Aman Singh**

[![GitHub](https://img.shields.io/badge/GitHub-RockZoid2080-181717?style=for-the-badge&logo=github)](https://github.com/RockZoid2080)

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ If you found this project useful, please give it a star!**

Made with ❤️ and lots of ☕

</div>
