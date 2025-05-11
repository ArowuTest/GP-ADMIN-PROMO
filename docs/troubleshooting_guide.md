# Mynumba Don Win - Admin Portal Troubleshooting Guide

**Version:** 1.0
**Date:** May 11, 2025

This guide provides solutions to common issues that may arise while using or deploying the Mynumba Don Win Admin Portal.

## 1. Frontend Issues

### 1.1. Unable to Log In

*   **Symptom:** Entering credentials and clicking "Login" results in an error message (e.g., "Failed to login," "Invalid credentials") or no action.
*   **Possible Causes & Solutions:**
    1.  **Incorrect Credentials:** Double-check your username (or email) and password. Ensure Caps Lock is off.
    2.  **Backend API Not Reachable:**
        *   Verify the backend service is running and accessible. Check its logs for errors.
        *   Ensure the `VITE_API_BASE_URL` in the frontend's `.env.production` (or `.env.development` for local) file is correctly pointing to the backend API URL (e.g., `https://your_backend_api_domain.com/api/v1`).
        *   Check network connectivity between your browser and the backend server. Open browser developer tools (Network tab) to see the login API request and its response status.
    3.  **CORS Issues:**
        *   If the frontend and backend are on different domains, ensure the backend has Cross-Origin Resource Sharing (CORS) configured correctly to allow requests from the frontend's domain. Check the `CORS_ALLOWED_ORIGINS` environment variable in the backend's `.env` file.
        *   Look for CORS errors in the browser developer console.
    4.  **User Account Issues:** Your account might be inactive or locked. Contact a SuperAdmin to check your account status.

### 1.2. Features Not Visible or Not Working as Expected (Role-Based Access)

*   **Symptom:** Certain menu items, buttons, or pages are not visible, or actions are disabled, even though you expect to have access.
*   **Possible Causes & Solutions:**
    1.  **Incorrect Role Assignment:** Your user account might not have the correct role assigned for the feature you are trying to access. Contact a SuperAdmin to verify your role and permissions.
    2.  **Frontend RBAC Logic Error:** There might be an issue in the frontend code that determines visibility based on roles. This would require a developer to investigate.
    3.  **Backend Authorization Denied:** The backend API might be correctly denying access based on your role. Check browser developer tools (Network tab) for API requests returning 403 Forbidden errors.

### 1.3. Data Not Loading or Displaying Incorrectly

*   **Symptom:** Pages show loading spinners indefinitely, display no data, or show outdated/incorrect information.
*   **Possible Causes & Solutions:**
    1.  **Backend API Issues:** The backend API endpoint responsible for fetching the data might be down, slow, or returning errors. Check backend logs and browser developer tools (Network tab) for failed API requests.
    2.  **Database Connectivity:** The backend might be unable to connect to the PostgreSQL database. Check database server status and backend logs.
    3.  **PostHog Integration Issues:** If data related to draw eligibility or participants is missing, there might be an issue with the backend's connection to PostHog or with the data cohorts in PostHog itself.
    4.  **Frontend State Management:** There could be an issue with how the frontend manages and displays the data. This would require developer investigation.

### 1.4. Draw Execution Fails or Animation Hangs

*   **Symptom:** Clicking "Execute Draw" results in an error, or the animation plays but results are not shown.
*   **Possible Causes & Solutions:**
    1.  **Backend Draw Logic Error:** An error might have occurred in the backend during the draw selection process. Check backend logs for detailed error messages.
    2.  **PostHog Data Issues:** The backend might not be ableto fetch valid participant data from PostHog for the selected draw date.
    3.  **Database Write Issues:** The backend might be unable to save the draw results to the database.
    4.  **Timeout Issues:** If the draw process is very long (many participants/points), a request timeout might occur. This might require optimizing the draw logic or increasing timeout settings (e.g., in a reverse proxy like Nginx).

## 2. Backend Issues (Server-Side)

### 2.1. Backend Service Fails to Start

*   **Symptom:** The `mynumba_backend` executable fails to run or the systemd service does not start.
*   **Possible Causes & Solutions:**
    1.  **Missing or Incorrect `.env` File:** Ensure the `.env` file exists in the backend project root and contains all required environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET_KEY, etc.) with correct values.
    2.  **Database Connection Failure:** The backend cannot connect to the PostgreSQL database. Verify database server is running, accessible, and credentials in `.env` are correct. Check database logs.
    3.  **Port Conflict:** The port specified in the `PORT` environment variable (default 8080) might already be in use by another application. Change the port or stop the conflicting application.
    4.  **Go Version Incompatibility:** Ensure the Go version used to build the executable matches the one required by the project and its dependencies (target Go 1.21.x).
    5.  **File Permissions:** Ensure the user running the service has execute permissions for the `mynumba_backend` binary and read access to the `.env` file and other necessary project files.
    6.  **Systemd Service Configuration Error:** If using systemd, double-check the paths and user in the `mynumba-backend.service` file.

### 2.2. API Endpoints Return Errors (5xx Server Errors)

*   **Symptom:** Frontend receives 500, 502, 503, etc., errors from the backend.
*   **Possible Causes & Solutions:**
    1.  **Bugs in Handler Logic:** There might be unhandled errors or panics in the Go code for specific API handlers. Check backend application logs (e.g., `journalctl -u mynumba-backend` if using systemd) for detailed error messages and stack traces.
    2.  **Database Issues:** Problems with database queries (syntax errors, connection drops, full disk on DB server).
    3.  **Resource Exhaustion:** The server might be running out of memory or CPU. Monitor server resources.
    4.  **Dependency Issues:** Problems with external services like PostHog if the API call to them fails.

### 2.3. JWT Authentication Issues

*   **Symptom:** Users cannot log in, or valid tokens are rejected.
*   **Possible Causes & Solutions:**
    1.  **Incorrect `JWT_SECRET_KEY`:** The `JWT_SECRET_KEY` in the `.env` file must be identical to the one used when tokens were issued. If it changes, previously issued tokens become invalid.
    2.  **Token Expiration:** JWTs have an expiration time. If a token is expired, it will be rejected. This is normal; the user needs to log in again.
    3.  **Clock Skew:** Significant time differences between the server issuing the JWT and the server validating it (if they are different, though not typical for this setup) can cause issues with `nbf` (not before) and `exp` (expiration) claims.

## 3. Deployment & Configuration Issues

### 3.1. Go Build Failures

*   **Symptom:** `go build` command fails.
*   **Possible Causes & Solutions:**
    1.  **Go Version Mismatch:** The `go.mod` file might specify a Go version different from the one installed. Either update `go.mod` (e.g., `go mod edit -go 1.21`) or install the required Go version.
    2.  **Missing Dependencies:** Run `go mod tidy` to ensure all dependencies are downloaded and consistent.
    3.  **Syntax Errors in Code:** Compiler errors will point to the problematic code.

### 3.2. Frontend Build Failures (`npm run build` or `yarn build`)

*   **Symptom:** Vite build process fails.
*   **Possible Causes & Solutions:**
    1.  **Missing Node Modules:** Run `npm install` or `yarn install` first.
    2.  **TypeScript Errors:** Type errors in the `.tsx` or `.ts` files.
    3.  **Environment Variable Issues:** Problems with how `VITE_` prefixed environment variables are accessed or defined.
    4.  **Outdated Dependencies:** Try updating key dependencies if error messages suggest compatibility issues.

### 3.3. Reverse Proxy (Nginx/Apache) Misconfiguration

*   **Symptom:** Cannot access the application through the domain, or get errors like 502 Bad Gateway.
*   **Possible Causes & Solutions:**
    1.  **Incorrect `proxy_pass` (Nginx) or `ProxyPass` (Apache):** Ensure the reverse proxy is pointing to the correct address and port where the backend (or frontend, if serving static files via Nginx) is running (e.g., `http://localhost:8080` for the backend).
    2.  **SSL Configuration Errors:** If using HTTPS, ensure SSL certificates are correctly configured, valid, and paths are correct.
    3.  **Firewall Issues:** Server firewall might be blocking traffic on port 80 or 443, or on the backend application's port.

## 4. General Advice

*   **Check Logs:** Always check application logs (backend and frontend browser console) and server logs (systemd journal, Nginx/Apache logs, PostgreSQL logs) for detailed error messages. They are the first place to look for clues.
*   **Reproduce the Issue:** Try to reliably reproduce the issue with specific steps. This helps in diagnosing the problem.
*   **Isolate the Problem:** Determine if the issue is frontend, backend, database, network, or configuration related.
*   **Consult Documentation:** Refer to the User Guide, Technical Documentation, and Deployment Guides.

If you cannot resolve an issue, gather as much information as possible (error messages, logs, steps to reproduce) before seeking further assistance from the development team or system administrator.

