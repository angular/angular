const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs/promises');

const outdir = path.join(__dirname, 'dist');

async function build() {
  console.log('Building E2E tests...');
  await fs.rm(outdir, {recursive: true, force: true});

  await esbuild.build({
    entryPoints: [
      path.join(__dirname, 'src/index.ts'),
      path.join(__dirname, 'src/hover.ts'),
      path.join(__dirname, 'src/getTcb.ts'),
      path.join(__dirname, 'src/definition.ts'),
      path.join(__dirname, 'src/diagnostics.ts'),
      path.join(__dirname, 'src/diagnostics_ext.ts'),
    ],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outdir: path.join(__dirname, 'dist'),
    external: ['vscode'],
  });
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
