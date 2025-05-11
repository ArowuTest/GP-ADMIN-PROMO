# Frontend Deployment Guide (React - Vite)

This guide outlines the steps to build, configure, and deploy the React frontend application for the Mynumba Don Win Admin Portal, which is built using Vite.

## 1. Prerequisites

*   **Node.js and npm/yarn:** Node.js (preferably a recent LTS version, e.g., 18.x or 20.x) and npm (usually comes with Node.js) or yarn installed on the deployment server or build environment.
*   **Backend API:** The backend API must be deployed and accessible from where the frontend will be served or from the users' browsers.

## 2. Source Code

*   Obtain the latest version of the frontend source code from the repository (e.g., `/home/ubuntu/GP-ADMIN-PROMO`).

## 3. Configuration

The primary configuration for the frontend is the backend API base URL. This is typically managed via environment variables.

Create a `.env.production` file in the root of the frontend project directory (`/home/ubuntu/GP-ADMIN-PROMO/.env.production`) if it doesn't exist, or modify it with the following:

```env
# React App Configuration
VITE_APP_NAME="Mynumba Don Win Admin Portal"
VITE_API_BASE_URL=https://your_backend_api_domain.com/api/v1
```

*   `VITE_APP_NAME`: The name displayed in the browser tab (optional, can be set in `index.html` too).
*   `VITE_API_BASE_URL`: **Crucial.** This is the full base URL of your deployed backend API. The frontend will make requests to this URL.

For local development, you might have a `.env.development` file pointing to `http://localhost:8080/api/v1` (or your local backend port).

## 4. Install Dependencies

Navigate to the frontend project directory and install the necessary Node.js packages:

```bash
cd /path/to/your/GP-ADMIN-PROMO

# Using npm
npm install

# Or using yarn
# yarn install
```

## 5. Build the Application

Build the static assets for production:

```bash
# Using npm
npm run build

# Or using yarn
# yarn build
```

This command will create a `dist` folder in the project root (`/home/ubuntu/GP-ADMIN-PROMO/dist`). This folder contains all the static files (HTML, CSS, JavaScript, images) needed to run the frontend application.

## 6. Deployment Options

The `dist` folder contains a static website. You can deploy it using various methods:

### Option A: Using a Static Web Host (Recommended for Simplicity and Performance)

Services like Vercel (as indicated by `gp-admin-promo.vercel.app` in CORS config), Netlify, AWS S3 with CloudFront, GitHub Pages, Firebase Hosting, etc., are excellent for hosting React applications.

*   **Vercel/Netlify:** Connect your Git repository, and they will typically auto-detect the Vite setup, build, and deploy. You will need to configure the environment variables (like `VITE_API_BASE_URL`) in their respective dashboards.
*   **AWS S3 + CloudFront:** Upload the contents of the `dist` folder to an S3 bucket configured for static website hosting and serve it via CloudFront for HTTPS and CDN benefits.

### Option B: Using a Traditional Web Server (Nginx, Apache)

You can serve the contents of the `dist` folder using a web server like Nginx or Apache.

**Example Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name your_frontend_admin_portal_domain.com;

    # Root directory for the frontend static files
    root /path/to/your/GP-ADMIN-PROMO/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: Add headers for caching, security, etc.
    # Example: Caching for static assets
    location ~* \.(?:css|js|jpg|jpeg|gif|png|svg|ico|webp)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
}

# If using SSL (recommended):
# server {
#     listen 443 ssl http2;
#     server_name your_frontend_admin_portal_domain.com;
# 
#     ssl_certificate /path/to/your/fullchain.pem;
#     ssl_certificate_key /path/to/your/privkey.pem;
# 
#     # ... other SSL configurations ...
# 
#     root /path/to/your/GP-ADMIN-PROMO/dist;
#     index index.html;
# 
#     location / {
#         try_files $uri $uri/ /index.html;
#     }
# 
#     # ... caching headers ...
# }
```

**Explanation for `try_files`:** This is important for single-page applications (SPAs) like React. It ensures that all routes are directed to `index.html`, allowing React Router to handle client-side routing.

## 7. Post-Deployment Checks

*   Verify that the frontend loads correctly at its domain.
*   Test login functionality to ensure it communicates with the backend API.
*   Test all features across different user roles.
*   Check browser developer console for any errors.

## 8. Continuous Integration/Continuous Deployment (CI/CD)

For a streamlined development workflow, consider setting up a CI/CD pipeline (e.g., using GitHub Actions, GitLab CI, Jenkins) that automatically builds and deploys the frontend whenever changes are pushed to the main repository branch.

