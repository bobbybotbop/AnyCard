# AnyCard

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.5.0-FFCA28?logo=firebase&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-0.160.0-000000?logo=three.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-20.10-2496ED?logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)

A digital trading card game platform where users can collect, trade, and manage AI-generated trading cards. Create custom card sets, open daily packs, and trade with other players in an immersive 3D experience.

## What is AnyCard?

AnyCard is a full-stack web application that combines AI-powered content generation with a traditional trading card game experience. Users can:

- **Collect Cards**: Open packs to discover cards with varying rarities
- **Create Custom Sets**: Generate themed card collections using AI
- **Trade Cards**: Exchange cards with other players
- **Manage Inventory**: Track your collection and favorite cards
- **Experience 3D Visualizations**: Interactive 3D card pack opening animations

## Technologies Used

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and development server
- **Three.js & React Three Fiber** - 3D graphics and visualizations
- **React Router** - Client-side routing

### Backend

- **Express.js** - Web server framework
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe backend code
- **Firebase Admin SDK** - Server-side Firebase operations

### Infrastructure & Services

- **Firebase** - Database (Firestore) and Authentication
- **Docker** - Containerization
- **Nginx** - Web server and reverse proxy
- **Vercel** - Deployment platform

## APIs Used

- **OpenRouter API** - AI-powered card set generation using Claude 3 Haiku model. Generates themed card sets with names, stats, and attack descriptions.
- **Serper API** - Google image search API for finding card images based on card names and themes.
- **Firebase** - Provides Firestore database for storing user data, cards, sets, and trades, plus Firebase Authentication for user management.

## Features

- **AI-Generated Card Sets**: Random themed collections generated using OpenRouter API + Serper Google Image Search API
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/05ba0bd2-6fce-45ca-a229-274f98ce2280"/>

- **3D Card Pack Visualization**: Interactive Three.js animations for pack opening
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7d27cce3-ce63-47ec-9331-047d2250199b"/>
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b738967f-91f3-48ce-9f68-36ded7e000a0"/>

Each card's background and border is calculated based of common colors within the picture


- **Custom Set Creation**: Users can create custom card sets with their own themes
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b525f1e4-7d07-4fb7-9ef1-a8a204b7b69f"/>

- **Pack Opening Mechanics**: Random card distribution based on rarity probabilities
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f2d1bbd0-9570-493a-a05a-2f40c31f9d8e"/>

- **Card Trading System**: Request and respond to trades with other users

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/301f43c3-aff5-4e6a-905e-b4c4de564fdc"/>
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/3ec21b9c-84a2-4759-ab4e-47ba6ce93dd9"/>
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f8f5a547-3042-4b03-8c4d-ff0f1d17ccef"/>

- **Inventory Management**: View and organize your card collection
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/0ff3721f-d948-4ff9-8b42-fbfddf76037c"/>
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/536719a3-ea7b-4c61-820b-57284699a3fc"/>


- **User Profiles**: Track your collection, level, and favorite cards
<img width="1919" height="925" alt="image" src="https://github.com/user-attachments/assets/dc45e283-c928-45a2-a752-1d1ed7e9e2d0" />


## Project Structure

```
AnyCard/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── api/          # API client functions
│   │   └── auth/         # Authentication logic
│   └── package.json
├── backend/           # Express backend server
│   ├── api/           # API route handlers
│   ├── controllers.ts # Business logic
│   ├── routers.ts     # Route definitions
│   └── server.ts      # Server entry point
└── lib/               # Shared code
    ├── types/         # Shared TypeScript types
    └── common/        # Shared utilities
```

## Screenshots

<!-- Add your screenshots here -->

## Setup Instructions

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn package manager
- Firebase project with Firestore and Authentication enabled
- API keys for OpenRouter and Serper

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd AnyCard/anycardproj
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the `backend` directory:

```env
FIREBASE_SERVICE_ACCOUNT=<base64-encoded-service-account-json>
OPENROUTER_API_KEY=<your-openrouter-api-key>
SERPER_API_KEY=<your-serper-api-key>
ALLOWED_ORIGINS=<comma-separated-origins>
```

For local development, you can also place your Firebase service account JSON file at `backend/secrets/ACFire.json`.

4. Set up Firebase configuration:

In the `frontend/src/auth/firebase.ts` file, configure your Firebase project credentials.

5. Start the development servers:

```bash
# Start backend (runs on http://localhost:8080)
cd backend
npm run dev

# Start frontend (runs on http://localhost:5173)
cd frontend
npm run dev
```

## Deployment

### Vercel Deployment

The project is configured for deployment on Vercel:

1. **Frontend**: Deployed automatically via Vercel when pushing to the main branch
2. **Backend**: Deployed as serverless functions on Vercel

### Environment Variables

Set the following environment variables in your Vercel project:

- `FIREBASE_SERVICE_ACCOUNT` - Base64 encoded Firebase service account JSON
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `SERPER_API_KEY` - Your Serper API key
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

### Docker Deployment

The project includes a Dockerfile for containerized deployment:

```bash
docker build -t anycard .
docker run -p 80:80 anycard
```

The Docker setup uses Nginx to serve the frontend and proxy API requests to the backend.

## License

MIT License
