
// ==========================================
// SISTEM MANAJEMEN INVENTARIS DAN KASIR TOKO
// DASHBOARD BERDASARKAN ROLE PENGGUNA
// ==========================================

const username = sessionStorage.getItem("username");
const role = sessionStorage.getItem("role");

const dashboard = document.getElementById("dashboard");

// Data sementara untuk tampilan dashboard
// Nantinya diganti dengan data dari database MySQL.

const dataToko = {
    totalBarang: 125,
    stokMenipis: 8,
    totalTransaksi: 48,
    totalPenjualan: 2450000,
    barangMasuk: 25,
    barangKeluar: 17
};

// Format Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
}

// Mencegah teks username menjadi HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// Periksa login
if (!username || !role) {
    window.location.replace("index.html");
} else {

    const namaUser = escapeHTML(username);

    // ======================================
    // KONFIGURASI ROLE DAN MENU
    // ======================================

    const configurations = {

        pemilik: {
            title: "Dashboard Pemilik Toko",
            roleName: "Pemilik Toko",
            menus: [
                "Dashboard",
                "Data Barang",
                "Stok Barang",
                "Transaksi Penjualan",
                "Bukti Transaksi",
                "Riwayat Transaksi",
                "Laporan Penjualan",
                "Manajemen Pengguna"
            ]
        },

        kasir: {
            title: "Dashboard Kasir",
            roleName: "Kasir",
            menus: [
                "Dashboard",
                "Data Barang",
                "Stok Barang",
                "Transaksi Penjualan",
                "Bukti Transaksi",
                "Riwayat Transaksi"
            ]
        },

        admin_gudang: {
            title: "Dashboard Admin Gudang",
            roleName: "Admin Gudang",
            menus: [
                "Dashboard",
                "Data Barang",
                "Stok Barang",
                "Barang Masuk",
                "Barang Keluar",
                "Pengajuan Perubahan"
            ]
        }

    };

    const config = configurations[role];

    if (!config) {
        sessionStorage.clear();
        window.location.replace("index.html");
    } else {

        // ======================================
        // MENU SIDEBAR
        // ======================================

        const menuIcons = {
            "Dashboard": "🏠",
            "Data Barang": "📦",
            "Stok Barang": "📊",
            "Transaksi Penjualan": "🛒",
            "Bukti Transaksi": "🧾",
            "Riwayat Transaksi": "📋",
            "Laporan Penjualan": "📈",
            "Manajemen Pengguna": "👥",
            "Barang Masuk": "📥",
            "Barang Keluar": "📤",
            "Pengajuan Perubahan": "📝"
        };

        const menuLinks = {
            "Dashboard": "dashboard.html",
            "Stok Barang": "../stok/manajemen_stok.html",
            "Riwayat Transaksi": "../transaksi/riwayat_transaksi.html",
            "Bukti Transaksi": "buktitransaksi.html"
        };

        // ======================================
        // MEMBUAT SIDEBAR
        // ======================================

        const sidebar = `
            <aside class="sidebar">

                <h2>🏪 TokoKita</h2>

                <p class="menu-title">MENU UTAMA</p>

                ${config.menus.map(menu => `
                    <a href="${menuLinks[menu] || '#'}"
                       class="menu-item ${menu === 'Dashboard' ? 'active' : ''}">
                        <span>${menuIcons[menu]}</span>
                        ${menu}
                    </a>
                `).join("")}

                <button class="sidebar-logout" onclick="openLogout()">
                    ↪ Logout
                </button>

            </aside>
        `;

        // ======================================
        // TOPBAR
        // ======================================

        const topbar = `
            <header class="topbar">

                <div>
                    <h3>Inventory Management System</h3>
                    <p>Sistem Manajemen Inventaris dan Kasir Toko</p>
                </div>

                <div class="user-profile">
                    <div class="user-avatar">👤</div>

                    <div>
                        <strong>${namaUser}</strong>
                        <p>${config.roleName}</p>
                    </div>
                </div>

            </header>
        `;

        // ======================================
        // DASHBOARD PEMILIK TOKO
        // ======================================

        function dashboardPemilik() {

            return `

                <div class="welcome">
                    <div>
                        <h2>Selamat Datang, ${namaUser}! 👋</h2>
                        <p>Pantau kondisi dan aktivitas toko Anda hari ini.</p>
                    </div>
                </div>

                <div class="section-heading">
                    <div>
                        <h2>Ringkasan Toko</h2>
                        <p>Informasi kondisi operasional toko</p>
                    </div>
                </div>

                <div class="stats-grid">

                    <div class="stat-card">
                        <div class="stat-icon blue">📦</div>
                        <p>Total Barang</p>
                        <h2>${dataToko.totalBarang}</h2>
                        <span>Barang terdaftar</span>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon red">⚠️</div>
                        <p>Stok Menipis</p>
                        <h2>${dataToko.stokMenipis}</h2>
                        <span>Perlu diperiksa</span>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon purple">🛒</div>
                        <p>Total Transaksi</p>
                        <h2>${dataToko.totalTransaksi}</h2>
                        <span>Transaksi hari ini</span>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon green">💰</div>
                        <p>Total Penjualan</p>
                        <h2>${formatRupiah(dataToko.totalPenjualan)}</h2>
                        <span>Penjualan hari ini</span>
                    </div>

                </div>

                <div class="dashboard-grid">

                    <div class="panel sales-panel">
                        <div class="panel-heading">
                            <div>
                                <h3>Grafik Penjualan</h3>
                                <p>Contoh visualisasi penjualan mingguan</p>
                            </div>
                            <span class="panel-label">Mingguan</span>
                        </div>

                        <div class="chart">
                            ${[
                                ["Sen", 45],
                                ["Sel", 70],
                                ["Rab", 55],
                                ["Kam", 85],
                                ["Jum", 60],
                                ["Sab", 95],
                                ["Min", 75]
                            ].map(item => `
                                <div class="chart-column">
                                    <div class="bar"
                                         style="height:${item[1]}%">
                                    </div>
                                    <span>${item[0]}</span>
                                </div>
                            `).join("")}
                        </div>
                    </div>

                    <div class="panel">
                        <div class="panel-heading">
                            <h3>Informasi Stok</h3>
                        </div>

                        <div class="stock-alert">
                            <span>⚠️ Aqua 600 ml</span>
                            <strong>8 unit</strong>
                        </div>

                        <div class="stock-alert">
                            <span>⚠️ Susu UHT</span>
                            <strong>5 unit</strong>
                        </div>

                        <div class="stock-alert">
                            <span>⚠️ Minyak Goreng</span>
                            <strong>7 unit</strong>
                        </div>

                        <a href="../stok/manajemen_stok.html"
                           class="panel-link">
                            Lihat semua stok →
                        </a>
                    </div>

                </div>

                <div class="panel activity-panel">

                    <div class="panel-heading">
                        <div>
                            <h3>Pengajuan Perubahan Stok</h3>
                            <p>Permintaan yang membutuhkan persetujuan</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Barang</th>
                                <th>Jenis Pengajuan</th>
                                <th>Pengaju</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>Aqua 600 ml</td>
                                <td>Koreksi Stok</td>
                                <td>Admin Gudang</td>
                                <td><span class="status-badge pending">Menunggu</span></td>
                            </tr>

                            <tr>
                                <td>Indomie Goreng</td>
                                <td>Perubahan Data</td>
                                <td>Admin Gudang</td>
                                <td><span class="status-badge approved">Disetujui</span></td>
                            </tr>
                        </tbody>
                    </table>

                </div>

            `;
        }

        // ======================================
        // DASHBOARD KASIR
        // ======================================

        function dashboardKasir() {

            return `

                <div class="welcome">
                    <h2>Halo, ${namaUser}! 👋</h2>
                    <p>Selamat bekerja. Siap melayani transaksi pelanggan hari ini?</p>
                </div>

                <div class="section-heading">
                    <div>
                        <h2>Ringkasan Transaksi</h2>
                        <p>Informasi aktivitas kasir hari ini</p>
                    </div>
                </div>

                <div class="stats-grid cashier-stats">

                    <div class="stat-card">
                        <div class="stat-icon blue">🛒</div>
                        <p>Total Transaksi</p>
                        <h2>${dataToko.totalTransaksi}</h2>
                        <span>Transaksi hari ini</span>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon green">💰</div>
                        <p>Total Penjualan</p>
                        <h2>${formatRupiah(dataToko.totalPenjualan)}</h2>
                        <span>Penjualan hari ini</span>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon purple">📦</div>
                        <p>Barang Tersedia</p>
                        <h2>${dataToko.totalBarang}</h2>
                        <span>Jenis barang</span>
                    </div>

                </div>

                <div class="panel cashier-panel">
                    <div class="panel-heading">
                        <div>
                            <h3>Transaksi Penjualan</h3>
                            <p>Mulai proses pembelian pelanggan</p>
                        </div>
                    </div>

                    <div class="quick-action">
                        <div>
                            <h3>🛍️ Transaksi Baru</h3>
                            <p>Pilih barang dan proses pembayaran pelanggan.</p>
                        </div>

                        <a href="#" class="action-button">
                            + Mulai Transaksi
                        </a>
                    </div>
                </div>

                <div class="panel activity-panel">
                    <div class="panel-heading">
                        <h3>Riwayat Transaksi Terakhir</h3>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>ID Transaksi</th>
                                <th>Tanggal</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>T001</td>
                                <td>11-11-2026</td>
                                <td>Rp50.000</td>
                                <td><span class="status-badge approved">Berhasil</span></td>
                            </tr>

                            <tr>
                                <td>T002</td>
                                <td>11-11-2026</td>
                                <td>Rp25.000</td>
                                <td><span class="status-badge approved">Berhasil</span></td>
                            </tr>
                        </tbody>
                    </table>

                    <a href="../transaksi/riwayat_transaksi.html"
                       class="panel-link">
                        Lihat riwayat transaksi →
                    </a>
                </div>

            `;
        }

        // ======================================
        // DASHBOARD ADMIN GUDANG
        // ======================================

        function dashboardAdminGudang() {

            return `

                <div class="welcome">
                    <h2>Halo, ${namaUser}! 👋</h2>
                    <p>Pantau persediaan dan aktivitas barang di gudang.</p>
                </div>

                <div class="section-heading">
                    <div>
                        <h2>Ringkasan Inventaris</h2>
                        <p>Informasi persediaan barang toko</p>
                    </div>
                </div>

                <div class="stats-grid">

                    <div class="stat-card">
                        <div class="stat-icon blue">📦</div>
                        <p>Total Barang</p>
                        <h2>${dataToko.totalBarang}</h2>
                        <span>Barang terdaftar</span>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon green">📥</div>
                        <p>Barang Masuk</p>
                        <h2>${dataToko.barangMasuk}</h2>
                        <span>Hari ini</span>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon red">📤</div>
                        <p>Barang Keluar</p>
                        <h2>${dataToko.barangKeluar}</h2>
                        <span>Hari ini</span>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon purple">⚠️</div>
                        <p>Stok Menipis</p>
                        <h2>${dataToko.stokMenipis}</h2>
                        <span>Perlu diperiksa</span>
                    </div>

                </div>

                <div class="panel">
                    <div class="panel-heading">
                        <div>
                            <h3>Daftar Stok Barang</h3>
                            <p>Pantau ketersediaan persediaan toko</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Nama Barang</th>
                                <th>Stok</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>BR001</td>
                                <td>Indomie Goreng</td>
                                <td>120</td>
                                <td><span class="status-badge approved">Aman</span></td>
                            </tr>

                            <tr>
                                <td>BR002</td>
                                <td>Aqua 600 ml</td>
                                <td>8</td>
                                <td><span class="status-badge danger">Rendah</span></td>
                            </tr>

                            <tr>
                                <td>BR003</td>
                                <td>Susu UHT</td>
                                <td>5</td>
                                <td><span class="status-badge danger">Rendah</span></td>
                            </tr>
                        </tbody>
                    </table>

                    <a href="../stok/manajemen_stok.html"
                       class="panel-link">
                        Lihat manajemen stok →
                    </a>
                </div>

                <div class="panel">
                    <div class="panel-heading">
                        <div>
                            <h3>Status Pengajuan</h3>
                            <p>Pengajuan perubahan data dan koreksi stok</p>
                        </div>
                    </div>

                    <div class="request-info">
                        <span>Pengajuan koreksi stok Aqua 600 ml</span>
                        <span class="status-badge pending">Menunggu persetujuan</span>
                    </div>
                </div>

            `;
        }

        // ======================================
        // MENENTUKAN ISI DASHBOARD
        // ======================================

        let dashboardContent = "";

        if (role === "pemilik") {
            dashboardContent = dashboardPemilik();
        } else if (role === "kasir") {
            dashboardContent = dashboardKasir();
        } else if (role === "admin_gudang") {
            dashboardContent = dashboardAdminGudang();
        }

        // ======================================
        // TAMPILKAN DASHBOARD
        // ======================================

        dashboard.innerHTML = `

            ${sidebar}

            <div class="main-content">

                ${topbar}

                <main class="content">

                    <h1>${config.title}</h1>

                    ${dashboardContent}

                </main>

            </div>

        `;
    }
}

// ==========================================
// POPUP LOGOUT
// ==========================================

function openLogout() {
    document.getElementById("logoutModal").style.display = "flex";
}

function closeLogout() {
    document.getElementById("logoutModal").style.display = "none";
}

function confirmLogout() {
    sessionStorage.clear();
    window.location.replace("index.html");
}

// Menutup popup ketika klik area luar
document.addEventListener("click", function(event) {

    const modal = document.getElementById("logoutModal");

    if (modal && event.target === modal) {
        closeLogout();
    }

});
