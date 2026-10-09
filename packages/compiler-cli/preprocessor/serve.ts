/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// tslint:disable:no-console

import {spawnSync} from 'child_process';
import * as esbuild from 'esbuild';
import * as http from 'http';
import {createRequire} from 'module';
import {createReadStream, existsSync, readFileSync} from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'path';
import ts from 'typescript';
import {fileURLToPath} from 'url';

import {resolveDistPath} from './serve_paths.js';
import {resolveWorkspaceConfig} from './src/workspace.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const rootDir = __dirname;
const args = process.argv.slice(2);
const optimize = args.includes('--optimize');
const useWasm = args.includes('--wasm');

const pathExists = (p: string): Promise<boolean> =>
  fs.access(p).then(
    () => true,
    () => false,
  );

async function main() {
  let workspaceRoot: string;
  let projectRoot: string;
  let tsconfigPath: string;
  let entryPointRelSrc = 'src/main.ts';
  let indexHtmlSrc: string | null = null;
  let assetsToCopy: Array<string | {input: string; glob: string; output?: string}> = [];

  const targetArg = args.find((arg) => !arg.startsWith('--'));
  if (!targetArg) {
    console.error('Usage: serve <project-dir|angular.json|tsconfig.json> [--optimize] [--wasm]');
    process.exit(1);
  }

  const targetPath = path.resolve(process.cwd(), targetArg);
  const workspaceConfig = await resolveWorkspaceConfig(targetPath);
  if (workspaceConfig) {
    workspaceRoot = workspaceConfig.workspaceRoot;
    projectRoot = workspaceConfig.projectRoot;
    tsconfigPath = workspaceConfig.tsConfig;
    entryPointRelSrc = path.relative(workspaceRoot, workspaceConfig.entryPoint);
    indexHtmlSrc = workspaceConfig.indexHtml;
    assetsToCopy = workspaceConfig.assets;
  } else {
    tsconfigPath = targetPath;
    try {
      const st = await fs.stat(targetPath);
      if (st.isDirectory()) {
        tsconfigPath = path.join(targetPath, 'tsconfig.app.json');
      }
    } catch {}
    projectRoot = path.dirname(tsconfigPath);
    workspaceRoot = projectRoot;
    indexHtmlSrc = path.join(projectRoot, 'src/index.html');
    assetsToCopy = [
      {input: 'src/assets', glob: '**/*'},
      {input: 'public', glob: '**/*'},
      'src/favicon.ico',
    ];
  }

  if (!(await pathExists(workspaceRoot))) {
    console.error(`Error: Workspace directory not found at ${workspaceRoot}`);
    process.exit(1);
  }

  const intermediateDir = path.join(workspaceRoot, 'dist-ngp');
  const distDir = path.join(workspaceRoot, 'dist');

  // `ngp.ts` exports `run` but has no CLI entry point; the argv handling lives in `main.ts`.
  const ngpScriptPath = path.join(rootDir, 'main.ts');
  const ngpJsPath = path.join(rootDir, 'main.js');
  const useCompiledMain = await pathExists(ngpJsPath);

  console.log(`Building app...`);
  console.log(`  Source: ${workspaceRoot}`);
  console.log(`  Intermediate: ${intermediateDir}`);
  console.log(`  Output: ${distDir}`);

  await Promise.all([
    fs.rm(intermediateDir, {recursive: true, force: true}),
    fs.rm(distDir, {recursive: true, force: true}),
  ]);
  await fs.mkdir(distDir, {recursive: true});

  // 1. Run ngp
  console.log(`\n\x1b[36m[1/3] Running ngp...\x1b[0m`);
  const ngpArgs = [
    ...process.execArgv,
    useCompiledMain ? ngpJsPath : ngpScriptPath,
    tsconfigPath,
    '--out',
    intermediateDir,
    '--root',
    workspaceRoot,
  ];

  if (optimize) ngpArgs.push('--optimize');
  if (useWasm) ngpArgs.push('--wasm');

  const ngpSpawn = spawnSync(process.execPath, ngpArgs, {
    cwd: rootDir,
    stdio: 'inherit',
    env: {...process.env},
  });

  if (ngpSpawn.status !== 0) {
    console.error('ngp failed');
    process.exit(1);
  }

  // Copy package.json to intermediate directory for ESBuild resolution fallback
  const pkgJsonSrc = path.join(workspaceRoot, 'package.json');
  const pkgJsonDest = path.join(intermediateDir, 'package.json');

  if (await pathExists(pkgJsonSrc)) {
    await fs.copyFile(pkgJsonSrc, pkgJsonDest);
  }

  // 2. Copy index.html and inject script
  console.log(`\n\x1b[36m[2/3] Copying assets...\x1b[0m`);

  if (indexHtmlSrc && (await pathExists(indexHtmlSrc))) {
    const indexHtmlDest = path.join(distDir, path.basename(indexHtmlSrc));
    let htmlContent = await fs.readFile(indexHtmlSrc, 'utf-8');
    if (htmlContent.includes('</body>')) {
      htmlContent = htmlContent.replace(
        '</body>',
        '<script type="module" src="bundle.js"></script></body>',
      );
    } else {
      htmlContent += '<script type="module" src="bundle.js"></script>';
    }
    await fs.writeFile(indexHtmlDest, htmlContent);
    console.log(`  Copied ${path.basename(indexHtmlSrc)} with bundle injection`);
  } else if (indexHtmlSrc) {
    console.log(`  Warning: ${indexHtmlSrc} not found`);
  }

  // Basic support for injecting the primary global stylesheet
  const globalCss = workspaceConfig?.styles?.find(
    (s: any) => typeof s === 'string' && s.endsWith('.css'),
  ) as string | undefined;

  if (globalCss) {
    const srcStylePath = path.resolve(workspaceRoot, globalCss);

    if (await pathExists(srcStylePath)) {
      const styleFileName = path.basename(srcStylePath);
      await fs.copyFile(srcStylePath, path.join(distDir, styleFileName));

      const indexHtmlDest = indexHtmlSrc ? path.join(distDir, path.basename(indexHtmlSrc)) : null;

      if (indexHtmlDest && (await pathExists(indexHtmlDest))) {
        let html = await fs.readFile(indexHtmlDest, 'utf-8');
        if (html.includes('</head>')) {
          html = html.replace(
            '</head>',
            `  <link rel="stylesheet" href="${styleFileName}">\n</head>`,
          );
          await fs.writeFile(indexHtmlDest, html);
          console.log(`  Copied and injected global stylesheet ${styleFileName}`);
        }
      }
    }
  }

  // Copy assets in parallel
  await Promise.all(
    assetsToCopy.map(async (asset) => {
      if (typeof asset === 'string') {
        const srcPath = path.resolve(workspaceRoot, asset);
        if (await pathExists(srcPath)) {
          const destPath = path.join(distDir, path.basename(srcPath));
          const st = await fs.stat(srcPath);
          if (st.isDirectory()) {
            await fs.cp(srcPath, destPath, {recursive: true});
          } else {
            await fs.copyFile(srcPath, destPath);
          }
          console.log(`  Copied ${asset}`);
        }
      } else {
        const srcDir = path.resolve(workspaceRoot, asset.input);
        if (await pathExists(srcDir)) {
          const st = await fs.stat(srcDir);
          if (st.isDirectory()) {
            const outDir = asset.output ? path.join(distDir, asset.output) : distDir;
            await fs.mkdir(outDir, {recursive: true});
            if (asset.glob === '**/*') {
              await fs.cp(srcDir, outDir, {recursive: true});
              console.log(`  Copied directory ${asset.input}`);
            } else {
              console.warn(`  Warning: Complex asset globs not fully supported yet: ${asset.glob}`);
            }
          }
        }
      }
    }),
  );

  // 3. Bundle with esbuild
  console.log(`\n\x1b[36m[3/3] Bundling with esbuild...\x1b[0m`);

  const ngpPackagesDir = path.join(workspaceRoot, 'packages');
  const esbuildTsconfigPath = path.join(intermediateDir, 'tsconfig.esbuild.json');
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    console.error(`Error reading tsconfig: ${configFile.error.messageText}`);
    process.exit(1);
  }
  const originalTsconfig = configFile.config;
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath),
    undefined,
    tsconfigPath,
  );

  const resolvedCompilerOptions = parsedConfig.options;
  const resolvedPaths = resolvedCompilerOptions.paths || {};
  const baseToUse = resolvedCompilerOptions.baseUrl || path.dirname(tsconfigPath);
  const relativeBase = path.relative(workspaceRoot, baseToUse);

  const adjustedPaths: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(resolvedPaths)) {
    if (Array.isArray(value)) {
      adjustedPaths[key] = value.map((p: string) => path.join(relativeBase, p));
    }
  }

  const esbuildTsconfig = {
    ...originalTsconfig,
    extends: undefined,
    compilerOptions: {
      ...resolvedCompilerOptions,
      baseUrl: '.',
      paths: {
        ...adjustedPaths,
        '@angular/*': [path.relative(intermediateDir, path.join(ngpPackagesDir, '*/index'))],
      },
    },
    files: undefined,
    include: ['**/*.ts'],
    references: undefined,
  };

  await fs.writeFile(esbuildTsconfigPath, JSON.stringify(esbuildTsconfig, null, 2));

  const srcAssetsDir = path.join(workspaceRoot, 'src', 'assets');
  const destAssetsDir = path.join(intermediateDir, 'src', 'assets');

  if (await pathExists(srcAssetsDir)) {
    await fs.cp(srcAssetsDir, destAssetsDir, {recursive: true});
  }

  const entryPoint = path.join(intermediateDir, entryPointRelSrc);

  if (!(await pathExists(entryPoint))) {
    console.error(`Error: Entry point not found at ${entryPoint}`);
    process.exit(1);
  }

  try {
    await esbuild.build({
      entryPoints: [{in: entryPoint, out: 'bundle'}],
      bundle: true,
      outdir: distDir,
      splitting: true,
      format: 'esm',
      sourcemap: true,
      tsconfig: esbuildTsconfigPath,
      nodePaths: [path.join(workspaceRoot, 'node_modules')],
      plugins: [
        {
          name: 'angular-linker',
          setup(build) {
            const LINKER_DECLARATION_PREFIX = 'ɵɵngDeclare';
            let linkerPluginCreator: any;

            async function requiresLinking(filePath: string, source: string): Promise<boolean> {
              if (/[\\/]@angular[\\/](?:compiler|core)|\.tsx?$/.test(filePath)) {
                return false;
              }
              return source.includes(LINKER_DECLARATION_PREFIX);
            }

            build.onLoad({filter: /\.[cm]?js$/}, async (args) => {
              const source = await fs.readFile(args.path, 'utf8');

              if (!(await requiresLinking(args.path, source))) {
                return undefined;
              }

              linkerPluginCreator ??= (await import('@angular/compiler-cli/linker/babel'))
                .createEs2015LinkerPlugin;

              const linkerPlugin = linkerPluginCreator({
                linkerJitMode: false,
                sourceMapping: false,
                fileSystem: {
                  resolve: path.resolve,
                  exists: existsSync,
                  dirname: path.dirname,
                  relative: path.relative,
                  readFile: readFileSync,
                },
              });

              const babel = require('@babel/core');
              const result = await babel.transformAsync(source, {
                filename: args.path,
                configFile: false,
                babelrc: false,
                plugins: [linkerPlugin],
                sourceMaps: 'inline',
              });
              return {contents: result.code, loader: 'js'};
            });
          },
        },
      ],
    });
  } catch (e) {
    console.error('Esbuild failed', e);
    process.exit(1);
  }

  // 4. Serve
  console.log(`\n\x1b[36m[4/4] Serving...\x1b[0m`);
  const PORT = 8080;

  const server = http.createServer(async (req, res) => {
    let filePath = resolveDistPath(distDir, req.url);
    if (filePath === null) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    let stat = await fs.stat(filePath).catch(() => null);
    if (stat?.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      stat = await fs.stat(filePath).catch(() => null);
    }
    if (!stat) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const contentType =
      {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.map': 'application/json',
        '.ico': 'image/x-icon',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
      }[path.extname(filePath)] || 'text/plain';

    res.writeHead(200, {'Content-Type': contentType});
    createReadStream(filePath).pipe(res);
  });

  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`Error: Port ${PORT} is already in use.`);
      console.error(`Please free port ${PORT} and try again.`);
      process.exit(1);
    } else {
      console.error(e);
    }
  });

  server.listen(PORT, () => {
    console.log(`\x1b[32mServer running at http://localhost:${PORT}/\x1b[0m`);
    console.log('Press Ctrl+C to stop');
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
