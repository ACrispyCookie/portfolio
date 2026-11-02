import { defineConfig } from '@playwright/test';

const executablePath =
  process.env.CHROME_PATH ?? `${process.env.HOME}/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome`;

const webkitEnv = { ...process.env, GST_PLUGIN_PATH: `${process.env.HOME}/.local/webkit-libs/usr/lib/aarch64-linux-gnu/gstreamer-1.0` } as Record<string, string>;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4321 --ignore-lock',
    url: 'http://localhost:4321',
    reuseExistingServer: false, // never test a leftover server holding an old build
    timeout: 180_000,
  },
  projects: [
    { name: 'phone', use: { launchOptions: { executablePath }, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'desktop', use: { launchOptions: { executablePath }, viewport: { width: 1440, height: 900 } } },
    // tablets: just above the 760px phone breakpoint, and the 1024 landscape between the two grids
    { name: 'tablet', use: { launchOptions: { executablePath }, viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true } },
    { name: 'tablet-landscape', use: { launchOptions: { executablePath }, viewport: { width: 1024, height: 768 }, isMobile: true, hasTouch: true } },
    // Safari's engine (WebKit). On this machine it needs the libraries unpacked into ~/.local/webkit-libs
    // (linked into Playwright's WebKit lib folder) and their GStreamer plugins.
    { name: 'webkit-phone', use: { browserName: 'webkit', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, launchOptions: { env: webkitEnv } } },
    { name: 'webkit-desktop', use: { browserName: 'webkit', viewport: { width: 1440, height: 900 }, launchOptions: { env: webkitEnv } } },
  ],
});
