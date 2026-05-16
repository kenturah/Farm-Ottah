// ── CONFIG — update these two lines ──
const WHATSAPP_NUMBER = '2348121156043';        // your WA number, no +
const PAYSTACK_PUBLIC_KEY = 'pk_live_XXXXXXXXXXXXXXXXXXXXXXXX'; // ← paste your real key

// ── CART STATE ──
let cartItems = [];

function addToCart(name, price, selectId) {
  const qty = document.getElementById(selectId).value;
  const existing = cartItems.find(i => i.name === name && i.qty === qty);
  if (existing) {
    existing.count++;
  } else {
    cartItems.push({ name, price, qty, count: 1 });
  }
  updateCartUI();
  showToast(name + ' added to cart! 🛒');
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

function updateCartUI() {
  const total = getTotal();
  const count = cartItems.reduce((sum, i) => sum + i.count, 0);
  document.getElementById('cartCount').textContent = count;
  document.getElementById('paystackTotal').textContent = total.toLocaleString();

  const itemsEl  = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');

  if (cartItems.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    footerEl.style.display = 'none';
  } else {
    itemsEl.innerHTML = cartItems.map((item, i) => `
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
    `).join('');
    document.getElementById('cartTotal').textContent = '₦' + total.toLocaleString();
    footerEl.style.display = 'block';
  }
}

// ── WHATSAPP ORDER ──
function orderViaWhatsapp() {
  if (cartItems.length === 0) { showToast('Your cart is empty!'); return; }

  const total = getTotal();
  const date  = new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });

  // Build the message
  let msg = `🌿 *NEW ORDER — FARM-OTTAH*\n`;
  msg += `📅 ${date}\n\n`;
  msg += `🛒 *ORDER DETAILS:*\n`;
  msg += `─────────────────\n`;

  cartItems.forEach(item => {
    msg += `• *${item.name}* (${item.qty})\n`;
    msg += `  Qty: ${item.count}  →  ₦${(item.price * item.count).toLocaleString()}\n`;
  });

  msg += `─────────────────\n`;
  msg += `💰 *TOTAL: ₦${total.toLocaleString()}*\n\n`;
  msg += `📦 Please confirm availability and provide delivery details.\n`;
  msg += `Thank you! 🙏`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
}

// ── PAYSTACK ──
function initiatePaystack() {
  if (cartItems.length === 0) { showToast('Your cart is empty!'); return; }

  const total    = getTotal();
  const name     = document.getElementById('custName').value.trim();
  const email    = document.getElementById('custEmail').value.trim();
  const phone    = document.getElementById('custPhone').value.trim();
  const address  = document.getElementById('custAddress').value.trim();
  const formEl   = document.getElementById('customerForm');

  // Show the form if not visible
  if (!formEl.classList.contains('visible')) {
    formEl.classList.add('visible');
    showToast('Please fill in your details, then click Pay again.');
    return;
  }

  // Validate
  if (!name || !email || !phone || !address) {
    showToast('Please fill in all your details above.');
    document.getElementById('custName').focus();
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.');
    return;
  }

  const handler = PaystackPop.setup({
    key:      PAYSTACK_PUBLIC_KEY,
    email:    email,
    amount:   total * 100, // kobo
    currency: 'NGN',
    metadata: {
      custom_fields: [
        { display_name: 'Customer Name',    variable_name: 'customer_name',    value: name    },
        { display_name: 'Phone',            variable_name: 'phone',            value: phone   },
        { display_name: 'Delivery Address', variable_name: 'delivery_address', value: address },
        { display_name: 'Order Summary',    variable_name: 'order_summary',
          value: cartItems.map(i => `${i.name} (${i.qty}) x${i.count}`).join(', ') }
      ]
    },
    callback: function(response) {
      showToast('✅ Payment successful! Ref: ' + response.reference);
      // Auto-send a WhatsApp confirmation too
      sendPaymentConfirmationWA(response.reference, name, phone, address, total);
      clearCart();
      toggleCart();
    },
    onClose: function() {
      showToast('Payment window closed.');
    }
  });

  handler.openIframe();
}

// After successful payment, also ping WA with confirmation
function sendPaymentConfirmationWA(ref, name, phone, address, total) {
  const date = new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
  let msg  = `✅ *PAYMENT CONFIRMED — FARM-OTTAH*\n`;
  msg += `📅 ${date}\n\n`;
  msg += `👤 *${name}*\n`;
  msg += `📞 ${phone}\n`;
  msg += `📍 ${address}\n\n`;
  msg += `🛒 *ITEMS:*\n`;
  cartItems.forEach(item => {
    msg += `• ${item.name} (${item.qty}) ×${item.count} — ₦${(item.price * item.count).toLocaleString()}\n`;
  });
  msg += `\n💰 *TOTAL PAID: ₦${total.toLocaleString()}*\n`;
  msg += `🔖 *Paystack Ref:* ${ref}\n\n`;
  msg += `Please process this order for delivery. Thank you! 🙏`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
}

// ── CART DRAWER ──
function toggleCart() {
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  const isOpen  = drawer.classList.toggle('open');
  overlay.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

// ── MOBILE NAV ──
function toggleNav() {
  const nav = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger');
  const isOpen = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', isOpen);
  btn.classList.toggle('active', isOpen);
}

document.querySelectorAll('#navLinks a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('hamburger').classList.remove('active');
  });
});

// ── CATEGORY FILTER ──
function filterProducts(category) {
  const products = document.querySelectorAll('.product');
  const label    = document.getElementById('activeFilter');
  const noResults= document.getElementById('noResults');

  document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-filter="${category}"]`).classList.add('active');

  let visible = 0;
  products.forEach(p => {
    const match = category === 'all' || p.dataset.category === category;
    p.style.display = match ? 'block' : 'none';
    if (match) visible++;
  });

  label.textContent = category === 'all' ? '' : `Showing: ${category.charAt(0).toUpperCase() + category.slice(1)}`;
  noResults.style.display = visible === 0 ? 'block' : 'none';
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// ── SCROLL TO TOP ──
window.addEventListener('scroll', () => {
  document.getElementById('scrollTop').style.display = window.scrollY > 400 ? 'flex' : 'none';
});

// ── ACTIVE NAV ON SCROLL ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav ul a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
  navLinks.forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
});

// ── TOAST ──
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}