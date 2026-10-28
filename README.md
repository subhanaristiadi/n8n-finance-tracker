# n8n Finance Tracker

Personal finance transaction tracker built with **n8n, Telegram, an LLM-based Information Extractor, and Google Sheets**. The current workflow supports natural-language transaction logging plus a `/saldo` summary command.

> This repository documents the latest supplied workflow, `Catatan Keuangan Aris Telegram.json`. It is a personal automation project, not a financial advice or banking application.

## Current workflow

```text
Telegram Trigger
       |
       v
      IF -------------------- /saldo or /balance ------------------+
       | false                                                      |
       v                                                            v
Information Extractor                                      Get rows from Google Sheets
       |                                                            |
       v                                                            v
Append transaction row                                     Calculate totals in Code
       |                                                            |
       v                                                            v
Telegram transaction confirmation                         Telegram balance summary
```

### Logging a transaction

Send a plain-language message, for example:

- `beli kopi 25rb`
- `isi bensin 100 ribu`
- `gaji masuk 5 juta`
- `bayar listrik 350rb`

The extractor returns exactly four fields:

| Field | Expected values / meaning |
|---|---|
| `tipe` | `pemasukan` or `pengeluaran` |
| `jumlah` | Numeric amount, without currency symbols |
| `deskripsi` | Short description that preserves the user's meaning |
| `kategori` | One of the six allowed categories below |

Allowed categories are a **closed list**: `Makanan`, `Transport`, `Belanja`, `Tagihan`, `Gaji`, `Lainnya`. The prompt's rules distinguish salary income from bonuses, gifts, or family transfers; those other income sources should use `Lainnya`.

After extraction, the workflow appends a row to Google Sheets and sends a Telegram confirmation.

### Checking the balance

Send `/saldo` or `/balance`.

The workflow reads rows from the configured worksheet and calculates:

- `totalPemasukan`: sum of rows where `Tipe` is `pemasukan`
- `totalPengeluaran`: sum of rows where `Tipe` is `pengeluaran`
- `saldo`: `totalPemasukan - totalPengeluaran`

Rows with a non-numeric `Jumlah` are skipped by the current Code node. The current balance query is configured for a named worksheet (`OKTOBER 2026` in the supplied export), so the displayed balance should be understood as the total of rows returned by that sheet query, not necessarily an all-time balance across every monthly worksheet.

## Technology

- **Automation:** n8n
- **Input/output:** Telegram Bot API
- **Structured storage:** Google Sheets
- **Extraction:** n8n Information Extractor
- **Configured model in the latest supplied JSON:** Groq `openai/gpt-oss-20b`

### Model configuration note

The project instruction specifies **`qwen3.8-max`** for the Finance Bot. However, in the latest attached workflow JSON, the Information Extractor is connected to the **Groq Chat Model** configured as `openai/gpt-oss-20b`; the Alibaba Cloud node set to `qwen3.8-max` is present but unconnected. This repository documents the exported workflow as supplied and does not silently replace the model. Decide which model is intended, then update and test the n8n node explicitly.

## Repository layout

```text
.
├── README.md
├── docs/
│   ├── workflow.md
│   ├── data-schema.md
│   ├── testing.md
│   └── security.md
├── workflows/
│   └── finance-tracker-telegram.sanitized.json
└── .gitignore
```

The committed workflow export is sanitized: credentials, credential IDs, Telegram chat ID, spreadsheet ID/URL, webhook IDs, and instance metadata are removed or replaced with placeholders. It is an import/reference template, **not a ready-to-run export**.

## Setup overview

1. Set up n8n and a Telegram bot.
2. Create a Google spreadsheet and a worksheet with the columns expected by the workflow. The transaction append mapping uses `Tanggal`, `Tipe`, `Jumlah`, `Deskripsi`, `Kategori`, and currently also maps `Saldo` to an empty expression.
3. In n8n, import `workflows/finance-tracker-telegram.sanitized.json`.
4. Configure Telegram credentials and replace the trigger's allowed chat ID placeholder.
5. Configure Google Sheets credentials, document ID, and worksheet reference in both Google Sheets nodes.
6. Configure the LLM provider credentials on the model node. Review the model discrepancy documented above before activating the workflow.
7. Inspect every node and expression, run the tests in `docs/testing.md`, and only then activate the workflow.

Node parameters and available authentication options may vary by installed n8n and node version. Use the imported node UI and your installed version as the final configuration source.

## Known limitations from the supplied workflow

- The current workflow only has a Telegram trigger; Discord is not included in this export.
- The workflow includes no explicit transaction validation node after the LLM extractor. Test the closed-list fields and consider adding deterministic validation before writing to Sheets.
- No deduplication check based on Telegram message/event ID is visible in this workflow. Do not assume duplicate updates are prevented.
- The `/saldo` branch reads from a specific configured worksheet, not an explicitly verified all-month aggregate.
- A `Saldo` column is mapped as an empty expression on the append path. Confirm the intended spreadsheet formula or remove that mapping if it is not needed.
- The balance branch should be tested when the worksheet is empty and when rows contain non-numeric amounts.

## Security

Never commit Telegram bot tokens, API keys, Google service-account JSON, OAuth tokens, webhook secrets, or sensitive transaction data. Use n8n Credentials / secret management. See [`docs/security.md`](docs/security.md).

## Documentation

- [Workflow details](docs/workflow.md)
- [Data schema](docs/data-schema.md)
- [Testing checklist](docs/testing.md)
- [Security and publishing](docs/security.md)

## License

No license has been added yet. Until a license is selected, reuse and redistribution permissions are not explicitly granted.
