const productContainer =
    document.getElementById("product-container");

const searchInput =
    document.getElementById("search-input");

const categoryFilter =
    document.getElementById("category-filter");

const sortSelect =
    document.getElementById("sort-select");

const loadMoreButton =
    document.getElementById("load-more-button");

const statusMessage =
    document.getElementById("status-message");


let allProducts = [];
let displayedProducts = [];

const productPerPage = 8;

let visibleProductCount =
    productPerPage;


async function fetchProducts() {

    try {

        statusMessage.textContent =
            "Loading produk...";

        const response =
            await fetch(
                "https://dummyjson.com/products?limit=100"
            );

        if (!response.ok) {
            throw new Error(
                "Gagal mengambil data produk."
            );
        }

        const data =
            await response.json();

        allProducts =
            data.products;

        displayedProducts =
            [...allProducts];

        createCategoryOptions();

        renderProducts();

        statusMessage.textContent = "";

    }

    catch (error) {

        console.error(error);

        statusMessage.textContent =
            "Produk gagal dimuat.";

        statusMessage.classList.add(
            "error-message"
        );

    }

}


function createCategoryOptions() {

    const categories =
        allProducts.map(
            function(product) {
                return product.category;
            }
        );

    const uniqueCategories =
        [...new Set(categories)];

    uniqueCategories.forEach(
        function(category) {

            const option =
                document.createElement("option");

            option.value =
                category;

            option.textContent =
                formatCategory(category);

            categoryFilter.appendChild(
                option
            );

        }
    );

}


function formatCategory(category) {

    return category
        .split("-")
        .map(
            function(word) {

                return (
                    word.charAt(0).toUpperCase()
                    +
                    word.slice(1)
                );

            }
        )
        .join(" ");

}


function createProductCard(product) {

    const card =
        document.createElement("article");

    card.classList.add(
        "product-card"
    );

    card.dataset.productId =
        product.id;


    const image =
        document.createElement("img");

    image.src =
        product.thumbnail;

    image.alt =
        product.title;

    image.classList.add(
        "product-image"
    );


    const title =
        document.createElement("h2");

    title.textContent =
        product.title;

    title.classList.add(
        "product-title"
    );


    const category =
        document.createElement("p");

    category.textContent =
        "Kategori: "
        +
        formatCategory(product.category);

    category.classList.add(
        "product-category"
    );


    const price =
        document.createElement("p");

    price.textContent =
        "$" + product.price.toFixed(2);

    price.classList.add(
        "product-price"
    );


    const rating =
        document.createElement("p");

    rating.textContent =
        "⭐ " + product.rating;

    rating.classList.add(
        "product-rating"
    );


    const discount =
        document.createElement("p");

    discount.textContent =
        "Diskon: "
        +
        product.discountPercentage
        +
        "%";

    discount.classList.add(
        "product-discount"
    );


    const cartButton =
        document.createElement("button");

    cartButton.textContent =
        "Tambah ke Keranjang";

    cartButton.classList.add(
        "add-cart-button"
    );

    cartButton.dataset.productId =
        product.id;


    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(category);
    card.appendChild(price);
    card.appendChild(rating);
    card.appendChild(discount);
    card.appendChild(cartButton);

    return card;
}


function renderProducts() {

    productContainer.textContent = "";

    const productsToShow =
        displayedProducts.slice(
            0,
            visibleProductCount
        );


    if (productsToShow.length === 0) {

        const message =
            document.createElement("p");

        message.textContent =
            "Produk tidak ditemukan.";

        message.classList.add(
            "empty-message"
        );

        productContainer.appendChild(
            message
        );

        loadMoreButton.style.display =
            "none";

        return;
    }


    productsToShow.forEach(
        function(product) {

            const card =
                createProductCard(product);

            productContainer.appendChild(
                card
            );

        }
    );


    if (
        visibleProductCount >=
        displayedProducts.length
    ) {

        loadMoreButton.style.display =
            "none";

    } else {

        loadMoreButton.style.display =
            "inline-block";

    }

}


function updateProducts() {

    const searchKeyword =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedCategory =
        categoryFilter.value;

    const selectedSort =
        sortSelect.value;


    let result =
        [...allProducts];


    result =
        result.filter(
            function(product) {

                const title =
                    product.title
                        .toLowerCase();

                const category =
                    product.category
                        .toLowerCase();

                return (
                    title.includes(searchKeyword)
                    ||
                    category.includes(searchKeyword)
                );

            }
        );


    if (
        selectedCategory !== "all"
    ) {

        result =
            result.filter(
                function(product) {

                    return (
                        product.category
                        === selectedCategory
                    );

                }
            );

    }


    if (
        selectedSort === "price-low"
    ) {

        result.sort(
            function(a, b) {
                return a.price - b.price;
            }
        );

    }

    else if (
        selectedSort === "price-high"
    ) {

        result.sort(
            function(a, b) {
                return b.price - a.price;
            }
        );

    }

    else if (
        selectedSort === "rating"
    ) {

        result.sort(
            function(a, b) {
                return b.rating - a.rating;
            }
        );

    }


    displayedProducts =
        result;

    visibleProductCount =
        productPerPage;

    renderProducts();
}


function debounce(callback, delay) {

    let timer;

    return function() {

        clearTimeout(timer);

        timer =
            setTimeout(
                function() {
                    callback();
                },
                delay
            );

    };

}


const debouncedSearch =
    debounce(
        updateProducts,
        500
    );


searchInput.addEventListener(
    "input",
    debouncedSearch
);

categoryFilter.addEventListener(
    "change",
    updateProducts
);

sortSelect.addEventListener(
    "change",
    updateProducts
);

loadMoreButton.addEventListener(
    "click",
    function() {

        visibleProductCount +=
            productPerPage;

        renderProducts();

    }
);


fetchProducts();