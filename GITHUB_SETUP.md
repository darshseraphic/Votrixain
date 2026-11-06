# Publish Votrixain on GitHub

Suggested repository name: `votrixain-chrome-extension`.

1. Create a new repository at <https://github.com/new>.
2. Set the repository name to `votrixain-chrome-extension` and visibility to **Public**.
3. Do not initialize it with a README, license, or `.gitignore`; those files are already included here.
4. Extract this archive and open a terminal in the extracted `Votrixain-GitHub` folder.
5. Run the following commands, replacing `YOUR-USERNAME` with your GitHub username:

   ```bash
   git init
   git add .
   git commit -m "Initial release: Votrixain v0.4.4"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/votrixain-chrome-extension.git
   git push -u origin main
   ```

Using Git ensures hidden files such as `.github/workflows/tests.yml` are uploaded too.

The repository is prepared locally in this archive. It has not been pushed to GitHub.
