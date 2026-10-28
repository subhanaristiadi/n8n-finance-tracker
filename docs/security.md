# Security and Publishing Checklist

This repository is public. Treat every committed file as readable by anyone.

## Never commit

- Telegram bot tokens
- AI/provider API keys
- n8n credential objects or credential identifiers
- Google service-account JSON or OAuth tokens
- Private chat IDs, webhook secrets, execution payloads, or real financial records
- Spreadsheet IDs/URLs unless the sheet is intentionally public

## Before each commit

1. Review the staged diff.
2. Search for token-like strings, API keys, `credentials`, `webhookId`, chat IDs, and spreadsheet IDs.
3. Use synthetic data in examples.
4. Sanitize exported workflow JSON before publishing.
5. Store secrets only in n8n Credentials or a suitable secret manager.

## If a secret was published

Revoking/rotating the secret at the provider is the first priority. Removing it from the latest commit does not remove it from Git history or copies already fetched. Clean repository history afterward when needed.

## Importing the workflow

The committed workflow JSON is a sanitized template, not a ready-to-run export. Replace placeholders in n8n, configure credentials securely, check the configured model and spreadsheet target, run the test checklist, and only then activate the workflow.
