/* ============================================================
   Admin Layout Behaviors
   Shared by all admin pages. Handles:
   - Desktop sidebar collapse (body.admin-sidebar-collapsed;
     all visuals live in src/css/style.css)
   - Mobile drawer (open/close, backdrop, ESC)
   - Sidebar accordion menu ([data-accordion-toggle])
   - Admin user dropdown (#admin-user-button)

   Conventions follow src/js/main.js (IIFE + class toggling).
   ============================================================ */
(function () {
  "use strict";

  /* ============================================
     Sidebar Collapse (desktop)
     The button only flips the body class; the expanded/collapsed
     states, transitions and hover-overlay are styled in
     src/css/style.css (.admin-sidebar rules).
     ============================================ */
  const sidebar = document.querySelector(".admin-sidebar");
  const sidebarToggle = document.querySelector("#admin-sidebar-toggle");

  const accordionToggles = document.querySelectorAll(
    "[data-accordion-toggle]"
  );

  let openAccordionIds = [];
  let isSidebarTransitioning = false;

  function waitForSidebarExpand(callback) {
    let done = false;

    function finish() {
      if (done) return;
      done = true;
      sidebar.removeEventListener("transitionend", handler);
      clearTimeout(timeoutId);
      callback();
    }

    function handler(event) {
      if (event.propertyName !== "width") return;
      finish();
    }

    sidebar.addEventListener("transitionend", handler);

    // fallback: اگه به هر دلیلی transitionend فایر نشد (مثلاً حالت‌های خیلی سریع)
    const timeoutId = setTimeout(finish, 350); // کمی بیشتر از مدت transition (0.3s) در CSS
  }

  /**
   * Save currently open accordion panels.
   */
  function saveOpenAccordions() {
    openAccordionIds = [];

    accordionToggles.forEach(function (toggle) {
      if (toggle.getAttribute("aria-expanded") === "true") {
        openAccordionIds.push(
          toggle.getAttribute("aria-controls")
        );
      }
    });
  }

  /**
   * Close all accordion panels (animated via max-height).
   */
  function closeAllAccordions() {
    accordionToggles.forEach(function (toggle) {
      const panelId = toggle.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);
      const chevron = toggle.querySelector(".admin-menu-chevron");

      if (!panel) return;

      panel.style.maxHeight = "";
      toggle.setAttribute("aria-expanded", "false");

      if (chevron) chevron.classList.remove("rotate-180");
    });
  }

  /**
   * Restore previously open accordion panels (animated via max-height).
   */
  function restoreOpenAccordions() {
    accordionToggles.forEach(function (toggle) {
      const panelId = toggle.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);
      const chevron = toggle.querySelector(".admin-menu-chevron");

      if (!panel) return;

      const shouldOpen = openAccordionIds.includes(panelId);

      panel.style.maxHeight = shouldOpen ? panel.scrollHeight + "px" : "";
      toggle.setAttribute("aria-expanded", String(shouldOpen));

      if (chevron) chevron.classList.toggle("rotate-180", shouldOpen);
    });
  }

  /**
   * Permanently collapse sidebar.
   */
  function collapseSidebar() {
    isSidebarTransitioning = true;
    saveOpenAccordions();
    closeAllAccordions();

    document.body.classList.add(
      "admin-sidebar-collapsed",
      "admin-sidebar-manually-collapsed"
    );

    sidebar.classList.remove("admin-sidebar-hover-expanded");
    sidebarToggle.setAttribute("aria-expanded", "false");

    setTimeout(function () { isSidebarTransitioning = false; }, 350);
  }

  /**
   * Permanently expand sidebar.
   */
  function expandSidebar() {
    isSidebarTransitioning = true;
    if (sidebar.classList.contains("admin-sidebar-hover-expanded")) {
      saveOpenAccordions();
    }
    document.body.classList.remove(
      "admin-sidebar-collapsed",
      "admin-sidebar-manually-collapsed"
    );

    sidebar.classList.remove("admin-sidebar-hover-expanded");
    sidebarToggle.setAttribute("aria-expanded", "true");

    waitForSidebarExpand(function () {
      isSidebarTransitioning = false;
      restoreOpenAccordions();
    });
  }

  /* ---------------------------------------------------------
     Toggle button
     --------------------------------------------------------- */

  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener("click", function (event) {
      event.stopPropagation();

      const isCollapsed =
        document.body.classList.contains(
          "admin-sidebar-collapsed"
        );

      if (isCollapsed) {
        expandSidebar();
      } else {
        collapseSidebar();
      }
    });
  }

  function handleSidebarEnter() {
    const isManuallyCollapsed = document.body.classList.contains(
      "admin-sidebar-manually-collapsed"
    );
    if (!isManuallyCollapsed) return;

    isSidebarTransitioning = true;

    sidebar.classList.add("admin-sidebar-hover-expanded");
    waitForSidebarExpand(function () {
      isSidebarTransitioning = false;
      restoreOpenAccordions();
    });
  }

  function handleSidebarLeave(event) {
    const isManuallyCollapsed = document.body.classList.contains(
      "admin-sidebar-manually-collapsed"
    );
    if (!isManuallyCollapsed) return;

    // اگه داره به سمت دکمه می‌ره، نبند
    if (event.relatedTarget && sidebarToggle.contains(event.relatedTarget)) return;

    isSidebarTransitioning = true;
    saveOpenAccordions();
    closeAllAccordions();
    sidebar.classList.remove("admin-sidebar-hover-expanded");
    setTimeout(function () { isSidebarTransitioning = false; }, 350);
  }

  function handleToggleLeave(event) {
    const isManuallyCollapsed = document.body.classList.contains(
      "admin-sidebar-manually-collapsed"
    );
    if (!isManuallyCollapsed) return;

    // اگه داره برمی‌گرده داخل سایدبار، نبند
    if (event.relatedTarget && sidebar.contains(event.relatedTarget)) return;

    isSidebarTransitioning = true;
    saveOpenAccordions();
    closeAllAccordions();
    sidebar.classList.remove("admin-sidebar-hover-expanded");
    setTimeout(function () { isSidebarTransitioning = false; }, 350);
  }

  sidebar.addEventListener("mouseenter", handleSidebarEnter);
  sidebar.addEventListener("mouseleave", handleSidebarLeave);
  sidebarToggle.addEventListener("mouseleave", handleToggleLeave);


  /* ============================================
     Mobile Drawer
     ============================================ */
  const menuButton = document.querySelector("#admin-mobile-menu-button");
  const closeButton = document.querySelector("#admin-close-menu-button");
  const mobileMenu = document.querySelector("#admin-mobile-menu");
  const menuOverlay = document.querySelector("#admin-menu-overlay");

  function openMenu() {
    // Slide in drawer from right (RTL)
    mobileMenu.classList.remove("translate-x-full");
    // Show backdrop
    menuOverlay.classList.remove("pointer-events-none", "opacity-0");
    menuOverlay.classList.add("opacity-100");

    // Prevent body scrolling
    document.body.style.overflow = "hidden";
    menuButton.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    // Slide out drawer to right
    mobileMenu.classList.add("translate-x-full");
    // Hide backdrop
    menuOverlay.classList.remove("opacity-100");
    menuOverlay.classList.add("opacity-0", "pointer-events-none");

    // Restore body scrolling
    document.body.style.overflow = "";
    menuButton.setAttribute("aria-expanded", "false");
  }

  if (menuButton && mobileMenu && menuOverlay) {
    menuButton.addEventListener("click", openMenu);
    if (closeButton) closeButton.addEventListener("click", closeMenu);
    menuOverlay.addEventListener("click", closeMenu);

    // Close menu on ESC key press
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        !mobileMenu.classList.contains("translate-x-full")
      ) {
        closeMenu();
      }
    });
  }

  /* ============================================
     Sidebar Accordion Menu (animated via max-height)
     Markup contract:
       <button data-accordion-toggle aria-controls="panel-id">
         <svg class="admin-menu-chevron ...">
       </button>
       <ul id="panel-id" class="admin-menu-accordion ...">
     ============================================ */
  accordionToggles.forEach(function (toggle) {
    const panelId = toggle.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const chevron = toggle.querySelector(".admin-menu-chevron");

    toggle.addEventListener("click", function (event) {
      // نادیده گرفتن کلیک‌های مصنوعی (نه از کاربر) وقتی سایدبار در حال transition عرضه
      if (isSidebarTransitioning && !event.isTrusted) return;

      const isOpen = toggle.getAttribute("aria-expanded") === "true";

      panel.style.maxHeight = isOpen ? "" : panel.scrollHeight + "px";
      toggle.setAttribute("aria-expanded", String(!isOpen));

      if (chevron) chevron.classList.toggle("rotate-180", !isOpen);

      saveOpenAccordions();
    });
  });

  /* ============================================
     Admin User Dropdown
     ============================================ */
  const userButton = document.querySelector("#admin-user-button");
  const userDropdown = document.querySelector("#admin-user-dropdown");
  const userChevron = document.querySelector("#admin-user-chevron");

  function openDropdown() {
    userDropdown.classList.remove("invisible", "opacity-0");
    userButton.setAttribute("aria-expanded", "true");
    if (userChevron) userChevron.classList.add("rotate-180");
  }

  function closeDropdown() {
    userDropdown.classList.add("invisible", "opacity-0");
    userButton.setAttribute("aria-expanded", "false");
    if (userChevron) userChevron.classList.remove("rotate-180");
  }

  if (userButton && userDropdown) {
    userButton.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = !userDropdown.classList.contains("invisible");
      if (isOpen) closeDropdown();
      else openDropdown();
    });

    // Close when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !userDropdown.classList.contains("invisible") &&
        !userDropdown.contains(e.target)
      ) {
        closeDropdown();
      }
    });

    // Close on ESC
    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Escape" &&
        !userDropdown.classList.contains("invisible")
      ) {
        closeDropdown();
      }
    });
  }
})();