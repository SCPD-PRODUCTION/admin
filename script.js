import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");
const loginGoogleBtn = document.getElementById("loginGoogleBtn");
const loginError = document.getElementById("loginError");

const addBtn = document.getElementById("addBtn");
const productsDiv = document.getElementById("products");

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const imageInput = document.getElementById("image");

// Login Google
loginGoogleBtn.addEventListener("click", () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).catch(err => { loginError.textContent = err.message; });
});

// Auth State
onAuthStateChanged(auth, user => {
  if(user){
    loginPage.style.display = "none";
    dashboard.style.display = "block";
    loadProducts();
  } else {
    loginPage.style.display = "flex";
    dashboard.style.display = "none";
  }
});

// Tambah Produk
addBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const price = parseFloat(priceInput.value);

  if(!title || !description || isNaN(price)){
    alert("Semua field harus diisi!");
    return;
  }

  try{
    await addDoc(collection(db,"products"), { title, description, price });
    titleInput.value = "";
    descriptionInput.value = "";
    priceInput.value = "";
    imageInput.value = "";
    loadProducts();
  } catch(err){
    alert("Terjadi kesalahan: " + err.message);
  }
});

// Load Produk
async function loadProducts(){
  productsDiv.innerHTML = "";
  const querySnapshot = await getDocs(collection(db,"products"));
  querySnapshot.forEach(doc => {
    const data = doc.data();
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.description}</p>
      <p class="price">Rp ${data.price.toLocaleString()}</p>
    `;
    productsDiv.appendChild(card);
  });
}
