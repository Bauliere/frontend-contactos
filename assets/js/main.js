import { App } from './App.js';

const startApp = () => {
    const app = new App();
    app.start();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp, { once: true });
} else {
    startApp();
}
