/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Only parse example templates.
    './src/content/examples/**/*.{html,ts}',
  ],
  // Scope utility classes to example previews.
  important: '.docs-example-viewer-preview',
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    // Disable Tailwind base styles.
    preflight: false,
  },
  darkMode: ['selector', '.docs-dark-mode'],
};
