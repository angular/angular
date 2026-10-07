const esbuild = require('esbuild');
const fs = require('fs/promises');
const path = require('path');

const exactExternalPlugin = {
  name: 'exact-external',
  setup(build) {
    const externals = new Set([
      '@angular/compiler',
      '@angular/compiler-cli',
      '@angular/language-service/api',
    ]);
    build.onResolve({filter: /^@angular\//}, (args) => {
      if (externals.has(args.path)) {
        return {path: args.path, external: true};
      }
    });
  },
};

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
  });

  // 2. Build Server
  console.log('Building server...');
  const repoRoot = path.resolve(__dirname, '..');
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'server/src/server.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    nodePaths: [path.join(__dirname, 'node_modules')],
    outfile: path.join(__dirname, 'dist/server/server.js'),
    external: [
      path.join(__dirname, '../packages/compiler-cli/preprocessor/ng-analyze/index.js'),
      path.join(__dirname, '../packages/compiler-cli/preprocessor/ng-analyze-wasm/ng_analyze.js'),
      'typescript',
    ],
    alias: {
      '@angular/compiler-cli/private/hybrid_analysis': path.join(
        repoRoot,
        'packages/compiler-cli/private/hybrid_analysis.ts',
      ),
      '@angular/compiler-cli/private/migrations': path.join(
        repoRoot,
        'packages/compiler-cli/private/migrations.ts',
      ),
      '@angular/compiler-cli': path.join(repoRoot, 'packages/compiler-cli/index.ts'),
      '@angular/compiler': path.join(repoRoot, 'packages/compiler/index.ts'),
      '@angular/language-service/private': path.join(
        repoRoot,
        'packages/language-service/private.ts',
      ),
      '@angular/language-service/api': path.join(repoRoot, 'packages/language-service/api.ts'),
      '@angular/language-service': path.join(repoRoot, 'packages/language-service/api.ts'),
      '@angular/core': path.join(repoRoot, 'packages/core/index.ts'),
    },
    logOverride: {
      'empty-import-meta': 'silent',
    },
  });

  // 3. Patch Server for import.meta.url compatibility in CJS
  console.log('Patching server bundle...');
  const serverOutPath = path.join(__dirname, 'dist/server/server.js');
  let serverContent = await fs.readFile(serverOutPath, 'utf8');
  serverContent = serverContent.replace(
    /import_meta(\d*)\.url/g,
    "require('url').pathToFileURL(__filename).href",
  );
  serverContent = serverContent.replace(
    /var import_meta(\d*) = \{\};/g,
    "var import_meta$1 = { url: require('url').pathToFileURL(__filename).href };",
  );
  await fs.writeFile(serverOutPath, serverContent);
  console.log('Successfully patched server bundle.');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
