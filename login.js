// Auth Guard: Jika sudah login, langsung alihkan ke halaman katalog produk
if (localStorage.getItem("firstName")) {
    window.location.href = "index.html";
}

// Inisialisasi elemen DOM
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const buttonSpinner = document.getElementById("button-spinner");
const buttonText = document.getElementById("button-text");
const errorBanner = document.getElementById("error-banner");
const errorMessage = document.getElementById("error-message");
const togglePasswordBtn = document.getElementById("toggle-password");
const fillDemoBtn = document.getElementById("fill-demo-btn");

// Fungsi menampilkan pesan error
function showError(message) {
    errorMessage.textContent = message;
    errorBanner.style.display = "flex";
}

// Fungsi menyembunyikan pesan error
function hideError() {
    errorBanner.style.display = "none";
    errorMessage.textContent = "";
}

// Fungsi mengatur loading state tombol login
function setLoading(isLoading) {
    if (isLoading) {
        loginButton.disabled = true;
        buttonSpinner.style.display = "inline-block";
        buttonText.textContent = "Memverifikasi...";
    } else {
        loginButton.disabled = false;
        buttonSpinner.style.display = "none";
        buttonText.textContent = "Masuk";
    }
}

// Event handler submit form login dengan try...catch dan fetch
loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    hideError();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showError("Username dan password tidak boleh kosong.");
        return;
    }

    setLoading(true);

    try {
        // Ambil data pengguna dari Users API DummyJSON
        const response = await fetch("https://dummyjson.com/users?limit=0");

        if (!response.ok) {
            throw new Error(`Koneksi ke server gagal dengan status ${response.status}`);
        }

        const data = await response.json();

        // Validasi kecocokan username dan password
        const authenticatedUser = data.users.find(function(user) {
            return user.username === username && user.password === password;
        });

        if (authenticatedUser) {
            // Session Persistence: Simpan firstName pengguna ke Local Storage
            localStorage.setItem("firstName", authenticatedUser.firstName);
            localStorage.setItem("lastName", authenticatedUser.lastName || "");
            localStorage.setItem("userEmail", authenticatedUser.email || "");

            // Auto Redirect ke halaman katalog produk
            window.location.href = "index.html";
        } else {
            showError("Username atau password salah. Silakan periksa kembali kredensial Anda.");
        }
    } catch (error) {
        console.error("Login Error:", error);
        showError("Terjadi kendala pada koneksi API atau jaringan: " + error.message);
    } finally {
        setLoading(false);
    }
});

// Fitur tambahan: Toggle visibilitas password
if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", function() {
        const isPassword = passwordInput.getAttribute("type") === "password";
        passwordInput.setAttribute("type", isPassword ? "text" : "password");
        togglePasswordBtn.textContent = isPassword ? "🙈" : "👁️";
    });
}

// Fitur pembantu: Tombol pengisian akun demo
if (fillDemoBtn) {
    fillDemoBtn.addEventListener("click", function() {
        usernameInput.value = "emilys";
        passwordInput.value = "emilyspass";
        hideError();
    });
}