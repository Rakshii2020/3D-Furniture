package com.furniture.servlet;

import com.furniture.db.ProductDAO;
import com.furniture.model.Product;
import com.furniture.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

/**
 * AdminServlet — Admin Dashboard at /admin
 * ------------------------------------------
 * Only accessible to users with role="admin".
 * Non-admins are redirected to /products.
 *
 * GET  /admin          → show all products + add-product form
 * POST /admin/add      → insert new product into database
 */
@WebServlet({"/admin", "/admin/add"})
public class AdminServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private final ProductDAO dao = new ProductDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        if (!isAdmin(req, resp)) return;

        try {
            List<Product> products = dao.getAllProducts();
            req.setAttribute("products", products);
            req.getRequestDispatcher("/WEB-INF/views/admin.jsp").forward(req, resp);
        } catch (SQLException e) {
            getServletContext().log("AdminServlet GET error", e);
            resp.sendError(500, "Database error");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        if (!isAdmin(req, resp)) return;

        // Build product from form parameters
        Product p = new Product();
        p.setName       (req.getParameter("name"));
        p.setCategoryId (parseInt(req.getParameter("categoryId"), 1));
        p.setPrice      (parseDouble(req.getParameter("price"), 0));
        p.setDescription(req.getParameter("description"));
        p.setMaterial   (req.getParameter("material"));
        p.setDimensions (req.getParameter("dimensions"));
        p.setWeight     (req.getParameter("weight"));
        p.setColorOptions(req.getParameter("colorOptions"));
        p.setModelFile  (req.getParameter("modelFile"));
        p.setImageUrl   (req.getParameter("imageUrl"));

        try {
            int newId = dao.insertProduct(p);
            resp.sendRedirect(req.getContextPath() + "/admin?added=" + newId);
        } catch (SQLException e) {
            getServletContext().log("AdminServlet POST error", e);
            req.setAttribute("error", "Could not add product: " + e.getMessage());
            req.getRequestDispatcher("/WEB-INF/views/admin.jsp").forward(req, resp);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private boolean isAdmin(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("loggedUser") instanceof User) {
            User u = (User) session.getAttribute("loggedUser");
            if (u.isAdmin()) return true;
        }
        resp.sendRedirect(req.getContextPath() + "/products");
        return false;
    }

    private int parseInt(String s, int def) {
        try { return Integer.parseInt(s); } catch (Exception e) { return def; }
    }

    private double parseDouble(String s, double def) {
        try { return Double.parseDouble(s); } catch (Exception e) { return def; }
    }
}
