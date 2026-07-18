# Genius Tailors - Production Deployment Guide
**Hosting:** 24hostio (cPanel) | **Domain:** Spaceship

This guide covers the exact, step-by-step process of taking the codebase from your local computer and making it live on the internet using your Spaceship domain and 24hostio plan.

---

## Phase 1: Connect Domain to Hosting (Spaceship -> 24hostio)
Your hosting provider needs permission to manage your domain name.

1. **Find your 24hostio Nameservers:** When you bought the 24hostio plan, you received an email with your account details, including two "Nameservers" (usually looking like `ns1.24hostio.com` and `ns2.24hostio.com`).
2. **Log in to Spaceship:** Go to your Spaceship dashboard and click on your domain.
3. **Change Nameservers:** Find the DNS / Nameservers section. Switch it from "Spaceship Basic DNS" to **Custom DNS**.
4. **Enter Nameservers:** Paste the two 24hostio nameservers into the fields and save. 
*(Note: It can take anywhere from 15 minutes to 24 hours for the internet to recognize this change. You can proceed with the next steps in the meantime).*

---

## Phase 2: Create a Subdomain for the Backend
Because this is a MERN stack app, the Frontend and Backend run separately. We will put the frontend on your main domain (`yourdomain.com`) and the backend on a subdomain (`api.yourdomain.com`).

1. Log in to your **24hostio cPanel**.
2. Scroll down to the **Domains** section and click on **Domains** (or Subdomains).
3. Click **Create A New Domain**.
4. Enter `api.yourdomain.com` (replace with your actual domain).
5. Uncheck "Share document root". Let it create a new folder (e.g., `api.yourdomain.com`).
6. Click **Submit**.

---

## Phase 3: Deploy the Backend (Node.js)

### 1. Prepare Backend Files Locally
1. On your computer, open your `backend` folder.
2. Select all files **EXCEPT** the `node_modules` folder and `.env` file.
3. Right-click and compress/zip them into a file called `backend.zip`.

### 2. Upload to cPanel
1. In cPanel, go to **File Manager**.
2. Find the folder created for your subdomain (e.g., `api.yourdomain.com`).
3. Click **Upload** at the top, and upload `backend.zip`.
4. Once uploaded, go back to File Manager, right-click `backend.zip`, and click **Extract**. Delete the `.zip` file afterward to save space.

### 3. Setup the Node.js App
1. Go back to the main cPanel dashboard. Find the **Software** section and click **Setup Node.js App**.
2. Click **Create Application**.
3. **Node.js version:** Select `20.x` (or whatever is latest supported).
4. **Application mode:** Production.
5. **Application root:** Type the folder name where you extracted the files (e.g., `api.yourdomain.com`).
6. **Application URL:** Select your `api.yourdomain.com` domain from the dropdown.
7. **Application startup file:** Type `api/index.js`.
8. Click **Create**.

### 4. Install Dependencies & Environment Variables
1. While still on the Node.js App page, scroll down and find the **Environment Variables** section. Add all your variables from your local `.env` file here (e.g., `PORT`, `MONGO_URI`, `JWT_SECRET`, etc.).
2. Scroll up and click **Run NPM Install**. This will install the backend packages.
3. Click **Restart** at the top of the page.
*(Your backend is now live!)*

---

## Phase 4: Deploy the Frontend (React / Vite)

### 1. Prepare Frontend Files Locally
1. On your computer, open your project in VS Code.
2. Open the `frontend/.env` file (or create it if it doesn't exist). Add the following line, replacing with your actual API domain:
   ```env
   VITE_API_URL=https://api.yourdomain.com
   ```
3. Open your terminal, navigate to the `frontend` folder, and run:
   ```bash
   npm run build
   ```
4. This creates a new folder called `dist`. Open the `dist` folder on your computer, select all files inside it, and zip them into `frontend.zip`.

### 2. Upload to cPanel
1. In cPanel, go to **File Manager**.
2. Open the **`public_html`** folder (this is the root of your main domain).
3. If there are any default cPanel files here (like `default.html`), delete them.
4. Click **Upload** and upload `frontend.zip`.
5. Right-click `frontend.zip` -> **Extract**. 
*(Your website is now live!)*

---

## Phase 5: Final Configuration

### 1. SSL Certificates (HTTPS)
Your 24hostio plan comes with free SSL.
1. In cPanel, go to **SSL/TLS Status**.
2. Select your domains (`yourdomain.com` and `api.yourdomain.com`).
3. Click **Run AutoSSL**. This will give your site the secure padlock icon.

### 2. MongoDB IP Whitelisting
By default, MongoDB Atlas blocks connections from unknown servers. 
1. Log into your MongoDB Atlas account.
2. Go to **Network Access** on the left menu.
3. Click **Add IP Address**.
4. Select **Allow Access From Anywhere** (`0.0.0.0/0`) and save. 
*(This ensures your 24hostio server is legally allowed to read your database).*

### 3. Check Image Permissions
1. In cPanel File Manager, navigate to `api.yourdomain.com/public/uploads`.
2. Right-click the `uploads` folder -> **Change Permissions**.
3. Ensure it is set to **755** so your Node.js backend can successfully save images when admins upload them.

---

## Phase 6: How to Update Your Live Website in the Future
Whenever you make code changes locally on your computer and want to push them to your live server, you do not need to repeat the entire setup. Just follow these quick steps:

### Updating the Frontend (React code, UI changes)
1. Make your changes and test them locally.
2. Open your terminal in the `frontend` folder and run `npm run build`.
3. Zip the newly generated `dist` folder into `frontend.zip`.
4. Go to cPanel File Manager -> `public_html`.
5. Upload `frontend.zip` and extract it. When it asks, choose to **overwrite** the existing files. (Your UI updates instantly).

### Updating the Backend (Node.js code, API, Database logic)
1. Make your changes and test them locally.
2. Zip the updated backend files (e.g., just `index.js`, or the whole `backend` folder excluding `node_modules`).
3. Go to cPanel File Manager -> your backend folder (e.g. `api.yourdomain.com`).
4. Upload and extract the zip file, **overwriting** the old files.
5. **CRITICAL:** Backend changes do not apply instantly. You must go to **Setup Node.js App** in cPanel and click the **Restart** button for the server to load your new code!
