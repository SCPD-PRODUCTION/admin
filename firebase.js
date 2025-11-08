// ==== FIREBASE CONFIG ====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5gAbdlbVL3t6oreb_ZZhAUT1YJVTKwPU",
  authDomain: "scpd-production.firebaseapp.com",
  databaseURL: "https://scpd-production-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "scpd-production",
  storageBucket: "scpd-production.appspot.com",
  messagingSenderId: "72136560829",
  appId: "1:72136560829:web:1c14d8087f9c3b88ade7d4",
  measurementId: "G-LGXCFVNFTH"
};

// ==== INISIALISASI FIREBASE ====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// ==== LOGIN GOOGLE ====
export function loginWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("Login berhasil:", user);

      // simpan data user ke localStorage
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.displayName);
      localStorage.setItem("userPhoto", user.photoURL);

      alert("Login berhasil sebagai: " + user.email);
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error("Login gagal:", error);
      alert("Login gagal: " + error.message);
    });
}

// ==== CEK STATUS LOGIN ====
onAuthStateChanged(auth, (user) => {
  const currentPage = window.location.pathname.split("/").pop();

  if (user) {
    console.log("Sudah login:", user.email);

    if (currentPage === "index.html" || currentPage === "") {
      window.location.href = "dashboard.html";
    }
  } else {
    console.log("Belum login");

    if (currentPage === "dashboard.html") {
      window.location.href = "index.html";
    }
  }
});

// ==== LOGOUT ====
export function logout() {
  signOut(auth)
    .then(() => {
      localStorage.clear();
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Gagal logout:", error);
    });
}
