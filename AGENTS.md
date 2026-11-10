# NutriGuide project instructions

## Keep application documentation current
For every application, test, dependency, configuration, integration or deployment behavior change:
- Review and update docs/APPLICATION.md and its revision log in the same commit. Describe actual behavior, requirements, architecture, data/contracts, limitations and verification affected by the change.
- Update relevant specialist guides and test coverage/status notes. Clearly distinguish implemented, conditional, limited and planned features, and actual results from mocks or unexecuted checks.
- Run npm run docs:update after the final source/doc edits, then npm run docs:check. Commit docs/GENERATED-INVENTORY.md and docs/source-manifest.json together with the change.
- CI checks documentation freshness and generates a current Word artifact. A fingerprint check does not replace semantic review. Never claim a downloaded Word snapshot updates itself.
- Keep secrets, passwords, SMTP keys, tokens, private callback URLs and actual user wellness data out of documentation, source and reports.
- Publish and synchronize authorized changes using the established Sites/GitHub workflow. Remind the user to pull into Kiro; never discard local user changes.
- Preserve automatic TXT reports. Record checks that did not execute and external-provider acceptance still pending.

The authoritative document is docs/APPLICATION.md. Word exports are generated from that document and inventory, not edited independently.
