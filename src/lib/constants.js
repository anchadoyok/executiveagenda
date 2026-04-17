export const TIMEZONES = [
  { value: 'Asia/Jakarta', label: 'WIB (Jakarta, GMT+7)' },
  { value: 'Asia/Makassar', label: 'WITA (Makassar, GMT+8)' },
  { value: 'Asia/Jayapura', label: 'WIT (Jayapura, GMT+9)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (GMT+8)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (GMT+5:30)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'UTC', label: 'UTC' },
]

export const PROFILE_ACCENTS = [
  '#2058e5',
  '#0f8b8d',
  '#c84b31',
  '#7a3cff',
  '#148f77',
  '#9a3412',
]

export const DEFAULT_OFFICIAL_OPTIONS = [
  'Menteri',
  'Wakil Menteri I',
  'Wakil Menteri II',
  'Sekretaris Jenderal',
]

export const DEFAULT_ATTENDEE_TYPES = ['Pendamping', 'Diwakili']

export const MEETING_TYPES = ['Luring', 'Daring', 'Hybrid']

export const TERMS_AND_CONDITIONS = [
  '1. Kerahasiaan Informasi: Seluruh data agenda pimpinan bersifat rahasia. Pengguna dilarang menyebarkan akses atau informasi jadwal kepada pihak yang tidak berkepentingan.',
  '2. Penyimpanan Cloud: Data disimpan di infrastruktur Cloud (Firebase/Firestore) dan akan tersinkronisasi antar perangkat. Pengguna memahami bahwa pemulihan data bergantung pada ketersediaan layanan pihak ketiga.',
  '3. Otoritas Admin: Master PIN memberikan wewenang penuh untuk mengelola profil, menghapus data, dan mengakses profil tanpa PIN individu. Kehilangan Master PIN dapat mengakibatkan hilangnya akses administratif.',
  '4. Tanggung Jawab Pengguna: Pengguna bertanggung jawab penuh atas kebenaran data input, kerahasiaan PIN masing-masing, dan kepatutan konten yang diunggah.',
  '5. Privasi & Data Pribadi: Agenda dapat memuat data pribadi (PII) seperti nama peserta, kontak, dan lokasi. Pengguna wajib memastikan bahwa pengumpulan, penyimpanan, dan distribusi data tersebut telah memperoleh persetujuan dari pihak terkait dan mematuhi UU Perlindungan Data Pribadi (UU PDP) serta regulasi sektoral yang berlaku.',
  '6. Pemrosesan PDF via Gemini: Fitur Import PDF mengirimkan isi dokumen ke Google Gemini untuk diekstrak. Dilarang meng-upload dokumen yang berklasifikasi RAHASIA/SANGAT RAHASIA atau yang dibatasi oleh peraturan. API key Gemini dibawa oleh pengguna, segala biaya dan kuota menjadi tanggung jawab pemilik key. Simpan key di tempat aman, jangan dibagikan.',
  '7. Ketersediaan Layanan: Aplikasi ini bergantung pada layanan pihak ketiga (Firebase, Vercel, Google Gemini). Developer tidak menjamin uptime 100%, ketepatan parsing PDF, maupun bebas gangguan/perawatan. Pengguna dianjurkan menyimpan cadangan mandiri untuk agenda kritis.',
  '8. Batas Tanggung Jawab: Sejauh diizinkan oleh hukum, developer dan afiliasi tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan aplikasi, termasuk kehilangan data, agenda yang terlewat, atau kebocoran informasi akibat kelalaian pengguna.',
  '9. Keamanan & Kerahasiaan: Pengguna bertanggung jawab menjaga kerahasiaan PIN, kredensial, dan perangkat yang digunakan. Laporkan segera bila terjadi dugaan akses tidak sah kepada admin.',
  '10. Kepemilikan & Hak Cipta: Seluruh konten yang dibuat pengguna tetap menjadi milik pengguna/instansi. Aplikasi hanya memproses data untuk keperluan penyelenggaraan agenda dan tidak mengalihkan kepemilikan.',
  '11. Perubahan T&C: Syarat dan ketentuan dapat diperbarui sewaktu-waktu tanpa pemberitahuan terlebih dahulu. Penggunaan lanjutan setelah pembaruan dianggap sebagai persetujuan atas versi terbaru.',
  '12. Hukum yang Berlaku: Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Setiap sengketa akan diselesaikan secara musyawarah, dan apabila tidak tercapai, melalui pengadilan yang berwenang di wilayah Republik Indonesia.',
]

export const DAYS_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
