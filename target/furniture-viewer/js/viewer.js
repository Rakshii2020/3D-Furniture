/**
 * viewer.js — Three.js 3D Furniture Viewer
 * ============================================
 * How Three.js integrates with the JSP page:
 *
 *  1. viewer.jsp includes <script src="three.min.js"> from CDN.
 *  2. viewer.jsp passes product data via window.APP.product.
 *  3. This script reads APP.product and builds the 3D scene.
 *  4. If a real .glb model path exists, GLTFLoader loads it.
 *     Otherwise, a procedural 3D furniture shape is generated.
 *
 * Scene structure:
 *   - PerspectiveCamera with OrbitControls (drag/scroll/pinch)
 *   - AmbientLight + 3 point lights for realistic shading
 *   - Ground plane with shadow receiving
 *   - ProductMesh: the 3D furniture object
 *   - EnvironmentMap: simulated HDRI for reflections
 *
 * Customisation:
 *   - Color swatches call viewer.applyColor(hex)
 *   - Wireframe toggled via toolbar
 *   - Screenshot via canvas.toDataURL()
 */

'use strict';

/* ════════════════════════════════════════════════════════════════
   FurnitureViewer Class
═════════════════════════════════════════════════════════════════ */
class FurnitureViewer {

    constructor(canvasId, product) {
        this.canvas      = document.getElementById(canvasId);
        this.product     = product;
        this.scene       = null;
        this.camera      = null;
        this.renderer    = null;
        this.mesh        = null;
        this.materials   = [];
        this.autoRotate  = false;
        this.wireframe   = false;
        this.clock       = new THREE.Clock();
        this.mouse       = { x: 0, y: 0, isDown: false };
        this.orbitState  = { theta: 0, phi: Math.PI / 3, radius: 4,
                             targetTheta: 0, targetPhi: Math.PI / 3, targetRadius: 4 };
        this.raycaster   = new THREE.Raycaster();

        this._init();
    }

    /* ── Scene Initialisation ──────────────────────────────────── */
    _init() {
        this._setupRenderer();
        this._setupScene();
        this._setupCamera();
        this._setupLights();
        this._setupEnvironment();
        this._loadModel();
        this._setupControls();
        this._setupColorSwatches();
        this._startRenderLoop();
        window.addEventListener('resize', () => this._onResize());
    }

    _setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas:      this.canvas,
            antialias:   true,
            alpha:       false,
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding    = THREE.sRGBEncoding;
    }

    _setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0E0D0C);
        this.scene.fog = new THREE.FogExp2(0x0E0D0C, 0.04);
    }

    _setupCamera() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        this._updateCameraPosition();
    }

    _setupLights() {
        // Soft ambient
        const ambient = new THREE.AmbientLight(0xfff4e6, 0.4);
        this.scene.add(ambient);

        // Key light (warm, from top-front-right)
        const keyLight = new THREE.DirectionalLight(0xfff0d0, 2.5);
        keyLight.position.set(5, 8, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(2048, 2048);
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far  = 30;
        keyLight.shadow.camera.left = keyLight.shadow.camera.bottom = -8;
        keyLight.shadow.camera.right = keyLight.shadow.camera.top   = 8;
        keyLight.shadow.bias = -0.0005;
        this.scene.add(keyLight);

        // Fill light (cool, from left)
        const fillLight = new THREE.DirectionalLight(0xc0d8ff, 0.8);
        fillLight.position.set(-5, 4, -2);
        this.scene.add(fillLight);

        // Rim light (accent, from behind)
        const rimLight = new THREE.PointLight(0xd4a85a, 1.5, 12);
        rimLight.position.set(-3, 5, -5);
        this.scene.add(rimLight);

        // Ground bounce light
        const bounce = new THREE.PointLight(0xffeedd, 0.6, 8);
        bounce.position.set(0, -1, 0);
        this.scene.add(bounce);

        this.keyLight = keyLight;
    }

    _setupEnvironment() {
        // Ground plane
        const groundGeo = new THREE.PlaneGeometry(20, 20);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x1A1714,
            roughness: 0.8,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1.5;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Subtle grid on ground
        const gridHelper = new THREE.GridHelper(16, 16, 0x2C2820, 0x1F1C19);
        gridHelper.position.y = -1.49;
        gridHelper.material.opacity = 0.4;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);

        // Background gradient via a large sphere
        const bgGeo = new THREE.SphereGeometry(40, 32, 32);
        const bgMat = new THREE.MeshBasicMaterial({
            color: 0x0E0D0C,
            side: THREE.BackSide
        });
        this.scene.add(new THREE.Mesh(bgGeo, bgMat));
    }

    /* ── Model Loading ─────────────────────────────────────────── */
    _loadModel() {
        const loader = document.getElementById('viewerLoader');
        const bar    = document.getElementById('loaderBar');

        // Simulate progress animation during load
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress = Math.min(progress + Math.random() * 15, 90);
            if (bar) {
                bar.style.animation = 'none';
                bar.style.width = progress + '%';
            }
        }, 200);

        // Build procedural furniture mesh (no external file needed)
        // In production, replace this with GLTFLoader pointing to your .glb file
        setTimeout(() => {
            clearInterval(progressInterval);
            if (bar) { bar.style.width = '100%'; }

            try {
                this._buildProceduralFurniture();
            } catch(e) {
                console.error('Furniture build error:', e);
                this._buildFallbackBox();
            }

            // Hide loader after mesh is ready
            setTimeout(() => {
                if (loader) loader.classList.add('hidden');
                this._fadeHints();
            }, 400);

        }, 800 + Math.random() * 600);
    }

    /**
     * Procedural furniture generator — creates a 3D shape based on product category.
     * In production: use THREE.GLTFLoader to load actual .glb files.
     */
    _buildProceduralFurniture() {
        const group = new THREE.Group();
        const catName = (this.product.name || '').toLowerCase();

        // Determine what to build from product name
        if (catName.includes('sofa') || catName.includes('cloud')) {
            this._buildSofa(group);
        } else if (catName.includes('chair') || catName.includes('lounge') || catName.includes('accent')) {
            this._buildChair(group);
        } else if (catName.includes('table')) {
            this._buildTable(group);
        } else if (catName.includes('bed')) {
            this._buildBed(group);
        } else if (catName.includes('shelf') || catName.includes('shelve')) {
            this._buildShelf(group);
        } else if (catName.includes('lamp')) {
            this._buildLamp(group);
        } else {
            this._buildGenericFurniture(group);
        }

        // Center the group
        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        group.position.sub(center);
        group.position.y += size.y / 2 - 1.5;

        // Collect all meshes for color changes
        group.traverse(child => {
            if (child.isMesh && child.userData.colorable) {
                this.materials.push(child.material);
                child.castShadow    = true;
                child.receiveShadow = true;
            }
        });

        this.mesh = group;
        this.scene.add(group);

        // Entrance animation
        group.scale.setScalar(0.01);
        group.userData.targetScale = 1;
        this._animateScaleIn(group);
    }

    _animateScaleIn(group) {
        const duration = 600;
        const start    = performance.now();
        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
            group.scale.setScalar(ease);
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    /* ── Procedural Furniture Builders ─────────────────────────── */

    _mat(color = 0xC4A882, roughness = 0.65, metalness = 0.05) {
        return new THREE.MeshStandardMaterial({ color, roughness, metalness });
    }
    _woodMat(color = 0x8B6914) {
        return new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.0 });
    }
    _metalMat(color = 0x888888) {
        return new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.9 });
    }
    _fabricMat(color = 0xC4A882) {
        const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.0 });
        m.userData = { colorable: true };
        return m;
    }

    _addMesh(group, geo, mat, x=0, y=0, z=0, rx=0, ry=0, rz=0) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.set(rx, ry, rz);
        mesh.castShadow = mesh.receiveShadow = true;
        if (mat.userData?.colorable) mesh.userData.colorable = true;
        group.add(mesh);
        return mesh;
    }

    _buildSofa(g) {
        const fabric = this._fabricMat(0xC4A882);
        const wood   = this._woodMat(0x5C3D1E);

        // Seat cushions (3 sections)
        for (let i = -1; i <= 1; i++) {
            const cushion = new THREE.Mesh(
                new THREE.BoxGeometry(0.78, 0.22, 0.85),
                fabric
            );
            cushion.position.set(i * 0.82, 0.41, 0);
            cushion.userData.colorable = true;
            g.add(cushion);
        }
        // Seat base
        this._addMesh(g, new THREE.BoxGeometry(2.6, 0.2, 0.9), fabric, 0, 0.22, 0);
        // Back rest
        this._addMesh(g, new THREE.BoxGeometry(2.6, 0.85, 0.2), fabric, 0, 0.72, -0.35);
        // Armrests
        this._addMesh(g, new THREE.BoxGeometry(0.22, 0.52, 0.9), fabric, -1.41, 0.56, 0);
        this._addMesh(g, new THREE.BoxGeometry(0.22, 0.52, 0.9), fabric,  1.41, 0.56, 0);
        // Legs
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8);
        [[-1.2, 0], [-1.2, 0.36], [1.2, 0], [1.2, 0.36]].forEach(([x, z]) => {
            this._addMesh(g, legGeo, wood, x, 0.1, z);
        });
    }

    _buildChair(g) {
        const fabric  = this._fabricMat(0x6B4C2A);
        const chrome  = this._metalMat(0xC0C0C0);

        // Seat
        this._addMesh(g, new THREE.BoxGeometry(0.7, 0.12, 0.7), fabric, 0, 0.5, 0);
        // Back cushion
        this._addMesh(g, new THREE.BoxGeometry(0.68, 0.75, 0.1), fabric, 0, 0.99, -0.3);
        // Chrome base legs (X shape)
        const leg = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8);
        [45, -45, 135, -135].forEach(angle => {
            const m = new THREE.Mesh(leg, chrome);
            m.position.set(
                Math.cos(angle * Math.PI / 180) * 0.25,
                0.02,
                Math.sin(angle * Math.PI / 180) * 0.25
            );
            m.rotation.set(
                Math.sin(angle * Math.PI / 180) * 0.4,
                0,
                -Math.cos(angle * Math.PI / 180) * 0.4
            );
            m.castShadow = true;
            g.add(m);
        });
        // Foot ring
        const ring = new THREE.TorusGeometry(0.32, 0.02, 8, 32);
        this._addMesh(g, ring, chrome, 0, 0.14, 0, Math.PI/2, 0, 0);
    }

    _buildTable(g) {
        const wood   = this._woodMat(0x8B6040);
        const metal  = this._metalMat(0x2C2C2C);

        // Tabletop
        const topGeo = new THREE.BoxGeometry(1.6, 0.05, 0.9);
        const top = new THREE.Mesh(topGeo, wood);
        top.userData.colorable = true;
        top.position.y = 0.73;
        top.castShadow = top.receiveShadow = true;
        g.add(top);

        // Hairpin legs (4 legs, each made of 3 thin rods)
        const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.72, 8);
        const legPositions = [[-0.7, 0.38], [0.7, 0.38], [-0.7, -0.38], [0.7, -0.38]];
        legPositions.forEach(([x, z]) => {
            const l1 = new THREE.Mesh(rodGeo, metal); l1.position.set(x, 0.36, z);
            const l2 = new THREE.Mesh(rodGeo, metal);
            l2.position.set(x + (x > 0 ? 0.04 : -0.04), 0.36, z);
            l2.rotation.z = x > 0 ? 0.12 : -0.12;
            g.add(l1, l2);
        });
    }

    _buildBed(g) {
        const fabric   = this._fabricMat(0x7B6B8D);
        const woodMat  = this._woodMat(0x6B4020);

        // Base platform
        this._addMesh(g, new THREE.BoxGeometry(2.0, 0.2, 2.6), woodMat, 0, 0.1, 0);
        // Mattress
        const mattress = new THREE.Mesh(
            new THREE.BoxGeometry(1.9, 0.3, 2.3),
            fabric
        );
        mattress.userData.colorable = true;
        mattress.position.set(0, 0.35, 0);
        mattress.castShadow = true;
        g.add(mattress);
        // Headboard
        this._addMesh(g, new THREE.BoxGeometry(2.0, 0.95, 0.1), fabric, 0, 0.68, -1.3);
        // Pillows
        const pillowGeo = new THREE.BoxGeometry(0.55, 0.12, 0.42);
        const pillow1 = new THREE.Mesh(pillowGeo, new THREE.MeshStandardMaterial({ color: 0xF5F0E8, roughness: 0.9 }));
        const pillow2 = pillow1.clone();
        pillow1.position.set(-0.38, 0.56, -0.9);
        pillow2.position.set( 0.38, 0.56, -0.9);
        g.add(pillow1, pillow2);
        // Legs
        const legGeo = new THREE.BoxGeometry(0.1, 0.3, 0.1);
        [[-0.9, -1.2], [0.9, -1.2], [-0.9, 1.2], [0.9, 1.2]].forEach(([x, z]) => {
            this._addMesh(g, legGeo, woodMat, x, -0.05, z);
        });
    }

    _buildShelf(g) {
        const wood  = this._woodMat(0xC8A06A);
        const metal = this._metalMat(0x3C3C3C);

        // Wall brackets (2 vertical poles)
        this._addMesh(g, new THREE.BoxGeometry(0.04, 2.2, 0.04), metal, -0.5, 0, 0);
        this._addMesh(g, new THREE.BoxGeometry(0.04, 2.2, 0.04), metal,  0.5, 0, 0);

        // 3 shelves at different heights
        [-0.6, 0, 0.6].forEach((y, i) => {
            const shelf = new THREE.Mesh(
                new THREE.BoxGeometry(1.1, 0.04, 0.26),
                wood
            );
            shelf.userData.colorable = true;
            shelf.position.set(0, y, 0);
            shelf.castShadow = shelf.receiveShadow = true;
            g.add(shelf);

            // Add small decorative boxes on each shelf
            for (let j = 0; j < 2; j++) {
                const bookGeo = new THREE.BoxGeometry(
                    0.06 + Math.random() * 0.06,
                    0.12 + Math.random() * 0.08,
                    0.18
                );
                const bookMat = new THREE.MeshStandardMaterial({
                    color: [0x8B4513, 0x4A6741, 0x2C3E50, 0xB8860B][Math.floor(Math.random()*4)],
                    roughness: 0.7
                });
                const book = new THREE.Mesh(bookGeo, bookMat);
                book.position.set(-0.3 + j * 0.42, y + 0.08, 0);
                book.castShadow = true;
                g.add(book);
            }
        });
    }

    _buildLamp(g) {
        const brass  = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.3, metalness: 0.9 });
        const marble = new THREE.MeshStandardMaterial({ color: 0xF0EAE0, roughness: 0.4, metalness: 0.0 });
        const shade  = this._fabricMat(0xF5E8D0);

        // Marble base disc
        this._addMesh(g, new THREE.CylinderGeometry(0.28, 0.32, 0.12, 32), marble, 0, -1.3, 0);

        // Main pole (arc approximated with segments)
        this._addMesh(g, new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), brass, 0, -0.6, 0);

        // Arc arm (angled cylinder)
        const arc = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.0, 8), brass);
        arc.position.set(0.4, 0.5, 0);
        arc.rotation.z = -Math.PI / 4;
        g.add(arc);

        // Lamp shade (cone)
        const coneGeo = new THREE.ConeGeometry(0.28, 0.35, 24, 1, true);
        const cone = new THREE.Mesh(coneGeo, shade);
        cone.userData.colorable = true;
        cone.position.set(0.82, 1.05, 0);
        cone.castShadow = true;
        g.add(cone);

        // Bulb (emissive sphere inside shade)
        const bulbGeo = new THREE.SphereGeometry(0.06, 16, 16);
        const bulbMat = new THREE.MeshStandardMaterial({ color: 0xFFFF99, emissive: 0xFFFF33, emissiveIntensity: 2.0 });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(0.82, 1.12, 0);
        g.add(bulb);

        // Point light from the bulb
        const lampLight = new THREE.PointLight(0xFFE8A0, 2.0, 6);
        lampLight.position.set(0.82, 1.12, 0);
        g.add(lampLight);
    }

    _buildGenericFurniture(g) {
        this._buildTable(g);
    }

    _buildFallbackBox(g) {
        const mat = this._fabricMat(0xC4A882);
        const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
        box.castShadow = true;
        g = g || new THREE.Group();
        g.add(box);
        this.mesh = g;
        this.scene.add(g);
    }

    /* ── Mouse / Touch Controls (OrbitControls from scratch) ───── */
    _setupControls() {
        const canvas = this.canvas;

        // Mouse
        canvas.addEventListener('mousedown',  e => this._onMouseDown(e));
        canvas.addEventListener('mousemove',  e => this._onMouseMove(e));
        canvas.addEventListener('mouseup',    () => this.mouse.isDown = false);
        canvas.addEventListener('mouseleave', () => this.mouse.isDown = false);
        canvas.addEventListener('wheel',      e => this._onWheel(e), { passive: false });
        canvas.addEventListener('contextmenu', e => e.preventDefault());

        // Touch
        let lastTouchDist = 0;
        canvas.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                this.mouse.isDown = true;
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                lastTouchDist = this._touchDist(e);
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', e => {
            if (e.touches.length === 1 && this.mouse.isDown) {
                const dx = e.touches[0].clientX - this.mouse.x;
                const dy = e.touches[0].clientY - this.mouse.y;
                this.orbitState.targetTheta -= dx * 0.008;
                this.orbitState.targetPhi   = Math.max(0.1,
                    Math.min(Math.PI - 0.1, this.orbitState.targetPhi - dy * 0.008));
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const dist = this._touchDist(e);
                const delta = lastTouchDist - dist;
                this.orbitState.targetRadius = Math.max(1.5,
                    Math.min(10, this.orbitState.targetRadius + delta * 0.02));
                lastTouchDist = dist;
            }
        }, { passive: true });

        canvas.addEventListener('touchend', () => { this.mouse.isDown = false; });
    }

    _touchDist(e) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        return Math.sqrt(dx*dx + dy*dy);
    }

    _onMouseDown(e) {
        this.mouse.isDown   = true;
        this.mouse.x        = e.clientX;
        this.mouse.y        = e.clientY;
        this.mouse.button   = e.button;
    }

    _onMouseMove(e) {
        if (!this.mouse.isDown) return;
        const dx = e.clientX - this.mouse.x;
        const dy = e.clientY - this.mouse.y;

        if (this.mouse.button === 0) {
            // Left drag → orbit
            this.orbitState.targetTheta -= dx * 0.007;
            this.orbitState.targetPhi   = Math.max(0.15,
                Math.min(Math.PI - 0.15, this.orbitState.targetPhi - dy * 0.007));
        } else if (this.mouse.button === 2) {
            // Right drag → pan
            this.camera.position.x -= dx * 0.005;
            this.camera.position.y += dy * 0.005;
        }
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    _onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.25 : -0.25;
        this.orbitState.targetRadius = Math.max(1.5,
            Math.min(10, this.orbitState.targetRadius + delta));
    }

    /* ── Camera ──────────────────────────────────────────────────── */
    _updateCameraPosition() {
        const { theta, phi, radius } = this.orbitState;
        this.camera.position.set(
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.cos(theta)
        );
        this.camera.lookAt(0, 0, 0);
    }

    _lerpOrbit() {
        const lerp = 0.1;
        this.orbitState.theta  += (this.orbitState.targetTheta  - this.orbitState.theta)  * lerp;
        this.orbitState.phi    += (this.orbitState.targetPhi    - this.orbitState.phi)    * lerp;
        this.orbitState.radius += (this.orbitState.targetRadius - this.orbitState.radius) * lerp;
    }

    /* ── Colour Swatches ─────────────────────────────────────────── */
    _setupColorSwatches() {
        const container = document.getElementById('colorSwatches');
        if (!container) return;

        let colors = [];
        try {
            colors = JSON.parse(this.product.colorOptions || '[]');
        } catch (e) {
            colors = ['#C4A882', '#2C2C2C', '#FFFFFF', '#4A7C59'];
        }

        colors.forEach((hex, i) => {
            const swatch = document.createElement('button');
            swatch.className = 'color-swatch' + (i === 0 ? ' active' : '');
            swatch.style.background = hex;
            swatch.title = hex;
            swatch.setAttribute('aria-label', `Color option: ${hex}`);
            swatch.addEventListener('click', () => {
                document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                this.applyColor(hex);

                const nameEl = document.getElementById('colorName');
                if (nameEl) nameEl.textContent = hex;
            });
            container.appendChild(swatch);
        });
    }

    /* ── Public API ──────────────────────────────────────────────── */

    /** Change the colour of all colorable materials in the model */
    applyColor(hexColor) {
        const color = new THREE.Color(hexColor);
        if (this.mesh) {
            this.mesh.traverse(child => {
                if (child.isMesh && child.userData.colorable) {
                    child.material.color.set(color);
                }
            });
        }
    }

    /** Reset camera to default position */
    resetCamera() {
        this.orbitState.targetTheta  = 0;
        this.orbitState.targetPhi    = Math.PI / 3;
        this.orbitState.targetRadius = 4;
    }

    /** Toggle auto-rotation */
    toggleAutoRotate() {
        this.autoRotate = !this.autoRotate;
        const btn = document.getElementById('autoRotateBtn');
        if (btn) btn.classList.toggle('active', this.autoRotate);
    }

    /** Toggle wireframe mode */
    toggleWireframe() {
        this.wireframe = !this.wireframe;
        if (this.mesh) {
            this.mesh.traverse(child => {
                if (child.isMesh) {
                    child.material.wireframe = this.wireframe;
                }
            });
        }
    }

    /** Save current frame as PNG */
    screenshot() {
        this.renderer.render(this.scene, this.camera);
        const url  = this.renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.href     = url;
        link.download = `forma-${this.product.name || 'furniture'}.png`;
        link.click();
        if (typeof showToast === 'function') showToast('Screenshot saved!', 'success');
    }

    /* ── Hints fade ──────────────────────────────────────────────── */
    _fadeHints() {
        const hints = document.getElementById('viewerHints');
        if (!hints) return;
        setTimeout(() => hints.classList.add('fade'), 3000);
        this.canvas.addEventListener('mousemove', () => hints.classList.remove('fade'), { once: true });
    }

    /* ── Resize ──────────────────────────────────────────────────── */
    _onResize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    /* ── Render Loop ─────────────────────────────────────────────── */
    _startRenderLoop() {
        const tick = () => {
            requestAnimationFrame(tick);

            const delta = this.clock.getDelta();

            // Auto-rotate
            if (this.autoRotate && this.mesh) {
                this.orbitState.targetTheta += delta * 0.5;
            }

            // Smooth orbit interpolation
            this._lerpOrbit();
            this._updateCameraPosition();

            // Subtle key light animation
            if (this.keyLight) {
                const t = this.clock.elapsedTime;
                this.keyLight.intensity = 2.2 + Math.sin(t * 0.5) * 0.3;
            }

            this.renderer.render(this.scene, this.camera);
        };
        tick();
    }
}

/* ════════════════════════════════════════════════════════════════
   Auto-initialize when DOM is ready
   (viewer.jsp sets window.APP.product before this script runs)
═════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded! Make sure three.min.js CDN link is working.');
        return;
    }

    if (!window.APP?.product) {
        console.error('window.APP.product is not set by the JSP page.');
        return;
    }

    // Expose viewer instance globally so toolbar buttons can call it
    window.viewer = new FurnitureViewer('threejsCanvas', window.APP.product);
});
