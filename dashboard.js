// === Firebase Setup ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ganti sesuai konfigurasi proyekmu
const firebaseConfig = {
  apiKey: "API_KEY_KAMU",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "123456789",
  appId: "APP_ID_KAMU"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// === DOM Element ===
const addProductBtn = document.getElementById("addProductBtn");
const modal = document.getElementById("addProductModal");
const closeModal = document.getElementById("closeModal");
const addProductForm = document.getElementById("addProductForm");
const uploadStatus = document.getElementById("uploadStatus");
const menuBtn = document.getElementById("menuBtn");
const sideMenu = document.getElementById("sideMenu");
const logoutBtn = document.getElementById("logoutBtn");
const dashboardTitle = document.getElementById("dashboardTitle");

// === Event ===
menuBtn.onclick = () => sideMenu.classList.toggle("hidden");
logoutBtn.onclick = () => window.location.href = "../index.html";
dashboardTitle.onclick = () => window.location.href = "dashboard.html";

addProductBtn.onclick = () => modal.classList.remove("hidden");
closeModal.onclick = () => modal.classList.add("hidden");

addProductForm.onsubmit = async (e) => {
  e.preventDefault();
  uploadStatus.textContent = "Mengunggah produk...";
  
  const name = document.getElementById("productName").value;
  const price = document.getElementById("productPrice").value;
  const description = document.getElementById("productDescription").value;
  const file = document.getElementById("productImage").files[0];

  if (!file) return alert("Pilih gambar terlebih dahulu!");

  try {
    const storageRef = ref(storage, `produk/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      null,
      (error) => uploadStatus.textContent = "Gagal upload: " + error,
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, "produk"), {
          nama: name,
          harga: parseFloat(price),
          deskripsi: description,
          gambar: downloadURL,
          waktu: serverTimestamp()
        });
        uploadStatus.textContent = "Produk berhasil disimpan!";
        addProductForm.reset();
        setTimeout(() => modal.classList.add("hidden"), 1000);
      }
    );
  } catch (err) {
    uploadStatus.textContent = "Terjadi kesalahan: " + err.message;
  }
};
