// ===== Produk LocalStorage =====
let produkData = JSON.parse(localStorage.getItem("produkData")) || [];
const produkContainer = document.querySelector(".produk-container");

// Render produk di dashboard
function renderProduk() {
  produkContainer.innerHTML = "";
  produkData.forEach((p, i) => {
    const div = document.createElement("div");
    div.style.minWidth = "200px";
    div.style.backgroundColor = "#333";
    div.style.padding = "10px";
    div.style.borderRadius = "5px";
    div.innerHTML = `
      <h4>${p.judul}</h4>
      <p>${p.deskripsi}</p>
      <p>Rp ${p.harga}</p>
      <img src="${p.foto}" style="width:100%; border-radius:5px;">
      <button onclick="hapusProduk(${i})">Hapus</button>
    `;
    produkContainer.appendChild(div);
  });
}

// ===== Modal Form =====
const modal = document.getElementById("productModal");
const openModalBtns = [document.getElementById("centerAddProduct"), document.getElementById("addProductBtn")];
const closeModalBtn = document.querySelector(".close-btn");
const productForm = document.getElementById("productForm");
const previewImg = document.getElementById("previewImg");
const productImgInput = document.getElementById("productImg");
let selectedImage = "";

// Buka modal
openModalBtns.forEach(btn => btn.addEventListener("click", () => modal.style.display = "block"));
// Tutup modal
closeModalBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if(e.target == modal) modal.style.display = "none"; });

// Preview & convert ke base64
productImgInput.addEventListener("change", () => {
  const file = productImgInput.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = e => {
      selectedImage = e.target.result;
      previewImg.src = selectedImage;
      previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    previewImg.style.display = "none";
    selectedImage = "";
  }
});

// Simpan Produk
productForm.addEventListener("submit", e => {
  e.preventDefault();
  const judul = document.getElementById("productTitle").value;
  const deskripsi = document.getElementById("productDesc").value;
  const harga = document.getElementById("productPrice").value;
  const foto = selectedImage;

  produkData.push({judul, deskripsi, harga, foto});
  localStorage.setItem("produkData", JSON.stringify(produkData));
  renderProduk();
  productForm.reset();
  previewImg.style.display = "none";
  selectedImage = "";
  modal.style.display = "none";
});

// Hapus Produk
window.hapusProduk = function(i){
  produkData.splice(i,1);
  localStorage.setItem("produkData", JSON.stringify(produkData));
  renderProduk();
}

// Sidebar toggle
const sidebar = document.getElementById("sidebar");
document.getElementById("menuToggle").addEventListener("click", () => {
  sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
});

// Slider tombol
document.querySelector(".prevBtn").addEventListener("click", () => produkContainer.scrollBy({left:-200,behavior:'smooth'}));
document.querySelector(".nextBtn").addEventListener("click", () => produkContainer.scrollBy({left:200,behavior:'smooth'}));

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => window.location.href = "index.html");

// Sidebar menu placeholder
document.getElementById("analyticsBtn").addEventListener("click", () => alert("Fitur Analitik sedang dikembangkan."));
document.getElementById("activityBtn").addEventListener("click", () => alert("Fitur Aktivitas sedang dikembangkan."));
document.getElementById("favoriteBtn").addEventListener("click", () => alert("Fitur Produk Favorit sedang dikembangkan."));

// Lihat produk
document.getElementById("centerViewProducts").addEventListener("click", renderProduk);

// Render produk saat load
renderProduk();
