// ============================================================
// CONFIG
// ============================================================
const WHATSAPP_NUMBER = "2348121156043"; // your WA number, no +
const PAYSTACK_PUBLIC_KEY = "pk_live_XXXXXXXXXXXXXXXXXXXXXXXX"; // ← paste your real key

// ============================================================
// CART STATE
// ============================================================
let cartItems = [];

// ============================================================
// PRODUCTS — RENDER & FILTER
// ============================================================

// Renders products — pass a category name or "all"
function renderProducts(filter = "all") {
  const grid = document.getElementById("productGrid");
  const noResults = document.getElementById("noResults");
  const activeFilter = document.getElementById("activeFilter");

  let items = [];

  if (filter === "all") {
    // Flatten all items from every category into one array
    products.forEach((cat) => {
      cat.items.forEach((item) => {
        items.push({ ...item, category: cat.category });
      });
    });
  } else {
    // Find the matching category and grab its items
    const category = products.find(
      (cat) => cat.category.toLowerCase() === filter.toLowerCase(),
    );
    if (category) {
      items = category.items.map((item) => ({
        ...item,
        category: category.category,
      }));
    }
  }

  // Show "no results" if empty
  if (items.length === 0) {
    grid.innerHTML = "";
    noResults.style.display = "block";
    activeFilter.textContent = filter !== "all" ? `Showing: ${filter}` : "";
    return;
  }

  noResults.style.display = "none";
  activeFilter.textContent = filter !== "all" ? `Showing: ${filter}` : "";

  // Build and inject HTML
  grid.innerHTML = items
    .map(
      (item) => `
      <div class="product" data-category="${item.category}">
        <img src="${item.image}" alt="${item.name}" />
        <div class="product-body">
          <h3>${item.name}</h3>
          <p class="price" id="price-${item.id}">
            ₦${item.variants[0].price.toLocaleString()}
          </p>
          <select id="select-${item.id}" onchange="updatePrice('${item.id}')">
            ${item.variants
              .map((v) => `<option value="${v.price}">${v.size}</option>`)
              .join("")}
          </select>
          <button class="add-btn" onclick="addToCart('${item.id}')">
            Add to Cart
          </button>
        </div>
      </div>
    `,
    )
    .join("");

  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}

// Updates displayed price when dropdown changes
function updatePrice(itemId) {
  const selectEl = document.getElementById(`select-${itemId}`);
  const newPrice = Number(selectEl.value);
  document.getElementById(`price-${itemId}`).textContent =
    `₦${newPrice.toLocaleString()}`;
}

// Finds an item by id across all categories
function findItem(itemId) {
  for (const cat of products) {
    const found = cat.items.find((item) => item.id === itemId);
    if (found) return { ...found, category: cat.category };
  }
  return null;
}

// Render all products on page load
renderProducts("all");

// ============================================================
// CART — ADD / REMOVE / CLEAR / TOTAL
// ============================================================

function addToCart(itemId) {
  const item = findItem(itemId);
  const selectEl = document.getElementById(`select-${itemId}`);
  const selectedPrice = Number(selectEl.value);
  const selectedSize = selectEl.options[selectEl.selectedIndex].text;

  // If same product + same size already in cart, increase count
  const existing = cartItems.find(
    (i) => i.id === itemId && i.qty === selectedSize,
  );

  if (existing) {
    existing.count += 1;
  } else {
    cartItems.push({
      id: item.id,
      name: item.name,
      category: item.category,
      qty: selectedSize,
      price: selectedPrice,
      count: 1,
    });
  }

  updateCartUI();
  showToast(`${item.name} added to cart!`);
}

function removeItem(index) {
  cartItems.splice(index, 1);
  updateCartUI();
}

function clearCart() {
  cartItems = [];
  updateCartUI();
}

function getTotal() {
  return cartItems.reduce((sum, i) => sum + i.price * i.count, 0);
}

// ============================================================
// CART — UI UPDATE
// ============================================================

function updateCartUI() {
  const total = getTotal();
  const count = cartItems.reduce((sum, i) => sum + i.count, 0);

  document.getElementById("cartCount").textContent = count;
  document.getElementById("paystackTotal").textContent = total.toLocaleString();

  const itemsEl = document.getElementById("cartItems");
  const footerEl = document.getElementById("cartFooter");

  if (cartItems.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    footerEl.style.display = "none";
    return;
  }

  itemsEl.innerHTML = cartItems
    .map(
      (item, i) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span class="cart-item-qty">${item.qty} × ${item.count}</span>
        </div>
        <div class="cart-item-right">
          <span>₦${(item.price * item.count).toLocaleString()}</span>
          <button class="remove-btn" onclick="removeItem(${i})" aria-label="Remove ${item.name}">✕</button>
        </div>
      </div>
    `,
    )
    .join("");

  document.getElementById("cartTotal").textContent =
    "₦" + total.toLocaleString();
  footerEl.style.display = "block";
}

// ============================================================
// CART DRAWER — OPEN / CLOSE
// ============================================================

function toggleCart() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  const isOpen = drawer.classList.toggle("open");
  overlay.classList.toggle("open", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
}

// ============================================================
// CHECKOUT — WHATSAPP
// ============================================================

function orderViaWhatsapp() {
  if (cartItems.length === 0) {
    showToast("Your cart is empty!");
    return;
  }

  const total = getTotal();
  const date = new Date().toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  let msg = `🌿 *NEW ORDER — FARM-OTTAH*\n`;
  msg += `📅 ${date}\n\n`;
  msg += `🛒 *ORDER DETAILS:*\n`;
  msg += `─────────────────\n`;
  cartItems.forEach((item) => {
    msg += `• *${item.name}* (${item.qty})\n`;
    msg += `  Qty: ${item.count}  →  ₦${(item.price * item.count).toLocaleString()}\n`;
  });
  msg += `─────────────────\n`;
  msg += `💰 *TOTAL: ₦${total.toLocaleString()}*\n\n`;
  msg += `📦 Please confirm availability and provide delivery details.\n`;
  msg += `Thank you! 🙏`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
}

// ============================================================
// CHECKOUT — PAYSTACK
// ============================================================

function initiatePaystack() {
  if (cartItems.length === 0) {
    showToast("Your cart is empty!");
    return;
  }

  const total = getTotal();
  const name = document.getElementById("custName").value.trim();
  const email = document.getElementById("custEmail").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const formEl = document.getElementById("customerForm");

  // Show the form if not visible yet
  if (!formEl.classList.contains("visible")) {
    formEl.classList.add("visible");
    showToast("Please fill in your details, then click Pay again.");
    return;
  }

  // Validate fields
  if (!name || !email || !phone || !address) {
    showToast("Please fill in all your details above.");
    document.getElementById("custName").focus();
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Please enter a valid email address.");
    return;
  }

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: total * 100, // kobo
    currency: "NGN",
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: name,
        },
        { display_name: "Phone", variable_name: "phone", value: phone },
        {
          display_name: "Delivery Address",
          variable_name: "delivery_address",
          value: address,
        },
        {
          display_name: "Order Summary",
          variable_name: "order_summary",
          value: cartItems
            .map((i) => `${i.name} (${i.qty}) x${i.count}`)
            .join(", "),
        },
      ],
    },
    callback: function (response) {
      showToast("✅ Payment successful! Ref: " + response.reference);
      sendPaymentConfirmationWA(
        response.reference,
        name,
        phone,
        address,
        total,
      );
      clearCart();
      toggleCart();
    },
    onClose: function () {
      showToast("Payment window closed.");
    },
  });

  handler.openIframe();
}

// Send WhatsApp confirmation after successful Paystack payment
function sendPaymentConfirmationWA(ref, name, phone, address, total) {
  const date = new Date().toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  let msg = `✅ *PAYMENT CONFIRMED — FARM-OTTAH*\n`;
  msg += `📅 ${date}\n\n`;
  msg += `👤 *${name}*\n`;
  msg += `📞 ${phone}\n`;
  msg += `📍 ${address}\n\n`;
  msg += `🛒 *ITEMS:*\n`;
  cartItems.forEach((item) => {
    msg += `• ${item.name} (${item.qty}) ×${item.count} — ₦${(item.price * item.count).toLocaleString()}\n`;
  });
  msg += `\n💰 *TOTAL PAID: ₦${total.toLocaleString()}*\n`;
  msg += `🔖 *Paystack Ref:* ${ref}\n\n`;
  msg += `Please process this order for delivery. Thank you! 🙏`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
}

// ============================================================
// MOBILE NAV
// ============================================================

function toggleNav() {
  const nav = document.getElementById("navLinks");
  const btn = document.getElementById("hamburger");
  const isOpen = nav.classList.toggle("open");
  btn.setAttribute("aria-expanded", isOpen);
  btn.classList.toggle("active", isOpen);
}

// Close nav when a link is clicked
document.querySelectorAll("#navLinks a").forEach((link) => {
  link.addEventListener("click", () => {
    document.getElementById("navLinks").classList.remove("open");
    document.getElementById("hamburger").classList.remove("active");
  });
});

// ============================================================
// SCROLL — SCROLL TO TOP BUTTON
// ============================================================

window.addEventListener("scroll", () => {
  document.getElementById("scrollTop").style.display =
    window.scrollY > 400 ? "flex" : "none";
});

// ============================================================
// SCROLL — ACTIVE NAV LINK ON SCROLL
// ============================================================

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("nav ul a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((s) => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + current);
  });
});

// ============================================================
// TOAST NOTIFICATION
// ============================================================

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}
