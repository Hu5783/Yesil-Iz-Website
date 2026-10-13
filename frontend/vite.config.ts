import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 3023 },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
        adminLogin: 'admin_login.html',
      },
    },
  },
});