/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const esbuild = require('esbuild');
const path = require('path');

async function build() {
  // 1. Build Client
  console.log('Building client...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'client/src/extension.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: path.join(__dirname, 'dist/client/extension.js'),
    external: ['vscode'],
    sourcemap: true,
  });

  // 2. Build Server
  console.log('Building server...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'server/src/server.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    nodePaths: [path.join(__dirname, 'node_modules')],
    outfile: path.join(__dirname, 'dist/server/server.js'),
    tsconfig: path.join(__dirname, 'server/esbuild-tsconfig.json'),
    external: ['typescript', '@typescript/native-preview', '@typescript/native-preview/*'],
    banner: {
      js: "const __ngp_import_meta_url = require('node:url').pathToFileURL(__filename).href;",
    },
    define: {
      'import.meta.url': '__ngp_import_meta_url',
    },
    sourcemap: true,
  });

  console.log('Successfully built client and server bundles.');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
