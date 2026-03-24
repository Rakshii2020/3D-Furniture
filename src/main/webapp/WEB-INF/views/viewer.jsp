<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
    com.furniture.model.User loggedUser =
        (session != null) ? (com.furniture.model.User) session.getAttribute("loggedUser") : null;
    request.setAttribute("loggedUser", loggedUser);
    String ctx = request.getContextPath();
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.name} — FORMA</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<%= ctx %>/css/main.css">
    <link rel="stylesheet" href="<%= ctx %>/css/viewer.css">
</head>
<body class="viewer-page">

<!-- ═══════════════════════════ NAV ═══════════════════════════ -->
<nav class="nav nav--transparent">
    <a href="<%= ctx %>/products" class="nav__brand">FORMA</a>
    <div class="nav__breadcrumb">
        <a href="<%= ctx %>/products">Collection</a>
        <span> / </span>
        <span>${product.categoryName}</span>
        <span> / </span>
        <span>${product.name}</span>
    </div>
    <div class="nav__actions">
        <c:if test="${loggedUser != null}">
            <button class="nav__cart-btn" onclick="toggleCart()">
                Cart <span class="cart-badge" id="cartBadge">0</span>
            </button>
            <a href="<%= ctx %>/logout" class="nav__link">Logout</a>
        </c:if>
        <c:if test="${loggedUser == null}">
            <a href="<%= ctx %>/login" class="nav__link nav__link--cta">Sign In</a>
        </c:if>
    </div>
</nav>

<!-- ═══════════════════════════ VIEWER LAYOUT ═══════════════════════════ -->
<div class="viewer-layout">

    <!-- ── 3D Canvas Panel ─────────────────────────────────────────── -->
    <div class="viewer-canvas-panel">

        <!-- Loading Spinner (shown while model loads) -->
        <div class="viewer-loader" id="viewerLoader">
            <div class="viewer-loader__ring"></div>
            <p class="viewer-loader__text">Loading 3D Model…</p>
            <div class="viewer-loader__progress">
                <div class="viewer-loader__bar" id="loaderBar"></div>
            </div>
        </div>

        <!-- The Three.js canvas renders here -->
        <canvas id="threejsCanvas"></canvas>

        <!-- Controls hint overlay -->
        <div class="viewer-hints" id="viewerHints">
            <span>🖱 Drag to rotate</span>
            <span>🖱 Scroll to zoom</span>
            <span>🖱 Right-drag to pan</span>
        </div>

        <!-- Viewer toolbar -->
        <div class="viewer-toolbar">
            <button class="toolbar-btn" onclick="viewer.resetCamera()" title="Reset View">⟳</button>
            <button class="toolbar-btn" onclick="viewer.toggleAutoRotate()" id="autoRotateBtn" title="Auto Rotate">▷</button>
            <button class="toolbar-btn" onclick="viewer.toggleWireframe()" title="Wireframe">⬡</button>
            <button class="toolbar-btn" onclick="viewer.screenshot()" title="Screenshot">📷</button>
        </div>
    </div>

    <!-- ── Product Details Panel ──────────────────────────────────── -->
    <aside class="viewer-details-panel">

        <div class="viewer-details-panel__inner">
            <!-- Header -->
            <div class="vd-header">
                <span class="vd-category">${product.categoryName}</span>
                <h1 class="vd-title">${product.name}</h1>
                <div class="vd-rating">
                    <span class="stars">★★★★★</span>
                    <span>${product.rating}</span>
                    <span class="vd-reviews">(${product.reviewCount} reviews)</span>
                </div>
                <div class="vd-price">
                    $<fmt:formatNumber value="${product.price}" pattern="#,##0.00"/>
                </div>
            </div>

            <!-- Description -->
            <div class="vd-section">
                <h3 class="vd-section__title">About</h3>
                <p class="vd-description">${product.description}</p>
            </div>

            <!-- Specs -->
            <div class="vd-section">
                <h3 class="vd-section__title">Specifications</h3>
                <dl class="vd-specs">
                    <div class="vd-spec-row">
                        <dt>Dimensions</dt>
                        <dd>${product.dimensions}</dd>
                    </div>
                    <div class="vd-spec-row">
                        <dt>Material</dt>
                        <dd>${product.material}</dd>
                    </div>
                    <div class="vd-spec-row">
                        <dt>Weight</dt>
                        <dd>${product.weight}</dd>
                    </div>
                    <div class="vd-spec-row">
                        <dt>Availability</dt>
                        <dd class="${product.inStock ? 'text-green' : 'text-amber'}">
                            ${product.inStock ? '✓ In Stock' : '⏳ Made to Order (6–8 weeks)'}
                        </dd>
                    </div>
                </dl>
            </div>

            <!-- Color Customization -->
            <div class="vd-section">
                <h3 class="vd-section__title">Colour / Finish</h3>
                <div class="color-swatches" id="colorSwatches">
                    <!-- Populated by viewer.js using product.colorOptions JSON -->
                </div>
                <p class="vd-color-name" id="colorName">Original</p>
            </div>

            <!-- CTAs -->
            <div class="vd-ctas">
                <button class="btn btn--primary btn--full btn--lg"
                        onclick="addToCart(${product.id})">
                    Add to Cart — $<fmt:formatNumber value="${product.price}" pattern="#,##0.00"/>
                </button>
                <button class="btn btn--ghost btn--full"
                        onclick="toggleWishlist(${product.id}, this)">
                    ♡ &nbsp;Add to Wishlist
                </button>
            </div>

            <!-- Shipping info -->
            <div class="vd-shipping">
                <div class="vd-shipping__item">🚚 Free delivery on orders over $500</div>
                <div class="vd-shipping__item">↩ 30-day returns</div>
                <div class="vd-shipping__item">🛡 5-year warranty</div>
            </div>
        </div>

    </aside>
</div>

<!-- ═══════════════════════════ CART DRAWER ═══════════════════════════ -->
<div class="cart-overlay" id="cartOverlay" onclick="toggleCart()"></div>
<aside class="cart-drawer" id="cartDrawer">
    <div class="cart-drawer__header">
        <h3>Your Cart</h3>
        <button onclick="toggleCart()" class="cart-drawer__close">✕</button>
    </div>
    <div class="cart-drawer__items" id="cartItems">
        <p class="cart-empty">Your cart is empty.</p>
    </div>
    <div class="cart-drawer__footer">
        <div class="cart-total">Total: <strong id="cartTotal">$0.00</strong></div>
        <button class="btn btn--primary btn--full">Checkout</button>
    </div>
</aside>

<!-- Pass product data to JavaScript -->
<script>
window.APP = {
    ctx: '<%= ctx %>',
    loggedIn: ${loggedUser != null},
    product: {
        id:           ${product.id},
        name:         '${product.name}',
        modelFile:    '${product.modelFile}',
        colorOptions: ${product.colorOptions != null ? product.colorOptions : '["#C4A882","#2C2C2C","#FFFFFF"]'}
    }
};
</script>

<!-- Three.js from CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- Application scripts -->
<script src="<%= ctx %>/js/main.js"></script>
<script src="<%= ctx %>/js/viewer.js"></script>
<script>
    initApp();
    // viewer.js auto-initialises using window.APP.product
</script>
</body>
</html>
