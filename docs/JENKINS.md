# Jenkins regression pipeline

The Jenkinsfile runs contract checks, reporter checks, test TypeScript checks, documentation inventory regeneration and validation, and the complete Playwright suite for desktop Chromium and mobile Chromium. A GitHub push to `main` starts the job after the Jenkins GitHub webhook is configured. This pipeline does not publish the live Sites website.

## Jenkins agent requirements

- A dedicated Jenkins agent labelled `nutriguide-ci`.
- Node.js 24 and npm, matching the GitHub Actions workflow.
- Git installed and able to check out `https://github.com/rishikesht775/nutriguide-calorie-planner.git`.
- Chromium system dependencies installed on Linux agents. Each build downloads the matching browser with `npx playwright install chromium`.
- No production account, SMTP, Supabase, Sites, or wellness-data credentials are required. The automated app tests use local or mocked auth and state routes.

The pipeline supports Windows and Linux agents. It uses `npm.cmd` and `npx.cmd` on Windows and `npm` and `npx` on Linux. Concurrent builds are disabled because Playwright starts a local web server on the configured test port.

## Create the Jenkins job

1. Install Jenkins Git, Pipeline, and GitHub plugins.
2. Create a Pipeline job using **Pipeline script from SCM**.
3. Set SCM to Git, repository URL to `https://github.com/rishikesht775/nutriguide-calorie-planner.git`, branch to `*/main`, and Script Path to `Jenkinsfile`.
4. Assign the job to an agent labelled `nutriguide-ci`.
5. Under Build Triggers, enable **GitHub hook trigger for GITScm polling**. The Jenkinsfile also declares the GitHub push trigger.
6. Save the job and run it once manually. Confirm all stages complete and the Playwright reports are attached to the build.

## Configure the GitHub webhook

Jenkins needs a stable HTTPS URL reachable from GitHub. In the repository, open **Settings → Webhooks → Add webhook** and enter:

- Payload URL: `https://<public-jenkins-host>/github-webhook/`
- Content type: `application/json`
- Events: **Just the push event**
- Active: enabled

If Jenkins uses a URL prefix or custom endpoint, use the GitHub hook URL shown under **Manage Jenkins → Configure System → GitHub**. Keep Jenkins behind TLS and do not expose an unauthenticated Jenkins login or script console. Only a repository owner or administrator can add the GitHub webhook.

GitHub cannot deliver webhooks to `localhost` or a private network. Use a secured public reverse proxy or approved webhook relay. After saving the webhook, check GitHub **Recent Deliveries**, send a test ping, then push to `main` and confirm Jenkins starts the regression build.

## What a passing run means

A passing Jenkins build means the listed automated checks passed for the checked-out commit on that agent. It does not deploy the live Sites source, verify real email delivery, prove physical-device behavior, or replace manual accessibility and provider acceptance.
