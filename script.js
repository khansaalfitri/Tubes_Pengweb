
// =====================================
// DATA CONTOH PENJUALAN
// =====================================

const today = new Date();

function dateAgo(days) {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

const transactions = [];

const sampleProducts = [
  { name: "Beras Premium 5kg", category: "Sembako" },
  { name: "Minyak Goreng 2L", category: "Sembako" },
  { name: "Gula Pasir 1kg", category: "Sembako" },
  { name: "Mi Instan", category: "Makanan" },
  { name: "Susu UHT", category: "Minuman" },
  { name: "Tepung Terigu 1kg", category: "Sembako" },
  { name: "Kopi Sachet", category: "Minuman" }
];

const paymentMethods = ["Tunai", "Transfer", "QRIS"];

for (let i = 0; i < 120; i++) {
  const daysBack = (i * 3) % 365;
  const product = sampleProducts[i % sampleProducts.length];
  const quantity = (i % 5) + 1;
  const unitPrice = [15000, 18000, 12000, 3000, 7000, 11000, 2000][i % 7];

  transactions.push({
    id: `TRX-${String(i + 1).padStart(4, "0")}`,
    date: dateAgo(daysBack),
    product: product.name,
    category: product.category,
    quantity,
    total: quantity * unitPrice,
    payment: paymentMethods[i % paymentMethods.length]
  });
}

// =====================================
// FORMAT ANGKA DAN TANGGAL
// =====================================

const rupiah = value =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);

const formatDate = date =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);

function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  result.setHours(0, 0, 0, 0);
  return result;
}

// =====================================
// ELEMEN HTML
// =====================================

const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const filterInfo = document.getElementById("filterInfo");

const totalSalesEl = document.getElementById("totalSales");
const totalTransactionsEl = document.getElementById("totalTransactions");
const totalItemsEl = document.getElementById("totalItems");
const averageSalesEl = document.getElementById("averageSales");

const chartTotalEl = document.getElementById("chartTotal");
const salesChartEl = document.getElementById("salesChart");
const paymentListEl = document.getElementById("paymentList");
const productListEl = document.getElementById("productList");

let currentPeriod = "daily";
let filteredTransactions = [];

// =====================================
// ATUR TANGGAL BERDASARKAN PERIODE
// =====================================

function setPeriod(period) {
  currentPeriod = period;

  const start = new Date(today);
  const end = new Date(today);

  if (period === "daily") {
    // Hari ini
  } else if (period === "weekly") {
    start.setTime(getStartOfWeek(today).getTime());
  } else if (period === "monthly") {
    start.setDate(1);
  } else if (period === "yearly") {
    start.setMonth(0, 1);
  }

  startDateInput.value = toDateInput(start);
  endDateInput.value = toDateInput(end);

  document.querySelectorAll(".period-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.period === period
    );
  });

  applyFilter();
}

// =====================================
// FILTER LAPORAN
// =====================================

function applyFilter() {
  const startValue = startDateInput.value;
  const endValue = endDateInput.value;

  if (!startValue || !endValue) {
    filterInfo.textContent = "Silakan pilih tanggal awal dan akhir.";
    return;
  }

  if (startValue > endValue) {
    filterInfo.textContent =
      "Tanggal awal tidak boleh melebihi tanggal akhir.";
    return;
  }

  filteredTransactions = transactions.filter(transaction => {
    return (
      transaction.date >= startValue &&
      transaction.date <= endValue
    );
  });

  filterInfo.textContent =
    `Periode: ${formatDate(new Date(startValue + "T00:00:00"))} – ` +
    `${formatDate(new Date(endValue + "T00:00:00"))}`;

  renderReport();
}

// =====================================
// TAMPILKAN RINGKASAN
// =====================================

function renderSummary(data) {
  const totalSales = data.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const totalTransactions = data.length;

  const totalItems = data.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const averageSales = totalTransactions
    ? totalSales / totalTransactions
    : 0;

  totalSalesEl.textContent = rupiah(totalSales);
  totalTransactionsEl.textContent =
    totalTransactions.toLocaleString("id-ID");
  totalItemsEl.textContent =
    totalItems.toLocaleString("id-ID");
  averageSalesEl.textContent = rupiah(averageSales);

  chartTotalEl.textContent = rupiah(totalSales);
}

// =====================================
// GRAFIK PENJUALAN
// =====================================

function renderChart(data) {
  salesChartEl.innerHTML = "";

  if (data.length === 0) {
    salesChartEl.innerHTML =
      `<div class="chart-empty">Tidak ada data penjualan pada periode ini.</div>`;
    return;
  }

  const start = new Date(startDateInput.value + "T00:00:00");
  const end = new Date(endDateInput.value + "T00:00:00");

  const diffDays = Math.round(
    (end - start) / (1000 * 60 * 60 * 24)
  ) + 1;

  const groups = new Map();

  if (diffDays <= 1) {
    // Grafik per jam untuk laporan harian
    for (let hour = 8; hour <= 20; hour += 2) {
      groups.set(`${hour}:00`, 0);
    }

    data.forEach((item, index) => {
      const hour = 8 + ((index * 3) % 13);
      const roundedHour = Math.floor(hour / 2) * 2;
      const key = `${roundedHour}:00`;

      if (groups.has(key)) {
        groups.set(key, groups.get(key) + item.total);
      }
    });
  } else if (diffDays <= 31) {
    // Grafik per hari
    for (let i = 0; i < diffDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const key = toDateInput(date);
      groups.set(key, 0);
    }

    data.forEach(item => {
      groups.set(
        item.date,
        (groups.get(item.date) || 0) + item.total
      );
    });
  } else {
    // Grafik per bulan
    const cursor = new Date(
      start.getFullYear(),
      start.getMonth(),
      1
    );

    const lastMonth = new Date(
      end.getFullYear(),
      end.getMonth(),
      1
    );

    while (cursor <= lastMonth) {
      const key = `${cursor.getFullYear()}-${String(
        cursor.getMonth() + 1
      ).padStart(2, "0")}`;

      groups.set(
        new Intl.DateTimeFormat("id-ID", {
          month: "short"
        }).format(cursor),
        0
      );

      cursor.setMonth(cursor.getMonth() + 1);
    }

    data.forEach(item => {
      const date = new Date(item.date + "T00:00:00");
      const key = new Intl.DateTimeFormat("id-ID", {
        month: "short"
      }).format(date);

      if (groups.has(key)) {
        groups.set(key, groups.get(key) + item.total);
      }
    });
  }

  const values = Array.from(groups.values());
  const maxValue = Math.max(...values, 1);

  groups.forEach((value, label) => {
    const column = document.createElement("div");
    column.className = "chart-column";

    const barWrap = document.createElement("div");
    barWrap.className = "chart-bar-wrap";

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = `${Math.max((value / maxValue) * 100, 2)}%`;
    bar.title = `${label}: ${rupiah(value)}`;

    const labelEl = document.createElement("span");
    labelEl.className = "chart-label";
    labelEl.textContent = label;

    barWrap.appendChild(bar);
    column.appendChild(barWrap);
    column.appendChild(labelEl);
    salesChartEl.appendChild(column);
  });
}

// =====================================
// METODE PEMBAYARAN
// =====================================

function renderPayment(data) {
  paymentListEl.innerHTML = "";

  if (data.length === 0) {
    paymentListEl.innerHTML =
      `<div class="payment-empty">Belum ada data pembayaran.</div>`;
    return;
  }

  const paymentTotals = {};

  data.forEach(item => {
    paymentTotals[item.payment] =
      (paymentTotals[item.payment] || 0) + item.total;
  });

  const total = Object.values(paymentTotals).reduce(
    (sum, value) => sum + value,
    0
  );

  Object.entries(paymentTotals).forEach(([name, value]) => {
    const percentage = total
      ? (value / total) * 100
      : 0;

    const item = document.createElement("div");
    item.className = "payment-item";

    item.innerHTML = `
      <div class="payment-info">
        <span class="payment-name">${name}</span>
        <span class="payment-value">
          ${percentage.toFixed(1)}% · ${rupiah(value)}
        </span>
      </div>
      <div class="payment-track">
        <div class="payment-fill"
          style="width: ${percentage}%"></div>
      </div>
    `;

    paymentListEl.appendChild(item);
  });
}

// =====================================
// PRODUK TERLARIS
// =====================================

function renderProducts(data) {
  productListEl.innerHTML = "";

  if (data.length === 0) {
    productListEl.innerHTML =
      `<div class="product-empty">Belum ada produk terjual.</div>`;
    return;
  }

  const productTotals = {};

  data.forEach(item => {
    if (!productTotals[item.product]) {
      productTotals[item.product] = {
        quantity: 0,
        category: item.category
      };
    }

    productTotals[item.product].quantity += item.quantity;
  });

  const sortedProducts = Object.entries(productTotals)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5);

  sortedProducts.forEach(([name, detail], index) => {
    const item = document.createElement("div");
    item.className = "product-item";

    item.innerHTML = `
      <div class="product-left">
        <div class="product-number">${index + 1}</div>
        <div>
          <div class="product-name">${name}</div>
          <div class="product-category">${detail.category}</div>
        </div>
      </div>
      <div class="product-quantity">
        ${detail.quantity} terjual
      </div>
    `;

    productListEl.appendChild(item);
  });
}

// =====================================
// RENDER SELURUH LAPORAN
// =====================================

function renderReport() {
  renderSummary(filteredTransactions);
  renderChart(filteredTransactions);
  renderPayment(filteredTransactions);
  renderProducts(filteredTransactions);
}

// =====================================
// EVENT FILTER PERIODE
// =====================================

document.querySelectorAll(".period-btn").forEach(button => {
  button.addEventListener("click", () => {
    setPeriod(button.dataset.period);
  });
});

document.getElementById("applyFilter").addEventListener(
  "click",
  applyFilter
);

document.getElementById("resetFilter").addEventListener(
  "click",
  () => setPeriod("daily")
);

// =====================================
// EXPORT LAPORAN KE CSV
// =====================================

document.getElementById("exportBtn").addEventListener(
  "click",
  () => {
    if (filteredTransactions.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const headers = [
      "ID Transaksi",
      "Tanggal",
      "Produk",
      "Kategori",
      "Jumlah",
      "Total",
      "Metode Pembayaran"
    ];

    const rows = filteredTransactions.map(item => [
      item.id,
      item.date,
      item.product,
      item.category,
      item.quantity,
      item.total,
      item.payment
    ]);

    const csvContent = [
      headers,
      ...rows
    ].map(row =>
      row.map(value =>
        `"${String(value).replace(/"/g, '""')}"`
      ).join(",")
    ).join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "laporan-penjualan.csv";
    link.click();

    URL.revokeObjectURL(url);
  }
);

// =====================================
// TAMPILAN AWAL
// =====================================

setPeriod("daily");