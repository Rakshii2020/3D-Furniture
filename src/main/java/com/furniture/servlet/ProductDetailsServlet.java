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

/**
 * ProductDetailsServlet — handles GET /product
 * -----------------------------------------------
 * Fetches a single product by its `id` query parameter and returns:
 *   - JSON  if the client sends Accept: application/json or ?format=json
 *   - JSP page (viewer.jsp) otherwise
 *
 * URL example: /product?id=3
 *
 * How it works:
 *   1. Parse & validate the `id` parameter.
 *   2. Call ProductDAO.getProductById(id).
 *   3. If not found → 404.
 *   4. If found → either JSON or forward to viewer.jsp.
 */
@WebServlet("/product")
public class ProductDetailsServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final Gson       gson = new Gson();
    private final ProductDAO dao  = new ProductDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        // ── 1. Parse the id parameter ─────────────────────────────────────
        String idParam = req.getParameter("id");
        int productId;

        if (idParam == null || idParam.trim().isEmpty()) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST,
                           "Missing required parameter: id");
            return;
        }

        try {
            productId = Integer.parseInt(idParam.trim());
            if (productId <= 0) throw new NumberFormatException("non-positive");
        } catch (NumberFormatException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST,
                           "Invalid id parameter: must be a positive integer.");
            return;
        }

        // ── 2. Fetch from database ────────────────────────────────────────
        Product product;
        try {
            product = dao.getProductById(productId);
        } catch (SQLException e) {
            getServletContext().log("ProductDetailsServlet DB error", e);
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                           "Database error, please try again later.");
            return;
        }

        // ── 3. Not found? ─────────────────────────────────────────────────
        if (product == null) {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND,
                           "No product found with id=" + productId);
            return;
        }

        // ── 4. Respond ────────────────────────────────────────────────────
        String format = req.getParameter("format");
        boolean wantsJson = "json".equalsIgnoreCase(format)
                || "application/json".equals(req.getHeader("Accept"));

        if (wantsJson) {
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write(gson.toJson(product));

        } else {
            req.setAttribute("product", product);
            req.getRequestDispatcher("/WEB-INF/views/viewer.jsp")
               .forward(req, resp);
        }
    }
}
