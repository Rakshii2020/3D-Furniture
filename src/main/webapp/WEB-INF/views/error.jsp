<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<%  String ctx = request.getContextPath(); %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Error — FORMA</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400&family=DM+Sans:wght@400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<%= ctx %>/css/main.css">
    <style>
        .error-page { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:80vh; gap:20px; text-align:center; padding:40px; }
        .error-code { font-family:var(--font-display); font-size:8rem; color:var(--clr-border); line-height:1; }
        .error-title { font-family:var(--font-display); font-size:2rem; }
        .error-msg { color:var(--clr-text-muted); max-width:480px; line-height:1.6; }
    </style>
</head>
<body>
<nav class="nav">
    <a href="<%= ctx %>/products" class="nav__brand">FORMA</a>
</nav>
<div class="error-page">
    <div class="error-code"><%= response.getStatus() %></div>
    <h1 class="error-title">Something went wrong</h1>
    <p class="error-msg">
        <% if (response.getStatus() == 404) { %>
            The page you're looking for doesn't exist or has been moved.
        <% } else { %>
            An unexpected error occurred. Please try again in a moment.
        <% } %>
    </p>
    <a href="<%= ctx %>/products" class="btn btn--primary">← Back to Collection</a>
</div>
</body>
</html>
