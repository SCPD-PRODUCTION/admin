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

// Modal untuk Tambah Produk
const addProductBtn = document.getElementById("addProductBtn");
const centerAddProduct = document.getElementById("centerAddProduct");
const modal = document.getElementById("addProductModal");
const closeModal = document.getElementById("closeModal");
const addProductForm = document.getElementById("addProductForm");

// Buka modal
function showAddProductModal() {
  modal.style.display = "flex";
}

// Tutup modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  addProductForm.reset(); // Reset form saat tutup
});

// Klik di luar modal untuk tutup
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
    addProductForm.reset();
  }
});

// Event listener untuk tombol
addProductBtn.addEventListener("click", showAddProductModal);
centerAddProduct.addEventListener("click", showAddProductModal);

// Submit form: Upload ke Firebase Storage dan simpan ke Firestore
addProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const productName = document.getElementById("productName").value;
  const productDescription = document.getElementById("productDescription").value;
  const productImage = document.getElementById("productImage").files[0];

  if (!productImage) {
    alert("Pilih gambar produk!");
    return;
  }

  try {
    // Upload gambar ke Firebase Storage
    const storageRef = ref(window.storage, `products/${Date.now()}_${productImage.name}`);
    await uploadBytes(storageRef, productImage);
    const imageUrl = await getDownloadURL(storageRef);

    // Simpan data ke Firestore
    await addDoc(collection(window.db, "products"), {
      name: productName,
      description: productDescription,
      imageUrl: imageUrl,
      createdAt: new Date()
    });

    alert("Produk berhasil ditambahkan!");
    modal.style.display = "none";
    addProductForm.reset();
  } catch (error) {
    console.error("Error menambah produk:", error);
    alert("Gagal menambah produk. Cek konsol untuk detail.");
  }
});
