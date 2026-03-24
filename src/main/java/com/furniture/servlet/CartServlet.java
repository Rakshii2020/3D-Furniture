package com.furniture.servlet;

import com.furniture.db.DBConnection;
import com.furniture.model.User;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.sql.*;
import java.util.*;

/**
 * CartServlet — Handles /cart
 * ----------------------------
 * Supports:
 *   GET  /cart          → returns JSON list of cart items for the logged-in user
 *   POST /cart          → adds a product (productId in body)
 *   DELETE /cart?id=X   → removes a cart item
 *
 * All responses are JSON so the frontend can update the cart badge dynamically.
 * Session check: if not logged in, returns 401 Unauthorized.
 */
@WebServlet("/cart")
public class CartServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private final Gson gson = new Gson();

    // ── GET: return current cart ──────────────────────────────────────────
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        User user = getLoggedUser(req, resp);
        if (user == null) return;

        String sql =
            "SELECT c.id AS cart_id, p.id, p.name, p.price, p.image_url, c.quantity " +
            "FROM cart c JOIN products p ON c.product_id = p.id " +
            "WHERE c.user_id = ?";

        List<Map<String, Object>> items = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, user.getId());
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("cartId",   rs.getInt("cart_id"));
                    item.put("id",       rs.getInt("id"));
                    item.put("name",     rs.getString("name"));
                    item.put("price",    rs.getDouble("price"));
                    item.put("imageUrl", rs.getString("image_url"));
                    item.put("quantity", rs.getInt("quantity"));
                    items.add(item);
                }
            }
            jsonResponse(resp, 200, items);

        } catch (SQLException e) {
            getServletContext().log("CartServlet GET error", e);
            jsonError(resp, 500, "Database error");
        }
    }

    // ── POST: add item to cart ────────────────────────────────────────────
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        User user = getLoggedUser(req, resp);
        if (user == null) return;

        String productIdParam = req.getParameter("productId");
        if (productIdParam == null) { jsonError(resp, 400, "productId required"); return; }

        int productId;
        try { productId = Integer.parseInt(productIdParam); }
        catch (NumberFormatException e) { jsonError(resp, 400, "Invalid productId"); return; }

        // If already in cart → increment quantity; else insert
        String checkSql = "SELECT id, quantity FROM cart WHERE user_id=? AND product_id=?";
        String updateSql = "UPDATE cart SET quantity = quantity + 1 WHERE id=?";
        String insertSql = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?,?,1)";

        try (Connection conn = DBConnection.getConnection()) {
            try (PreparedStatement ps = conn.prepareStatement(checkSql)) {
                ps.setInt(1, user.getId());
                ps.setInt(2, productId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        // Increment existing
                        try (PreparedStatement upd = conn.prepareStatement(updateSql)) {
                            upd.setInt(1, rs.getInt("id"));
                            upd.executeUpdate();
                        }
                    } else {
                        // Insert new row
                        try (PreparedStatement ins = conn.prepareStatement(insertSql)) {
                            ins.setInt(1, user.getId());
                            ins.setInt(2, productId);
                            ins.executeUpdate();
                        }
                    }
                }
            }
            jsonResponse(resp, 200, Map.of("message", "Added to cart"));

        } catch (SQLException e) {
            getServletContext().log("CartServlet POST error", e);
            jsonError(resp, 500, "Database error");
        }
    }

    // ── DELETE: remove item from cart ─────────────────────────────────────
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        User user = getLoggedUser(req, resp);
        if (user == null) return;

        String idParam = req.getParameter("id");
        if (idParam == null) { jsonError(resp, 400, "id required"); return; }

        String sql = "DELETE FROM cart WHERE id=? AND user_id=?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, Integer.parseInt(idParam));
            ps.setInt(2, user.getId());
            int rows = ps.executeUpdate();
            jsonResponse(resp, 200, Map.of("deleted", rows > 0));

        } catch (Exception e) {
            getServletContext().log("CartServlet DELETE error", e);
            jsonError(resp, 500, "Database error");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private User getLoggedUser(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("loggedUser") == null) {
            jsonError(resp, 401, "Not logged in");
            return null;
        }
        return (User) session.getAttribute("loggedUser");
    }

    private void jsonResponse(HttpServletResponse resp, int status, Object data)
            throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write(gson.toJson(data));
    }

    private void jsonError(HttpServletResponse resp, int status, String message)
            throws IOException {
        jsonResponse(resp, status, Map.of("error", message));
    }
}
