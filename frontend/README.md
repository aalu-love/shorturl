# URL Shortener Frontend

A lightweight React frontend built with Vite for the URL Shortener application.

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx    # Main dashboard for shortening URLs
│   ├── Login.jsx        # Login page
│   ├── Register.jsx     # Registration page
│   └── Navbar.jsx       # Navigation component
├── App.jsx              # Main app component with routing
├── App.css              # App styles
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Features

- User authentication (login/register)
- Shorten URLs
- View all shortened URLs
- Click statistics
- API key support (for later)
- Role-based access control (prepared for future implementation)

## Environment

The frontend proxies API calls to the backend at `http://localhost:3001` (configured in `vite.config.js`).

Make sure the backend is running before starting the frontend.
