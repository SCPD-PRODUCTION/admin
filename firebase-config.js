// Firebase configuration
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Login Google resmi dengan popup
function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            // Cek apakah user termasuk admin
            const allowedAdmins = ["tsaqibys@gmail.com", "scpdproduct@gmail.com"]; // Ganti sesuai email admin
            if(!allowedAdmins.includes(result.user.email)) {
                alert("Akses ditolak! Hanya admin yang boleh login.");
                auth.signOut();
                return;
            }
            // Redirect ke dashboard
            window.location.href = "dashboard.html";
        })
        .catch(error => {
            console.error("Login gagal:", error);
            alert("Login gagal, cek console.");
        });
}
