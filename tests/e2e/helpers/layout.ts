import type { Page } from '@playwright/test';

// The site has two layouts, split at 760px (spec §7.1). Tests pick by layout, not by device name, so tablets get the right checks.
export const PHONE_MAX = 760;
export const phoneLayout = (page: Page) => page.viewportSize()!.width <= PHONE_MAX;
// The timeline keeps its three lanes only above 1280px (and only while they fit); below that it uses the rails.
export const RAILS_MAX = 1280;
export const railsLayout = (page: Page) => page.viewportSize()!.width <= RAILS_MAX;
// The hero's two full columns (photo + Now | name + widget) exist only above 1100px.
export const heroColumns = (page: Page) => page.viewportSize()!.width > 1100;
