# Expo + Rails 7x Template

A full-stack mobile application template combining Expo (React Native) frontend with Rails 7.x backend API.

## Project Structure

```
.
├── backend/              # Rails 7.x API (git submodule)
├── config/              # Frontend configuration
│   └── api.ts          # API endpoint configuration
├── App.tsx             # Main Expo app component
└── .env                # Environment variables
```

## Installation

### Prerequisites

* Node.js and npm

    ```bash
    $ node --version  # output should be 18.x or higher
    $ npm --version   # output should be 8.x or higher
    ```

* Ruby 3.x and Rails 7.x (for backend)

    ```bash
    $ ruby -v  # output should be 3.x
    $ rails -v # output should be rails 7.x
    ```

* PostgreSQL

    ```bash
    $ brew install postgresql
    ```

### Setup

1. Install frontend dependencies:

    ```bash
    $ npm install
    ```

2. Setup backend (Rails API):

    ```bash
    $ cd backend
    $ bundle install
    $ ./bin/setup
    ```

3. Configure environment variables:

    Copy `.env.example` to `.env` and adjust settings:

    ```bash
    $ cp .env.example .env
    ```

## Configuration

Environment variables in `.env`:

```bash
# Rails API port (backend runs on 3001)
APP_PORT=3001

# Expo web server port (frontend runs on 3000)
EXPO_WEB_PORT=3000
```

Backend configuration in `backend/config/application.yml`:

```yaml
APP_PORT: '3001'
PUBLIC_HOST: ''  # Set for production
```

## Development

Start backend and frontend in separate terminals:

**Terminal 1 - Backend API:**
```bash
$ cd backend
$ bin/dev
```
Backend will start on port **3001**: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
$ npm run start   # Start Metro bundler
$ npm run web     # Start web development (port 3000)
$ npm run ios     # Start iOS simulator
$ npm run android # Start Android emulator
```

Frontend web will start on port **3000**: http://localhost:3000

## API Endpoints

The backend provides RESTful API endpoints:

* `GET /api/v1/health` - Health check endpoint
* Authentication API (after running generator):
  * `POST /api/v1/login` - User login
  * `DELETE /api/v1/logout` - User logout

Example request:
```bash
$ curl http://localhost:3001/api/v1/health
# {"status":"ok","message":"API is running","timestamp":"2025-11-04T10:00:00Z","version":"1.0.0"}
```

## Authentication Generator

Generate complete authentication system:

```bash
$ cd backend
$ rails generate authentication
$ bundle install && rails db:migrate
```

This adds:
* User registration, login, password reset
* Email verification
* Session management
* OAuth integration (Google, Facebook, Twitter, GitHub)
* API authentication endpoints (`/api/v1/login`, `/api/v1/logout`)

## Tech Stack

### Frontend (Expo)
* React Native 0.74
* Expo SDK ~51.0
* TypeScript ~5.3
* React 18.2

### Backend (Rails)
* Ruby on Rails 7.2
* PostgreSQL
* Puma web server
* Figaro (environment management)
* CORS support (rack-cors)
* Authentication system with OAuth
* ActionCable for WebSocket
* Tailwind CSS (admin dashboard)
* RSpec (testing)

## Deployment

### Environment Configuration

The app uses the same environment variables for both frontend and backend:

* **Local dev**: Uses `APP_PORT` from `.env` / `application.yml`
* **Cloud dev**: Reads system-injected `APP_PORT` + `CLACKY_PREVIEW_DOMAIN_BASE`
* **Production**: Uses `PUBLIC_HOST` for the API domain

All configuration is managed through `app.config.js` and automatically maps to the appropriate format.

## Admin Dashboard

Backend includes an admin dashboard at `/admin` (localhost:3001/admin)

* Default username: `admin`
* Default password: `admin`

**Note**: Do not write business logic in the admin dashboard. Use it only for administrative tasks.
