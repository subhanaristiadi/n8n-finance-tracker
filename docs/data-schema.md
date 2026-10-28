# Data Schema

## Information Extractor output

| Field | Type shown in workflow schema | Required | Rule |
|---|---|---:|---|
| `tipe` | Not explicitly set | Yes | `pemasukan` or `pengeluaran` |
| `jumlah` | `number` | Yes | Numeric amount in rupiah without a currency symbol |
| `deskripsi` | Not explicitly set | Yes | Short description; preserve intent and do not invent details |
| `kategori` | Not explicitly set | Yes | One of the six closed-list values below |

### Closed-list values

`tipe`: `pemasukan`, `pengeluaran`.

`kategori`:

- `Makanan` — food or beverages for consumption.
- `Transport` — vehicles, fuel, parking, repairs, travel, or other transportation costs.
- `Belanja` — physical goods other than food and transportation.
- `Tagihan` — utilities, phone/internet, installments, BPJS, subscriptions, and other service/payment obligations.
- `Gaji` — salary or regular employment income only.
- `Lainnya` — transactions outside the previous categories, including bonuses, gifts, donations, family transfers, and unclear categories.

### Amount normalization examples

| User text | Expected `jumlah` |
|---|---:|
| `25rb` / `25 ribu` | `25000` |
| `150rb` / `150 ribu` | `150000` |
| `2jt` / `2 juta` | `2000000` |
| `1,5 juta` | `1500000` |

## Google Sheets mapping

The supplied append node maps `Tanggal`, `Tipe`, `Jumlah`, `Deskripsi`, `Kategori`, and `Saldo`. The `Saldo` mapping is an empty expression in the supplied export, so verify its purpose before retaining it. The documented minimum transaction table is `Tanggal`, `Tipe`, `Jumlah`, `Deskripsi`, `Kategori`.

## Timestamp and timezone

```text
{{ $now.setZone('Asia/Makassar').toFormat('yyyy-MM-dd HH:mm') }}
```

Timezone: `Asia/Makassar` (WITA).
