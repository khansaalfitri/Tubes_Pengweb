const users = [
  {
    username: "owner01",
    password: "owner123",
    role: "pemilik",
  },
  {
    username: "kasir01",
    password: "kasir123",
    role: "kasir",
  },
  {
    username: "gudang01",
    password: "gudang123",
    role: "admin_gudang",
  },
];

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const user = users.find(function (data) {
    return data.username === username && data.password === password;
  });

  if (user) {
    // Simpan data pengguna
    sessionStorage.setItem("username", user.username);
    sessionStorage.setItem("role", user.role);

    // Langsung menuju dashboard
    window.location.href = "dashboard.html";
  } else {
    alert("Username atau password salah!");
  }
});