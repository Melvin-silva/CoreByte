(function () {
    const TOAST_DURATION = 5000;
    const TOAST_CLOSE_DURATION = 260;

    function closeToast(toast) {
        if (!toast || toast.hidden) return;

        toast.classList.add('toast-closing');

        window.setTimeout(() => {
            if (toast.dataset.reusable === 'true') {
                toast.hidden = true;
                toast.classList.remove('toast-closing');
                return;
            }

            toast.remove();
        }, TOAST_CLOSE_DURATION);
    }

    function scheduleToast(toast) {
        if (!toast || toast.hidden) return;

        window.clearTimeout(toast.corebyteToastTimer);
        toast.corebyteToastTimer = window.setTimeout(() => closeToast(toast), TOAST_DURATION);
    }

    window.showCoreByteToast = function (toast, message) {
        if (!toast) return;

        if (message) {
            toast.textContent = message;
        }

        toast.dataset.reusable = 'true';
        toast.classList.remove('toast-closing');
        toast.hidden = false;
        scheduleToast(toast);
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.toast-message:not([hidden])').forEach(scheduleToast);
    });
})();
