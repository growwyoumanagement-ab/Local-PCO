# Local PCO Client App

A production-ready React Native client app for requesting local services.

## Features

- 📱 **Dashboard** - View active requests, recent history, and quick actions
- 🛠️ **Service Selection** - Browse and select from available service categories
- 📍 **Address Management** - GPS auto-detect, saved addresses, manual entry
- 📋 **Request Tracking** - Live status timeline and partner tracking
- 👤 **Profile Management** - Edit profile, manage addresses, logout

## Tech Stack

- React Native (TypeScript)
- Expo SDK 54
- React Navigation (Stack + Bottom Tabs)
- Redux Toolkit + Redux Persist
- Axios for API calls

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
# Navigate to client app
cd d:\Gautam\Local PCO\client\Local-Pco-Client

# Install dependencies
npm install

# Start Expo dev server
npm start
```

### Running the App

- Press `a` to open on Android emulator
- Press `w` to open in web browser
- Scan QR code with Expo Go app on your phone

## Project Structure

```
/src
├── /components       # Reusable UI components
│   ├── /ui           # Basic UI (Card, Button, Input, etc.)
│   └── *.tsx         # Feature components (RequestCard, ServiceCard, etc.)
├── /navigation       # React Navigation setup
├── /screens          # App screens
├── /services         # API service layer
├── /store            # Redux store and slices
└── /utils            # Constants, helpers, validators
```

## API Placeholders

All API calls have mock implementations for demo mode. Replace with actual endpoints when backend is ready:

- `POST /auth/client/login`
- `GET /client/profile`
- `GET /services`
- `POST /requests`
- `GET /requests/active`
- `GET /requests/history`
- `PUT /requests/{id}/cancel`

## Demo Mode

Click "🚀 Demo Login" on the login screen to bypass authentication and explore the app with mock data.
