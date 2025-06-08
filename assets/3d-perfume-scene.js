class PerfumeScene {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.perfumeModel = null;
    this.scrollProgress = 0;
    this.isLoaded = false;
    this.animationId = null;
    
    // Animation parameters
    this.initialRotation = { x: 0.2, y: 0 };
    this.targetRotation = { x: -0.2, y: Math.PI };
    this.initialPosition = { x: 0, y: 0, z: 0 };
    this.targetPosition = { x: -3, y: 0, z: -2 };
    
    this.init();
  }
  
  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLighting();
    this.loadModel();
    this.setupEventListeners();
    this.animate();
  }
  
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent background
    
    // Add fog for depth
    this.scene.fog = new THREE.Fog(0xffffff, 10, 50);
  }
  
  setupCamera() {
    const container = document.getElementById('perfume-3d-container');
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 8);
    this.camera.lookAt(0, 0, 0);
  }
  
  setupRenderer() {
    const canvas = document.getElementById('perfume-canvas');
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false
    });
    
    const container = document.getElementById('perfume-3d-container');
    this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Enhanced rendering settings
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
  }
  
  setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    this.scene.add(mainLight);
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-3, 2, 4);
    this.scene.add(fillLight);
    
    // Rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, 0, -5);
    this.scene.add(rimLight);
    
    // Point lights for sparkle
    const pointLight1 = new THREE.PointLight(0xffffff, 0.3, 10);
    pointLight1.position.set(3, 3, 3);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 0.2, 8);
    pointLight2.position.set(-2, -2, 2);
    this.scene.add(pointLight2);
  }
  
  loadModel() {
    // Show loading state
    this.showLoading(true);
    
    const loader = new THREE.OBJLoader();
    
    // Get model path from data attribute
    const sectionContainer = document.getElementById('perfume-3d-container');
    const modelPath = sectionContainer?.dataset.modelPath;
    
    console.log('Attempting to load model from:', modelPath);
    
    if (!modelPath) {
      console.error('No model path specified');
      this.showLoading(false);
      this.showError('No 3D model file specified in section settings');
      return;
    }
    
    loader.load(
      modelPath,
      (object) => {
        console.log('Model loaded successfully');
        this.setupModel(object);
        this.showLoading(false);
        this.isLoaded = true;
      },
      (progress) => {
        const percent = progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;
        this.updateLoadingProgress(percent);
        console.log('Loading progress:', percent.toFixed(1) + '%');
      },
      (error) => {
        console.error('Error loading 3D model:', error);
        console.log('Model path attempted:', modelPath);
        this.showLoading(false);
        this.showError(`Could not load 3D model: ${modelPath.split('/').pop()}`);
      }
    );
  }
  
  showError(message) {
    const container = document.getElementById('perfume-3d-container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'section-3d-perfume__error';
    errorDiv.innerHTML = `
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  text-align: center; color: #666; z-index: 10; font-family: 'The Seasons', serif;">
        <h3 style="margin-bottom: 1rem; color: #333;">3D Model Not Found</h3>
        <p style="margin-bottom: 0.5rem;">${message}</p>
        <small style="opacity: 0.7;">Make sure your .obj file is uploaded to the assets folder</small>
      </div>
    `;
    container.appendChild(errorDiv);
  }
  
  createPlaceholderModel() {
    // Create a beautiful glass bottle as placeholder
    const group = new THREE.Group();
    
    // Bottle body
    const bodyGeometry = new THREE.CylinderGeometry(0.8, 1, 3, 32);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      roughness: 0,
      metalness: 0,
      transmission: 0.9,
      thickness: 0.1,
      envMapIntensity: 1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    
    // Bottle cap
    const capGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 32);
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9a876,
      roughness: 0.2,
      metalness: 0.8
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = 1.8;
    cap.castShadow = true;
    group.add(cap);
    
    // Liquid inside
    const liquidGeometry = new THREE.CylinderGeometry(0.7, 0.9, 2.5, 32);
    const liquidMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.3
    });
    const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquid.position.y = -0.25;
    group.add(liquid);
    
    this.setupModel(group);
    this.isLoaded = true;
  }
  
  setupModel(object) {
    // Scale and position the model
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDimension;
    
    object.scale.setScalar(scale);
    
    // Center the model
    box.setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);
    
    // Apply materials if needed
    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Enhance materials for glass-like appearance
        if (child.material) {
          child.material.transparent = true;
          child.material.opacity = 0.8;
          child.material.roughness = 0.1;
          child.material.metalness = 0.1;
        }
      }
    });
    
    // Set initial rotation
    object.rotation.x = this.initialRotation.x;
    object.rotation.y = this.initialRotation.y;
    
    this.perfumeModel = object;
    this.scene.add(object);
  }
  
  setupEventListeners() {
    // Scroll event for animation
    window.addEventListener('scroll', () => {
      this.updateScrollProgress();
    });
    
    // Resize event
    window.addEventListener('resize', () => {
      this.handleResize();
    });
    
    // Mouse move for subtle parallax
    document.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });
  }
  
  updateScrollProgress() {
    const container = document.getElementById('perfume-3d-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress based on element visibility
    const elementTop = rect.top;
    const elementHeight = rect.height;
    
    // Progress from 0 when element enters viewport to 1 when it exits
    let progress = (windowHeight - elementTop) / (windowHeight + elementHeight);
    progress = Math.max(0, Math.min(1, progress));
    
    this.scrollProgress = progress;
    this.updateModelTransform();
  }
  
  updateModelTransform() {
    if (!this.perfumeModel || !this.isLoaded) return;
    
    // Smooth easing function
    const ease = (t) => t * t * (3 - 2 * t);
    const progress = ease(this.scrollProgress);
    
    // Rotation animation (X-axis rotation from back to front)
    const rotX = this.initialRotation.x + (this.targetRotation.x - this.initialRotation.x) * progress;
    const rotY = this.initialRotation.y + (this.targetRotation.y - this.initialRotation.y) * progress;
    
    this.perfumeModel.rotation.x = rotX;
    this.perfumeModel.rotation.y = rotY;
    
    // Position animation (move back and to the left)
    const posX = this.initialPosition.x + (this.targetPosition.x - this.initialPosition.x) * progress;
    const posY = this.initialPosition.y + (this.targetPosition.y - this.initialPosition.y) * progress;
    const posZ = this.initialPosition.z + (this.targetPosition.z - this.initialPosition.z) * progress;
    
    this.perfumeModel.position.x = posX;
    this.perfumeModel.position.y = posY;
    this.perfumeModel.position.z = posZ;
    
    // Update progress bar if it exists
    const progressBar = document.querySelector('.section-3d-perfume__progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }
  }
  
  handleMouseMove(event) {
    if (!this.perfumeModel || !this.isLoaded) return;
    
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Subtle parallax effect
    const parallaxX = mouseX * 0.1;
    const parallaxY = mouseY * 0.1;
    
    this.camera.position.x = parallaxX;
    this.camera.position.y = parallaxY;
    this.camera.lookAt(0, 0, 0);
  }
  
  handleResize() {
    const container = document.getElementById('perfume-3d-container');
    if (!container) return;
    
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  
  showLoading(show) {
    let loader = document.querySelector('.section-3d-perfume__loading');
    
    if (show && !loader) {
      loader = document.createElement('div');
      loader.className = 'section-3d-perfume__loading';
      loader.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading Experience...</div>
      `;
      document.getElementById('perfume-3d-container').appendChild(loader);
    } else if (!show && loader) {
      loader.remove();
    }
  }
  
  updateLoadingProgress(percent) {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = `Loading ${Math.round(percent)}%`;
    }
  }
  
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (this.perfumeModel && this.isLoaded) {
      // Subtle idle animation
      const time = Date.now() * 0.001;
      this.perfumeModel.rotation.y += Math.sin(time * 0.5) * 0.002;
      this.perfumeModel.position.y += Math.sin(time * 2) * 0.01;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    window.removeEventListener('scroll', this.updateScrollProgress);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('mousemove', this.handleMouseMove);
    
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

// Initialize the scene when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if the 3D section exists on the page
  const container = document.getElementById('perfume-3d-container');
  if (container) {
    // Wait for Three.js to load
    const checkThreeJS = () => {
      if (typeof THREE !== 'undefined') {
        // Add OBJLoader implementation
        THREE.OBJLoader = class {
          load(url, onLoad, onProgress, onError) {
            fetch(url)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                const total = parseInt(response.headers.get('content-length')) || 0;
                let loaded = 0;
                
                const reader = response.body.getReader();
                let chunks = [];
                
                return new ReadableStream({
                  start(controller) {
                    function pump() {
                      return reader.read().then(({ done, value }) => {
                        if (done) {
                          controller.close();
                          return;
                        }
                        loaded += value.length;
                        if (onProgress && total > 0) {
                          onProgress({ loaded, total });
                        }
                        chunks.push(value);
                        controller.enqueue(value);
                        return pump();
                      });
                    }
                    return pump();
                  }
                }).getReader();
              })
              .then(reader => {
                let chunks = [];
                function pump() {
                  return reader.read().then(({ done, value }) => {
                    if (done) {
                      const uint8Array = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
                      let offset = 0;
                      chunks.forEach(chunk => {
                        uint8Array.set(chunk, offset);
                        offset += chunk.length;
                      });
                      const text = new TextDecoder().decode(uint8Array);
                      return this.parse(text);
                    }
                    chunks.push(value);
                    return pump();
                  });
                }
                return pump();
              })
              .then(object => {
                onLoad && onLoad(object);
              })
              .catch(error => {
                console.error('Error loading OBJ file:', error);
                onError && onError(error);
              });
          }
          
          parse(text) {
            const object = new THREE.Group();
            const vertices = [];
            const normals = [];
            const uvs = [];
            
            const lines = text.split('\n');
            let geometry = new THREE.BufferGeometry();
            let material = new THREE.MeshStandardMaterial({ 
              color: 0xffffff,
              transparent: true,
              opacity: 0.9,
              roughness: 0.1,
              metalness: 0.1
            });
            
            const positions = [];
            const normalsArray = [];
            const uvsArray = [];
            
            lines.forEach(line => {
              const parts = line.trim().split(/\s+/);
              
              if (parts[0] === 'v') {
                vertices.push(
                  parseFloat(parts[1]),
                  parseFloat(parts[2]),
                  parseFloat(parts[3])
                );
              } else if (parts[0] === 'vn') {
                normals.push(
                  parseFloat(parts[1]),
                  parseFloat(parts[2]),
                  parseFloat(parts[3])
                );
              } else if (parts[0] === 'vt') {
                uvs.push(
                  parseFloat(parts[1]),
                  parseFloat(parts[2])
                );
              } else if (parts[0] === 'f') {
                // Handle faces - simple triangulation
                const face = [];
                for (let i = 1; i < parts.length; i++) {
                  const vertex = parts[i].split('/');
                  face.push({
                    v: parseInt(vertex[0]) - 1,
                    vt: vertex[1] ? parseInt(vertex[1]) - 1 : null,
                    vn: vertex[2] ? parseInt(vertex[2]) - 1 : null
                  });
                }
                
                // Triangulate face
                for (let i = 1; i < face.length - 1; i++) {
                  [face[0], face[i], face[i + 1]].forEach(vertex => {
                    const vIndex = vertex.v * 3;
                    positions.push(
                      vertices[vIndex],
                      vertices[vIndex + 1],
                      vertices[vIndex + 2]
                    );
                    
                    if (vertex.vn !== null && normals.length > 0) {
                      const nIndex = vertex.vn * 3;
                      normalsArray.push(
                        normals[nIndex],
                        normals[nIndex + 1],
                        normals[nIndex + 2]
                      );
                    }
                    
                    if (vertex.vt !== null && uvs.length > 0) {
                      const uvIndex = vertex.vt * 2;
                      uvsArray.push(
                        uvs[uvIndex],
                        uvs[uvIndex + 1]
                      );
                    }
                  });
                }
              }
            });
            
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            
            if (normalsArray.length > 0) {
              geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normalsArray, 3));
            } else {
              geometry.computeVertexNormals();
            }
            
            if (uvsArray.length > 0) {
              geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvsArray, 2));
            }
            
            const mesh = new THREE.Mesh(geometry, material);
            object.add(mesh);
            
            return object;
          }
        };
        
        new PerfumeScene();
      } else {
        setTimeout(checkThreeJS, 100);
      }
    };
    
    checkThreeJS();
  }
});

// Export for potential external use
window.PerfumeScene = PerfumeScene;