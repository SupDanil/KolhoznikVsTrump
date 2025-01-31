import { defineConfig } from 'vite';

export default defineConfig({
    base: '/KolhoznikVsTrump/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: 'index.html'
        }
    }
});
