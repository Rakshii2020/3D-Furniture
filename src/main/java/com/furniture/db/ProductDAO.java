package com.furniture.db;

import com.furniture.model.Product;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * ProductDAO — Data Access Object
 * ---------------------------------
 * All SQL queries for the products table live here.
 * Servlets call DAO methods and receive domain objects (Product) back.
 * This separates business/presentation logic from database logic (MVC).
 *
 * Every method uses try-with-resources to guarantee that Connection,
 * PreparedStatement, and ResultSet are closed even if an exception occurs.
 */
public class ProductDAO {

    // ── Column name constants prevent typos ───────────────────────────────
    private static final String COL_ID           = "id";
    private static final String COL_NAME         = "name";
    private static final String COL_PRICE        = "price";
    private static final String COL_DESCRIPTION  = "description";
    private static final String COL_MATERIAL     = "material";
    private static final String COL_DIMENSIONS   = "dimensions";
    private static final String COL_WEIGHT       = "weight";
    private static final String COL_COLOR_OPT    = "color_options";
    private static final String COL_MODEL_FILE   = "model_file";
    private static final String COL_IMAGE_URL    = "image_url";
    private static final String COL_IN_STOCK     = "in_stock";
    private static final String COL_RATING       = "rating";
    private static final String COL_REVIEW_COUNT = "review_count";
    private static final String COL_CAT_NAME     = "category_name";

    // ── SQL Queries ───────────────────────────────────────────────────────

    /** Fetch all products with their category name */
    private static final String SQL_ALL =
        "SELECT p.*, c.name AS category_name " +
        "FROM products p " +
        "LEFT JOIN categories c ON p.category_id = c.id " +
        "ORDER BY p.id ASC";

    /** Fetch one product by primary key */
    private static final String SQL_BY_ID =
        "SELECT p.*, c.name AS category_name " +
        "FROM products p " +
        "LEFT JOIN categories c ON p.category_id = c.id " +
        "WHERE p.id = ?";

    /** Fetch products filtered by category */
    private static final String SQL_BY_CATEGORY =
        "SELECT p.*, c.name AS category_name " +
        "FROM products p " +
        "LEFT JOIN categories c ON p.category_id = c.id " +
        "WHERE c.name = ? " +
        "ORDER BY p.id ASC";

    /** Full-text style search by name or description */
    private static final String SQL_SEARCH =
        "SELECT p.*, c.name AS category_name " +
        "FROM products p " +
        "LEFT JOIN categories c ON p.category_id = c.id " +
        "WHERE p.name LIKE ? OR p.description LIKE ? OR p.material LIKE ? " +
        "ORDER BY p.id ASC";

    /** Insert a new product */
    private static final String SQL_INSERT =
        "INSERT INTO products " +
        "(name, category_id, price, description, material, dimensions, weight, " +
        " color_options, model_file, image_url) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    // ── Public Methods ────────────────────────────────────────────────────

    /**
     * Returns every product in the catalogue.
     * Used by ProductServlet → home page.
     */
    public List<Product> getAllProducts() throws SQLException {
        List<Product> products = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_ALL);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                products.add(mapRow(rs));
            }
        }
        return products;
    }

    /**
     * Returns a single product by its ID.
     * Used by ProductDetailsServlet → detail/viewer page.
     *
     * @param id  the product primary key
     * @return    Product, or null if not found
     */
    public Product getProductById(int id) throws SQLException {
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_BY_ID)) {

            ps.setInt(1, id);                       // bind the ? parameter

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);              // found — map and return
                }
            }
        }
        return null;                                // not found
    }

    /**
     * Returns products belonging to a category.
     *
     * @param categoryName  e.g. "Sofas"
     */
    public List<Product> getProductsByCategory(String categoryName) throws SQLException {
        List<Product> products = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_BY_CATEGORY)) {

            ps.setString(1, categoryName);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    products.add(mapRow(rs));
                }
            }
        }
        return products;
    }

    /**
     * Full-text style search across name, description, and material.
     *
     * @param query  raw search term
     */
    public List<Product> searchProducts(String query) throws SQLException {
        List<Product> products = new ArrayList<>();
        String like = "%" + query + "%";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_SEARCH)) {

            ps.setString(1, like);
            ps.setString(2, like);
            ps.setString(3, like);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    products.add(mapRow(rs));
                }
            }
        }
        return products;
    }

    /**
     * Inserts a new product. Used by AdminServlet.
     *
     * @param p  product to insert (id is ignored; MySQL auto-assigns it)
     * @return   the auto-generated primary key
     */
    public int insertProduct(Product p) throws SQLException {
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     SQL_INSERT, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, p.getName());
            ps.setInt   (2, p.getCategoryId());
            ps.setDouble(3, p.getPrice());
            ps.setString(4, p.getDescription());
            ps.setString(5, p.getMaterial());
            ps.setString(6, p.getDimensions());
            ps.setString(7, p.getWeight());
            ps.setString(8, p.getColorOptions());
            ps.setString(9, p.getModelFile());
            ps.setString(10, p.getImageUrl());

            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
        }
        return -1;
    }

    // ── Private Helpers ───────────────────────────────────────────────────

    /**
     * Maps a single ResultSet row → Product object.
     * Centralised here so all queries share one mapping.
     */
    private Product mapRow(ResultSet rs) throws SQLException {
        Product p = new Product();
        p.setId          (rs.getInt    (COL_ID));
        p.setName        (rs.getString (COL_NAME));
        p.setPrice       (rs.getDouble (COL_PRICE));
        p.setDescription (rs.getString (COL_DESCRIPTION));
        p.setMaterial    (rs.getString (COL_MATERIAL));
        p.setDimensions  (rs.getString (COL_DIMENSIONS));
        p.setWeight      (rs.getString (COL_WEIGHT));
        p.setColorOptions(rs.getString (COL_COLOR_OPT));
        p.setModelFile   (rs.getString (COL_MODEL_FILE));
        p.setImageUrl    (rs.getString (COL_IMAGE_URL));
        p.setInStock     (rs.getBoolean(COL_IN_STOCK));
        p.setRating      (rs.getDouble (COL_RATING));
        p.setReviewCount (rs.getInt    (COL_REVIEW_COUNT));
        p.setCategoryName(rs.getString (COL_CAT_NAME));
        return p;
    }
}
