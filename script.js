
const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 1499,
    rating: 4.5,
    emoji: "🎧"
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: 2299,
    rating: 4.3,
    emoji: "⌚"
  },
  {
    id: 3,
    name: "Running Shoes",
    category: "Fashion",
    price: 1799,
    rating: 4.4,
    emoji: "👟"
  },
  {
    id: 4,
    name: "Casual T-Shirt",
    category: "Fashion",
    price: 599,
    rating: 4.1,
    emoji: "👕"
  },
  {
    id: 5,
    name: "Coffee Mug Set",
    category: "Home",
    price: 399,
    rating: 4.2,
    emoji: "☕"
  },
  {
    id: 6,
    name: "Table Lamp",
    category: "Home",
    price: 899,
    rating: 4.0,
    emoji: "💡"
  },
  {
    id: 7,
    name: "Learning JavaScript",
    category: "Books",
    price: 499,
    rating: 4.7,
    emoji: "📘"
  },
  {
    id: 8,
    name: "Notebook Set",
    category: "Books",
    price: 249,
    rating: 4.2,
    emoji: "📚"
  }
];

const money = amount =>
  "₹" + amount.toLocaleString("en-IN");

function getCart() {
  try {
    const cart = JSON.parse(
      localStorage.getItem("amazonDemoCart") || "{}"
    );

    if (!cart || typeof cart !== "object" || Array.isArray(cart)) {
      return {};
    }

    const validCart = {};

    Object.entries(cart).forEach(([id, qty]) => {
      const product = products.find(p => p.id === Number(id));

      if (
        product &&
        Number.isInteger(qty) &&
        qty > 0 &&
        qty <= 99
      ) {
        validCart[id] = qty;
      }
    });

    return validCart;
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem("amazonDemoCart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const count = Object.values(cart).reduce(
    (total, qty) => total + qty, 0
  );

  document.querySelectorAll(".cart-count").forEach(element => {
    element.textContent = count;
  });
}

function addToCart(id) {
  const cart = getCart();

  if ((cart[id] || 0) >= 99) {
    alert("Maximum quantity is 99 per product.");
    return;
  }

  cart[id] = (cart[id] || 0) + 1;
  saveCart(cart);
  alert("Product added to your cart!");
}

function renderProduct(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const image = document.createElement("div");
  image.className = "product-image";
  image.setAttribute("aria-hidden", "true");
  image.textContent = product.emoji;

  const category = document.createElement("p");
  category.className = "product-category";
  category.textContent = product.category;

  const name = document.createElement("h3");
  name.textContent = product.name;

  const rating = document.createElement("p");
  rating.className = "rating";
  rating.textContent = `⭐ ${product.rating} / 5`;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = money(product.price);

  const button = document.createElement("button");
  button.className = "add-btn";
  button.textContent = "Add to Cart";
  button.addEventListener("click", () => addToCart(product.id));

  card.append(image, category, name, rating, price, button);
  return card;
}

function displayProducts(items, container) {
  if (!container) return;

  container.replaceChildren();

  items.forEach(product => {
    container.appendChild(renderProduct(product));
  });
}

// Home page: featured products
displayProducts(
  products.slice(0, 4),
  document.getElementById("featured-products")
);

// Products page: search, category, and sorting
const categoryFilter = document.getElementById("category-filter");
const sortFilter = document.getElementById("sort-filter");
const allProducts = document.getElementById("all-products");
const resultCount = document.getElementById("result-count");
const emptyMessage = document.getElementById("empty-message");

if (allProducts) {
  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim().toLowerCase();
  const requestedCategory = params.get("category");

  const validCategories = ["Electronics", "Fashion", "Home", "Books"];

  if (validCategories.includes(requestedCategory)) {
    categoryFilter.value = requestedCategory;
  }

  const searchInput = document.querySelector(
    '.search input[name="q"]'
  );

  if (searchInput) {
    searchInput.value = params.get("q") || "";
  }

  function filterProducts() {
    let filtered = products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter.value === "All" ||
        product.category === categoryFilter.value;

      return matchesSearch && matchesCategory;
    });

    switch (sortFilter.value) {
      case "low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    displayProducts(filtered, allProducts);

    resultCount.textContent =
      `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`;

    emptyMessage.hidden = filtered.length !== 0;
  }

  categoryFilter.addEventListener("change", filterProducts);
  sortFilter.addEventListener("change", filterProducts);

  filterProducts();
}

// Shopping cart page
const cartItems = document.getElementById("cart-items");

if (cartItems) {
  function renderCart() {
    const cart = getCart();
    cartItems.replaceChildren();

    const entries = Object.entries(cart);
    const subtotal = entries.reduce((sum, [id, qty]) => {
      const product = products.find(p => p.id === Number(id));
      return sum + (product ? product.price * qty : 0);
    }, 0);

    const delivery = subtotal === 0 || subtotal >= 999 ? 0 : 49;

    document.getElementById("cart-subtotal").textContent =
      money(subtotal);

    document.getElementById("delivery-cost").textContent =
      money(delivery);

    document.getElementById("cart-total").textContent =
      money(subtotal + delivery);

    if (entries.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-cart";

      const heading = document.createElement("h2");
      heading.textContent = "Your cart is empty";

      const message = document.createElement("p");
      message.textContent = "Discover products and add your favourites.";

      const link = document.createElement("a");
      link.href = "products.html";
      link.className = "primary-btn";
      link.textContent = "Start Shopping";

      empty.append(heading, message, link);
      cartItems.appendChild(empty);
      return;
    }

    entries.forEach(([id, qty]) => {
      const product = products.find(p => p.id === Number(id));
      if (!product) return;

      const row = document.createElement("article");
      row.className = "cart-row";

      const emoji = document.createElement("div");
      emoji.className = "cart-emoji";
      emoji.textContent = product.emoji;

      const details = document.createElement("div");

      const heading = document.createElement("h3");
      heading.textContent = product.name;

      const price = document.createElement("p");
      price.className = "price";
      price.textContent = money(product.price * qty);

      const controls = document.createElement("div");
      controls.className = "quantity-controls";

      const decrease = document.createElement("button");
      decrease.textContent = "−";
      decrease.setAttribute("aria-label", "Decrease quantity");
      decrease.addEventListener("click", () => changeQuantity(id, -1));

      const quantity = document.createElement("span");
      quantity.textContent = `Qty: ${qty}`;

      const increase = document.createElement("button");
      increase.textContent = "+";
      increase.setAttribute("aria-label", "Increase quantity");
      increase.disabled = qty >= 99;
      increase.addEventListener("click", () => changeQuantity(id, 1));

      const remove = document.createElement("button");
      remove.className = "remove-btn";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        const updatedCart = getCart();
        delete updatedCart[id];
        saveCart(updatedCart);
        renderCart();
      });

      controls.append(decrease, quantity, increase, remove);
      details.append(heading, price, controls);
      row.append(emoji, details);
      cartItems.appendChild(row);
    });
  }

  function changeQuantity(id, amount) {
    const cart = getCart();
    const nextQty = (cart[id] || 0) + amount;

    if (nextQty <= 0) {
      delete cart[id];
    } else if (nextQty <= 99) {
      cart[id] = nextQty;
    } else {
      return;
    }

    saveCart(cart);
    renderCart();
  }

  renderCart();

  document.getElementById("checkout-btn").addEventListener("click", () => {
    const cart = getCart();

    if (Object.keys(cart).length === 0) {
      alert("Your cart is empty. Add a product first.");
      return;
    }

    alert(
      "Demo checkout successful! No payment was taken. " +
      "This project does not place real orders."
    );
  });
}

updateCartCount();
