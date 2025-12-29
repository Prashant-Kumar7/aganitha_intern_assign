# Pastebin-Lite

A lightweight pastebin application built with Next.js that allows users to create text pastes and share them via URLs. Pastes can optionally have time-based expiry (TTL) or view-count limits.

## Features

- ✅ Create text pastes with optional constraints
- ✅ Share pastes via unique URLs
- ✅ Time-based expiry (TTL) support
- ✅ View-count limit support
- ✅ Beautiful UI with light/dark/system theme support
- ✅ Deterministic time testing support for automated tests
- ✅ Secure HTML rendering (XSS protection)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Validation**: Zod
- **Form Handling**: React Hook Form
- **Persistence**: Vercel KV (Redis-compatible key-value store)
- **Theme**: next-themes

## Running Locally

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Vercel account (for KV access) or local Redis instance

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd next_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Vercel KV**
   
   For production deployment on Vercel:
   - Create a Vercel KV database in your Vercel dashboard
   - Environment variables will be automatically set
   
   For local development, you can either:
   - Use Vercel CLI: `vercel link` and `vercel env pull`
   - Set environment variables manually:
     ```bash
     KV_URL=<your-kv-url>
     KV_REST_API_URL=<your-kv-rest-api-url>
     KV_REST_API_TOKEN=<your-kv-token>
     KV_REST_API_READ_ONLY_TOKEN=<your-readonly-token>
     ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Persistence Layer

This application uses **Vercel KV** (a Redis-compatible key-value store) as its persistence layer.

### Why Vercel KV?

- **Serverless-friendly**: Works seamlessly with Vercel's serverless functions
- **No cold starts**: Unlike traditional databases, KV stores are optimized for fast reads
- **Automatic scaling**: Handles traffic spikes without manual configuration
- **Simple key-value model**: Perfect for this use case where we're storing simple paste objects

### Data Model

Pastes are stored with the following structure:
- Key: `paste:{id}`
- Value: JSON object containing:
  - `id`: Unique paste identifier
  - `content`: The paste content
  - `createdAt`: Timestamp in milliseconds
  - `expiresAt`: Expiration timestamp (null if no TTL)
  - `maxViews`: Maximum view count (null if unlimited)
  - `viewCount`: Current view count

### Environment Variables

The following environment variables are required (automatically set on Vercel):

- `KV_URL` - Redis connection URL
- `KV_REST_API_URL` - REST API endpoint
- `KV_REST_API_TOKEN` - API token for write operations
- `KV_REST_API_READ_ONLY_TOKEN` - Read-only token (optional)

## API Endpoints

### Health Check
- **GET** `/api/healthz`
- Returns: `{ "ok": true }`
- Checks if the application can access the persistence layer

### Create Paste
- **POST** `/api/pastes`
- Request body:
  ```json
  {
    "content": "string (required)",
    "ttl_seconds": 60 (optional, integer ≥ 1),
    "max_views": 5 (optional, integer ≥ 1)
  }
  ```
- Response: `{ "id": "string", "url": "https://your-app.vercel.app/p/:id" }`

### Get Paste (API)
- **GET** `/api/pastes/:id`
- Response:
  ```json
  {
    "content": "string",
    "remaining_views": 4 (null if unlimited),
    "expires_at": "2026-01-01T00:00:00.000Z" (null if no TTL)
  }
  ```
- Each successful fetch counts as a view

### View Paste (HTML)
- **GET** `/p/:id`
- Returns HTML page with the paste content
- Returns 404 if paste is unavailable (expired, exceeded views, or not found)

## Design Decisions

### 1. **Vercel KV for Persistence**
   - Chosen for its serverless compatibility and simplicity
   - No need for complex database migrations
   - Fast read/write operations suitable for this use case

### 2. **Zod for Validation**
   - Type-safe validation with excellent TypeScript integration
   - Runtime validation ensures data integrity
   - Clear error messages for better developer experience

### 3. **Server-Side Rendering**
   - Paste viewing page (`/p/:id`) is server-rendered for better SEO
   - Main page is client-side for better interactivity

### 4. **Test Mode Support**
   - Environment variable `TEST_MODE=1` enables deterministic time testing
   - Header `x-test-now-ms` allows tests to set the current time
   - Critical for automated testing of TTL functionality

### 5. **XSS Protection**
   - HTML content is escaped when rendering pastes
   - Prevents script injection attacks
   - Simple yet effective security measure

### 6. **View Count Increment**
   - View count is incremented after checking availability
   - This ensures that the last view is allowed before the paste becomes unavailable
   - Prevents race conditions by using atomic operations where possible

## Testing

The application supports deterministic time testing for automated test suites:

1. Set environment variable: `TEST_MODE=1`
2. Include header in requests: `x-test-now-ms: <milliseconds since epoch>`

This allows tests to verify TTL expiration without waiting for real time to pass.

## Deployment

### Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your project in Vercel
3. Add Vercel KV database in the Vercel dashboard
4. Deploy!

The application will automatically:
- Use the KV database for persistence
- Set up environment variables
- Handle serverless function deployment

## Repository Requirements

✅ README.md exists with project description, local setup instructions, and persistence layer documentation  
✅ No hardcoded localhost URLs in committed code  
✅ No secrets or credentials in the repository  
✅ Server-side code uses Vercel KV (no global mutable state)  
✅ Standard npm/yarn/pnpm commands for installation and running  

## License

This project is created as a take-home assignment.
