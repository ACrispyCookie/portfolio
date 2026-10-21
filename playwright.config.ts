import { defineConfig } from '@playwright/test';

const executablePath =
  process.env.CHROME_PATH ?? `${process.env.HOME}/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4321', launchOptions: { executablePath } },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4321 --ignore-lock',
    url: 'http://localhost:4321',
    reuseExistingServer: false, // never test a leftover server holding an old build
    timeout: 180_000,
  },
  projects: [
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    // tablets: just above the 760px phone breakpoint, and the 1024 landscape between the two grids
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true } },
    { name: 'tablet-landscape', use: { viewport: { width: 1024, height: 768 }, isMobile: true, hasTouch: true } },
  ],
});
