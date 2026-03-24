<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
    // Check if user is logged in (for nav display)
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
    <title>FORMA — Luxury Furniture</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<%= ctx %>/css/main.css">
</head>
<body>

<!-- ═══════════════════════════ NAV ═══════════════════════════ -->
<nav class="nav">
    <a href="<%= ctx %>/products" class="nav__brand">FORMA</a>
    <div class="nav__search">
        <form action="<%= ctx %>/products" method="get">
            <input type="text" name="search" placeholder="Search furniture…"
                   value="${searchQuery}" class="nav__search-input">
            <button type="submit" class="nav__search-btn">→</button>
        </form>
    </div>
    <div class="nav__actions">
        <c:choose>
            <c:when test="${loggedUser != null}">
                <span class="nav__user">Hello, ${loggedUser.username}</span>
                <c:if test="${loggedUser.admin}">
                    <a href="<%= ctx %>/admin" class="nav__link">Admin</a>
                </c:if>
                <button class="nav__cart-btn" onclick="toggleCart()">
                    Cart <span class="cart-badge" id="cartBadge">0</span>
                </button>
                <a href="<%= ctx %>/logout" class="nav__link">Logout</a>
            </c:when>
            <c:otherwise>
                <a href="<%= ctx %>/login" class="nav__link nav__link--cta">Sign In</a>
            </c:otherwise>
        </c:choose>
    </div>
</nav>

<!-- ═══════════════════════════ HERO ═══════════════════════════ -->
<header class="hero">
    <div class="hero__content">
        <p class="hero__eyebrow">Curated Living</p>
        <h1 class="hero__title">Where Design<br><em>Meets Home</em></h1>
        <p class="hero__sub">Explore our collection in interactive 360° 3D</p>
    </div>
    <div class="hero__visual">
        <div class="hero__orb hero__orb--1"></div>
        <div class="hero__orb hero__orb--2"></div>
        <div class="hero__orb hero__orb--3"></div>
    </div>
</header>

<!-- ═══════════════════════════ FILTERS ═══════════════════════════ -->
<section class="filters">
    <div class="filters__inner">
        <a href="<%= ctx %>/products" class="filter-pill ${selectedCategory == null ? 'filter-pill--active' : ''}">All</a>
        <a href="<%= ctx %>/products?category=Sofas"  class="filter-pill ${'Sofas'.equals(selectedCategory)  ? 'filter-pill--active' : ''}">🛋 Sofas</a>
        <a href="<%= ctx %>/products?category=Chairs" class="filter-pill ${'Chairs'.equals(selectedCategory) ? 'filter-pill--active' : ''}">🪑 Chairs</a>
        <a href="<%= ctx %>/products?category=Tables" class="filter-pill ${'Tables'.equals(selectedCategory) ? 'filter-pill--active' : ''}">🪵 Tables</a>
        <a href="<%= ctx %>/products?category=Beds"   class="filter-pill ${'Beds'.equals(selectedCategory)   ? 'filter-pill--active' : ''}">🛏 Beds</a>
        <a href="<%= ctx %>/products?category=Shelves"class="filter-pill ${'Shelves'.equals(selectedCategory)? 'filter-pill--active' : ''}">📚 Shelves</a>
        <a href="<%= ctx %>/products?category=Lamps"  class="filter-pill ${'Lamps'.equals(selectedCategory)  ? 'filter-pill--active' : ''}">💡 Lamps</a>
    </div>
</section>

<!-- ═══════════════════════════ PRODUCT GRID ═══════════════════════════ -->
<main class="products">
    <div class="products__header">
        <h2 class="products__title">
            <c:choose>
                <c:when test="${searchQuery != null and not empty searchQuery}">
                    Results for "<em>${searchQuery}</em>"
                </c:when>
                <c:when test="${selectedCategory != null}">
                    ${selectedCategory}
                </c:when>
                <c:otherwise>Our Collection</c:otherwise>
            </c:choose>
        </h2>
        <span class="products__count">${products.size()} pieces</span>
    </div>

    <div class="product-grid">
        <c:forEach var="p" items="${products}">
        <article class="product-card" data-id="${p.id}">
            <div class="product-card__image-wrap">
                <!-- Fallback gradient canvas if no image available -->
                <div class="product-card__img-placeholder"
                     style="--hue:${p.id * 37 % 360}"></div>
                <div class="product-card__badge">
                    <c:choose>
                        <c:when test="${p.inStock}">In Stock</c:when>
                        <c:otherwise>Made to Order</c:otherwise>
                    </c:choose>
                </div>
                <div class="product-card__actions">
                    <button class="card-action-btn wishlist-btn"
                            onclick="toggleWishlist(${p.id}, this)"
                            title="Add to Wishlist">♡</button>
                </div>
            </div>
            <div class="product-card__info">
                <span class="product-card__category">${p.categoryName}</span>
                <h3 class="product-card__name">${p.name}</h3>
                <p class="product-card__material">${p.material}</p>
                <div class="product-card__footer">
                    <div class="product-card__price-block">
                        <span class="product-card__price">
                            $<fmt:formatNumber value="${p.price}" pattern="#,##0.00"/>
                        </span>
                        <div class="product-card__rating">
                            <span class="stars">★★★★★</span>
                            <span class="rating-val">${p.rating}</span>
                            <span class="rating-count">(${p.reviewCount})</span>
                        </div>
                    </div>
                    <div class="product-card__ctas">
                        <a href="<%= ctx %>/product?id=${p.id}"
                           class="btn btn--primary">View in 3D</a>
                        <button class="btn btn--ghost"
                                onclick="addToCart(${p.id})">+ Cart</button>
                    </div>
                </div>
            </div>
        </article>
        </c:forEach>

        <c:if test="${empty products}">
        <div class="products__empty">
            <p>No furniture found.</p>
            <a href="<%= ctx %>/products" class="btn btn--primary">Browse all</a>
        </div>
        </c:if>
    </div>
</main>

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
        <div class="cart-total">
            Total: <strong id="cartTotal">$0.00</strong>
        </div>
        <button class="btn btn--primary btn--full">Checkout</button>
    </div>
</aside>

<!-- ═══════════════════════════ FOOTER ═══════════════════════════ -->
<footer class="footer">
    <div class="footer__inner">
        <div class="footer__brand">
            <span class="footer__logo">FORMA</span>
            <p>Luxury furniture, crafted for modern living.</p>
        </div>
        <div class="footer__links">
            <h4>Collection</h4>
            <a href="<%= ctx %>/products?category=Sofas">Sofas</a>
            <a href="<%= ctx %>/products?category=Chairs">Chairs</a>
            <a href="<%= ctx %>/products?category=Tables">Tables</a>
        </div>
        <div class="footer__links">
            <h4>Support</h4>
            <a href="#">Delivery</a>
            <a href="#">Returns</a>
            <a href="#">Contact</a>
        </div>
    </div>
    <div class="footer__bottom">
        <p>© 2024 FORMA Furniture. All rights reserved.</p>
    </div>
</footer>

<script src="<%= ctx %>/js/main.js"></script>
<script>
    // Pass server-side login state to JS
    window.APP = {
        ctx: '<%= ctx %>',
        loggedIn: ${loggedUser != null}
    };
    initApp();
</script>
</body>
</html>
