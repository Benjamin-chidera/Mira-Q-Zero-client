# GP-Connect Client (Mira-Q-Zero)

A modern, fast, and highly interactive frontend application for the GP-Connect / Mira-Q-Zero platform. Built to provide a seamless user experience for patients and clinicians, offering real-time AI consultations, GP availability mapping, and secure medical records management.

## 🚀 Features

- **Lightning Fast:** Built with Vite and React 19, featuring the experimental React Compiler for maximum performance and minimal re-renders.
- **Beautiful UI:** Styled with Tailwind CSS v4 and fully integrated with [shadcn/ui](https://ui.shadcn.com/) components for a cohesive, accessible, and premium design system.
- **Real-Time AI Consultations:** Powered by `socket.io-client` to connect seamlessly with the backend's AI agents for voice and chat interactions.
- **State Management:** Simple, fast, and scalable global state management using `zustand`.
- **Interactive Maps:** GP locations and availability visualized beautifully using Google Maps integration (`@vis.gl/react-google-maps`).
- **Modern Routing:** Client-side routing handled by `react-router-dom` for smooth transitions between dashboards, consultations, and profile pages.

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4, `clsx`, `tailwind-merge`, and `tw-animate-css`
- **UI Components:** shadcn/ui, Base UI, Lucide React (Icons)
- **State Management:** Zustand
- **Networking:** Axios (HTTP), Socket.IO (WebSockets)
- **Utilities:** `date-fns` & `react-day-picker` for date selection

## 📦 Project Structure

```
client/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── assets/             # Images, fonts, and global CSS
│   ├── components/         # Reusable UI components (including shadcn/ui)
│   ├── lib/                # Utility functions and configurations
│   ├── pages/              # Application views/routes
│   ├── store/              # Zustand state stores
│   ├── App.tsx             # Main application component & routing setup
│   ├── index.css           # Global styles and Tailwind configuration
│   └── main.tsx            # Application entry point
├── package.json            # Dependencies and scripts
└── vite.config.ts          # Vite & React Compiler configuration
```

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- The GP-Connect [Server](../server) should be running locally to handle API requests and WebSocket connections.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Benjamin-chidera/Mira-Q-Zero-server.git
   cd Mira-Q-Zero-server/client
   ```

2. **Install dependencies:**
   Using npm (or your preferred package manager):
   ```bash
   npm install
   ```

3. **Set up your environment variables:**
   Create a `.env` file in the `client` directory. Example:
   ```ini
   VITE_API_BASE_URL=http://localhost:8000
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

### Running the Application

Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```
You can then preview the build locally using:
```bash
npm run preview
```

## 🧑‍💻 Development Guidelines

- **Component Design:** Prioritize composition and reusability. Stick to the `shadcn/ui` aesthetic.
- **State:** Use `zustand` for global state. Keep stores logical and split by feature domain (e.g., auth, consultation, gp).
- **Code Quality:** Ensure all components are strongly typed with TypeScript. Avoid deeply nested logic—prioritize readable, junior/mid-level friendly code.
