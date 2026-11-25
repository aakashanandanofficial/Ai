# StudySpark

StudySpark is an installable study assistant website for maths, physics, chemistry, biology, and other subjects. It connects to a local Ollama model, so questions are answered on this computer without OpenAI API credits.

## Run it on your computer

1. Install [Ollama for Windows](https://ollama.com/download/windows).
2. Open PowerShell and run `ollama pull qwen3.5:2b` to download the local model (about 3 GB).
3. Install Node.js 20 or newer if it is not already installed.
4. In this folder, run `npm start`.
5. Open `http://localhost:3000` in your browser.

On Windows, after installing Ollama and downloading the model once, double-click `Start StudySpark.bat` to start the website.

The model runs on your computer. Its first download requires an internet connection and about 3 GB of disk space; after that, answering questions does not use OpenAI API credits. A smaller local model can be slower or less accurate than a large hosted AI model.

## Install it like an app

Open the running site in a supported browser and choose **Install app** (or use the browser's Install/Add to Home Screen option). The app shell can reopen offline; asking new questions needs an internet connection.

## Put it online

The included `render.yaml` can publish a free public preview on Render. The preview shows the website, but AI answers are disabled there: Render cannot reach the Ollama model installed on your computer. Render's free web services have 512 MB RAM, while the downloaded model is 2.7 GB, so this configuration is for sharing the design only.

To publish the preview, first upload the project files to a GitHub repository (do not upload `.env`). Then, in Render, choose **New → Blueprint**, connect that repository, and deploy the Blueprint from `render.yaml`. Render will give the site a public `onrender.com` link. Free services may spin down after 15 minutes without visitors and can take about a minute to wake up.

To let visitors ask questions, the AI model must also run on an internet-accessible server, or the app must use a hosted AI provider. That needs a separate setup; a public Render preview alone does not make your computer's local Ollama model available to visitors.
