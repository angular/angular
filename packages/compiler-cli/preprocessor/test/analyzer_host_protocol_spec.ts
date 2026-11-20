/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fsSync from 'node:fs';
import * as path from 'node:path';
import ts from 'typescript';
import {
  createAnalyzer,
  createAnalyzerWithInfo,
  FileUpdateType,
  HybridCompiler,
  type AnalyzerHost,
  type LoadRequest,
  type LoadResult,
  type ModuleFormat,
  type ResolveRequest,
  type ResolveResult,
} from '../api.js';
import {resolveFixtureNodeModules, resolveWasmBinding} from './utils.js';

function inferModuleFormat(filePath: string): ModuleFormat | undefined {
  if (filePath.endsWith('.d.ts') || filePath.endsWith('.d.mts') || filePath.endsWith('.d.cts')) {
    return 'dts';
  }
  const ext = path.posix.extname(filePath).toLowerCase();
  switch (ext) {
    case '.ts':
    case '.mts':
    case '.cts':
      return 'ts';
    case '.tsx':
      return 'tsx';
    case '.js':
    case '.mjs':
    case '.cjs':
      return 'js';
    case '.jsx':
      return 'jsx';
    default:
      return undefined;
  }
}

/**
 * Builds an asynchronous TypeScript-style {@link AnalyzerHost} backed by an in-memory `files` map
 * plus `nodeModulesRoot` on disk for framework `.d.ts` packages (`@angular/core`, `@angular/common`).
 */
function createTsTestHost(
  files: Map<string, string>,
  nodeModulesRoot: string,
): {
  host: AnalyzerHost;
  observedBatches: Array<{resolve: readonly ResolveRequest[]; load: readonly LoadRequest[]}>;
} {
  const normalizedNodeModules = nodeModulesRoot.replace(/\\/g, '/');
  const observedBatches: Array<{
    resolve: readonly ResolveRequest[];
    load: readonly LoadRequest[];
  }> = [];

  const fileExists = (fileName: string): boolean => {
    const posixName = fileName.replace(/\\/g, '/');
    if (files.has(posixName)) {
      return true;
    }
    if (posixName.startsWith(normalizedNodeModules + '/')) {
      return fsSync.existsSync(fileName);
    }
    return false;
  };

  const readFile = (fileName: string): string | undefined => {
    const posixName = fileName.replace(/\\/g, '/');
    const inMemory = files.get(posixName);
    if (inMemory !== undefined) {
      return inMemory;
    }
    if (posixName.startsWith(normalizedNodeModules + '/') && fsSync.existsSync(fileName)) {
      return fsSync.readFileSync(fileName, 'utf8');
    }
    return undefined;
  };

  const tsHost: ts.ModuleResolutionHost = {
    fileExists,
    readFile,
    directoryExists(dirName: string): boolean {
      const posixDir = dirName.replace(/\\/g, '/').replace(/\/+$/, '');
      const prefix = posixDir + '/';
      for (const key of files.keys()) {
        if (key.startsWith(prefix)) {
          return true;
        }
      }
      if (
        posixDir === normalizedNodeModules ||
        posixDir.startsWith(normalizedNodeModules + '/') ||
        normalizedNodeModules.startsWith(prefix)
      ) {
        return fsSync.existsSync(dirName);
      }
      return false;
    },
    getCurrentDirectory: () => '/',
  };

  const compilerOptions: ts.CompilerOptions = {
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
  };

  const resolveOne = (req: ResolveRequest): ResolveResult | null => {
    // Direct relative lookup for non-TS component resources (`.html`, `.css`) before TS module
    // resolution.
    if (req.specifier.startsWith('./') || req.specifier.startsWith('../')) {
      const exactCandidate = path.posix.resolve(path.posix.dirname(req.importer), req.specifier);
      if (files.has(exactCandidate) && inferModuleFormat(exactCandidate) === undefined) {
        return {id: exactCandidate, idKind: 'path'};
      }
    }

    const fromInMemory = ts.resolveModuleName(req.specifier, req.importer, compilerOptions, tsHost);
    let resolvedFile = fromInMemory.resolvedModule?.resolvedFileName;
    if (!resolvedFile && !req.specifier.startsWith('.') && !req.specifier.startsWith('/')) {
      const anchor = path.posix.join(normalizedNodeModules, '__anchor__.ts');
      resolvedFile = ts.resolveModuleName(req.specifier, anchor, compilerOptions, tsHost)
        .resolvedModule?.resolvedFileName;
    }
    if (!resolvedFile) {
      return null;
    }
    const posixResolved = resolvedFile.replace(/\\/g, '/');
    const external =
      posixResolved.startsWith(normalizedNodeModules + '/') ||
      posixResolved.includes('/node_modules/');
    return {
      id: posixResolved,
      idKind: 'path',
      format: inferModuleFormat(posixResolved),
      external,
    };
  };

  const host: AnalyzerHost = {
    async resolve(requests) {
      observedBatches.push({resolve: requests, load: []});
      await Promise.resolve();
      return requests.map(resolveOne);
    },
    async load(requests) {
      observedBatches.push({resolve: [], load: requests});
      await Promise.resolve();
      return requests.map((req): LoadResult | null => {
        const code = readFile(req.id);
        if (code === undefined) {
          return null;
        }
        return {
          code,
          format: req.kind === 'module' ? inferModuleFormat(req.id) : undefined,
        };
      });
    },
  };

  return {host, observedBatches};
}

describe('LoadAnalyzerOptions.host validation and backend selection', () => {
  const dummyHost: AnalyzerHost = {
    resolve: async (reqs) => reqs.map(() => null),
    load: async (reqs) => reqs.map(() => null),
  };

  it('rejects incompatible options when host is provided', async () => {
    await expectAsync(createAnalyzer({host: dummyHost, backend: 'native'})).toBeRejectedWithError(
      /cannot be used with backend: 'native'/,
    );

    await expectAsync(
      createAnalyzer('/app/tsconfig.json', {host: dummyHost}),
    ).toBeRejectedWithError(/'host' cannot be combined with 'tsconfigPath'/);

    await expectAsync(createAnalyzer({host: dummyHost, hostFs: null})).toBeRejectedWithError(
      /'host' cannot be combined with 'hostFs'/,
    );

    await expectAsync(createAnalyzer({host: dummyHost, defaultHost: {}})).toBeRejectedWithError(
      /'host' cannot be combined with 'defaultHost'/,
    );

    await expectAsync(
      createAnalyzer({host: dummyHost, nodeModulesPathOverride: '/nm'}),
    ).toBeRejectedWithError(/'host' cannot be combined with 'nodeModulesPathOverride'/);

    await expectAsync(createAnalyzer({host: dummyHost, allowedSources: []})).toBeRejectedWithError(
      /'host' cannot be combined with 'allowedSources'/,
    );
  });

  it('auto-selects the wasm backend when host is provided without an explicit backend', async () => {
    const loaded = await createAnalyzerWithInfo({
      host: dummyHost,
      wasmBinding: resolveWasmBinding(),
      entryPoints: [],
    });
    try {
      expect(loaded.backend).toBe('wasm');
    } finally {
      loaded.analyzer.close();
    }
  });
});

describe('AnalyzerHost end-to-end compilation and parity', () => {
  it('produces byte-identical emitted JS to DefaultFsHost across NgModules, standalone components, and external .d.ts libraries', async () => {
    const rawFiles: Record<string, string> = {
      '/parity/app.module.ts': `import {NgModule} from '@angular/core';
import {BannerCmp} from './banner.component';
import {UpperPipe} from './shared/upper.pipe';
import {ExtBadgeDir} from '@my/ui';

@NgModule({
  declarations: [BannerCmp],
  imports: [UpperPipe, ExtBadgeDir],
  exports: [BannerCmp, UpperPipe, ExtBadgeDir],
})
export class AppModule {}
`,
      '/parity/banner.component.ts': `import {Component} from '@angular/core';

@Component({
  selector: 'app-banner',
  standalone: false,
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerCmp {
  title = 'hello';
}
`,
      '/parity/banner.component.html': `<div extBadge>{{ title | upper }}</div>`,
      '/parity/banner.component.css': `.banner { color: navy; }`,
      '/parity/shared/upper.pipe.ts': `import {Pipe} from '@angular/core';

@Pipe({name: 'upper'})
export class UpperPipe {
  transform(value: string): string {
    return value.toUpperCase();
  }
}
`,
      '/parity/page.component.ts': `import {Component} from '@angular/core';
import {AppModule} from './app.module';

@Component({
  selector: 'app-page',
  template: '<app-banner></app-banner>',
  imports: [AppModule],
})
export class PageCmp {}
`,
      '/parity/node_modules/@my/ui/package.json': JSON.stringify({
        name: '@my/ui',
        typings: './index.d.ts',
      }),
      '/parity/node_modules/@my/ui/index.d.ts': `import * as i0 from '@angular/core';
export declare class ExtBadgeDir {
  static ɵdir: i0.ɵɵDirectiveDeclaration<ExtBadgeDir, '[extBadge]', never, {}, {}, never, never, true, never>;
}
`,
    };

    const entryPoints = ['/parity/app.module.ts', '/parity/page.component.ts'];
    const nodeModulesPath = resolveFixtureNodeModules();
    const wasmBinding = resolveWasmBinding();

    const defaultAnalyzer = await createAnalyzer({
      backend: 'wasm',
      wasmBinding,
      entryPoints,
      virtualFiles: rawFiles,
      optimize: true,
      defaultHost: {nodeModulesPathOverride: nodeModulesPath},
    });
    const {host} = createTsTestHost(new Map(Object.entries(rawFiles)), nodeModulesPath);
    const hostAnalyzer = await createAnalyzer({
      host,
      wasmBinding,
      entryPoints,
      optimize: true,
    });

    try {
      const defaultCompiler = new HybridCompiler(defaultAnalyzer, {
        optimize: true,
        rootDir: '/parity',
      });
      const hostCompiler = new HybridCompiler(hostAnalyzer, {
        optimize: true,
        rootDir: '/parity',
      });

      const readFromMap = (p: string) => rawFiles[p];
      const defaultOut = await defaultCompiler.compile({readFile: readFromMap});
      const hostOut = await hostCompiler.compile();

      expect([...hostOut.keys()].sort()).toEqual([...defaultOut.keys()].sort());
      expect(hostOut.size).toBe(4);
      for (const [filePath, expectedProcessed] of defaultOut) {
        const actualProcessed = hostOut.get(filePath)!;
        expect(actualProcessed.magicString.toString()).toBe(
          expectedProcessed.magicString.toString(),
        );
      }
    } finally {
      defaultAnalyzer.close();
      hostAnalyzer.close();
    }
  });

  it('compiles virtual ModuleRef entry points and emits verbatim virtual specifiers and debug filePath', async () => {
    const appId = '\0virtual:app';
    const childId = '\0virtual:child?v=1';
    const nodeModulesPath = resolveFixtureNodeModules();
    const coreDtsPath = path.posix.join(
      nodeModulesPath.replace(/\\/g, '/'),
      '@angular/core/index.d.ts',
    );

    const sources = new Map<string, string>([
      [
        appId,
        `import {Component} from '@angular/core';
import {ChildCmp} from './child';

@Component({
  selector: 'app-root',
  template: '<child-cmp></child-cmp>',
  imports: [ChildCmp],
})
export class AppCmp {}
`,
      ],
      [
        childId,
        `import {Component} from '@angular/core';

@Component({
  selector: 'child-cmp',
  template: '<span>virtual child</span>',
})
export class ChildCmp {}
`,
      ],
    ]);

    const {host: tsFallbackHost} = createTsTestHost(new Map(), nodeModulesPath);
    const host: AnalyzerHost = {
      async resolve(requests) {
        const fallback = await tsFallbackHost.resolve(requests);
        return requests.map((req, idx) => {
          if (req.specifier === './child') {
            return {id: childId, idKind: 'virtual', format: 'ts'};
          }
          if (req.specifier === '@angular/core' && fsSync.existsSync(coreDtsPath)) {
            return {id: coreDtsPath, idKind: 'path', format: 'dts', external: true};
          }
          return fallback[idx] ?? null;
        });
      },
      async load(requests) {
        const fallback = await tsFallbackHost.load(requests);
        return requests.map((req, idx) => {
          const virtualCode = sources.get(req.id);
          if (virtualCode !== undefined) {
            return {code: virtualCode, format: 'ts'};
          }
          return fallback[idx] ?? null;
        });
      },
    };

    const analyzer = await createAnalyzer({
      host,
      wasmBinding: resolveWasmBinding(),
      entryPoints: [{id: appId, idKind: 'virtual'}],
      optimize: true,
    });

    try {
      const compiler = new HybridCompiler(analyzer, {
        optimize: true,
        rootDir: '/workspace',
      });
      const compiled = await compiler.compile();
      expect(compiled.has(appId)).toBe(true);
      expect(compiled.has(childId)).toBe(true);
      expect(await compiler.getFileContent(appId)).toBe(sources.get(appId)!);

      const appJs = compiled.get(appId)!.magicString.toString();
      expect(appJs).toContain("filePath: '\\0virtual:app'");
      const meta = await analyzer.getMetadataForFile({id: appId, idKind: 'virtual'});
      expect(meta?.idKind).toBe('virtual');
      expect(
        meta?.classes[0]?.component?.resolvedDeclarations?.[0]?.ref.typecheckImport?.specifier,
      ).toBe(childId);
    } finally {
      analyzer.close();
    }
  });

  it('tolerates per-slot host errors and re-resolves previously unresolved imports on Created invalidation', async () => {
    const files = new Map<string, string>([
      [
        '/proto/app.ts',
        `import {Component} from '@angular/core';
import {BrokenDir} from './broken';
import {LateDir} from './late';

@Component({
  selector: 'proto-app',
  template: '<div brokenDir lateDir></div>',
  imports: [BrokenDir, LateDir],
})
export class ProtoApp {}
`,
      ],
    ]);
    let failBroken = true;
    const {host: baseHost} = createTsTestHost(files, resolveFixtureNodeModules());
    const host: AnalyzerHost = {
      async resolve(requests) {
        const resolved = await baseHost.resolve(requests);
        return requests.map((req, i) => {
          if (failBroken && req.specifier === './broken') {
            return {error: 'Bundler plugin failed to resolve ./broken'};
          }
          return resolved[i] ?? null;
        });
      },
      load: (requests) => baseHost.load(requests),
    };

    const analyzer = await createAnalyzer({
      host,
      wasmBinding: resolveWasmBinding(),
      entryPoints: ['/proto/app.ts'],
      optimize: true,
    });

    try {
      const compiler = new HybridCompiler(analyzer, {optimize: true, rootDir: '/proto'});
      const declarationNames = async () => {
        const meta = await analyzer.getMetadataForFile('/proto/app.ts');
        return meta?.classes[0]?.component?.resolvedDeclarations?.map((d) => d.name) ?? [];
      };

      // The engine reports nothing for an unresolved import, whether the host returned `null`
      // or an `{error}` slot, so both directives are simply missing from the component's scope.
      await compiler.compile();
      const before = await declarationNames();
      expect(before).not.toContain('BrokenDir');
      expect(before).not.toContain('LateDir');

      failBroken = false;
      files.set(
        '/proto/broken.ts',
        `import {Directive} from '@angular/core';
@Directive({selector: '[brokenDir]'})
export class BrokenDir {}
`,
      );
      files.set(
        '/proto/late.ts',
        `import {Directive} from '@angular/core';
@Directive({selector: '[lateDir]'})
export class LateDir {}
`,
      );

      await compiler.invalidateFiles([
        {filePath: '/proto/late.ts', updateType: FileUpdateType.Created},
      ]);
      await compiler.compile();
      expect(compiler.getDiagnostics()).toEqual([]);
      const after = await declarationNames();
      expect(after).toContain('BrokenDir');
      expect(after).toContain('LateDir');
    } finally {
      analyzer.close();
    }
  });
});
