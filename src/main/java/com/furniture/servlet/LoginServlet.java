package com.furniture.servlet;

import com.furniture.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.security.MessageDigest;
import java.sql.*;

import com.furniture.db.DBConnection;

/**
 * LoginServlet — Session-Based Authentication
 * ---------------------------------------------
 * Handles both the login form (GET) and form submission (POST).
 *
 * Session tracking explained:
 *   - After successful login, a User object is placed in the HTTP session.
 *   - The session ID is stored in a browser cookie (JSESSIONID).
 *   - Subsequent requests to protected pages check for req.getSession()
 *     attribute "loggedUser" — if absent, redirect to /login.
 *
 * Security notes (for production):
 *   - Use BCrypt, not SHA-256, for password hashing.
 *   - Regenerate session ID after login to prevent session fixation.
 *   - Set secure, httpOnly cookie flags.
 */
@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    /** Show the login page */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // If already logged in → redirect to home
        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("loggedUser") != null) {
            resp.sendRedirect(req.getContextPath() + "/products");
            return;
        }
        req.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(req, resp);
    }

    /** Process the login form submission */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        String username = req.getParameter("username");
        String password = req.getParameter("password");

        // Basic validation
        if (username == null || password == null ||
            username.trim().isEmpty() || password.trim().isEmpty()) {
            req.setAttribute("error", "Username and password are required.");
            req.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(req, resp);
            return;
        }

        // Hash the submitted password (SHA-256 — simple demo; use BCrypt in production)
        String hashedPassword = sha256(password.trim());

        // Query the database
        String sql = "SELECT id, username, email, role FROM users " +
                     "WHERE username = ? AND password = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username.trim());
            ps.setString(2, hashedPassword);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    // ── Successful login ──────────────────────────────────
                    User user = new User(
                        rs.getInt("id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("role")
                    );

                    // Invalidate old session → create new one (prevents session fixation)
                    req.getSession(false);
                    HttpSession newSession = req.getSession(true);
                    newSession.setAttribute("loggedUser", user);
                    newSession.setMaxInactiveInterval(60 * 60); // 1 hour

                    resp.sendRedirect(req.getContextPath() + "/products");

                } else {
                    // ── Login failed ──────────────────────────────────────
                    req.setAttribute("error", "Invalid username or password.");
                    req.getRequestDispatcher("/WEB-INF/views/login.jsp")
                       .forward(req, resp);
                }
            }

        } catch (SQLException e) {
            getServletContext().log("LoginServlet DB error", e);
            req.setAttribute("error", "Server error. Please try again.");
            req.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(req, resp);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    /** SHA-256 hash helper.  Replace with BCrypt in production! */
    private String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
