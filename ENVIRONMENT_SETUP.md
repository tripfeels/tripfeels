# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database (Neon)
DATABASE_URL="postgresql://neondb_owner:npg_k7bjuht2NUyP@ep-ancient-shadow-a1ulnnw4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Firebase (existing)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

## Getting Your Neon Database URL

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to "Connection Details"
4. Copy the connection string
5. Replace the DATABASE_URL in your .env.local file
