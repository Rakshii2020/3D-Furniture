/**
 * main.js — Shared application logic
 * =====================================
 * Handles: cart drawer, wishlist toggling, toast notifications,
 *          cart badge count, and common UI interactions.
 *
 * All API calls go to the Java Servlets via fetch().
 */

'use strict';

/* ── State ────────────────────────────────────────────────────── */
let cartItems = [];

/* ── Init ─────────────────────────────────────────────────────── */
function initApp() {
    if (window.APP?.loggedIn) {
        loadCart();
    }
    initAnimations();
}

/* ── CART ─────────────────────────────────────────────────────── */

/** Fetch cart from CartServlet GET /cart */
async function loadCart() {
    try {
        const res = await fetch(`${APP.ctx}/cart`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) return;
        cartItems = await res.json();
        renderCart();
    } catch (e) {
        console.warn('Could not load cart:', e);
    }
}

/** POST to CartServlet to add product */
async function addToCart(productId) {
    if (!APP.loggedIn) {
        showToast('Please sign in to add items to your cart.', 'info');
        setTimeout(() => { window.location.href = `${APP.ctx}/login`; }, 1200);
        return;
    }
    try {
        const res = await fetch(`${APP.ctx}/cart?productId=${productId}`, {
            method: 'POST'
        });
        if (res.ok) {
            showToast('Added to cart!', 'success');
            await loadCart();
        } else if (res.status === 401) {
            showToast('Please sign in first.', 'info');
        } else {
            showToast('Could not add to cart.', 'error');
        }
    } catch (e) {
        showToast('Network error.', 'error');
    }
}

/** DELETE to CartServlet to remove item */
async function removeFromCart(cartId) {
    try {
        const res = await fetch(`${APP.ctx}/cart?id=${cartId}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Removed from cart.', 'info');
            await loadCart();
        }
    } catch (e) {
        showToast('Network error.', 'error');
    }
}

/** Render cart items in the drawer */
function renderCart() {
    const container = document.getElementById('cartItems');
    const badgeEl   = document.getElementById('cartBadge');
    const totalEl   = document.getElementById('cartTotal');
    if (!container) return;

    // Update badge
    const totalQty = cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
    if (badgeEl) badgeEl.textContent = totalQty;

    if (!cartItems || cartItems.length === 0) {
        container.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
        if (totalEl) totalEl.textContent = '$0.00';
        return;
    }

    // Build HTML
    let html = '';
    let total = 0;

    cartItems.forEach(item => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;
        html += `
            <div class="cart-item">
                <div class="cart-item__thumb" style="--hue:${item.id * 37 % 360}">
                    <div style="width:100%;height:100%;background:linear-gradient(135deg,
                        hsl(${item.id * 37 % 360},40%,72%),
                        hsl(${(item.id * 37 + 30) % 360},45%,60%))"></div>
                </div>
                <div class="cart-item__info">
                    <div class="cart-item__name">${escHtml(item.name)}</div>
                    <div class="cart-item__price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item__qty">Qty: ${item.quantity || 1}</div>
                </div>
                <button class="cart-item__remove"
                        onclick="removeFromCart(${item.cartId})"
                        title="Remove">✕</button>
            </div>`;
    });

    container.innerHTML = html;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

/** Toggle cart drawer visibility */
function toggleCart() {
    const drawer  = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (!drawer) return;

    const isOpen = drawer.classList.contains('open');
    drawer.classList.toggle('open', !isOpen);
    overlay.classList.toggle('open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
}

/* ── WISHLIST ─────────────────────────────────────────────────── */

/** Track wishlist client-side (persisted via localStorage for demo) */
const wishlistKey = 'forma_wishlist';
function getWishlist() {
    try { return JSON.parse(localStorage.getItem(wishlistKey) || '[]'); }
    catch (e) { return []; }
}
function saveWishlist(list) {
    localStorage.setItem(wishlistKey, JSON.stringify(list));
}

function toggleWishlist(productId, btnEl) {
    if (!APP.loggedIn) {
        showToast('Sign in to save items to your wishlist.', 'info');
        return;
    }
    const list = getWishlist();
    const idx  = list.indexOf(productId);

    if (idx === -1) {
        list.push(productId);
        if (btnEl) { btnEl.textContent = '♥'; btnEl.classList.add('active'); }
        showToast('Added to wishlist!', 'success');
    } else {
        list.splice(idx, 1);
        if (btnEl) { btnEl.textContent = '♡'; btnEl.classList.remove('active'); }
        showToast('Removed from wishlist.', 'info');
    }
    saveWishlist(list);
}

/** Restore wishlist button states on page load */
function restoreWishlistState() {
    const list = getWishlist();
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const card = btn.closest('[data-id]');
        if (card && list.includes(parseInt(card.dataset.id))) {
            btn.textContent = '♥';
            btn.classList.add('active');
        }
    });
}

/* ── TOAST NOTIFICATIONS ─────────────────────────────────────── */

let toastTimeout;

function showToast(message, type = 'info') {
    // Remove existing toast
    const existing = document.getElementById('toastEl');
    if (existing) existing.remove();
    clearTimeout(toastTimeout);

    const colors = {
        success: '#4A7C59',
        error:   '#C1392B',
        info:    '#4A6B8A',
        warning: '#C49A3C'
    };

    const toast = document.createElement('div');
    toast.id = 'toastEl';
    toast.style.cssText = `
        position: fixed;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 24px;
        border-radius: 100px;
        font-size: 0.85rem;
        font-family: 'DM Sans', sans-serif;
        box-shadow: 0 8px 24px rgba(0,0,0,.25);
        z-index: 9999;
        transition: all 0.3s cubic-bezier(.4,0,.2,1);
        white-space: nowrap;
        pointer-events: none;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.opacity = '1';
    });

    toastTimeout = setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(10px)';
        toast.style.opacity   = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

/* ── PAGE ANIMATIONS ─────────────────────────────────────────── */

function initAnimations() {
    // Stagger product card entrance
    const cards = document.querySelectorAll('.product-card');
    if (cards.length && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity    = '1';
                        entry.target.style.transform  = 'translateY(0)';
                    }, i * 60);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05 });

        cards.forEach(card => {
            card.style.opacity   = '0';
            card.style.transform = 'translateY(24px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.28s, filter 0.28s';
            obs.observe(card);
        });
    }

    restoreWishlistState();
}

/* ── UTILITY ─────────────────────────────────────────────────── */

function escHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
