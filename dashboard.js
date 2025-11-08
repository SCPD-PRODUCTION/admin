// === Import Firebase ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyC5gAbdlbVL3t6oreb_ZZhAUT1YJVTKwPU",
  authDomain: "scpd-production.firebaseapp.com",
  databaseURL: "https://scpd-production-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "scpd-production",
  storageBucket: "scpd-production.firebasestorage.app",
  messagingSenderId: "72136560829",
  appId: "1:72136560829:web:1c14d8087f9c3b88ade7d4",
  measurementId: "G-LGXCFVNFTH"
};

// === Inisialisasi ===
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// === Elemen DOM ===
const addProductBtn = document.getElementById("addProductBtn");
const modal = document.getElementById("addProductModal");
const closeModalBtn = document.getElementById("closeModal");
const saveProductBtn = document.getElementById("saveProduct");
const productsContainer = document.getElementById("productsContainer");
const logoutBtn = document.getElementById("logoutBtn");
const dashboardTitle = document.getElementById("dashboardTitle");
const leftBtn = document.getElementById("scrollLeft");
const rightBtn = document.getElementById("scrollRight");

// === Modal Tambah Produk ===
addProductBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// === Tambah Produk ke Firestore ===
saveProductBtn.addEventListener("click", async () => {
  const name = document.getElementById("productName").value.trim();
  const desc = document.getElementById("productDesc").value.trim();
  const price = document.getElementById("productPrice").value.trim();
  const file = document.getElementById("productImage").files[0];

  if (!name || !desc || !price || !file) {
    alert("Lengkapi semua field sebelum menyimpan!");
    return;
  }

  try {
    // Upload gambar ke Storage
    const storageRef = ref(storage, `scpd_produk/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);

    // Simpan data ke Firestore
    await addDoc(collection(db, "scpd_produk"), {
      name,
      desc,
      price,
      imageUrl
    });

    alert("Produk berhasil ditambahkan!");
    modal.style.display = "none";
    loadProducts(); // refresh
  } catch (error) {
    console.error("Gagal menambah produk:", error);
  }
});

// === Ambil & Tampilkan Produk ===
async function loadProducts() {
  productsContainer.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "scpd_produk"));
  querySnapshot.forEach((docItem) => {
    const data = docItem.data();

    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
      <button class="delete-btn" data-id="${docItem.id}" data-url="${data.imageUrl}">🗑️</button>
      <img src="${data.imageUrl}" alt="${data.name}">
      <h3>${data.name}</h3>
      <p>${data.desc}</p>
      <strong>Rp ${data.price}</strong>
    `;

    productsContainer.appendChild(card);
  });

  // Tambahkan event hapus
  const deleteBtns = document.querySelectorAll(".delete-btn");
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const imageUrl = btn.getAttribute("data-url");

      if (confirm("Yakin ingin menghapus produk ini?")) {
        try {
          await deleteDoc(doc(db, "scpd_produk", id));
          // Hapus dari storage
          const imgRef = ref(storage, imageUrl);
          await deleteObject(imgRef);
          loadProducts();
        } catch (err) {
          console.error("Gagal hapus produk:", err);
        }
      }
    });
  });
}

// === Navigasi Kiri / Kanan ===
leftBtn.addEventListener("click", () => {
  productsContainer.scrollBy({ left: -300, behavior: "smooth" });
});

rightBtn.addEventListener("click", () => {
  productsContainer.scrollBy({ left: 300, behavior: "smooth" });
});

// === Logout ===
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout gagal:", error);
  }
});

// === Dashboard Title kembali ke Beranda Dashboard ===
dashboardTitle.addEventListener("click", () => {
  loadProducts();
});

// === Cek Login ===
onAuthStateChanged(auth, (user) => {
  if (!user) {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      console.error("Login gagal:", error);
    });
  } else {
    loadProducts();
  }
});
