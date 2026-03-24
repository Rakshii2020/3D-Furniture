package com.furniture.model;

/**
 * Product — Domain Model (JavaBean / POJO)
 * ------------------------------------------
 * Mirrors the `products` table in MySQL.
 * Used to transfer data between the DAO layer, Servlets, and JSP views.
 *
 * All fields have getters/setters so JSP EL (${product.name}) works
 * seamlessly without extra configuration.
 */
public class Product {

    private int    id;
    private String name;
    private int    categoryId;
    private String categoryName;   // joined from categories table
    private double price;
    private String description;
    private String material;
    private String dimensions;
    private String weight;
    private String colorOptions;   // JSON string: ["#FFFFFF","#000000",...]
    private String modelFile;      // relative path to .glb model
    private String imageUrl;       // relative path to preview image
    private boolean inStock;
    private double  rating;
    private int     reviewCount;

    // ── Constructors ──────────────────────────────────────────────────────

    public Product() {}

    public Product(int id, String name, double price, String modelFile, String imageUrl) {
        this.id        = id;
        this.name      = name;
        this.price     = price;
        this.modelFile = modelFile;
        this.imageUrl  = imageUrl;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────

    public int    getId()            { return id; }
    public void   setId(int id)      { this.id = id; }

    public String getName()          { return name; }
    public void   setName(String n)  { this.name = n; }

    public int    getCategoryId()              { return categoryId; }
    public void   setCategoryId(int cid)       { this.categoryId = cid; }

    public String getCategoryName()            { return categoryName; }
    public void   setCategoryName(String cn)   { this.categoryName = cn; }

    public double getPrice()                   { return price; }
    public void   setPrice(double p)           { this.price = p; }

    public String getDescription()             { return description; }
    public void   setDescription(String d)     { this.description = d; }

    public String getMaterial()                { return material; }
    public void   setMaterial(String m)        { this.material = m; }

    public String getDimensions()              { return dimensions; }
    public void   setDimensions(String dim)    { this.dimensions = dim; }

    public String getWeight()                  { return weight; }
    public void   setWeight(String w)          { this.weight = w; }

    public String getColorOptions()            { return colorOptions; }
    public void   setColorOptions(String co)   { this.colorOptions = co; }

    public String getModelFile()               { return modelFile; }
    public void   setModelFile(String mf)      { this.modelFile = mf; }

    public String getImageUrl()                { return imageUrl; }
    public void   setImageUrl(String iu)       { this.imageUrl = iu; }

    public boolean isInStock()                 { return inStock; }
    public void    setInStock(boolean s)       { this.inStock = s; }

    public double  getRating()                 { return rating; }
    public void    setRating(double r)         { this.rating = r; }

    public int     getReviewCount()            { return reviewCount; }
    public void    setReviewCount(int rc)      { this.reviewCount = rc; }

    // ── Helpers ───────────────────────────────────────────────────────────

    /** Formatted price string, e.g. "$1,299.00" */
    public String getFormattedPrice() {
        return String.format("$%,.2f", price);
    }

    @Override
    public String toString() {
        return "Product{id=" + id + ", name='" + name + "', price=" + price + "}";
    }
}
