# Current Workflow Reference

Source of truth: the user-supplied `Catatan Keuangan Aris Telegram.json` attached on 2026-10-28.

## Node map

| Node | Role | Verified behavior in supplied export |
|---|---|---|
| `Telegram Trigger` | Input | Listens for message updates; original export restricts `chatIds` to one chat (redacted in repository copy). |
| `If` | Command router | Routes trimmed, lowercase `/saldo` and `/balance` to the balance path; other message text goes to extraction. |
| `Information Extractor` | Parse transaction | Receives `message.text`; schema contains `tipe`, `jumlah`, `deskripsi`, `kategori`. |
| `Groq Chat Model` | LLM connection | Connected to extractor; model set to `openai/gpt-oss-20b`. |
| `Append row in sheet` | Persistence | Appends transaction fields and timestamp to the configured Google Sheets worksheet. |
| `Send a text message` | Confirmation | Sends transaction confirmation to the originating Telegram chat. |
| `Get row(s) in sheet` | Balance input | Reads rows from the configured Google Sheets worksheet. |
| `Code in JavaScript` | Balance calculation | Sums numeric `Jumlah` by `Tipe`; computes income minus expense. |
| `Send a text message1` | Balance response | Formats totals using Indonesian number formatting and replies to Telegram. |

Disconnected model nodes in the source export are omitted from the sanitized workflow template because they are not in the execution path.

## Transaction path

1. Telegram sends a `message` update.
2. `If` checks `($json.message.text || '').trim().toLowerCase()`.
3. If it equals `/saldo` or `/balance`, execution takes the balance path.
4. Otherwise, `Information Extractor` parses `message.text`.
5. `Append row in sheet` maps `Tanggal`, `Tipe`, `Jumlah`, `Deskripsi`, `Kategori`, and `Saldo`.
6. The `Tanggal` expression is `$now.setZone('Asia/Makassar').toFormat('yyyy-MM-dd HH:mm')`.
7. `Saldo` is currently mapped to an empty expression in the supplied export; confirm its intended behavior.
8. Telegram sends a confirmation containing the extracted fields.

## Balance path

1. `Get row(s) in sheet` reads rows from the configured worksheet.
2. `Code in JavaScript` normalizes `Tipe` by trimming whitespace and converting it to lowercase, converts `Jumlah` to a number, skips non-finite values, sums `pemasukan` and `pengeluaran`, then calculates `saldo = totalPemasukan - totalPengeluaran`.
3. The response formats values using `toLocaleString('id-ID')`.

The Code node does not apply a date filter. The sheet read is configured to a worksheet named `OKTOBER 2026` in the supplied export. Validate how the installed Google Sheets node behaves with an empty worksheet and whether the selected worksheet represents the desired balance period.

## AI model

The connected model node in the supplied workflow is Groq, configured as `openai/gpt-oss-20b`.

## Import safety

The JSON in `workflows/finance-tracker-telegram.sanitized.json` is a sanitized reference template. It uses placeholders instead of private IDs/URLs and has no credentials. Reconnect credentials and replace placeholders in n8n; do not activate it before review.
