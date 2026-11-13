# setup-site-remote.ps1
# Configures the 'site' Git remote for NutriGuide Sites deployment.
# Run once after every fresh clone. Safe to re-run — it replaces an existing site remote.
#
# Usage:
#   .\scripts\setup-site-remote.ps1
#
# After running this script, deploy with:
#   git push site main
# Git Credential Manager will open a browser window for ChatGPT authentication on first push.

$SiteRemoteUrl = "https://git.chatgpt-team.site/b9c64515-d6d6-491d-9ad6-4c8885992e3e/appgprj_6af73121356c81918979ed6ea0bbc272.git"

$existing = git remote get-url site 2>$null
if ($existing) {
    Write-Host "site remote already exists: $existing"
    Write-Host "Updating to: $SiteRemoteUrl"
    git remote set-url site $SiteRemoteUrl
} else {
    Write-Host "Adding site remote..."
    git remote add site $SiteRemoteUrl
}

Write-Host ""
Write-Host "Configured remotes:"
git remote -v

Write-Host ""
Write-Host "Setup complete. To deploy, run:"
Write-Host "  git push site main"
Write-Host ""
Write-Host "On first push, Git Credential Manager will open a browser window."
Write-Host "Sign in with your ChatGPT account (Google login works in the browser)."
Write-Host "Credentials are cached by Windows Credential Manager for future pushes."
