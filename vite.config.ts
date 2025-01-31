import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',  // Убедитесь, что путь указан правильно
        rollupOptions: {
            input: 'index.html'  // Убедитесь, что входной файл указан корректно
        }
    }
});
