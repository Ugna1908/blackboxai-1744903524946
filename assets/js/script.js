/**
 * Gokuldham Gau Sewa Mahatirth - Main JavaScript
 * This file handles all interactive elements of the website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeCarousel();
    initializeMobileMenu();
    initializeGalleryLightbox();
    initializeFormValidation();
    initializeDonationForm();
    
    // Animate elements on scroll
    animateOnScroll();
});

/**
 * Carousel/Slider functionality
 */
function initializeCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const indicators = document.querySelector('.carousel-indicators');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let autoSlideInterval;
    
    // Create indicators if they don't exist
    if (!indicators && totalSlides > 1) {
        const indicatorsDiv = document.createElement('div');
        indicatorsDiv.className = 'carousel-indicators';
        
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            if (i === 0) indicator.classList.add('active');
            
            indicator.addEventListener('click', () => {
                goToSlide(i);
                resetAutoSlideTimer();
            });
            
            indicatorsDiv.appendChild(indicator);
        }
        
        carousel.parentElement.appendChild(indicatorsDiv);
    }
    
    // Initialize auto-sliding
    startAutoSlide();
    
    // Pause auto-sliding when hovering over carousel
    carousel.parentElement.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });
    
    carousel.parentElement.addEventListener('mouseleave', () => {
        startAutoSlide();
    });
    
    // Add touch/swipe support
    let startX, endX;
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    carousel.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const threshold = 50; // Minimum distance for swipe
        if (startX - endX > threshold) {
            // Swiped left, go to next slide
            nextSlide();
            resetAutoSlideTimer();
        } else if (endX - startX > threshold) {
            // Swiped right, go to previous slide
            prevSlide();
            resetAutoSlideTimer();
        }
    }
    
    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        
        currentSlide = index;
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update indicators
        const allIndicators = document.querySelectorAll('.carousel-indicator');
        allIndicators.forEach((ind, i) => {
            if (i === currentSlide) {
                ind.classList.add('active');
            } else {
                ind.classList.remove('active');
            }
        });
    }
    
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }
    
    function resetAutoSlideTimer() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
    
    // Add navigation controls if multiple slides
    if (totalSlides > 1) {
        // Create next/prev buttons if needed
        const createNavButton = (className, text, clickHandler) => {
            const button = document.createElement('button');
            button.className = className;
            button.innerHTML = text;
            button.addEventListener('click', () => {
                clickHandler();
                resetAutoSlideTimer();
            });
            return button;
        };
        
        const prevButton = carousel.parentElement.querySelector('.carousel-prev') || 
                          createNavButton('carousel-prev', '&#10094;', prevSlide);
        
        const nextButton = carousel.parentElement.querySelector('.carousel-next') || 
                          createNavButton('carousel-next', '&#10095;', nextSlide);
        
        if (!carousel.parentElement.querySelector('.carousel-prev')) {
            carousel.parentElement.appendChild(prevButton);
        }
        
        if (!carousel.parentElement.querySelector('.carousel-next')) {
            carousel.parentElement.appendChild(nextButton);
        }
    }
}

/**
 * Mobile Menu Toggle
 */
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.navbar-links');
    
    if (!menuToggle || !navLinks) return;
    
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = navLinks.contains(event.target) || menuToggle.contains(event.target);
        
        if (!isClickInside && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
}

/**
 * Gallery Lightbox functionality
 */
function initializeGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (!galleryItems.length) return;
    
    // Create lightbox elements if they don't exist
    let lightbox = document.querySelector('.lightbox');
    
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close">&times;</span>
                <img class="lightbox-image" src="" alt="Gallery image">
                <div class="lightbox-caption"></div>
                <button class="lightbox-prev">&#10094;</button>
                <button class="lightbox-next">&#10095;</button>
            </div>
        `;
        document.body.appendChild(lightbox);
    }
    
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    
    let currentIndex = 0;
    
    // Open lightbox when clicking on gallery item
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            const imgSrc = item.querySelector('img').src;
            const caption = item.querySelector('.gallery-overlay') ? 
                           item.querySelector('.gallery-overlay').textContent : '';
            
            openLightbox(imgSrc, caption, index);
        });
    });
    
    // Close lightbox when clicking on close button or outside the image
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Navigate through images
    lightboxPrev.addEventListener('click', function() {
        navigateLightbox(-1);
    });
    
    lightboxNext.addEventListener('click', function() {
        navigateLightbox(1);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (!lightbox.classList.contains('active')) return;
        
        if (event.key === 'Escape') {
            closeLightbox();
        } else if (event.key === 'ArrowLeft') {
            navigateLightbox(-1);
        } else if (event.key === 'ArrowRight') {
            navigateLightbox(1);
        }
    });
    
    function openLightbox(imgSrc, caption, index) {
        lightboxImage.src = imgSrc;
        lightboxCaption.textContent = caption;
        currentIndex = index;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    function navigateLightbox(direction) {
        currentIndex += direction;
        
        // Loop around if we reach the end or beginning
        if (currentIndex >= galleryItems.length) {
            currentIndex = 0;
        } else if (currentIndex < 0) {
            currentIndex = galleryItems.length - 1;
        }
        
        const newItem = galleryItems[currentIndex];
        const newImgSrc = newItem.querySelector('img').src;
        const newCaption = newItem.querySelector('.gallery-overlay') ? 
                          newItem.querySelector('.gallery-overlay').textContent : '';
        
        lightboxImage.src = newImgSrc;
        lightboxCaption.textContent = newCaption;
    }
}

/**
 * Form Validation
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            let isValid = validateForm(form);
            
            if (!isValid) {
                event.preventDefault();
            }
        });
        
        // Live validation on input
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(input);
            });
            
            // Clear error when typing
            input.addEventListener('input', function() {
                const errorElement = input.parentElement.querySelector('.error-message');
                if (errorElement) {
                    errorElement.remove();
                }
                input.classList.remove('error');
            });
        });
    });
    
    function validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function validateInput(input) {
        // Remove any existing error messages
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        input.classList.remove('error');
        
        let isValid = true;
        let errorMessage = '';
        
        // Check if required
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (input.type === 'email' && input.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation
        if (input.type === 'tel' && input.value.trim()) {
            const phonePattern = /^\d{10}$/;
            if (!phonePattern.test(input.value.replace(/\D/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid 10-digit phone number';
            }
        }
        
        // Number validation
        if (input.type === 'number') {
            const min = parseFloat(input.getAttribute('min'));
            const max = parseFloat(input.getAttribute('max'));
            
            if (!isNaN(min) && parseFloat(input.value) < min) {
                isValid = false;
                errorMessage = `Minimum value is ${min}`;
            }
            
            if (!isNaN(max) && parseFloat(input.value) > max) {
                isValid = false;
                errorMessage = `Maximum value is ${max}`;
            }
        }
        
        // Display error message if invalid
        if (!isValid) {
            input.classList.add('error');
            
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = errorMessage;
            
            input.parentElement.appendChild(errorElement);
        }
        
        return isValid;
    }
}

/**
 * Donation Form Handling
 */
function initializeDonationForm() {
    const donationForm = document.querySelector('.donation-form');
    if (!donationForm) return;
    
    const amountOptions = donationForm.querySelectorAll('.amount-option');
    const customAmountInput = donationForm.querySelector('.custom-amount');
    
    // Toggle active state for amount options
    amountOptions.forEach(option => {
        option.addEventListener('click', function() {
            amountOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Update amount field
            const amount = option.getAttribute('data-amount');
            const amountField = donationForm.querySelector('input[name="amount"]');
            if (amountField) {
                amountField.value = amount;
            }
            
            // Reset custom amount
            if (customAmountInput) {
                customAmountInput.value = '';
            }
        });
    });
    
    // Handle custom amount
    if (customAmountInput) {
        customAmountInput.addEventListener('focus', function() {
            amountOptions.forEach(opt => opt.classList.remove('active'));
        });
        
        customAmountInput.addEventListener('input', function() {
            const amountField = donationForm.querySelector('input[name="amount"]');
            if (amountField) {
                amountField.value = this.value;
            }
        });
    }
}

/**
 * Animate elements when they come into view
 */
function animateOnScroll() {
    const animElements = document.querySelectorAll('.anim-on-scroll');
    
    if (!animElements.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('anim-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    animElements.forEach(element => {
        observer.observe(element);
    });
}
