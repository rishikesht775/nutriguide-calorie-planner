# Maintaining the NutriGuide application document

The maintained source is APPLICATION.md. GENERATED-INVENTORY.md contains generated route/module/test file inventory. source-manifest.json fingerprints the app, tests, build/configuration and documentation maintenance inputs. None contains credentials.

## Every change

Review the actual code and update affected requirements, architecture, data flows, UI behavior, limitations and the revision log. Then run:

```powershell
npm.cmd run docs:update
npm.cmd run docs:check
```

Commit all resulting documentation and source changes together. CI rejects stale fingerprints and generates an up-to-date Word document on each passing push/PR. A deliberate refresh without a narrative review can satisfy the mechanical check but still leave incorrect documentation; reviewers must check meaning. Runtime/provider-only changes also require a narrative/revision update even when source hashes do not change.

## Generate a Word snapshot locally

Normal app testing requires Node, not Python. Word export generation additionally requires Python 3.11 or later and python-docx, plus Graphviz (`dot` must be on PATH):

```powershell
py -m pip install -r scripts/docs-requirements.txt
npm.cmd run docs:export
```

If Python is not installed on your Windows machine, use the NutriGuide application document artifact from the Documentation workflow in GitHub Actions instead. The export is under docs/exports and is intentionally ignored by Git. Downloads are snapshots; they cannot update themselves. CI generates a new export after future changes and does not overwrite a previously downloaded file on your device.

## Delivery and review

The repository AGENTS.md carries the update rule for future development sessions. The independent documentation CI job runs even when browser tests cannot start. It checks freshness, regenerates DOCX from the maintained Markdown and uploads the export. It does not certify content correctness, provider status or visual layout. Inspect rendered Word pages after substantive layout changes. Do not edit DOCX independently of Markdown.

This workflow creates no recurring scheduled task: updates belong to the change/release workflow. To review separate test categories and automatic TXT evidence, use README-KIRO.md.
