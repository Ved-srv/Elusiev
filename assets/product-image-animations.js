// Product image fade-in animations
class ProductImageAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.setupImageLoading();
    this.setupScrollAnimations();
  }

  setupImageLoading() {
    // Target all product media images
    const productImages = document.querySelectorAll(`
      .main-product__media .swiper-slide .media img,
      .main-product__media--grid-item .media img
    `);

    productImages.forEach((img, index) => {
      // Add loading state
      img.classList.add("loading");

      if (img.complete && img.naturalWidth > 0) {
        // Image already loaded
        this.handleImageLoad(img, index);
      } else {
        // Wait for image to load
        img.addEventListener("load", () => this.handleImageLoad(img, index));
        img.addEventListener("error", () => this.handleImageError(img));
      }
    });
  }

  handleImageLoad(img, index) {
    // Stagger the animation for multiple images
    const delay = index * 100; // 100ms delay between each image

    setTimeout(() => {
      img.classList.add("loaded");
      img.classList.remove("loading");

      // Trigger any additional animations
      this.triggerLuxuryEffects(img);
    }, delay);
  }

  handleImageError(img) {
    img.classList.remove("loading");
    // You can add error handling here
  }

  triggerLuxuryEffects(img) {
    // Add a subtle glow effect for luxury feel
    const mediaContainer = img.closest(".media");
    if (mediaContainer) {
      mediaContainer.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
    }
  }

  setupScrollAnimations() {
    // Intersection Observer for scroll-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "50px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target.querySelector("img");
          if (img && !img.classList.contains("loaded")) {
            img.classList.add("loaded");
          }
        }
      });
    }, observerOptions);

    // Observe all media containers
    const mediaContainers = document.querySelectorAll(
      ".main-product__media .media"
    );
    mediaContainers.forEach((container) => observer.observe(container));
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new ProductImageAnimations();
});

// Re-initialize on Shopify section reload (for theme editor)
if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener("shopify:section:load", () => {
    new ProductImageAnimations();
  });
}
