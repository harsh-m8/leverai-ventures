# LeverAI Ventures — Landing Page

React + Vite + TailwindCSS landing page for LeverAI Ventures.

---

## Project Structure

```
leverai-app/
├── public/
│   ├── favicon.svg
│   └── staticwebapp.config.json   ← Azure SPA routing config
├── src/
│   ├── index.css                  ← Tailwind directives
│   ├── main.jsx                   ← React entry point
│   └── LandingPage.jsx            ← Main page component
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  ← CI/CD pipeline
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (http://localhost:5173)
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build locally
npm run preview
```

---

## Hosting on Azure — Step-by-Step Guide

There are **two paths**: the recommended **Azure Static Web Apps** (free tier, global CDN, auto CI/CD) and the alternative **Azure Blob Storage + CDN** (more control, manual deploys). Both are covered below.

---

## PATH 1 — Azure Static Web Apps (Recommended)

Azure Static Web Apps is the best fit for React SPAs. It includes a global CDN, automatic HTTPS, preview environments for PRs, and a free tier generous enough for a marketing site.

### Prerequisites

- An **Azure account** — https://portal.azure.com (free tier available)
- **Node.js 20+** installed locally — https://nodejs.org
- **Git** installed — https://git-scm.com
- A **GitHub account** — https://github.com (Azure SWA integrates directly with GitHub)
- **Azure CLI** (optional but useful) — https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

---

### Step 1 — Push your code to GitHub

```bash
# In the leverai-app/ folder:
git init
git add .
git commit -m "Initial commit — LeverAI Ventures landing page"

# Create a new repo at https://github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/leverai-ventures.git
git branch -M main
git push -u origin main
```

---

### Step 2 — Create an Azure Static Web App

**Option A — Azure Portal (GUI)**

1. Go to https://portal.azure.com
2. Click **"Create a resource"** → search **"Static Web App"** → click **Create**
3. Fill in the form:
   - **Subscription**: your Azure subscription
   - **Resource Group**: click "Create new" → name it `leverai-rg`
   - **Name**: `leverai-ventures` (must be globally unique)
   - **Plan type**: `Free` (more than enough for a landing page)
   - **Region**: choose the region closest to your users (e.g. `East US 2`, `West Europe`)
   - **Deployment source**: `GitHub`
4. Click **"Sign in with GitHub"** → authorize Azure
5. Select your **Organization**, **Repository** (`leverai-ventures`), and **Branch** (`main`)
6. Under **Build Details**:
   - **Build Presets**: select `React`
   - **App location**: `/` (root of the repo)
   - **Api location**: leave blank
   - **Output location**: `dist`
7. Click **Review + Create** → **Create**

Azure will automatically:
- Add the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret to your GitHub repo
- Commit the GitHub Actions workflow file to your repo
- Trigger the first build and deploy

**Option B — Azure CLI**

```bash
# Login
az login

# Create a resource group
az group create \
  --name leverai-rg \
  --location eastus2

# Create the Static Web App
az staticwebapp create \
  --name leverai-ventures \
  --resource-group leverai-rg \
  --source https://github.com/YOUR_USERNAME/leverai-ventures \
  --location eastus2 \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

---

### Step 3 — Monitor the deployment

1. In the Azure Portal, go to your Static Web App resource
2. Click **"GitHub Actions runs"** in the left sidebar, or go directly to:
   `https://github.com/YOUR_USERNAME/leverai-ventures/actions`
3. You'll see the **"Deploy to Azure Static Web Apps"** workflow running
4. First deploy typically takes 2–4 minutes

When it shows a green checkmark, your site is live.

---

### Step 4 — Get your live URL

1. In the Azure Portal → your Static Web App resource → **Overview**
2. Copy the **URL** — it will look like:
   `https://lively-rock-abc123.azurestaticapps.net`

That's your live site. HTTPS is automatic — no certificate setup needed.

---

### Step 5 — Add a custom domain (optional)

1. In Azure Portal → your Static Web App → **Custom domains** (left sidebar)
2. Click **"+ Add"**
3. Enter your domain: `www.leveraiventures.com`
4. Azure provides a **CNAME record** to add to your DNS provider:
   ```
   Type:  CNAME
   Host:  www
   Value: lively-rock-abc123.azurestaticapps.net
   TTL:   3600
   ```
5. Add that record in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
6. Return to Azure and click **"Validate"** — Azure provisions the SSL cert automatically (uses Let's Encrypt, free)

For the apex/root domain (`leveraiventures.com` without www):
- Azure SWA supports apex domains via **ALIAS** or **ANAME** records
- In Cloudflare: use a **CNAME flattening** record pointing to the `.azurestaticapps.net` URL
- In other registrars: check if they support ALIAS/ANAME records

---

### Step 6 — Continuous deployment

Every time you `git push` to the `main` branch, GitHub Actions automatically:
1. Installs dependencies (`npm ci`)
2. Runs the build (`npm run build`)
3. Deploys the `dist/` folder to Azure's global CDN

Pull requests automatically get **staging preview URLs** (e.g. `https://lively-rock-abc123-pr-5.azurestaticapps.net`) so you can review before merging.

---

## PATH 2 — Azure Blob Storage + Azure CDN (Manual)

Use this if you want full control, already have a CDN setup, or need custom configuration not available in SWA.

### Step 1 — Build the project

```bash
npm install
npm run build
# Output is in the dist/ folder
```

### Step 2 — Create a Storage Account

```bash
az group create --name leverai-rg --location eastus2

az storage account create \
  --name leveraistatic \
  --resource-group leverai-rg \
  --location eastus2 \
  --sku Standard_LRS \
  --kind StorageV2
```

### Step 3 — Enable static website hosting

```bash
az storage blob service-properties update \
  --account-name leveraistatic \
  --static-website \
  --index-document index.html \
  --404-document index.html
```

The `--404-document index.html` is critical — it enables SPA routing (React Router / hash navigation).

### Step 4 — Upload the build

```bash
az storage blob upload-batch \
  --account-name leveraistatic \
  --source ./dist \
  --destination '$web' \
  --overwrite
```

Your site is now accessible at the Blob Storage URL:
```
https://leveraistatic.z13.web.core.windows.net
```

### Step 5 — Add Azure CDN (for custom domain + HTTPS)

```bash
# Create CDN profile
az cdn profile create \
  --name leverai-cdn \
  --resource-group leverai-rg \
  --sku Standard_Microsoft

# Create CDN endpoint pointing to blob storage
az cdn endpoint create \
  --name leverai-endpoint \
  --profile-name leverai-cdn \
  --resource-group leverai-rg \
  --origin leveraistatic.z13.web.core.windows.net \
  --origin-host-header leveraistatic.z13.web.core.windows.net \
  --enable-compression true
```

Then add your custom domain via the Azure Portal → CDN endpoint → "Custom domains".

---

## Environment Variables

If you need to add API keys or config later (e.g. for a contact form endpoint), create a `.env.local` file locally:

```env
VITE_API_URL=https://your-api.com
VITE_FORM_ENDPOINT=https://your-form-handler.com/submit
```

In Azure Static Web Apps, set environment variables via:
- **Portal**: Static Web App → Configuration → Application settings
- **CLI**: `az staticwebapp appsettings set --name leverai-ventures --resource-group leverai-rg --setting-names VITE_API_URL=https://your-api.com`

Note: Vite only exposes variables prefixed with `VITE_` to the client bundle.

---

## Estimated Azure Costs

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Azure Static Web Apps | Free | $0 |
| Azure Static Web Apps | Standard (if you need APIs) | ~$9/month |
| Blob Storage + CDN | Pay-as-you-go | ~$1–5/month for a landing page |
| Custom domain SSL | Included with SWA | $0 |

**For a landing page, the Free tier of Azure Static Web Apps costs $0.**

---

## Troubleshooting

**Build fails in GitHub Actions**
- Check Node version: the workflow uses Node 20. If you need a different version, edit `.github/workflows/azure-static-web-apps.yml`
- Check the Actions tab in your GitHub repo for the full error log

**Page shows 404 on direct URL access (e.g. /audit)**
- Ensure `public/staticwebapp.config.json` is present — it handles SPA routing fallback
- For Blob Storage: confirm `--404-document index.html` was set

**Custom domain not resolving**
- DNS propagation can take up to 48 hours (usually under 1 hour with Cloudflare)
- Verify the CNAME record with: `nslookup www.yourdomain.com`

**Styles not loading after deploy**
- Run `npm run build` locally and check the `dist/` folder looks correct before pushing
- Ensure `tailwind.config.js` content paths include `./src/**/*.{js,ts,jsx,tsx}`
