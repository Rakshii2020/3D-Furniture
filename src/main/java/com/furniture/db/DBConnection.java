package com.furniture.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DBConnection — JDBC Connection Utility
 * ----------------------------------------
 * Provides a centralized, reusable method to obtain a MySQL database
 * connection via JDBC. All Servlets call DBConnection.getConnection()
 * instead of duplicating connection logic.
 *
 * Connection is created fresh on each call (simple approach).
 * For production, replace with a connection pool (HikariCP / c3p0).
 */
public class DBConnection {

    // ── JDBC driver class name ──────────────────────────────────────────────
    private static final String DRIVER = "com.mysql.cj.jdbc.Driver";

    // ── Connection URL ──────────────────────────────────────────────────────
    // Format: jdbc:mysql://<host>:<port>/<database>?options
    private static final String URL =
        "jdbc:mysql://localhost:3306/furniture_db" +
        "?useSSL=false" +
        "&serverTimezone=UTC" +
        "&characterEncoding=UTF-8" +
        "&allowPublicKeyRetrieval=true";

    // ── Credentials ─────────────────────────────────────────────────────────
    private static final String USER     = "root";   // change if needed
    private static final String PASSWORD = "rakshi08";   // change to your MySQL password

    /**
     * Loads the JDBC driver once when the class is first referenced.
     * Class.forName() is technically optional for modern JDBC (4.0+),
     * but explicit loading avoids ClassNotFoundException in some servers.
     */
    static {
        try {
            Class.forName(DRIVER);
        } catch (ClassNotFoundException e) {
            throw new ExceptionInInitializerError(
                "MySQL JDBC driver not found. Add mysql-connector-j.jar to /WEB-INF/lib/\n" + e
            );
        }
    }

    /**
     * Returns a new JDBC Connection to the furniture_db database.
     *
     * Usage:
     *   try (Connection conn = DBConnection.getConnection()) {
     *       // use conn here — auto-closed by try-with-resources
     *   }
     *
     * @return  a live java.sql.Connection
     * @throws  SQLException if the connection cannot be established
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    // Prevent instantiation — this is a pure utility class
    private DBConnection() {}
}
