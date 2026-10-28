# Testing Checklist

Use a test Telegram chat and test spreadsheet first. Inspect the actual n8n node outputs and resulting sheet rows; workflow completion alone is not sufficient evidence of correct behavior.

## Transaction parsing

| Input | Expected key fields |
|---|---|
| `beli kopi 25rb` | `pengeluaran`, `25000`, category `Makanan` |
| `isi bensin 100 ribu` | `pengeluaran`, `100000`, category `Transport` |
| `bayar listrik 350rb` | `pengeluaran`, `350000`, category `Tagihan` |
| `beli baju 200rb` | `pengeluaran`, `200000`, category `Belanja` |
| `gaji masuk 5 juta` | `pemasukan`, `5000000`, category `Gaji` |
| `dapat bonus 500rb` | `pemasukan`, `500000`, category `Lainnya` |
| `uang dari mama 300rb` | `pemasukan`, `300000`, category `Lainnya` |

Descriptions may have minor capitalization differences but must preserve the original meaning. Verify amount and closed-list values exactly.

## Command routing

- `/saldo` → balance path, with no transaction append.
- `/balance` → balance path, with no transaction append.
- `/saldo ` → balance path (the condition trims whitespace).
- `/SALDO` → balance path (the condition lowercases input).
- `beli kopi 25rb` → transaction path.

## Balance calculation

Test using known rows:

| Tipe | Jumlah |
|---|---:|
| pemasukan | 1000000 |
| pengeluaran | 250000 |
| pemasukan | 50000 |

Expected values: `totalPemasukan = 1050000`, `totalPengeluaran = 250000`, `saldo = 800000`.

Also test no rows returned, non-numeric `Jumlah`, unexpected `Tipe`, numeric values represented as strings, and whether a monthly sheet contains the full period users expect. The current Code node skips non-finite amounts and ignores unrecognized `Tipe` values.

## Acceptance criteria

- Extractor returns all four expected fields.
- `tipe` is exactly `pemasukan` or `pengeluaran`.
- `kategori` exactly matches an allowed value.
- A valid transaction appends one expected row with an Asia/Makassar timestamp.
- Confirmation is returned to the originating Telegram chat.
- `/saldo` and `/balance` do not append transactions.
- Balance totals match a manual calculation over rows actually returned by Google Sheets.
- No credentials, tokens, private IDs, or real transaction records are committed.

## Live-environment tests still required

- Credential reconnection after import.
- Google Sheets read behavior with an empty sheet.
- Actual row count returned by the Google Sheets read node.
- Model output quality with the chosen live model/provider.
- Duplicate Telegram update handling; no explicit deduplication check is visible in the supplied graph.
