
/* ==========================================
   SERVORA - MAIN WEBSITE JAVASCRIPT
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ======================================
       1. HOME PAGE MOBILE MENU
    ====================================== */

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", function () {
            navLinks.classList.toggle("mobile-open");
        });

        // Close menu after clicking a navigation link
        navLinks.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                navLinks.classList.remove("mobile-open");
            });
        });
    }


    /* ======================================
       2. CUSTOMER PAGE MOBILE MENU
    ====================================== */

    const customerMenu = document.getElementById("customerMenu");
    const customerNav = document.getElementById("customerNav");

    if (customerMenu && customerNav) {

        customerMenu.addEventListener("click", function () {
            customerNav.classList.toggle("show");
        });

        customerNav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                customerNav.classList.remove("show");
            });
        });
    }


    /* ======================================
       3. SERVICE SEARCH
    ====================================== */

    const searchButton = document.getElementById("searchButton");

    if (searchButton) {

        searchButton.addEventListener("click", function () {

            const serviceInput = document.querySelector(
                ".service-search input"
            );

            const locationInput = document.querySelector(
                '.search-field input[placeholder="Enter your location"]'
            );

            const service = serviceInput
                ? serviceInput.value.trim()
                : "";

            const location = locationInput
                ? locationInput.value.trim()
                : "";

            if (!service) {
                alert("Please enter the service you need.");

                if (serviceInput) {
                    serviceInput.focus();
                }

                return;
            }

            const params = new URLSearchParams();

            params.set("service", service);

            if (location) {
                params.set("location", location);
            }

            window.location.href =
                "customer.html?" + params.toString();

        });
    }


    /* ======================================
       4. AUTOMATIC SERVICE SLIDER
    ====================================== */

    const slider = document.getElementById("serviceSlider");

    const nextButton = document.getElementById("slideNext");
    const prevButton = document.getElementById("slidePrev");

    if (slider) {

        let autoSlide = null;
        let isPaused = false;

        const slideSpeed = 3500;
        const slideGap = 18;

        function getSlideAmount() {

            const card = slider.querySelector(".service-slide");

            if (!card) {
                return 0;
            }

            return card.getBoundingClientRect().width + slideGap;
        }


        // Move slider to the right
        function slideNext() {

            const amount = getSlideAmount();

            if (!amount) return;

            const maxScroll =
                slider.scrollWidth - slider.clientWidth;

            if (slider.scrollLeft >= maxScroll - 10) {

                slider.scrollTo({
                    left: 0,
                    behavior: "smooth"
                });

            } else {

                slider.scrollBy({
                    left: amount,
                    behavior: "smooth"
                });

            }
        }


        // Move slider to the left
        function slidePrevious() {

            const amount = getSlideAmount();

            if (!amount) return;

            if (slider.scrollLeft <= 10) {

                slider.scrollTo({
                    left: slider.scrollWidth,
                    behavior: "smooth"
                });

            } else {

                slider.scrollBy({
                    left: -amount,
                    behavior: "smooth"
                });

            }
        }


        // Start automatic movement
        function startAutoSlide() {

            stopAutoSlide();

            if (
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches
            ) {
                return;
            }

            autoSlide = setInterval(function () {

                if (!isPaused && !document.hidden) {
                    slideNext();
                }

            }, slideSpeed);
        }


        // Stop automatic movement
        function stopAutoSlide() {

            if (autoSlide) {
                clearInterval(autoSlide);
                autoSlide = null;
            }
        }


        // Previous and next buttons
        if (nextButton) {

            nextButton.addEventListener("click", function () {
                slideNext();
            });

        }

        if (prevButton) {

            prevButton.addEventListener("click", function () {
                slidePrevious();
            });

        }


        // Pause on desktop hover
        slider.addEventListener("mouseenter", function () {
            isPaused = true;
        });

        slider.addEventListener("mouseleave", function () {
            isPaused = false;
        });


        // Pause while customer touches slider
        slider.addEventListener("touchstart", function () {
            isPaused = true;
        }, { passive: true });

        slider.addEventListener("touchend", function () {

            setTimeout(function () {
                isPaused = false;
            }, 1200);

        }, { passive: true });


        // Pause when browser tab is hidden
        document.addEventListener("visibilitychange", function () {

            if (document.hidden) {
                isPaused = true;
            } else {
                isPaused = false;
            }

        });


        startAutoSlide();

    }


    /* ======================================
       5. RIGHT TO LEFT SCROLL ANIMATION
    ====================================== */

    const revealElements = document.querySelectorAll(
        ".category-card, " +
        ".popular-card, " +
        ".inspiration-large, " +
        ".inspiration-small, " +
        ".service-slide"
    );

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            function (entries, observer) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


        revealElements.forEach(function (element, index) {

            element.classList.add("reveal-left");

            element.style.transitionDelay =
                (index % 3) * 100 + "ms";

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(function (element) {
            element.classList.add("visible");
        });

    }


    /* ======================================
       6. CLOSE MENUS ON OUTSIDE CLICK
    ====================================== */

    document.addEventListener("click", function (event) {

        if (
            navLinks &&
            menuToggle &&
            !navLinks.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            navLinks.classList.remove("mobile-open");
        }

        if (
            customerNav &&
            customerMenu &&
            !customerNav.contains(event.target) &&
            !customerMenu.contains(event.target)
        ) {
            customerNav.classList.remove("show");
        }

    });


    /* ======================================
       7. FOOTER CURRENT YEAR
    ====================================== */

    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    console.log("SERVORA website JavaScript loaded successfully.");

});
