package com.furniture.servlet;

import com.furniture.db.ProductDAO;
import com.furniture.model.Product;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

/**
 * ProductServlet — handles GET /products
 * ----------------------------------------
 * How Servlets work:
 *   1. Tomcat maps the URL "/products" to this class via @WebServlet.
 *   2. Each HTTP GET request calls doGet().
 *   3. doGet() reads optional query parameters (category, search).
 *   4. It delegates to ProductDAO for database access.
 *   5. It either:
 *      a) serialises the result to JSON (for AJAX/API calls), or
 *      b) forwards to index.jsp (for full page renders).
 *
 * The Accept header distinguishes API vs page requests:
 *   - "application/json" → return JSON
 *   - anything else      → forward to JSP
 */
@WebServlet("/products")
public class ProductServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    // Gson converts Java objects ↔ JSON strings
    private final Gson gson = new Gson();
    private final ProductDAO dao = new ProductDAO();

    /**
     * Handles HTTP GET /products
     *
     * Query parameters:
     *   ?category=Sofas     → filter by category
     *   ?search=oak         → keyword search
     *   ?format=json        → always return JSON (overrides Accept header)
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        String category = req.getParameter("category");  // nullable
        String search   = req.getParameter("search");    // nullable
        String format   = req.getParameter("format");    // "json" | null

        List<Product> products;

        try {
            // ── Choose the right DAO query ────────────────────────────────
            if (search != null && !search.trim().isEmpty()) {
                products = dao.searchProducts(search.trim());
            } else if (category != null && !category.trim().isEmpty()) {
                products = dao.getProductsByCategory(category.trim());
            } else {
                products = dao.getAllProducts();
            }
        } catch (SQLException e) {
            // Log the real error server-side, send a safe message to client
            getServletContext().log("ProductServlet DB error", e);
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                           "Database error, please try again later.");
            return;
        }

        // ── Decide response format ────────────────────────────────────────
        boolean wantsJson = "json".equalsIgnoreCase(format)
                || "application/json".equals(req.getHeader("Accept"));

        if (wantsJson) {
            // ── JSON response (for AJAX calls from the frontend) ──────────
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write(gson.toJson(products));

        } else {
            // ── JSP forward (classic server-side rendering) ───────────────
            // Place the list in request scope so JSP EL can read ${products}
            req.setAttribute("products", products);
            req.setAttribute("selectedCategory", category);
            req.setAttribute("searchQuery", search);

            // RequestDispatcher forwards internally — the URL stays /products
            req.getRequestDispatcher("/WEB-INF/views/index.jsp")
               .forward(req, resp);
        }
    }
}
