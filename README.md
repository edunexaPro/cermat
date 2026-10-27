# Pustaka Digital CERMAT (versi dengan Mode Admin)

Halaman tombol menuju folder Google Drive. Tautan Drive diisi lewat **Mode Admin** di halaman itu sendiri, tanpa Google Sheets dan tanpa menyunting kode.

## Isi paket

| Berkas | Fungsi |
|---|---|
| `index.html`, `assets/` | Halaman dan tampilan. Tidak perlu diubah. |
| `data.json` | Daftar folder dan teks halaman. Mode Admin yang mengubah berkas ini. |

## Pemasangan (sekali saja, sekitar 10 menit)

1. Buat akun di <https://github.com>, lalu klik **New repository**. Beri nama `cermat`, pilih **Public**, klik **Create repository**.
2. Klik **uploading an existing file**, seret **semua isi** folder ini (`index.html`, `data.json`, folder `assets`), lalu **Commit changes**.
3. Buka **Settings > Pages**. Pilih **Deploy from a branch**, branch **main**, folder **/ (root)**, lalu **Save**. Tunggu 1 sampai 2 menit. Alamat situs: `https://AKUN.github.io/cermat/`.
4. (Opsional) Pendekkan alamat di <https://s.id>.

## Membuat token admin (sekali saja)

Token adalah "kunci" yang mengizinkan halaman menyimpan perubahan ke repositori Anda.

1. Di GitHub: foto profil > **Settings** > **Developer settings** > **Personal access tokens** > **Fine-grained tokens** > **Generate new token**.
2. **Token name**: `cermat-admin`. **Expiration**: pilih masa berlaku terpanjang yang tersedia.
3. **Repository access**: **Only select repositories**, pilih `cermat`.
4. **Permissions > Repository permissions > Contents**: ubah ke **Read and write**.
5. Klik **Generate token**, lalu **salin tokennya** (hanya tampil sekali). Simpan di pengelola kata sandi atau catatan pribadi.

## Memakai Mode Admin

1. Buka situs, gulir ke paling bawah, tekan **Admin**.
2. Isi **Repositori** (`akun/cermat`, biasanya terisi otomatis) dan **Token**. Centang **Ingat di perangkat ini** bila perangkat pribadi.
3. Pada tiap menu, tekan **Ubah**, tempel **tautan Google Drive**, lalu **Simpan**.
   - Mengambil tautan: di Google Drive klik kanan folder > **Bagikan** > atur akses ke **Siapa saja yang memiliki link** > **Salin link**.
4. Tombol di setiap kartu: naik, turun, sembunyikan/tampilkan, ubah. **Tambah folder** di bawah daftar. **Pengaturan** untuk judul dan pengumuman.
5. Tekan **Simpan ke GitHub**. Pengunjung melihat perubahan dalam 1 sampai 2 menit.
6. Selesai, tekan **Keluar** (token dihapus dari perangkat).

Bila penyimpanan otomatis bermasalah, tekan **Salin data**, lalu di GitHub buka `data.json`, tekan ikon pensil, ganti seluruh isinya, dan **Commit changes**.

## Menambah admin lain

Pemilik repositori: **Settings > Collaborators > Add people**, masukkan akun GitHub admin. Admin tersebut membuat tokennya sendiri (langkah "Membuat token admin"; pilih repositori `cermat` jika sudah muncul di daftar).

## Keamanan, perlu diketahui

- Tombol **Admin** tampak oleh semua orang, tetapi tanpa token yang sah tidak ada yang bisa menyimpan perubahan. Keamanannya ada di token, bukan di tombol.
- Siapa pun yang memegang token dapat mengubah isi repositori `cermat`. Jangan dibagikan lewat grup. Bila bocor, cabut di GitHub (Settings > Developer settings > token > Delete) lalu buat yang baru.
- Repositori dan `data.json` bersifat publik. Isi hanya nama folder dan tautan yang memang boleh dilihat umum. Izin sebenarnya tetap diatur di Google Drive.

## Bila ada masalah

| Gejala | Solusi |
|---|---|
| "Token ditolak" | Token salah, kedaluwarsa, atau dicabut. Buat token baru. |
| "Tidak punya izin menulis" | Pada token, izin **Contents** harus **Read and write**. |
| "Repositori atau data.json tidak ditemukan" | Periksa penulisan `akun/cermat`, pastikan `data.json` ada, dan token mencakup repositori itu. |
| "Data di GitHub sudah berubah" | Ada admin lain yang menyimpan lebih dulu. Muat ulang, masuk lagi, ulangi perubahan. |
| Perubahan belum tampil bagi pengunjung | Tunggu 1 sampai 2 menit, lalu muat ulang (di ponsel bisa perlu tutup tab). |
| Tombol bertuliskan "Segera hadir" | Tautan folder belum diisi atau tidak diawali `https://`. |
