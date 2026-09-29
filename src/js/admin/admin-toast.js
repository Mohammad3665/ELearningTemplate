/**
 * Admin Toast Notification System
 * Usage:
 *   showToast('success', 'دسته‌بندی با موفقیت ایجاد شد');
 *   showToast('error', 'خطا در ذخیره‌سازی');
 *   showToast('warning', 'فیلد نام اجباری است');
 *   showToast('info', 'در حال بارگذاری...');
 */
(function () {
    'use strict';

    const TOAST_DURATION = 4000; // ms

    const ICONS = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="size-4"><path d="M20 6 9 17l-5-5"/></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="size-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="size-4"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="size-4"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`
    };

    const STYLES = {
        success: {
            icon: 'bg-green-500/10 text-green-600',
            bar: 'bg-green-500'
        },
        error: {
            icon: 'bg-red-500/10 text-red-600',
            bar: 'bg-red-500'
        },
        warning: {
            icon: 'bg-yellow-500/10 text-yellow-600',
            bar: 'bg-yellow-500'
        },
        info: {
            icon: 'bg-blue-400/10 text-blue-500',
            bar: 'bg-blue-400'
        }
    };

    // ---------- Container ----------
    function getContainer() {
        let container = document.getElementById('admin-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'admin-toast-container';
            container.className =
                'fixed bottom-4 left-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(container);
        }
        return container;
    }

    // ---------- Create Toast Element ----------
    function createToastElement(type, message, duration) {
        const style = STYLES[type] || STYLES.info;
        const icon = ICONS[type] || ICONS.info;

        const toast = document.createElement('div');
        toast.className =
            'pointer-events-auto relative flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 overflow-hidden rounded-xl border border-border bg-white p-3.5 shadow-lg';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-20px)';
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

        toast.innerHTML = `
    <div class="flex size-8 shrink-0 items-center justify-center rounded-full ${style.icon}">
      ${icon}
    </div>
    <div class="flex-1 pt-1">
      <p class="text-xs font-medium leading-5 text-dark">${message}</p>
    </div>
    <button type="button" class="toast-close -m-1 shrink-0 cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-dark" aria-label="بستن">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-3.5">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
      </svg>
    </button>
    <span class="toast-bar absolute bottom-0 right-0 h-0.5 w-full origin-right ${style.bar}"
          style="animation: toast-progress ${duration}ms linear forwards;"></span>
  `;

        return toast;
    }

    // ---------- Show Toast ----------
    function showToast(type, message, options = {}) {
        const duration = options.duration ?? TOAST_DURATION;
        const container = getContainer();
        const toast = createToastElement(type, message, duration);

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        const bar = toast.querySelector('.toast-bar');

        const remove = () => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-20px)';
            setTimeout(() => toast.remove(), 300);
        };

        if (bar && duration > 0) {
            bar.addEventListener('animationend', remove, { once: true });
        } else if (duration > 0) {
            setTimeout(remove, duration);
        }

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn?.addEventListener('click', remove);

        toast.addEventListener('mouseenter', () => {
            if (bar && duration > 0) {
                bar.style.animationPlayState = 'paused';
            }
        });

        toast.addEventListener('mouseleave', () => {
            if (bar && duration > 0) {
                bar.style.animationPlayState = 'running';
            }
        });

        return toast;
    }

    // ---------- Public API ----------
    window.showToast = showToast;
    window.toast = {
        success: (msg, opts) => showToast('success', msg, opts),
        error: (msg, opts) => showToast('error', msg, opts),
        warning: (msg, opts) => showToast('warning', msg, opts),
        info: (msg, opts) => showToast('info', msg, opts),
    };
})();