<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%  String ctx = request.getContextPath(); %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard — FORMA</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<%= ctx %>/css/main.css">
    <link rel="stylesheet" href="<%= ctx %>/css/admin.css">
</head>
<body class="admin-page">

<nav class="nav">
    <a href="<%= ctx %>/products" class="nav__brand">FORMA</a>
    <span class="nav__breadcrumb">Admin Dashboard</span>
    <a href="<%= ctx %>/logout" class="nav__link">Logout</a>
</nav>

<div class="admin-layout">

    <!-- Sidebar -->
    <aside class="admin-sidebar">
        <h3>Dashboard</h3>
        <nav class="admin-nav">
            <a href="#products" class="admin-nav__link admin-nav__link--active">Products</a>
            <a href="#add" class="admin-nav__link">Add Product</a>
        </nav>
        <div class="admin-stats">
            <div class="admin-stat">
                <span class="admin-stat__val">${products.size()}</span>
                <span class="admin-stat__label">Total Products</span>
            </div>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">

        <!-- Success / Error alerts -->
        <c:if test="${param.added != null}">
        <div class="alert alert--success">✓ Product #${param.added} added successfully!</div>
        </c:if>
        <c:if test="${error != null}">
        <div class="alert alert--error">${error}</div>
        </c:if>

        <!-- ── Product Table ────────────────────────────────────── -->
        <section id="products" class="admin-section">
            <h2>All Products</h2>
            <div class="admin-table-wrap">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Material</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <c:forEach var="p" items="${products}">
                        <tr>
                            <td>${p.id}</td>
                            <td><strong>${p.name}</strong></td>
                            <td>${p.categoryName}</td>
                            <td>$<fmt:formatNumber value="${p.price}" pattern="#,##0.00"/></td>
                            <td>${p.material}</td>
                            <td>
                                <span class="badge ${p.inStock ? 'badge--green' : 'badge--amber'}">
                                    ${p.inStock ? 'In Stock' : 'On Order'}
                                </span>
                            </td>
                            <td>
                                <a href="<%= ctx %>/product?id=${p.id}" class="btn btn--sm">View 3D</a>
                            </td>
                        </tr>
                        </c:forEach>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- ── Add Product Form ─────────────────────────────────── -->
        <section id="add" class="admin-section">
            <h2>Add New Product</h2>
            <form action="<%= ctx %>/admin/add" method="post" class="admin-form">
                <div class="admin-form__grid">
                    <div class="form-group">
                        <label>Product Name *</label>
                        <input type="text" name="name" required placeholder="e.g. Velvet Armchair">
                    </div>
                    <div class="form-group">
                        <label>Category ID *</label>
                        <select name="categoryId" required>
                            <option value="1">Sofas</option>
                            <option value="2">Chairs</option>
                            <option value="3">Tables</option>
                            <option value="4">Beds</option>
                            <option value="5">Shelves</option>
                            <option value="6">Lamps</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Price (USD) *</label>
                        <input type="number" name="price" step="0.01" min="0" required placeholder="999.00">
                    </div>
                    <div class="form-group">
                        <label>Material</label>
                        <input type="text" name="material" placeholder="e.g. Solid Oak, Linen">
                    </div>
                    <div class="form-group">
                        <label>Dimensions</label>
                        <input type="text" name="dimensions" placeholder="e.g. 80W x 85H x 90D cm">
                    </div>
                    <div class="form-group">
                        <label>Weight</label>
                        <input type="text" name="weight" placeholder="e.g. 18 kg">
                    </div>
                    <div class="form-group form-group--full">
                        <label>Description</label>
                        <textarea name="description" rows="3" placeholder="Product description…"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Color Options (JSON array)</label>
                        <input type="text" name="colorOptions" placeholder='["#FFFFFF","#2C2C2C"]'>
                    </div>
                    <div class="form-group">
                        <label>3D Model File</label>
                        <input type="text" name="modelFile" placeholder="models/my-model.glb">
                    </div>
                    <div class="form-group">
                        <label>Image URL</label>
                        <input type="text" name="imageUrl" placeholder="images/my-product.jpg">
                    </div>
                </div>
                <button type="submit" class="btn btn--primary btn--lg">Add Product</button>
            </form>
        </section>

    </main>
</div>

<script src="<%= ctx %>/js/main.js"></script>
</body>
</html>
