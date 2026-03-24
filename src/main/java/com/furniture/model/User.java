package com.furniture.model;

/**
 * User — Domain Model
 * ---------------------
 * Mirrors the `users` table. Stored in the HTTP session after login.
 * Password hash is NEVER stored on this object after retrieval —
 * only username, email, role, and id travel in the session.
 */
public class User {

    private int    id;
    private String username;
    private String email;
    private String role;       // "user" or "admin"

    public User() {}

    public User(int id, String username, String email, String role) {
        this.id       = id;
        this.username = username;
        this.email    = email;
        this.role     = role;
    }

    public int    getId()              { return id; }
    public void   setId(int id)        { this.id = id; }

    public String getUsername()        { return username; }
    public void   setUsername(String u){ this.username = u; }

    public String getEmail()           { return email; }
    public void   setEmail(String e)   { this.email = e; }

    public String getRole()            { return role; }
    public void   setRole(String r)    { this.role = r; }

    public boolean isAdmin()           { return "admin".equals(role); }
}
