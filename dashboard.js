// Sidebar toggle
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Logout
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  // Arahkan ke halaman login
  window.location.href = "index.html";
});

// Klik Dashboard → kembali ke halaman utama dashboard
const dashboardTitle = document.getElementById("dashboardTitle");
dashboardTitle.addEventListener("click", () => {
  window.location.href = "dashboard.html"; // tetap di dashboard utama
});

// Tambah produk (nanti bisa disambungkan ke Firebase)
const addProductBtn = document.getElementById("addProductBtn");
const centerAddProduct = document.getElementById("centerAddProduct");

function showAddProductForm() {
  alert("Form tambah produk akan muncul di sini (terhubung ke Firestore).");
}

addProductBtn.addEventListener("click", showAddProductForm);
centerAddProduct.addEventListener("click", showAddProductForm);
