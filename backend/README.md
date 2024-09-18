# Backend

## Perquisites

-   node
-   pnpm version 9.10.0

## 🛠️ Getting Started

### Step-by-Step Guide

#### Step 1: 🚀 Initial Setup

-   Install dependencies: `pnpm install --frozen-lockfile`

#### Step 2: ⚙️ Environment Configuration

-   Create `.env`: Copy `.env.template` to `.env`
-   Update `.env`: Fill in necessary environment variables

#### Step 3: 🏃‍♂️ Running the Project

-   Development Mode: `npm run dev`
-   Building And Running in Production Mode: Set `.env` to `NODE_ENV="production"` then `pnpm run prod`

## 🚀 Features

-   📁 Modular Structure: Organized by feature for easy navigation and scalability
-   💨 Faster Execution with tsx: Rapid TypeScript execution with `tsx` and type checking with `tsc`
-   🔧 Simplified Environment Variables: Managed with Envalid
-   🔗 Path Aliases: Cleaner code with shortcut imports
-   🔄 Renovate Integration: Automatic updates for dependencies
-   🔒 Security: Helmet for HTTP header security and CORS setup
-   📊 Logging: Efficient logging with `pino-http`
-   🧪 Comprehensive Testing: Setup with Vitest and Supertest
-   🔑 Code Quality Assurance: Husky and lint-staged for consistent quality
-   ✅ Unified Code Style: `Biomejs` for consistent coding standards
-   📃 API Response Standardization: `ServiceResponse` class for consistent API responses
-   🐳 Docker Support: Ready for containerization and deployment
-   📝 Input Validation with Zod: Strongly typed request validation using `Zod`
-   🧩 Swagger UI: Interactive API documentation generated from Zod schemas
