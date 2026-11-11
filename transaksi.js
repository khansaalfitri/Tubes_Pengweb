
// ==========================================
// TOKOKITA - TRANSAKSI PENJUALAN
// Simulasi frontend menggunakan localStorage
// ==========================================

// DATA BARANG AWAL
const initialProducts = [
    { kode: "BR001", nama: "Indomie Goreng", harga: 3500, stok: 120 },
    { kode: "BR002", nama: "Aqua 600 ml", harga: 4000, stok: 8 },
    { kode: "BR003", nama: "Susu UHT", harga: 7000, stok: 5 },
    { kode: "BR004", nama: "Minyak Goreng", harga: 18000, stok: 7 },
    { kode: "BR005", nama: "Beras 5 Kg", harga: 75000, stok: 30 },
    { kode: "BR006", nama: "Gula Pasir 1 Kg", harga: 17000, stok: 25 },
    { kode: "BR007", nama: "Teh Botol", harga: 5000, stok: 40 },
    { kode: "BR008", nama: "Kopi Sachet", harga: 2000, stok: 80 }
];

const STORAGE_PRODUCTS = "tokokita_products";
const STORAGE_TRANSACTIONS = "tokokita_transactions";

// Ambil data produk atau buat data awal
function getProducts() {
    const saved = localStorage.getItem(STORAGE_PRODUCTS);

    if (saved) {
        return JSON.parse(saved);
    }

    localStorage.setItem(
        STORAGE_PRODUCTS,
        JSON.stringify(initialProducts)
    );

    return initialProducts.map(item => ({ ...item }));
}

function saveProducts(products) {
    localStorage.setItem(
        STORAGE_PRODUCTS,
        JSON.stringify(products)
    );
}

// Data aplikasi
let products = getProducts();
let cart = [];
let currentReceipt = null;

// Ambil username kasir
const username = sessionStorage.getItem("username") || "Kasir";

document.getElementById("cashierName").textContent = username;

// Format Rupiah
function rupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}

// Format tanggal dan waktu
function getDateTime() {
    return new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

// Mencegah HTML dari data teks
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// ==========================================
// MENAMPILKAN DAFTAR BARANG
// ==========================================

function renderProducts(keyword = "") {

    const table = document.getElementById("productTable");

    const filtered = products.filter(item =>
        item.nama.toLowerCase().includes(keyword.toLowerCase()) ||
        item.kode.toLowerCase().includes(keyword.toLowerCase())
    );

    if (filtered.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:25px">
                    Barang tidak ditemukan.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = filtered.map(item => {

        const lowStock = item.stok <= 10;

        return `
            <tr>
                <td>${escapeHTML(item.kode)}</td>

                <td>
                    <strong>${escapeHTML(item.nama)}</strong>
                </td>

                <td>${rupiah(item.harga)}</td>

                <td>
                    <span class="${lowStock ? "stock-label stock-low" : "stock-label"}">
                        ${item.stok}
                    </span>
                </td>

                <td>
                    <button
                        class="add-button"
                        data-add="${escapeHTML(item.kode)}"
                        ${item.stok <= 0 ? "disabled" : ""}
                    >
                        + Tambah
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// ==========================================
// MENAMBAHKAN BARANG KE KERANJANG
// ==========================================

function addToCart(kode) {

    const product = products.find(item => item.kode === kode);

    if (!product || product.stok <= 0) {
        alert("Stok barang tidak tersedia.");
        return;
    }

    const existing = cart.find(item => item.kode === kode);

    if (existing) {

        if (existing.jumlah >= product.stok) {
            alert("Jumlah pembelian melebihi stok tersedia.");
            return;
        }

        existing.jumlah++;

    } else {

        cart.push({
            kode: product.kode,
            nama: product.nama,
            harga: product.harga,
            jumlah: 1
        });

    }

    renderCart();
}

// ==========================================
// MENGUBAH JUMLAH BARANG
// ==========================================

function changeQuantity(kode, perubahan) {

    const item = cart.find(item => item.kode === kode);
    const product = products.find(item => item.kode === kode);

    if (!item || !product) return;

    const newQuantity = item.jumlah + perubahan;

    if (newQuantity <= 0) {
        cart = cart.filter(item => item.kode !== kode);
    } else if (newQuantity > product.stok) {
        alert("Jumlah melebihi stok yang tersedia.");
        return;
    } else {
        item.jumlah = newQuantity;
    }

    renderCart();
}

// ==========================================
// MENGHAPUS BARANG DARI KERANJANG
// ==========================================

function removeItem(kode) {

    cart = cart.filter(item => item.kode !== kode);

    renderCart();
}

// ==========================================
// MENGHITUNG TOTAL
// ==========================================

function getTotal() {
    return cart.reduce(
        (total, item) => total + (item.harga * item.jumlah),
        0
    );
}

function getTotalItems() {
    return cart.reduce(
        (total, item) => total + item.jumlah,
        0
    );
}

// ==========================================
// MENAMPILKAN KERANJANG
// ==========================================

function renderCart() {

    
    const container = document.getElementById("cartItems");

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <span class="empty-icon">🛒</span>
                <h3>Keranjang masih kosong</h3>
                <p>Silakan pilih barang terlebih dahulu.</p>
            </div>
        `;
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-item">

                <div class="cart-product">
                    <strong>${escapeHTML(item.nama)}</strong>
                    <span class="item-unit-price">
                        ${rupiah(item.harga)} / pcs
                    </span>
                </div>

                <div class="cart-item-bottom">
                    <div class="cart-controls">
                        <button type="button"
                            class="quantity-button"
                            data-minus="${escapeHTML(item.kode)}"
                            title="Kurangi">−</button>

                        <span class="quantity-number">
                            ${item.jumlah}
                        </span>

                        <button type="button"
                            class="quantity-button"
                            data-plus="${escapeHTML(item.kode)}"
                            title="Tambah">+</button>

                        <button type="button"
                            class="remove-button"
                            data-remove="${escapeHTML(item.kode)}"
                            title="Hapus produk">×</button>
                    </div>

                    <div class="cart-subtotal">
                        <span>Subtotal</span>
                        <strong>
                            ${rupiah(item.harga * item.jumlah)}
                        </strong>
                    </div>
                </div>

            </div>
        `).join("");
    }

    document.getElementById("cartCount").textContent =
        getTotalItems() + " Barang";

    document.getElementById("totalItems").textContent =
        getTotalItems();

    document.getElementById("totalPrice").textContent =
        rupiah(getTotal());

    updatePayment();
}

// ==========================================
// PERHITUNGAN PEMBAYARAN DAN KEMBALIAN
// ==========================================

function updatePayment() {

    const payment = Number(
        document.getElementById("paymentAmount").value
    ) || 0;

    const total = getTotal();

    const change = Math.max(payment - total, 0);

    document.getElementById("changeAmount").textContent =
        rupiah(change);

    document.getElementById("processTransaction").disabled =
        cart.length === 0 || payment < total || total <= 0;
}

// ==========================================
// KOSONGKAN KERANJANG
// ==========================================

function clearCart() {

    if (cart.length === 0) return;

    const confirmClear = confirm(
        "Apakah Anda yakin ingin mengosongkan keranjang?"
    );

    if (!confirmClear) return;

    cart = [];

    document.getElementById("paymentAmount").value = "";

    renderCart();
}

// ==========================================
// MEMPROSES TRANSAKSI
// ==========================================

function processTransaction() {

    if (cart.length === 0) {
        alert("Keranjang masih kosong.");
        return;
    }

    const total = getTotal();

    const payment = Number(
        document.getElementById("paymentAmount").value
    ) || 0;

    if (payment < total) {
        alert("Uang pembayaran belum mencukupi.");
        return;
    }

    // Periksa ulang stok terbaru
    for (const item of cart) {

        const product = products.find(
            product => product.kode === item.kode
        );

        if (!product || item.jumlah > product.stok) {
            alert("Stok " + item.nama + " tidak mencukupi.");
            return;
        }
    }

    const change = payment - total;

    // Kurangi stok barang
    cart.forEach(item => {

        const product = products.find(
            product => product.kode === item.kode
        );

        product.stok -= item.jumlah;

    });

    // Simpan stok terbaru
    saveProducts(products);

    // Ambil riwayat transaksi
    const transactions = JSON.parse(
        localStorage.getItem(STORAGE_TRANSACTIONS) || "[]"
    );

    const transaction = {

        id: "TRX-" + Date.now(),

        tanggal: new Date().toISOString(),

        kasir: username,

        items: cart.map(item => ({ ...item })),

        total: total,

        pembayaran: payment,

        kembalian: change

    };

    transactions.push(transaction);

    localStorage.setItem(
        STORAGE_TRANSACTIONS,
        JSON.stringify(transactions)
    );

    currentReceipt = transaction;

    // Tampilkan bukti transaksi
    showReceipt(transaction);

    // Reset keranjang
    cart = [];

    document.getElementById("paymentAmount").value = "";

    renderProducts(
        document.getElementById("searchProduct").value
    );

    renderCart();
}

// ==========================================
// BUKTI TRANSAKSI
// ==========================================

function showReceipt(transaction) {

    const receipt = document.getElementById("receiptContent");

    receipt.innerHTML = `

        <div class="receipt-title">
            <h3>TokoKita</h3>
            <p>Inventory & Cashier Management</p>
            <p>Bukti Transaksi Penjualan</p>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-line">
            <span>ID Transaksi</span>
            <strong>${escapeHTML(transaction.id)}</strong>
        </div>

        <div class="receipt-line">
            <span>Tanggal</span>
            <span>${new Date(transaction.tanggal).toLocaleString("id-ID")}</span>
        </div>

        <div class="receipt-line">
            <span>Kasir</span>
            <span>${escapeHTML(transaction.kasir)}</span>
        </div>

        <div class="receipt-divider"></div>

        ${transaction.items.map(item => `
            <div class="receipt-line">
                <span>
                    ${escapeHTML(item.nama)}<br>
                    ${item.jumlah} × ${rupiah(item.harga)}
                </span>

                <strong>
                    ${rupiah(item.jumlah * item.harga)}
                </strong>
            </div>
        `).join("")}

        <div class="receipt-divider"></div>

        <div class="receipt-line">
            <strong>Total</strong>
            <strong>${rupiah(transaction.total)}</strong>
        </div>

        <div class="receipt-line">
            <span>Tunai</span>
            <span>${rupiah(transaction.pembayaran)}</span>
        </div>

        <div class="receipt-line">
            <strong>Kembalian</strong>
            <strong>${rupiah(transaction.kembalian)}</strong>
        </div>

        <div class="receipt-divider"></div>

        <p style="text-align:center;font-size:11px;margin-top:15px;">
            Terima kasih telah berbelanja!
        </p>

    `;

    document.getElementById("receiptModal").style.display = "flex";
}

function closeReceipt() {
    document.getElementById("receiptModal").style.display = "none";
}

function printReceipt() {
    window.print();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

document.getElementById("searchProduct").addEventListener(
    "input",
    function() {
        renderProducts(this.value);
    }
);

document.getElementById("productTable").addEventListener(
    "click",
    function(event) {

        const button = event.target.closest("[data-add]");

        if (button) {
            addToCart(button.dataset.add);
        }

    }
);

document.getElementById("cartItems").addEventListener(
    "click",
    function(event) {

        const plus = event.target.closest("[data-plus]");
        const minus = event.target.closest("[data-minus]");
        const remove = event.target.closest("[data-remove]");

        if (plus) {
            changeQuantity(plus.dataset.plus, 1);
        }

        if (minus) {
            changeQuantity(minus.dataset.minus, -1);
        }

        if (remove) {
            removeItem(remove.dataset.remove);
        }

    }
);

document.getElementById("paymentAmount").addEventListener(
    "input",
    updatePayment
);

document.getElementById("processTransaction").addEventListener(
    "click",
    processTransaction
);

document.getElementById("clearCart").addEventListener(
    "click",
    clearCart
);

// ==========================================
// INISIALISASI
// ==========================================

renderProducts();
renderCart();
