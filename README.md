# FORMA — Interactive 3D Furniture Viewer

A full-stack web application built with **Java Servlets**, **MySQL**, and **Three.js**,
hosted on **Apache Tomcat**.

---

## 📁 Project Structure

```
furniture-viewer/
│
├── pom.xml                          ← Maven build file
├── sql/
│   └── schema.sql                   ← Database setup + seed data
│
└── src/main/
    ├── java/com/furniture/
    │   ├── db/
    │   │   ├── DBConnection.java     ← JDBC connection utility
    │   │   └── ProductDAO.java       ← All SQL queries (DAO pattern)
    │   ├── model/
    │   │   ├── Product.java          ← Product JavaBean
    │   │   └── User.java             ← User JavaBean
    │   └── servlet/
    │       ├── ProductServlet.java       ← GET /products
    │       ├── ProductDetailsServlet.java← GET /product?id=N
    │       ├── LoginServlet.java         ← GET/POST /login
    │       ├── LogoutServlet.java        ← GET /logout
    │       ├── CartServlet.java          ← GET/POST/DELETE /cart
    │       └── AdminServlet.java         ← GET/POST /admin
    │
    └── webapp/
        ├── index.jsp                ← Redirects → /products
        ├── WEB-INF/
        │   ├── web.xml              ← Servlet deployment descriptor
        │   └── views/
        │       ├── index.jsp        ← Product listing page
        │       ├── viewer.jsp       ← 3D viewer page
        │       ├── login.jsp        ← Login form
        │       ├── admin.jsp        ← Admin dashboard
        │       └── error.jsp        ← 404/500 error page
        ├── css/
        │   ├── main.css             ← Global styles
        │   ├── viewer.css           ← 3D viewer styles
        │   └── admin.css            ← Admin dashboard styles
        └── js/
            ├── main.js              ← Cart, wishlist, toast notifications
            └── viewer.js            ← Three.js 3D rendering engine
```

---

## 🚀 Setup & Run (Step-by-Step)

### Prerequisites
| Tool        | Version  | Download |
|-------------|----------|---------|
| Java JDK    | 11+      | https://adoptium.net |
| Apache Tomcat | 9.x    | https://tomcat.apache.org/download-90.cgi |
| MySQL       | 8.x      | https://dev.mysql.com/downloads/ |
| Maven       | 3.8+     | https://maven.apache.org/download.cgi |

---

### Step 1 — Set up the database

```bash
# Start MySQL and log in
mysql -u root -p

# Run the schema script
source /path/to/furniture-viewer/sql/schema.sql;

# Verify tables exist
USE furniture_db;
SHOW TABLES;
SELECT name, price FROM products;
```

Expected output: 8 furniture products in the `products` table.

---

### Step 2 — Configure JDBC credentials

Open `src/main/java/com/furniture/db/DBConnection.java` and update:

```java
private static final String USER     = "root";   // your MySQL username
private static final String PASSWORD = "root";   // your MySQL password
```

If your MySQL runs on a different port:
```java
private static final String URL = "jdbc:mysql://localhost:3306/furniture_db?...";
//                                              ^^^^^^^^^^^  ^^^^
//                                              host         port
```

---

### Step 3 — Build the WAR file

```bash
cd furniture-viewer
mvn clean package
```

This creates: `target/furniture-viewer.war`

---

### Step 4 — Deploy to Tomcat

**Option A — Copy WAR to Tomcat webapps folder:**
```bash
cp target/furniture-viewer.war /path/to/tomcat/webapps/
# Tomcat auto-deploys it
```

**Option B — Use Maven Tomcat plugin:**
```bash
mvn tomcat7:run
```
Then open: http://localhost:8080/furniture-viewer

**Option C — Deploy via Tomcat Manager UI:**
1. Open http://localhost:8080/manager/html
2. Under "WAR file to deploy", upload `target/furniture-viewer.war`
3. Click Deploy

---

### Step 5 — Open in browser

```
http://localhost:8080/furniture-viewer/products
```

### Demo Login Credentials

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |
| User  | demo     | demo123   |

---

## 🔌 Servlet Endpoints Reference

| URL                    | Method | Description                            |
|------------------------|--------|----------------------------------------|
| `/products`            | GET    | List all products (HTML or JSON)       |
| `/products?category=X` | GET    | Filter by category                     |
| `/products?search=X`   | GET    | Search by name/material                |
| `/products?format=json`| GET    | Return JSON array                      |
| `/product?id=N`        | GET    | Single product detail / 3D viewer      |
| `/product?id=N&format=json` | GET | Return single product as JSON     |
| `/login`               | GET    | Show login form                        |
| `/login`               | POST   | Submit credentials                     |
| `/logout`              | GET    | Invalidate session                     |
| `/cart`                | GET    | Get cart items (JSON, auth required)   |
| `/cart?productId=N`    | POST   | Add to cart (auth required)            |
| `/cart?id=N`           | DELETE | Remove from cart (auth required)       |
| `/admin`               | GET    | Admin dashboard (admin role required)  |
| `/admin/add`           | POST   | Insert new product (admin only)        |

---

## 🗄️ Database Schema Summary

```sql
users       (id, username, email, password, role, created_at)
categories  (id, name, icon)
products    (id, name, category_id, price, description, material,
             dimensions, weight, color_options, model_file, image_url,
             in_stock, rating, review_count, created_at)
cart        (id, user_id, product_id, quantity, added_at)
wishlist    (id, user_id, product_id, added_at)
```

---

## 🧩 How Servlets Work — Explained

### Request → Servlet → Response flow:

```
Browser GET /products
       ↓
Tomcat finds @WebServlet("/products") → ProductServlet
       ↓
doGet() runs:
  1. Reads query params (category, search, format)
  2. Calls ProductDAO.getAllProducts()
  3. ProductDAO opens JDBC connection via DBConnection.getConnection()
  4. Executes SQL, maps ResultSet → List<Product>
  5. Stores list in request scope: req.setAttribute("products", products)
  6. Forwards to /WEB-INF/views/index.jsp
       ↓
JSP renders HTML using JSTL <c:forEach> over ${products}
       ↓
HTML response sent to browser
```

### Session tracking (login):

```
POST /login (username=admin&password=admin123)
       ↓
LoginServlet.doPost():
  1. SHA-256 hashes the password
  2. Queries users table: SELECT * WHERE username=? AND password=?
  3. If found: creates HttpSession, stores User object
     session.setAttribute("loggedUser", user)
  4. Redirects to /products
       ↓
Subsequent requests:
  session.getAttribute("loggedUser") → User object
  (session ID stored in browser JSESSIONID cookie)
```

---

## 🎮 Three.js Integration — Explained

### How Three.js connects with JSP:

```
viewer.jsp (server-side JSP):
  1. Outputs product data into JavaScript:
     <script>
       window.APP = {
         product: {
           id: ${product.id},          ← JSP EL injects Java value
           name: '${product.name}',
           colorOptions: ${product.colorOptions}
         }
       };
     </script>
  2. Links CDN Three.js: <script src="three.min.js">
  3. Links viewer.js: <script src="js/viewer.js">
  4. Provides a <canvas id="threejsCanvas"> element

viewer.js (client-side JavaScript):
  1. Reads window.APP.product
  2. Creates THREE.WebGLRenderer attached to the <canvas>
  3. Builds Scene, Camera, Lights
  4. Generates procedural 3D furniture mesh from product name
  5. Starts render loop: requestAnimationFrame(tick)
  6. Handles mouse/touch events for orbit/zoom
  7. Color swatches call viewer.applyColor(hex)
     → changes THREE.Material.color on the mesh
```

### Adding real 3D models (GLB files):

To load actual `.glb` furniture models, replace the `_loadModel()` section with:

```javascript
// Import GLTFLoader (add to HTML before viewer.js):
// <script src="GLTFLoader.js"></script>

const loader = new THREE.GLTFLoader();
loader.load(
    `${APP.ctx}/${this.product.modelFile}`,        // e.g. models/sofa.glb
    (gltf) => {
        this.mesh = gltf.scene;
        this.scene.add(this.mesh);
        loader_el.classList.add('hidden');
    },
    (progress) => {
        const pct = (progress.loaded / progress.total) * 100;
        bar.style.width = pct + '%';
    },
    (error) => console.error('GLB load error', error)
);
```

Place `.glb` files in `src/main/webapp/models/`.

---

## 🔒 Security Notes

- Passwords use SHA-256 hashing (demo only). Use **BCrypt** in production.
- All database queries use **PreparedStatements** to prevent SQL injection.
- Session is invalidated and recreated on login to prevent session fixation.
- JSP views are in `/WEB-INF/` — they cannot be accessed directly by URL.
- Admin pages check `user.isAdmin()` before rendering.

---

## 💡 Bonus Features Included

- ✅ Login system with session tracking
- ✅ Cart (add/remove, quantity tracking)
- ✅ Wishlist (localStorage-based)
- ✅ Admin dashboard (product listing + add form)
- ✅ Search and category filtering
- ✅ Color customization in 3D viewer
- ✅ Auto-rotate, wireframe mode, screenshot
- ✅ Responsive design (mobile-friendly)
- ✅ Toast notifications
- ✅ Product card entrance animations

---

## 🎨 Screenshots Guide

| Page           | URL                                      |
|----------------|------------------------------------------|
| Home           | `/furniture-viewer/products`             |
| Category filter| `/furniture-viewer/products?category=Sofas` |
| Search         | `/furniture-viewer/products?search=oak`  |
| 3D Viewer      | `/furniture-viewer/product?id=1`         |
| Login          | `/furniture-viewer/login`                |
| Admin          | `/furniture-viewer/admin` (admin login)  |
