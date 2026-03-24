<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%  String ctx = request.getContextPath(); %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In — FORMA</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<%= ctx %>/css/main.css">
</head>
<body class="auth-page">

<div class="auth-layout">
    <!-- Visual side -->
    <div class="auth-visual">
        <div class="auth-visual__orbs">
            <div class="hero__orb hero__orb--1"></div>
            <div class="hero__orb hero__orb--2"></div>
        </div>
        <div class="auth-visual__content">
            <h1 class="auth-visual__brand">FORMA</h1>
            <p class="auth-visual__tagline">Luxury furniture,<br>crafted for modern living.</p>
        </div>
    </div>

    <!-- Form side -->
    <div class="auth-form-side">
        <div class="auth-form-wrap">
            <h2 class="auth-title">Welcome back</h2>
            <p class="auth-sub">Sign in to access your cart, wishlist and order history.</p>

            <c:if test="${error != null}">
            <div class="alert alert--error">${error}</div>
            </c:if>

            <form action="<%= ctx %>/login" method="post" class="auth-form">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username"
                           placeholder="Enter username" required autocomplete="username">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password"
                           placeholder="Enter password" required autocomplete="current-password">
                </div>
                <button type="submit" class="btn btn--primary btn--full btn--lg">
                    Sign In
                </button>
            </form>

            <div class="auth-demo-hint">
                <strong>Demo credentials:</strong><br>
                Admin: <code>admin</code> / <code>admin123</code><br>
                User: <code>demo</code> / <code>demo123</code>
            </div>

            <p class="auth-footer-link">
                <a href="<%= ctx %>/products">← Continue browsing without an account</a>
            </p>
        </div>
    </div>
</div>

</body>
</html>
