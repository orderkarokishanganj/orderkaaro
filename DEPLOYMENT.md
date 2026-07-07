# Deployment Guide

This repository is configured for deployment on **Vercel** and **Render**. Choose the platform that best suits your needs.

## Prerequisites

- Node.js 18+ installed locally
- Git repository pushed to GitHub, GitLab, or Bitbucket
- A free or paid account on your chosen platform

## Deployment on Vercel

### Option 1: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in/sign up
2. Click **"Add New"** → **"Project"**
3. Select your Git repository
4. Vercel will auto-detect this as a Vite project
5. Click **"Deploy"**

The site will be live at `https://your-project-name.vercel.app`

### Option 2: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

### Environment Variables on Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the required variables (see `.env.example`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Any other `VITE_*` prefixed variables

## Deployment on Render

### Using Render Dashboard

1. Go to [render.com](https://render.com) and sign in/sign up
2. Click **"New +"** → **"Web Service"**
3. Select your Git repository
4. Configure settings:
   - **Name**: Enter your project name
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Publish directory**: `dist`

5. Add Environment Variables:
   - Click **"Environment"**
   - Add variables from `.env.example`

6. Click **"Create Web Service"**

The site will be live at `https://your-project-name.onrender.com`

## Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd orderkaaro
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Configuration Files

- **`vercel.json`** - Vercel deployment configuration
- **`render.yaml`** - Render deployment configuration
- **`.env.example`** - Environment variables template
- **`vite.config.ts`** - Vite build configuration optimized for production

## Custom Domain

### On Vercel
1. Project Settings → Domains
2. Add your custom domain
3. Follow DNS instructions

### On Render
1. Project Settings → Custom Domain
2. Add your domain and follow DNS setup

## Performance Optimizations

The build configuration includes:
- ✅ Minification with Terser
- ✅ Dead code elimination
- ✅ Console log removal in production
- ✅ Optimized dependencies

## Troubleshooting

### Build fails
- Check Node.js version: `node --version` (should be 18+)
- Clear cache: `npm run build` after `rm -rf node_modules dist`
- Check for required environment variables

### SPA Routing Issues
- Both `vercel.json` and `render.yaml` are configured to rewrite all routes to `/index.html`
- React Router will handle client-side routing

## Support

For Vercel issues: [Vercel Docs](https://vercel.com/docs)
For Render issues: [Render Docs](https://render.com/docs)
