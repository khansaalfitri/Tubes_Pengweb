
// ==========================================
// DATA BARANG
// ==========================================

const defaultProducts = [
  {
    id: 1,
    code: "BRG-001",
    name: "Beras Premium 5kg",
    category: "Sembako",
    price: 75000
  },
  {
    id: 2,
    code: "BRG-002",
    name: "Minyak Goreng 2L",
    category: "Sembako",
    price: 35000
  },
  {
    id: 3,
    code: "BRG-003",
    name: "Indomie Goreng",
    category: "Makanan",
    price: 3500
  },
  {
    id: 4,
    code: "BRG-004",
    name: "Susu UHT 1L",
    category: "Minuman",
    price: 18000
  },
  {
    id: 5,
    code: "BRG-005",
    name: "Gula Pasir 1kg",
    category: "Sembako",
    price: 17000
  },
  {
    id: 6,
    code: "BRG-006",
    name: "Sabun Cuci Piring",
    category: "Kebutuhan Rumah",
    price: 12000
  }
];

let products = JSON.parse(localStorage.getItem("products")) || defaultProducts;
let requests = JSON.parse(localStorage.getItem("productRequests")) || [];
let currentRole = "owner";
let selectedRequestId = null;

// ==========================================
// ELEMENT HTML
// ==========================================

const productBody = document.getElementById("productBody");
const requestBody = document.getElementById("requestBody");
const totalProducts = document.getElementById("totalProducts");
const dataCount = document.getElementById("dataCount");
const requestCount = document.getElementById("requestCount");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const roleSelect = document.getElementById("roleSelect");

const productModal = document.getElementById("productModal");
const detailModal = document.getElementById("detailModal");
const requestModal = document.getElementById("requestModal");
const approvalModal = document.getElementById("approvalModal");

// ==========================================
// PENYIMPANAN DATA
// ==========================================

function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("productRequests", JSON.stringify(requests));
}

// ==========================================
// FORMAT RUPIAH
// ==========================================

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

// ==========================================
// MENAMPILKAN DATA BARANG
// ==========================================

function renderProducts() {
  const keyword = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  const filteredProducts = products.filter(product => {
    const matchKeyword =
      product.name.toLowerCase().includes(keyword) ||
      product.code.toLowerCase().includes(keyword);

    const matchCategory =
      category === "" || product.category === category;

    return matchKeyword && matchCategory;
  });

  totalProducts.textContent = products.length;
  dataCount.textContent = `${filteredProducts.length} Barang`;
  document.getElementById("tableInfo").textContent =
    `Menampilkan ${filteredProducts.length} dari ${products.length} barang`;

  if (filteredProducts.length === 0) {
    productBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          Tidak ada data barang yang ditemukan.
        </td>
      </tr>
    `;
    return;
  }

  productBody.innerHTML = filteredProducts.map(product => {
    let actions = "";

    if (currentRole === "owner") {
      actions = `
        <button class="action-btn" data-action="detail" data-id="${product.id}" title="Detail">
          <i class="fa-solid fa-eye"></i>
        </button>
        <button class="action-btn edit" data-action="edit" data-id="${product.id}" title="Edit">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="action-btn delete" data-action="delete" data-id="${product.id}" title="Hapus">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
    } else {
      actions = `
        <button class="action-btn" data-action="detail" data-id="${product.id}" title="Detail">
          <i class="fa-solid fa-eye"></i>
        </button>
        <button class="action-btn request" data-action="request" data-id="${product.id}" title="Ajukan perubahan">
          <i class="fa-solid fa-file-pen"></i>
        </button>
      `;
    }

    return `
      <tr>
        <td><span class="product-code">${product.code}</span></td>
        <td><strong>${escapeHTML(product.name)}</strong></td>
        <td><span class="category-badge">${escapeHTML(product.category)}</span></td>
        <td><span class="price">${rupiah(product.price)}</span></td>
        <td>
          <div class="action-buttons">${actions}</div>
        </td>
      </tr>
    `;
  }).join("");
}

// Mengamankan teks yang ditampilkan dari input pengguna
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
// TAMBAH BARANG
// ==========================================

document.getElementById("addBtn").addEventListener("click", () => {
  if (currentRole !== "owner") return;

  document.getElementById("productForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("productModalTitle").textContent = "Tambah Barang";

  openModal("productModal");
});

// ==========================================
// SIMPAN DAN EDIT BARANG
// ==========================================

document.getElementById("productForm").addEventListener("submit", event => {
  event.preventDefault();

  if (currentRole !== "owner") return;

  const id = document.getElementById("editId").value;
  const code = document.getElementById("codeInput").value.trim();
  const name = document.getElementById("nameInput").value.trim();
  const category = document.getElementById("categoryInput").value;
  const price = Number(document.getElementById("priceInput").value);

  if (!code || !name || !category || price < 0 || !Number.isFinite(price)) {
    alert("Lengkapi data barang dengan benar.");
    return;
  }

  const duplicateCode = products.some(product =>
    product.code.toLowerCase() === code.toLowerCase() &&
    String(product.id) !== id
  );

  if (duplicateCode) {
    alert("Kode barang sudah digunakan.");
    return;
  }

  if (id) {
    products = products.map(product =>
      product.id == id
        ? { ...product, code, name, category, price }
        : product
    );

    alert("Data barang berhasil diperbarui.");
  } else {
    products.push({
      id: Date.now(),
      code,
      name,
      category,
      price
    });

    alert("Barang berhasil ditambahkan.");
  }

  saveData();
  renderAll();
  closeModal("productModal");
});

// ==========================================
// AKSI PADA TABEL BARANG
// ==========================================

productBody.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  const product = products.find(item => item.id === id);
  if (!product) return;

  if (action === "detail") {
    showDetail(product);
  }

  if (action === "edit" && currentRole === "owner") {
    editProduct(product);
  }

  if (action === "delete" && currentRole === "owner") {
    deleteProduct(product);
  }

  if (action === "request" && currentRole === "admin") {
    showRequestForm(product);
  }
});

// ==========================================
// EDIT BARANG
// ==========================================

function editProduct(product) {
  document.getElementById("productModalTitle").textContent = "Edit Barang";
  document.getElementById("editId").value = product.id;
  document.getElementById("codeInput").value = product.code;
  document.getElementById("nameInput").value = product.name;
  document.getElementById("categoryInput").value = product.category;
  document.getElementById("priceInput").value = product.price;

  openModal("productModal");
}

// ==========================================
// HAPUS BARANG
// ==========================================

function deleteProduct(product) {
  const confirmation = confirm(
    `Apakah kamu yakin ingin menghapus ${product.name}?`
  );

  if (!confirmation) return;

  products = products.filter(item => item.id !== product.id);

  // Hapus pengajuan terkait barang yang sudah dihapus
  requests = requests.filter(item => item.productId !== product.id);

  saveData();
  renderAll();

  alert("Data barang berhasil dihapus.");
}

// ==========================================
// DETAIL BARANG
// ==========================================

function showDetail(product) {
  document.getElementById("detailContent").innerHTML = `
    <div class="detail-list">
      <div class="detail-item">
        <span>Kode Barang</span>
        <strong>${escapeHTML(product.code)}</strong>
      </div>
      <div class="detail-item">
        <span>Nama Barang</span>
        <strong>${escapeHTML(product.name)}</strong>
      </div>
      <div class="detail-item">
        <span>Kategori</span>
        <strong>${escapeHTML(product.category)}</strong>
      </div>
      <div class="detail-item">
        <span>Harga</span>
        <strong>${rupiah(product.price)}</strong>
      </div>
    </div>
  `;

  openModal("detailModal");
}

// ==========================================
// PENGAJUAN PERUBAHAN OLEH ADMIN
// ==========================================

function showRequestForm(product) {
  document.getElementById("requestForm").reset();
  document.getElementById("requestProductId").value = product.id;
  document.getElementById("requestProductName").value = product.name;

  openModal("requestModal");
}

document.getElementById("requestForm").addEventListener("submit", event => {
  event.preventDefault();

  if (currentRole !== "admin") return;

  const productId = Number(
    document.getElementById("requestProductId").value
  );

  const product = products.find(item => item.id === productId);
  if (!product) {
    alert("Barang tidak ditemukan.");
    return;
  }

  const field = document.getElementById("requestField").value;
  const value = document.getElementById("requestValue").value.trim();
  const reason = document.getElementById("requestReason").value.trim();

  if (!field || !value || !reason) {
    alert("Lengkapi semua informasi pengajuan.");
    return;
  }

  requests.push({
    id: Date.now(),
    productId,
    date: new Date().toLocaleDateString("id-ID"),
    code: product.code,
    name: product.name,
    field,
    value,
    reason,
    status: "pending"
  });

  saveData();
  renderAll();
  closeModal("requestModal");

  alert("Pengajuan perubahan berhasil dikirim.");
});

// ==========================================
// MENAMPILKAN DAFTAR PENGAJUAN
// ==========================================

function renderRequests() {
  requestCount.textContent = `${requests.length} Pengajuan`;

  if (currentRole === "admin") {
    requestBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          Riwayat pengajuan perubahan data hanya dapat diperiksa oleh Pemilik Toko.
        </td>
      </tr>
    `;
    return;
  }

  if (requests.length === 0) {
    requestBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          Belum ada pengajuan perubahan data.
        </td>
      </tr>
    `;
    return;
  }

  requestBody.innerHTML = requests.map(request => {
    const statusText = {
      pending: "Menunggu",
      approved: "Disetujui",
      rejected: "Ditolak"
    };

    const action = request.status === "pending"
      ? `<button class="btn primary small" data-request-action="review" data-id="${request.id}">
           Periksa
         </button>`
      : "-";

    return `
      <tr>
        <td>${escapeHTML(request.date)}</td>
        <td>${escapeHTML(request.code)}</td>
        <td>${escapeHTML(request.name)}</td>
        <td>${escapeHTML(request.field)}</td>
        <td>${escapeHTML(request.reason)}</td>
        <td>
          <span class="status ${request.status}">
            ${statusText[request.status]}
          </span>
        </td>
        <td>${action}</td>
      </tr>
    `;
  }).join("");
}

// ==========================================
// PEMERIKSAAN PENGAJUAN
// ==========================================

requestBody.addEventListener("click", event => {
  const button = event.target.closest("[data-request-action='review']");
  if (!button || currentRole !== "owner") return;

  selectedRequestId = Number(button.dataset.id);

  const request = requests.find(item => item.id === selectedRequestId);
  if (!request) return;

  document.getElementById("approvalContent").innerHTML = `
    <div class="detail-list">
      <div class="detail-item">
        <span>Barang</span>
        <strong>${escapeHTML(request.name)}</strong>
      </div>
      <div class="detail-item">
        <span>Bagian diubah</span>
        <strong>${escapeHTML(request.field)}</strong>
      </div>
      <div class="detail-item">
        <span>Usulan perubahan</span>
        <strong>${escapeHTML(request.value)}</strong>
      </div>
      <div class="detail-item">
        <span>Alasan</span>
        <strong>${escapeHTML(request.reason)}</strong>
      </div>
    </div>
  `;

  openModal("approvalModal");
});

// ==========================================
// SETUJUI PENGAJUAN
// ==========================================

document.getElementById("approveRequest").addEventListener("click", () => {
  if (currentRole !== "owner") return;

  const request = requests.find(item => item.id === selectedRequestId);
  if (!request || request.status !== "pending") return;

  const product = products.find(item => item.id === request.productId);

  if (!product) {
    alert("Barang sudah tidak tersedia.");
    return;
  }

  const fieldMap = {
    "Nama Barang": "name",
    "Kode Barang": "code",
    "Kategori": "category",
    "Harga": "price"
  };

  const property = fieldMap[request.field];

  if (!property) return;

  let newValue = request.value.trim();

  if (property === "price") {
    newValue = Number(newValue);

    if (!Number.isFinite(newValue) || newValue < 0) {
      alert("Usulan harga tidak valid.");
      return;
    }
  }

  if (property === "code") {
    const duplicate = products.some(item =>
      item.id !== product.id &&
      item.code.toLowerCase() === newValue.toLowerCase()
    );

    if (duplicate) {
      alert("Kode barang tersebut sudah digunakan.");
      return;
    }
  }

  product[property] = newValue;
  request.status = "approved";

  saveData();
  renderAll();
  closeModal("approvalModal");

  alert("Pengajuan disetujui dan data barang berhasil diperbarui.");
});

// ==========================================
// TOLAK PENGAJUAN
// ==========================================

document.getElementById("rejectRequest").addEventListener("click", () => {
  if (currentRole !== "owner") return;

  const request = requests.find(item => item.id === selectedRequestId);
  if (!request || request.status !== "pending") return;

  request.status = "rejected";

  saveData();
  renderAll();
  closeModal("approvalModal");

  alert("Pengajuan perubahan ditolak.");
});

// ==========================================
// PERGANTIAN HAK AKSES
// ==========================================

roleSelect.addEventListener("change", () => {
  currentRole = roleSelect.value;

  const addButton = document.getElementById("addBtn");
  const notice = document.getElementById("accessNotice");
  const requestPanel = document.querySelector(".request-panel");

  if (currentRole === "owner") {
    addButton.style.display = "inline-flex";
    notice.innerHTML = `
      <i class="fa-solid fa-circle-info"></i>
      <span>Pemilik Toko memiliki akses penuh untuk mengelola seluruh data barang.</span>
    `;
    requestPanel.style.display = "block";
  } else {
    addButton.style.display = "none";
    notice.innerHTML = `
      <i class="fa-solid fa-circle-info"></i>
      <span>Admin Gudang hanya dapat melihat data barang dan mengajukan perubahan data.</span>
    `;
    requestPanel.style.display = "none";
  }

  renderAll();
});

// ==========================================
// PENCARIAN DAN FILTER
// ==========================================

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);

document.getElementById("resetFilter").addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "";
  renderProducts();
});

// ==========================================
// EXPORT DATA BARANG KE CSV
// ==========================================

document.getElementById("exportBtn").addEventListener("click", () => {
  if (products.length === 0) {
    alert("Tidak ada data barang untuk diekspor.");
    return;
  }

  const headers = [
    "Kode Barang",
    "Nama Barang",
    "Kategori",
    "Harga"
  ];

  const rows = products.map(product => [
    product.code,
    product.name,
    product.category,
    product.price
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(value =>
      `"${String(value).replace(/"/g, '""')}"`
    ).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "data-barang.csv";
  link.click();

  URL.revokeObjectURL(url);
});

// ==========================================
// MODAL
// ==========================================

function openModal(id) {
  document.getElementById(id).classList.add("show");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
}

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    closeModal(button.dataset.close);
  });
});

document.querySelectorAll(".modal-overlay").forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) {
      modal.classList.remove("show");
    }
  });
});

// ==========================================
// RENDER SEMUA DATA
// ==========================================

function renderAll() {
  renderProducts();
  renderRequests();
}

// Jalankan halaman
renderAll();
