/* =========================================================
   KTModal — Metronic Tailwind modal component (vanilla JS port)

   Ported 1:1 from:
   metronic-tailwind-html/src/core/components/modal/modal.ts
   (+ helpers: data.ts, dom.ts, event-handler.ts, utils.ts)

   Public API (same as the original):
     - KTModal.getInstance(element) -> KTModal | null
     - KTModal.getOrCreateInstance(element, config) -> KTModal
     - modal.show() / modal.hide() / modal.toggle(targetElement)
     - modal.isOpen() / modal.getOption(name)
     - KTModal.hide()  (hides every open modal)
     - KTModal.init()  (auto-inits [data-modal="true"] + global handlers)

   Data attributes (same as the original):
     - data-modal="true"                 marks the modal root
     - data-modal-toggle="#selector"     toggles the modal
     - data-modal-dismiss="true"         closes the owning modal
     - data-modal-zindex="90"            base z-index
     - data-modal-backdrop="false"       disable backdrop
     - data-modal-backdrop-static="true" backdrop click won't close
     - data-modal-disable-scroll="false" keep page scrollable
     - data-modal-persistent="true"      ignore click-away/esc hiding
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     HELPERS — data.ts
     ========================================================= */

  const KTElementMap = new Map();

  const KTData = {
    set(element, key, value) {
      if (!KTElementMap.has(element)) {
        KTElementMap.set(element, new Map());
      }
      KTElementMap.get(element).set(key, value);
    },

    get(element, key) {
      if (KTElementMap.has(element)) {
        return KTElementMap.get(element).get(key) || null;
      }
      return null;
    },

    has(element, key) {
      return KTElementMap.has(element) && KTElementMap.get(element).has(key);
    },

    remove(element, key) {
      if (!KTElementMap.has(element) || !KTElementMap.get(element).has(key)) {
        return;
      }
      KTElementMap.get(element).delete(key);
      if (KTElementMap.get(element).size === 0) {
        KTElementMap.delete(element);
      }
    }
  };

  /* =========================================================
     HELPERS — utils.ts
     ========================================================= */

  const KTUtils = {
    geUID(prefix) {
      return (prefix || "") + Math.floor(Math.random() * new Date().getTime());
    },

    parseDataAttribute(value) {
      if (value === "true") return true;
      if (value === "false") return false;
      if (value === Number(value).toString()) return Number(value);
      if (value === "" || value === "null") return null;
      if (typeof value !== "string") return value;

      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (e) {
        return value;
      }
    },

    parseSelector(selector) {
      if (selector && window.CSS && window.CSS.escape) {
        selector = selector.replace(
          /#([^\s"'#]+)/g,
          (match, id) => "#" + window.CSS.escape(id)
        );
      }
      return selector;
    },

    uncapitalize(value) {
      return value.charAt(0).toLowerCase() + value.slice(1);
    },

    camelCase(value) {
      return value.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    }
  };

  /* =========================================================
     HELPERS — dom.ts (only what the modal needs)
     ========================================================= */

  const KTDom = {
    isElement(element) {
      return Boolean(element && element instanceof HTMLElement);
    },

    remove(element) {
      if (this.isElement(element) && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    },

    addClass(element, className) {
      const classNames = className.split(" ");
      if (element.classList) {
        for (let i = 0; i < classNames.length; i++) {
          if (classNames[i] && classNames[i].length > 0) {
            element.classList.add(classNames[i].trim());
          }
        }
      }
    },

    getCssProp(element, prop) {
      return (
        element ? window.getComputedStyle(element).getPropertyValue(prop) : ""
      ).replace(" ", "");
    },

    transitionEnd(element, callback) {
      const duration = this.getCSSTransitionDuration(element);
      setTimeout(() => {
        callback();
      }, duration);
    },

    getCSSTransitionDuration(element) {
      return (
        parseFloat(window.getComputedStyle(element).transitionDuration) * 1000
      );
    },

    reflow(element) {
      element.offsetHeight;
    },

    getHighestZindex(element) {
      let position;
      let value;

      while (element && element !== document.documentElement) {
        position = element.style.position;

        if (
          position === "absolute" ||
          position === "relative" ||
          position === "fixed"
        ) {
          value = parseInt(element.style.zIndex);

          if (!isNaN(value) && value !== 0) {
            return value;
          }
        }

        element = element.parentNode;
      }

      return 1;
    },

    getDataAttributes(element, prefix) {
      if (!element) {
        return {};
      }

      prefix = KTUtils.camelCase(prefix);

      const attributes = {};
      const keys = Object.keys(element.dataset).filter(key =>
        key.startsWith(prefix)
      );

      for (const key of keys) {
        let normalizedKey = key.replace(prefix, "");
        normalizedKey = KTUtils.uncapitalize(normalizedKey);
        attributes[normalizedKey] = KTUtils.parseDataAttribute(
          element.dataset[key]
        );
      }

      return attributes;
    }
  };

  /* =========================================================
     HELPERS — event-handler.ts (delegated events)
     ========================================================= */

  const KTDelegatedEventHandlers = {};

  const KTEventHandler = {
    on(element, selector, eventName, handler) {
      if (element === null) {
        return null;
      }

      const eventId = KTUtils.geUID("event");

      KTDelegatedEventHandlers[eventId] = event => {
        const targets = element.querySelectorAll(selector);
        let target = event.target;

        while (target && target !== element) {
          for (let i = 0, j = targets.length; i < j; i++) {
            if (target === targets[i]) {
              handler.call(this, event, target);
            }
          }
          target = target.parentNode;
        }
      };

      element.addEventListener(eventName, KTDelegatedEventHandlers[eventId]);

      return eventId;
    },

    off(element, eventName, eventId) {
      if (!element || KTDelegatedEventHandlers[eventId] === null) {
        return;
      }
      element.removeEventListener(eventName, KTDelegatedEventHandlers[eventId]);
      delete KTDelegatedEventHandlers[eventId];
    }
  };

  /* =========================================================
     COMPONENT — component.ts (base class, only what's needed)
     ========================================================= */

  class KTComponent {
    constructor() {
      this._name = "";
      this._defaultConfig = {};
      this._config = {};
      this._events = new Map();
      this._uid = null;
      this._element = null;
    }

    _init(element) {
      if (!KTDom.isElement(element)) {
        return;
      }

      this._element = element;
      this._events = new Map();
      this._uid = KTUtils.geUID(this._name);

      KTData.set(this._element, this._name, this);
    }

    _fireEvent(eventType, payload = null) {
      const listeners = this._events.get(eventType);

      if (listeners) {
        listeners.forEach(callback => callback(payload));
      }
    }

    _dispatchEvent(eventType, payload = null) {
      const event = new CustomEvent(eventType, {
        detail: { payload: payload },
        bubbles: true,
        cancelable: true,
        composed: false
      });

      if (!this._element) return;
      this._element.dispatchEvent(event);
    }

    _getOption(name) {
      return this._config[name];
    }

    _buildConfig(config = {}) {
      if (!this._element) return;

      this._config = Object.assign(
        {},
        this._defaultConfig,
        KTDom.getDataAttributes(this._element, this._name),
        config
      );
    }

    on(eventType, callback) {
      const eventId = KTUtils.geUID();

      if (!this._events.get(eventType)) {
        this._events.set(eventType, new Map());
      }

      this._events.get(eventType).set(eventId, callback);

      return eventId;
    }

    off(eventType, eventId) {
      const listeners = this._events.get(eventType);

      if (listeners) {
        listeners.delete(eventId);
      }
    }

    getOption(name) {
      return this._getOption(name);
    }

    getElement() {
      if (!this._element) return null;
      return this._element;
    }
  }

  /* =========================================================
     COMPONENT — modal.ts
     ========================================================= */

  class KTModal extends KTComponent {
    constructor(element, config) {
      super();

      this._name = "modal";
      this._defaultConfig = {
        zindex: "90",
        backdrop: true,
        backdropClass:
          "transition-all duration-300 fixed inset-0 bg-gray-900 opacity-25",
        backdropStatic: false,
        keyboard: true,
        disableScroll: true,
        persistent: false,
        focus: true,
        hiddenClass: "hidden"
      };
      this._config = this._defaultConfig;
      this._isOpen = false;
      this._isTransitioning = false;
      this._backdropElement = null;
      this._targetElement = null;

      if (KTData.has(element, this._name)) return;

      this._init(element);
      this._buildConfig(config);
      this._handlers();
    }

    _handlers() {
      this._element.addEventListener("click", event => {
        if (this._element !== event.target) return;

        if (this._getOption("backdropStatic") === false) {
          this._hide();
        }
      });
    }

    _toggle(targetElement) {
      const payload = { cancel: false };
      this._fireEvent("toggle", payload);
      this._dispatchEvent("toggle", payload);
      if (payload.cancel === true) {
        return;
      }

      if (this._isOpen === true) {
        this._hide();
      } else {
        this._show(targetElement);
      }
    }

    _show(targetElement) {
      if (this._isOpen || this._isTransitioning) {
        return;
      }

      if (targetElement) this._targetElement = targetElement;

      const payload = { cancel: false };
      this._fireEvent("show", payload);
      this._dispatchEvent("show", payload);
      if (payload.cancel === true) {
        return;
      }

      KTModal.hide();

      if (!this._element) return;
      this._isTransitioning = true;
      this._element.setAttribute("role", "dialog");
      this._element.setAttribute("aria-modal", "true");
      this._element.setAttribute("tabindex", "-1");

      this._setZindex();
      if (this._getOption("backdrop") === true) this._createBackdrop();

      if (this._getOption("disableScroll")) {
        document.body.style.overflow = "hidden";
      }

      this._element.style.display = "block";
      KTDom.reflow(this._element);
      this._element.classList.add("open");
      this._element.classList.remove(this._getOption("hiddenClass"));

      KTDom.transitionEnd(this._element, () => {
        this._isTransitioning = false;
        this._isOpen = true;

        if (this._getOption("focus") === true) {
          this._autoFocus();
        }

        this._fireEvent("shown");
        this._dispatchEvent("shown");
      });
    }

    _hide() {
      if (!this._element) return;
      if (this._isOpen === false || this._isTransitioning) {
        return;
      }

      const payload = { cancel: false };
      this._fireEvent("hide", payload);
      this._dispatchEvent("hide", payload);
      if (payload.cancel === true) {
        return;
      }

      this._isTransitioning = true;
      this._element.removeAttribute("role");
      this._element.removeAttribute("aria-modal");
      this._element.removeAttribute("tabindex");
      if (this._getOption("disableScroll")) {
        document.body.style.overflow = "";
      }

      KTDom.reflow(this._element);
      this._element.classList.remove("open");

      if (this._getOption("backdrop") === true) {
        this._deleteBackdrop();
      }

      KTDom.transitionEnd(this._element, () => {
        if (!this._element) return;

        this._isTransitioning = false;
        this._isOpen = false;
        this._element.style.display = "";
        this._element.classList.add(this._getOption("hiddenClass"));

        this._fireEvent("hidden");
        this._dispatchEvent("hidden");
      });
    }

    _setZindex() {
      let zindex = parseInt(this._getOption("zindex"));

      if (parseInt(KTDom.getCssProp(this._element, "z-index")) > zindex) {
        zindex = parseInt(KTDom.getCssProp(this._element, "z-index"));
      }

      if (KTDom.getHighestZindex(this._element) > zindex) {
        zindex = KTDom.getHighestZindex(this._element) + 1;
      }

      this._element.style.zIndex = String(zindex);
    }

    _autoFocus() {
      if (!this._element) return;
      const input = this._element.querySelector("[data-modal-input-focus]");
      if (!input) return;
      input.focus();
    }

    _createBackdrop() {
      if (!this._element) return;
      const zindex = parseInt(KTDom.getCssProp(this._element, "z-index"));
      this._backdropElement = document.createElement("DIV");
      this._backdropElement.style.zIndex = (zindex - 1).toString();
      this._backdropElement.classList.add("modal-backdrop");
      document.body.append(this._backdropElement);
      KTDom.reflow(this._backdropElement);
      KTDom.addClass(
        this._backdropElement,
        this._getOption("backdropClass")
      );
    }

    _deleteBackdrop() {
      if (!this._backdropElement) return;

      KTDom.reflow(this._backdropElement);
      this._backdropElement.style.opacity = "0";

      KTDom.transitionEnd(this._backdropElement, () => {
        if (!this._backdropElement) return;
        KTDom.remove(this._backdropElement);
      });
    }

    toggle(targetElement) {
      return this._toggle(targetElement);
    }

    show(targetElement) {
      return this._show(targetElement);
    }

    hide() {
      return this._hide();
    }

    getTargetElement() {
      return this._targetElement;
    }

    isOpen() {
      return this._isOpen;
    }

    static getInstance(element) {
      if (!element) return null;

      if (KTData.has(element, "modal")) {
        return KTData.get(element, "modal");
      }

      if (element.getAttribute("data-modal") === "true") {
        return new KTModal(element);
      }

      return null;
    }

    static getOrCreateInstance(element, config) {
      return this.getInstance(element) || new KTModal(element, config);
    }

    static hide() {
      const elements = document.querySelectorAll("[data-modal]");

      elements.forEach(element => {
        const modal = KTModal.getInstance(element);

        if (modal && modal.isOpen()) {
          modal.hide();
        }
      });
    }

    static handleToggle() {
      KTEventHandler.on(
        document.body,
        "[data-modal-toggle]",
        "click",
        (event, target) => {
          event.stopPropagation();

          const selector = target.getAttribute("data-modal-toggle");
          if (!selector) return;

          const modalElement = document.querySelector(selector);
          const modal = KTModal.getInstance(modalElement);
          if (modal) {
            modal.toggle(target);
          }
        }
      );
    }

    static handleDismiss() {
      KTEventHandler.on(
        document.body,
        "[data-modal-dismiss]",
        "click",
        (event, target) => {
          event.stopPropagation();

          const modalElement = target.closest("[data-modal]");
          if (modalElement) {
            const modal = KTModal.getInstance(modalElement);
            if (modal) {
              modal.hide();
            }
          }
        }
      );
    }

    static handleClickAway() {
      document.addEventListener("click", event => {
        const modalElement = document.querySelector(".open[data-modal]");
        if (!modalElement) return;

        const modal = KTModal.getInstance(modalElement);
        if (!modal) return;

        if (modal.getOption("persistent")) return;

        if (modal.getOption("backdrop")) return;

        if (
          modalElement !== event.target &&
          modal.getTargetElement() !== event.target &&
          modalElement.contains(event.target) === false
        ) {
          modal.hide();
        }
      });
    }

    static handleKeyword() {
      document.addEventListener("keydown", event => {
        const modalElement = document.querySelector(".open[data-modal]");
        const modal = KTModal.getInstance(modalElement);
        if (!modal) {
          return;
        }

        // if esc key was not pressed in combination with ctrl or alt or shift
        if (
          event.key === "Escape" &&
          !(event.ctrlKey || event.altKey || event.shiftKey)
        ) {
          modal.hide();
        }

        if (event.code === "Tab" && !event.metaKey) {
          return;
        }
      });
    }

    static createInstances() {
      const elements = document.querySelectorAll('[data-modal="true"]');

      elements.forEach(element => {
        if (!KTData.has(element, "modal")) {
          new KTModal(element);
        }
      });
    }

    static init() {
      KTModal.createInstances();

      if (window.KT_MODAL_INITIALIZED !== true) {
        KTModal.handleToggle();
        KTModal.handleDismiss();
        KTModal.handleClickAway();
        KTModal.handleKeyword();
        window.KT_MODAL_INITIALIZED = true;
      }
    }
  }

  window.KTModal = KTModal;
})();
