# Mini Shopee - Praktikum Pemrograman Web (Modul 2)

Proyek aplikasi web e-commerce sederhana interaktif ("Mini Shopee") yang dibangun murni secara native (*vanilla* HTML, CSS, JavaScript) tanpa framework atau library eksternal apa pun, sesuai dengan seluruh ketentuan dan spesifikasi pada **Soal Praktikum Modul 2**.

---

## 📌 Daftar Isi
1. [Fitur Utama & Implementasi Spesifikasi](#-fitur-utama--implementasi-spesifikasi)
2. [Kredensial Akun Demo](#-kredensial-akun-demo)
3. [Struktur Proyek](#-struktur-proyek)
4. [Cara Menjalankan](#-cara-menjalankan)

---

## 🚀 Fitur Utama & Implementasi Spesifikasi

### 1. Ketentuan Umum & Arsitektur
- **Wajib Native**: 100% dibuat tanpa library atau framework (tanpa React, Vue, jQuery, Bootstrap, Tailwind, dll).
- **External JavaScript**: Seluruh kode JavaScript dipisah ke berkas eksternal (`login.js`, `index.js`) dan dihubungkan pada elemen `<head>` menggunakan atribut `defer`.
- **Dynamic API**: Seluruh data dipanggil secara dinamis menggunakan `fetch()`.

---

### 2. Halaman Login (`login.html`, `login.css`, `login.js`)
- **Form Login**: Input `username` dan `password` dengan validasi kelengkapan.
- **Autentikasi API**: Memverifikasi kredensial pengguna ke endpoint `https://dummyjson.com/users` secara asinkron (`async/await`).
- **Loading State**: Tombol submit menampilkan animasi spinner dan teks `"Memverifikasi..."` saat proses autentikasi berlangsung serta tombol di-disable sementara.
- **Error Handling (`try...catch`)**: Menampilkan pesan error visual yang informatif dan ramah pengguna ketika username/password tidak cocok atau terjadi gangguan jaringan.
- **Session Persistence**: Menyimpan data `firstName` pengguna ke Local Storage (`localStorage.setItem`) saat login berhasil.
- **Auto Redirect**: Pengguna langsung diarahkan ke `index.html` setelah autentikasi sukses.
- **Auth Guard**: Jika pengguna sudah memiliki sesi login aktif di Local Storage, membuka `login.html` akan langsung dialihkan ke `index.html`.
- **Fitur Tambahan (Bonus)**:
  - Tombol **"Gunakan Akun Demo"** untuk pengisian username & password instan saat demo/pengujian.
  - Tombol toggle tampilkan / sembunyikan password (👁️ / 🙈).

---

### 3. Halaman Katalog Produk (`index.html`, `index.css`, `index.js`)
- **Proteksi Halaman (Auth Guard)**:
  - Halaman `index.html` diproteksi secara ketat. Jika tidak ditemukan data `firstName` di Local Storage, pengguna akan dipaksa redirect kembali ke `login.html`.
- **Navigation Bar**:
  - Menampilkan ucapan selamat datang personal: `"Halo, [NamaPengguna]!"` menggunakan `localStorage.getItem("firstName")`.
  - Tombol **Logout**: Menghapus data sesi dari Local Storage (`localStorage.removeItem`) dan mengarahkan kembali ke `login.html`.
  - Tombol **Keranjang Belanja**: Menampilkan badge jumlah item dan total akumulasi harga belanjaan secara *real-time*.
- **Render Produk Dinamis**:
  - Mengambil data produk dari `https://dummyjson.com/products` via `fetch()`.
  - Ditampilkan dalam format kartu (*card grid*) responsif yang memuat:
    - Gambar (*thumbnail*)
    - Nama Produk (*title*)
    - Kategori (*category badge*)
    - Rating berbintang (*rating*)
    - Diskon (*discountPercentage badge*)
    - Harga (*price*)
    - Tombol "Tambah ke Keranjang"
- **Pencarian Real-Time (Debounce & Closures)**:
  - Kolom pencarian untuk menyaring produk berdasarkan **nama** atau **kategori**.
  - Menggunakan teknik **Debounce** dengan konsep **Closure** (fungsi di dalam fungsi yang menyimpan referensi `timer`) dengan jeda 400ms agar tidak terjadi render berulang di setiap ketikan keyboard.
- **Filter & Sorting (Functional Programming)**:
  - Filter kategori dinamis dari API yang di-*generate* otomatis ke elemen `<select>`.
  - Pengurutan (*sorting*) berdasarkan:
    - Harga Termurah (`price-low`)
    - Harga Termahal (`price-high`)
    - Rating Tertinggi (`rating`)
  - Diimplementasikan secara fungsional menggunakan metode *array* bawaan: `.filter()`, `.sort()`, dan *spread operator* `[...]`.
- **Keranjang Belanja Sederhana (Local Storage CRUD)**:
  - **Create**: Tombol "Tambah ke Keranjang" menambahkan item atau menambah kuantitasnya di Local Storage (`localStorage.setItem`).
  - **Read**: Membaca data keranjang dari Local Storage (`localStorage.getItem`) dan menghitung total harga serta badge jumlah item.
  - **Update**: Mengubah kuantitas item (+ / -) langsung dari modal drawer keranjang.
  - **Delete**: Menghapus per-item atau mengosongkan seluruh keranjang menggunakan `localStorage.removeItem`.
  - **Simulasi Checkout**: Fitur checkout belanja dengan konfirmasi dan pembersihan keranjang.
- **Load More / Pagination (Array Slicing)**:
  - Tombol **"Tampilkan Lebih Banyak"** untuk merender batch 8 produk berikutnya memanfaatkan teknik **Array Slicing** (`displayedProducts.slice(0, visibleProductCount)`).
  - Tombol otomatis disembunyikan jika seluruh produk yang sesuai telah ditampilkan.
- **Detail Produk Modal (Event Delegation)**:
  - Mengklik kartu produk akan membuka Modal Popup detail lengkap (deskripsi, stok unit, brand, rating, harga, diskon).
  - Penanganan *event click* wajib dan murni menggunakan teknik **Event Delegation** pada satu elemen *parent* (`#product-container`), membedakan apakah pengguna mengklik tombol keranjang atau kartu produk (`event.target.closest`).
- **Global Error Handling**:
  - Jika proses `fetch()` katalog produk mengalami kegagalan, ditampilkan pesan error visual lengkap dengan tombol **"Coba Lagi"** (*retry mechanism*).
- **Desain & Responsivitas (Bonus)**:
  - Antarmuka bertema modern oranye khas e-commerce ("Shopee-style") yang bersih, rapi, dan responsif untuk layar HP, tablet, maupun komputer desktop.
  - Toast Notification interaktif setiap kali aksi keranjang berhasil dilakukan.

---

## 🔑 Kredensial Akun Demo

Anda dapat menggunakan akun bawaan dari **DummyJSON Users**:
- **Username**: `emilys`
- **Password**: `emilyspass`

*(Tersedia tombol satu-klik **"Gunakan Akun Demo"** di halaman login untuk kemudahan penilaian).*

---

## 📁 Struktur Proyek

```text
pweb-js-c12-2026/
├── login.html      # Tampilan formulir login
├── login.css       # Tata gaya halaman login (Shopee theme)
├── login.js        # Logika autentikasi, API fetch, try-catch, session persistence
├── index.html      # Tampilan utama katalog produk & keranjang
├── index.css       # Tata gaya katalog, card grid, modal detail & modal keranjang
├── index.js        # Auth guard, debounce search, sorting, CRUD cart, event delegation
└── README.md       # Dokumentasi teknis proyek
```

---

## 💻 Cara Menjalankan

1. Buka folder proyek di terminal atau teks editor (VS Code, dll).
2. Jalankan melalui ekstensi **Live Server** di VS Code, atau menggunakan server lokal sederhana:
   ```bash
   # Menggunakan Python
   python3 -m http.server 8000
   ```
3. Buka peramban (*browser*) dan akses `http://localhost:8000/login.html`.
