import "@testing-library/jest-dom/vitest";

// Polyfill ResizeObserver for jsdom (needed by Radix UI Slider)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
