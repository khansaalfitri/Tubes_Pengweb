const transactions = [
  {
    number: "TRX-001",
    date: "11 November 2026",
    cashier: "kasir01",
    items: [
      {
        name: "Buku Tulis",
        quantity: 2,
        price: 5000,
      },
      {
        name: "Pulpen",
        quantity: 3,
        price: 5000,
      },
    ],
    total: 25000,
    payment: 30000,
    change: 5000,
  },

  {
    number: "TRX-002",
    date: "11 November 2026",
    cashier: "kasir01",
    items: [
      {
        name: "Pensil",
        quantity: 4,
        price: 3000,
      },
      {
        name: "Penghapus",
        quantity: 2,
        price: 2000,
      },
    ],
    total: 16000,
    payment: 20000,
    change: 4000,
  },

  {
    number: "TRX-003",
    date: "10 November 2026",
    cashier: "kasir01",
    items: [
      {
        name: "Buku Gambar",
        quantity: 2,
        price: 8000,
      },
    ],
    total: 16000,
    payment: 20000,
    change: 4000,
  },
];

// Format Rupiah
function formatRupiah(value) {
  return "Rp" + value.toLocaleString("id-ID");
}

// Menampilkan daftar transaksi
function displayTransactions(data) {
  const list = document.getElementById("transactionList");

  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Transaksi tidak ditemukan.
                </td>
            </tr>
        `;
    return;
  }

  data.forEach((transaction, index) => {
    list.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${transaction.number}</td>
                <td>${transaction.date}</td>
                <td>${formatRupiah(transaction.total)}</td>
                <td>
                    <button
                        class="detail-button"
                        onclick="showReceipt('${transaction.number}')">
                        Lihat Bukti
                    </button>
                </td>
            </tr>
        `;
  });
}

// Mencari transaksi
function searchTransaction() {
  const keyword = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  const result = transactions.filter((transaction) =>
    transaction.number.toLowerCase().includes(keyword),
  );

  document.getElementById("receiptCard").style.display = "none";

  displayTransactions(result);
}

// Menampilkan detail bukti transaksi
function showReceipt(number) {
  const transaction = transactions.find((item) => item.number === number);

  if (!transaction) {
    alert("Transaksi tidak ditemukan!");
    return;
  }

  document.getElementById("receiptNumber").textContent = transaction.number;

  document.getElementById("receiptDate").textContent = transaction.date;

  document.getElementById("receiptCashier").textContent = transaction.cashier;

  document.getElementById("receiptTotal").textContent = formatRupiah(
    transaction.total,
  );

  document.getElementById("receiptPayment").textContent = formatRupiah(
    transaction.payment,
  );

  document.getElementById("receiptChange").textContent = formatRupiah(
    transaction.change,
  );

  const items = document.getElementById("receiptItems");

  items.innerHTML = "";

  transaction.items.forEach((item) => {
    const subtotal = item.quantity * item.price;

    items.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatRupiah(item.price)}</td>
                <td>${formatRupiah(subtotal)}</td>
            </tr>
        `;
  });

  document.getElementById("receiptCard").style.display = "block";

  document.getElementById("receiptCard").scrollIntoView({
    behavior: "smooth",
  });
}

// Mencetak bukti transaksi
function printReceipt() {
  window.print();
}

// Tampilkan seluruh transaksi ketika halaman dibuka
displayTransactions(transactions);
