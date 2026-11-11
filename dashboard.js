const username = sessionStorage.getItem("username");
const role = sessionStorage.getItem("role");

const dashboard = document.getElementById("dashboard");

// Periksa apakah pengguna sudah login
if (!username || !role) {
  window.location.replace("index.html");
} else {
  // KONFIGURASI HAK AKSES
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
        "Laporan Penjualan",
        "Manajemen Pengguna",
      ],
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
      ],
    },

    admin_gudang: {
      title: "Dashboard Admin Gudang",
      roleName: "Admin Gudang",
      menus: ["Dashboard", "Data Barang", "Stok Barang"],
    },
  };

  const config = configurations[role];

  // Pastikan role terdaftar
  if (!config) {
    sessionStorage.clear();
    window.location.replace("index.html");
  } else {
    // MEMBUAT DASHBOARD
    dashboard.innerHTML = `

            <div class="sidebar">

                <h2>📦 INVENTORY</h2>

                <p class="menu-title">MENU UTAMA</p>

                ${config.menus
                  .map(
                    (menu) => `
                    <a href="${
                      menu === "Bukti Transaksi" ? "buktitransaksi.html" : "#"
                    }" class="menu-item">
                        ${menu}
                    </a>
                `,
                  )
                  .join("")}

                <!-- TOMBOL LOGOUT -->
                <button class="sidebar-logout" onclick="openLogout()">
                    ↪ Logout
                </button>

            </div>

            <div class="main-content">

                <div class="topbar">

                    <h3>Inventory Management System</h3>

                    <div>
                        <strong>${username}</strong>
                        <p>${config.roleName}</p>
                    </div>

                </div>

                <div class="content">

                    <h1>${config.title}</h1>

                    <p>Selamat datang, ${username}!</p>

                    <div class="welcome">

                        <h2>Selamat Bekerja! 👋</h2>

                        <p>
                            Anda berhasil masuk ke Sistem
                            Manajemen Inventaris dan Kasir Toko.
                        </p>

                    </div>

                    <h3>Hak Akses Pengguna</h3>

                    <p>
                        Anda masuk sebagai ${config.roleName}.
                        Menu telah disesuaikan dengan hak akses akun Anda.
                    </p>

                </div>

            </div>

        `;
  }
}

// MEMBUKA POPUP LOGOUT
function openLogout() {
  document.getElementById("logoutModal").style.display = "flex";
}

// MENUTUP POPUP LOGOUT
function closeLogout() {
  document.getElementById("logoutModal").style.display = "none";
}

// KONFIRMASI LOGOUT
function confirmLogout() {
  sessionStorage.clear();

  window.location.replace("index.html");
}
