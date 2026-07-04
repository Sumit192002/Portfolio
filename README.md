# DevOps & Linux Operations Console Portfolio

A premium, highly interactive single-page portfolio website designed for **Sumit Padiyar (Linux/Cloud Specialist & DevOps Engineer)**. Styled as a modern system monitoring console with live metrics telemetry, a fully functioning bash-style terminal emulator, and an SMTP tunneling mock console.

🔗 **Live Demo:** [Deploy to GitHub Pages to get your link]

---

## 🛠️ Visual & Interactive Features

1. **Infrastructure Telemetry Dashboard**:
   - Simulated production dashboard using HTML5 Canvas rendering engine.
   - Shows live updating line graphs for CPU load, Memory usage (16GB node), and Network bandwidth metrics.
   - Running uptime counters and indicator pills.

2. **Interactive Bash CLI Terminal**:
   - Custom-built command parser. Try clicking quick commands or typing:
     - `neofetch` - Inspect system logs, operator specs, and hardware nodes.
     - `skills` - Outputs structured grids of Linux administration and cloud automation skills.
     - `experience` - Displays chronological history (Infobell IT, Aforeserve, Prodevans).
     - `projects` - Prints project architectures and repository links.
     - `cat [summary | certs | education]` - Inspects detailed profile sub-files.
     - `ping [host]` - Runs ICMP packet latency simulations.
     - `sudo [command]` - Trigger superuser checks (e.g. try `sudo rm -rf /` for custom firewall alerts).
     - `clear` - Clears the console screen.
   - Features up/down arrow key history retrieval.

3. **Secure SMTP Transmission Console**:
   - Contact form actions intercept standard email submission and trigger animated feedback logs.
   - Displays real-time logging sequences: spawning SSH tunnels, certificate handshakes, payload formatting, transmission, and validation.

4. **Sleek Tech Aesthetics**:
   - Deep slate/dark background variables.
   - Glassmorphic panels with customizable blur coefficients.
   - CRT-style scrolling screen scanline overlays.
   - Highlighted tabs tracked with custom scroll spy tracking indicators.

---

## 🚀 Getting Started

### Local Setup
Since the application has **zero external dependencies** and uses native HTML5 APIs, you can run it immediately without compiling:
1. Clone or download this directory.
2. Double-click the `index.html` file to open it in any web browser.
3. *Alternative (Recommended):* Serve it using a lightweight local server to prevent local file security warnings on certain scripts:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node/NPM
   npx serve .
   ```

---

## 🌐 Deploying Freely to GitHub Pages

GitHub Pages is a free, secure, and fast hosting service provided by GitHub to host static HTML/CSS/JS websites directly from a repository.

### Step 1: Create a GitHub Repository
1. Log in to your [GitHub account](https://github.com).
2. Click the **New** button to create a new repository.
3. Configure the settings:
   - **Repository name**: You can name it anything (e.g., `portfolio` or `sumit-padiyar.github.io`).
   - **Public**: Ensure the repository visibility is set to **Public**.
   - Do **NOT** initialize it with a README, `.gitignore`, or license (since we have them already).
4. Click **Create repository**.

### Step 2: Push Your Local Code to GitHub
Open your terminal (PowerShell or Bash) in the folder containing `index.html`, `styles.css`, and `script.js` and execute:

```bash
# Initialize local git repository
git init

# Add all project files
git add .

# Create initial commit
git commit -m "feat: initial commit of DevOps portfolio console"

# Rename default branch to main
git branch -M main

# Link your local repo to GitHub (replace URL with your repository's URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Push files to the main branch
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub.com.
2. Click on the **Settings** tab (gear icon at the top).
3. In the left-hand sidebar, scroll down to the **Code and automation** section and click **Pages**.
4. Under the **Build and deployment** section:
   - **Source**: Select **Deploy from a branch**.
   - **Branch**: Click the dropdown menu that says `None`, select **`main`**, and keep the folder set to **`/ (root)`**.
5. Click the **Save** button.

### Step 4: Access Your Live Site!
- Wait about 1-2 minutes for GitHub Actions to build and deploy your pages.
- Refresh the **Pages** settings menu. You will see a banner at the top displaying your live URL:
  > **Your site is live at:** `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`
- Click the link to view your stylish, fully functional portfolio console!

---

## 🛡️ License & Attributions
- Built for **Sumit Padiyar** under the MIT License.
- Icons by **FontAwesome**.
- Typography hosted by **Google Fonts**.
