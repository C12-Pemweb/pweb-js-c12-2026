// ==========================================================================
// 1. Proteksi Halaman (Auth Guard)
// ==========================================================================
// Halaman ini tidak boleh dapat diakses jika pengguna belum login
const currentUserFirstName = localStorage.getItem("firstName");
if (!currentUserFirstName) {
    window.location.href = "login.html";
}

// ==========================================================================
// 2. Inisialisasi Elemen DOM
// ==========================================================================
const welcomeUser = document.getElementById("welcome-user");
const logoutButton = document.getElementById("logout-button");

// Keranjang
const cartButton = document.getElementById("cart-button");
const cartBadge = document.getElementById("cart-badge");
const cartTotalNav = document.getElementById("cart-total");
const cartModal = document.getElementById("cart-modal");
const cartBackdrop = document.getElementById("cart-backdrop");
const cartClose = document.getElementById("cart-close");
const cartItemsContainer = document.getElementById("cart-items");
const cartModalTotal = document.getElementById("cart-modal-total");
const clearCartBtn = document.getElementById("clear-cart-btn");
const checkoutBtn = document.getElementById("checkout-btn");

// Kontrol Produk
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const resetFilterBtn = document.getElementById("reset-filter-btn");

// Status & Error
const statusBar = document.querySelector(".status-bar");
const statusMessage = document.getElementById("status-message");
const productsCount = document.getElementById("products-count");
const errorContainer = document.getElementById("error-container");
const errorDescription = document.getElementById("error-description");
const retryButton = document.getElementById("retry-button");

// Grid & Pagination
const productContainer = document.getElementById("product-container");
const loadMoreButton = document.getElementById("load-more-button");

// Detail Modal
const productModal = document.getElementById("product-modal");
const modalBackdrop = document.getElementById("modal-backdrop");
const modalClose = document.getElementById("modal-close");
const modalBody = document.getElementById("modal-body");

// Toast
const toastContainer = document.getElementById("toast-container");

// ==========================================================================
// 3. State Management
// ==========================================================================
let allProducts = [];
let displayedProducts = [];
const productPerPage = 8;
let visibleProductCount = productPerPage;
const CART_STORAGE_KEY = "mini_shopee_cart";

// ==========================================================================
// 4. Inisialisasi Tampilan Navbar & Sesi
// ==========================================================================
welcomeUser.textContent = `Halo, ${currentUserFirstName}!`;

// Tombol Logout: hapus session storage dan arahkan ke login.html
logoutButton.addEventListener("click", function() {
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("userEmail");
    window.location.href = "login.html";
});

// ==========================================================================
// 5. Toast Notification System
// ==========================================================================
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";
    
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// ==========================================================================
// 6. Keranjang Belanja (Local Storage CRUD)
// ==========================================================================
// Read: Membaca keranjang dari Local Storage (getItem)
function getCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Gagal membaca keranjang:", e);
        return [];
    }
}

// Save/Update: Menyimpan keranjang ke Local Storage (setItem / removeItem)
function saveCart(cart) {
    if (cart.length === 0) {
        // Hapus key jika keranjang kosong
        localStorage.removeItem(CART_STORAGE_KEY);
    } else {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
    updateCartUI();
}

// Create/Update: Tambah item ke keranjang
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            category: product.category,
            quantity: 1
        });
    }

    saveCart(cart);
    showToast(`"${product.title}" berhasil ditambahkan ke keranjang!`, "success");
}

// Update: Ubah kuantitas item
function updateCartQuantity(productId, delta) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    cart[itemIndex].quantity += delta;
    if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
        showToast("Produk dihapus dari keranjang.", "info");
    }

    saveCart(cart);
    renderCartModal();
}

// Delete: Hapus satu item dari keranjang
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCartModal();
    showToast("Produk dihapus dari keranjang.", "info");
}

// Clear: Mengosongkan keranjang belanja (removeItem)
function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartUI();
    renderCartModal();
    showToast("Keranjang belanja dikosongkan.", "warning");
}

// Render UI Navbar Keranjang (Badge & Total Harga)
function updateCartUI() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartBadge.textContent = totalCount;
    cartTotalNav.textContent = "$" + totalPrice.toFixed(2);
    if (cartModalTotal) {
        cartModalTotal.textContent = "$" + totalPrice.toFixed(2);
    }
}

// Render Item pada Modal Drawer Keranjang
function renderCartModal() {
    const cart = getCart();
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <span class="empty-icon">🛒</span>
                <p><strong>Keranjang Anda masih kosong</strong></p>
                <p style="font-size: 13px; color: #888; margin-top: 4px;">Yuk cari produk impianmu sekarang!</p>
            </div>
        `;
        return;
    }

    cart.forEach(item => {
        const itemRow = document.createElement("div");
        itemRow.className = "cart-item";
        itemRow.innerHTML = `
            <img src="${item.thumbnail}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-info">
                <h4 class="cart-item-title" title="${item.title}">${item.title}</h4>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Kurangi kuantitas">−</button>
                    <span class="qty-count">${item.quantity}</span>
                    <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Tambah kuantitas">+</button>
                </div>
            </div>
            <button type="button" class="cart-item-remove" data-id="${item.id}" title="Hapus produk">&times;</button>
        `;
        cartItemsContainer.appendChild(itemRow);
    });
}

// Event listener di dalam keranjang (Event Delegation)
cartItemsContainer.addEventListener("click", function(e) {
    const qtyBtn = e.target.closest(".qty-btn");
    if (qtyBtn) {
        const id = Number(qtyBtn.dataset.id);
        const action = qtyBtn.dataset.action;
        updateCartQuantity(id, action === "increase" ? 1 : -1);
        return;
    }

    const removeBtn = e.target.closest(".cart-item-remove");
    if (removeBtn) {
        const id = Number(removeBtn.dataset.id);
        removeFromCart(id);
    }
});

// Modal Cart Open / Close
cartButton.addEventListener("click", function() {
    renderCartModal();
    cartModal.style.display = "flex";
    document.body.style.overflow = "hidden";
});

function closeCartModal() {
    cartModal.style.display = "none";
    document.body.style.overflow = "auto";
}

cartClose.addEventListener("click", closeCartModal);
cartBackdrop.addEventListener("click", closeCartModal);

clearCartBtn.addEventListener("click", function() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast("Keranjang sudah kosong.", "info");
        return;
    }
    if (confirm("Apakah Anda yakin ingin mengosongkan seluruh isi keranjang?")) {
        clearCart();
    }
});

checkoutBtn.addEventListener("click", function() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast("Keranjang Anda masih kosong. Silakan pilih produk terlebih dahulu.", "warning");
        return;
    }
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Terima kasih, ${currentUserFirstName}! Checkout sukses untuk ${totalCount} produk dengan total belanja $${totalPrice.toFixed(2)}.`);
    clearCart();
    closeCartModal();
});

// ==========================================================================
// 7. Pengambilan Data Produk dari API (Dynamic Fetch & Error Handling)
// ==========================================================================
async function fetchProducts() {
    try {
        errorContainer.style.display = "none";
        productContainer.style.display = "grid";
        statusMessage.textContent = "Loading produk dari API...";
        statusMessage.classList.remove("error-message");

        const response = await fetch("https://dummyjson.com/products?limit=100");

        if (!response.ok) {
            throw new Error(`Server merespon dengan status ${response.status}`);
        }

        const data = await response.json();
        allProducts = data.products;
        displayedProducts = [...allProducts];

        createCategoryOptions();
        updateProductCountInfo();
        renderProducts();

        statusMessage.textContent = "";
    } catch (error) {
        console.error("Global Fetch Error:", error);
        statusMessage.textContent = "Gagal memuat produk.";
        statusMessage.classList.add("error-message");
        productContainer.style.display = "none";
        loadMoreButton.style.display = "none";
        
        // Tampilkan pesan error visual (Global Error Handling)
        errorDescription.textContent = `Terjadi kesalahan saat memuat katalog produk: ${error.message}`;
        errorContainer.style.display = "block";
    }
}

retryButton.addEventListener("click", fetchProducts);

// ==========================================================================
// 8. Kategori Dinamis & Formatting
// ==========================================================================
function formatCategory(category) {
    if (!category) return "";
    return category
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function createCategoryOptions() {
    const categories = allProducts.map(product => product.category);
    const uniqueCategories = [...new Set(categories)].sort();

    // Hapus opsi selain "Semua Kategori"
    categoryFilter.innerHTML = '<option value="all">Semua Kategori</option>';

    uniqueCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = formatCategory(category);
        categoryFilter.appendChild(option);
    });
}

function updateProductCountInfo() {
    const totalFound = displayedProducts.length;
    productsCount.textContent = `Menampilkan ${Math.min(visibleProductCount, totalFound)} dari ${totalFound} produk`;
}

// ==========================================================================
// 9. Render Produk (Card Grid)
// ==========================================================================
function createProductCard(product) {
    const card = document.createElement("article");
    card.classList.add("product-card");
    card.dataset.productId = product.id;

    card.innerHTML = `
        <div class="product-card-image-wrap">
            <span class="discount-badge">-${Math.round(product.discountPercentage)}%</span>
            <img src="${product.thumbnail}" alt="${product.title}" class="product-image" loading="lazy">
        </div>
        <div class="product-card-body">
            <span class="product-category-tag">${formatCategory(product.category)}</span>
            <h2 class="product-title" title="${product.title}">${product.title}</h2>
            <div class="product-meta-row">
                <span class="product-rating"><span class="star-icon">★</span> ${product.rating.toFixed(1)}</span>
                <span style="font-size: 12px; color: #888;">Stok: ${product.stock}</span>
            </div>
            <div class="product-price-section">
                <span class="product-price">$${product.price.toFixed(2)}</span>
            </div>
            <button type="button" class="add-cart-button" data-product-id="${product.id}">
                🛒 Tambah ke Keranjang
            </button>
        </div>
    `;

    return card;
}

function renderProducts() {
    productContainer.textContent = "";

    // Array slicing untuk load more / pagination
    const productsToShow = displayedProducts.slice(0, visibleProductCount);

    if (productsToShow.length === 0) {
        const emptyBox = document.createElement("div");
        emptyBox.className = "empty-message";
        emptyBox.innerHTML = `
            <span class="empty-icon">🔍</span>
            <p><strong>Tidak ada produk yang cocok</strong></p>
            <p style="font-size: 13px; color: #888; margin-top: 4px;">Coba gunakan kata kunci pencarian atau filter kategori lain.</p>
        `;
        productContainer.appendChild(emptyBox);
        loadMoreButton.style.display = "none";
        updateProductCountInfo();
        return;
    }

    productsToShow.forEach(product => {
        const card = createProductCard(product);
        productContainer.appendChild(card);
    });

    // Kontrol tombol "Load More"
    if (visibleProductCount >= displayedProducts.length) {
        loadMoreButton.style.display = "none";
    } else {
        loadMoreButton.style.display = "inline-block";
    }

    updateProductCountInfo();
}

// ==========================================================================
// 10. Filter, Pencarian, & Sorting (Functional Programming)
// ==========================================================================
function updateProducts() {
    const searchKeyword = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedSort = sortSelect.value;

    let result = [...allProducts];

    // Filter berdasarkan pencarian nama atau kategori
    if (searchKeyword) {
        result = result.filter(product => {
            const title = product.title.toLowerCase();
            const category = product.category.toLowerCase();
            return title.includes(searchKeyword) || category.includes(searchKeyword);
        });
    }

    // Filter berdasarkan kategori pilihan
    if (selectedCategory !== "all") {
        result = result.filter(product => product.category === selectedCategory);
    }

    // Urutkan (Sorting) berdasarkan harga atau rating
    if (selectedSort === "price-low") {
        result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-high") {
        result.sort((a, b) => b.price - a.price);
    } else if (selectedSort === "rating") {
        result.sort((a, b) => b.rating - a.rating);
    }

    displayedProducts = result;
    visibleProductCount = productPerPage; // Reset batch ke halaman pertama saat filter berubah
    renderProducts();
}

// ==========================================================================
// 11. Real-Time Search (Debounce & Closures)
// ==========================================================================
// Teknik Debounce memanfaatkan Closure agar pencarian tidak memicu proses di setiap ketikan keyboard
function debounce(callback, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback.apply(this, args);
        }, delay);
    };
}

const debouncedSearch = debounce(updateProducts, 400);

searchInput.addEventListener("input", debouncedSearch);
categoryFilter.addEventListener("change", updateProducts);
sortSelect.addEventListener("change", updateProducts);

// Tombol Reset Filter
resetFilterBtn.addEventListener("click", function() {
    searchInput.value = "";
    categoryFilter.value = "all";
    sortSelect.value = "default";
    updateProducts();
    showToast("Filter pencarian direset.", "info");
});

// Load More Click (Array Slicing)
loadMoreButton.addEventListener("click", function() {
    visibleProductCount += productPerPage;
    renderProducts();
});

// ==========================================================================
// 12. Detail Produk Modal (EVENT DELEGATION)
// ==========================================================================
// Penanganan event click pada kartu wajib menggunakan teknik Event Delegation pada elemen parent
productContainer.addEventListener("click", function(event) {
    // 1. Jika tombol "Tambah ke Keranjang" diklik
    const cartBtn = event.target.closest(".add-cart-button");
    if (cartBtn) {
        event.stopPropagation();
        const productId = Number(cartBtn.dataset.productId);
        addToCart(productId);
        return;
    }

    // 2. Jika area kartu produk lainnya diklik, tampilkan modal detail
    const productCard = event.target.closest(".product-card");
    if (productCard) {
        const productId = Number(productCard.dataset.productId);
        openProductDetailModal(productId);
    }
});

// Fungsi membuka modal detail produk
function openProductDetailModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    modalBody.innerHTML = `
        <div class="detail-layout">
            <div class="detail-image-wrapper">
                <img src="${product.thumbnail}" alt="${product.title}" class="detail-image">
            </div>
            <div class="detail-info">
                <div class="detail-badge-row">
                    <span class="detail-category">${formatCategory(product.category)}</span>
                    <span class="detail-brand">${product.brand || "Original Brand"}</span>
                </div>
                <h2 class="detail-title" id="modal-title">${product.title}</h2>
                <div class="detail-rating">
                    <span class="star-icon">★</span> <strong>${product.rating.toFixed(1)}</strong> / 5.0
                </div>
                <div class="detail-pricing">
                    <span class="detail-price">$${product.price.toFixed(2)}</span>
                    <span class="detail-discount">Diskon ${product.discountPercentage}%</span>
                </div>
                <div class="detail-desc-title">Deskripsi Produk:</div>
                <p class="detail-description">${product.description}</p>
                <div class="detail-stock">
                    <span>📦 Stok Tersedia: <strong>${product.stock} unit</strong></span>
                </div>
                <div class="detail-actions">
                    <button type="button" class="detail-add-btn" id="modal-add-cart-btn" data-id="${product.id}">
                        🛒 Tambah ke Keranjang
                    </button>
                </div>
            </div>
        </div>
    `;

    // Tombol tambah ke keranjang di dalam modal
    const modalAddBtn = document.getElementById("modal-add-cart-btn");
    if (modalAddBtn) {
        modalAddBtn.addEventListener("click", function() {
            addToCart(product.id);
        });
    }

    productModal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeProductModal() {
    productModal.style.display = "none";
    document.body.style.overflow = "auto";
}

modalClose.addEventListener("click", closeProductModal);
modalBackdrop.addEventListener("click", closeProductModal);

// Close modal with Escape key
window.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        closeProductModal();
        closeCartModal();
    }
});

// ==========================================================================
// 13. Bootstrapping Aplikasi
// ==========================================================================
updateCartUI();
fetchProducts();