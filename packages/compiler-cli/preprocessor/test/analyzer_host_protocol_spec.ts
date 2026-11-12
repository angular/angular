/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fsSync from 'node:fs';
import {createRequire} from 'node:module';
import * as os from 'node:os';
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

  it('validates and auto-selects wasm for virtual entryPoints and unwraps path ModuleRefs on native', async () => {
    await expectAsync(
      createAnalyzer({
        entryPoints: [{id: '\0virtual:entry', idKind: 'virtual'}],
        backend: 'native',
      }),
    ).toBeRejectedWithError(/Virtual entryPoints cannot be used with backend: 'native'/);

    const loaded = await createAnalyzerWithInfo({
      entryPoints: [{id: '\0virtual:entry', idKind: 'virtual'}],
      wasmBinding: resolveWasmBinding(),
      virtualFiles: {'\0virtual:entry': 'export const V = 1;\n'},
    });
    try {
      expect(loaded.backend).toBe('wasm');
    } finally {
      loaded.analyzer.close();
    }

    const req = createRequire(import.meta.url);
    const dir = fsSync.mkdtempSync(
      path.join(process.env['TEST_TMPDIR'] || os.tmpdir(), 'ngp-mock-native-'),
    );
    const mockNativePath = path.join(dir, 'mock_native.cjs');
    fsSync.writeFileSync(
      mockNativePath,
      [
        'exports.receivedOptions = null;',
        'exports.Analyzer = class {',
        '  constructor(options) {',
        '    exports.receivedOptions = options;',
        '  }',
        '};',
      ].join('\n'),
    );
    try {
      const nativeLoaded = await createAnalyzerWithInfo({
        backend: 'native',
        nativeBinding: mockNativePath,
        entryPoints: ['/app/a.ts', {id: '/app/b.ts', idKind: 'path'}],
      });
      expect(nativeLoaded.backend).toBe('native');
      expect(req(mockNativePath).receivedOptions.entryPoints).toEqual(['/app/a.ts', '/app/b.ts']);
      nativeLoaded.analyzer.close();
    } finally {
      delete req.cache[mockNativePath];
      fsSync.rmSync(dir, {recursive: true, force: true});
    }
  });

  it('skips a wasm build without host request support, frees its instance, and reports wasm-required remedy', async () => {
    // Stands in for wasm-bindgen glue built before the engine supported host requests.
    const req = createRequire(import.meta.url);
    const dir = fsSync.mkdtempSync(
      path.join(process.env['TEST_TMPDIR'] || os.tmpdir(), 'ngp-stale-wasm-'),
    );
    const staleBinding = path.join(dir, 'ng_analyze_wasm.cjs');
    fsSync.writeFileSync(
      staleBinding,
      [
        'exports.freed = 0;',
        'exports.WasmAnalyzer = class {',
        '  free() {',
        '    exports.freed++;',
        '  }',
        '  pump() {}',
        '  analyze() {',
        '    return 1;',
        '  }',
        '};',
      ].join('\n'),
    );

    try {
      // The loader goes on to its remaining candidates, so whether an engine loads at all depends
      // on the environment. If one does, it is not the stale build.
      let caughtError: Error | null = null;
      const loadedFrom = await createAnalyzerWithInfo({
        host: dummyHost,
        wasmBinding: staleBinding,
        entryPoints: [],
      }).then(
        (loaded) => {
          loaded.analyzer.close();
          return loaded.resolvedFrom;
        },
        (err: Error) => {
          caughtError = err;
          return null;
        },
      );

      expect(loadedFrom).not.toBe(staleBinding);
      expect(req(staleBinding).freed).toBe(1);
      if (caughtError !== null) {
        expect((caughtError as Error).message).toContain("'host' requires the 'wasm' backend");
        expect((caughtError as Error).message).not.toContain('NG_EXP_COMPILER_BACKEND');
      }
    } finally {
      delete req.cache[staleBinding];
      fsSync.rmSync(dir, {recursive: true, force: true});
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
    const {host, observedBatches} = createTsTestHost(
      new Map(Object.entries(rawFiles)),
      nodeModulesPath,
    );
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

      expect(observedBatches.some((b) => b.resolve.length > 0)).toBe(true);
      expect(observedBatches.some((b) => b.load.length > 0)).toBe(true);
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

  it('restarts an in-flight getMetadataForFile request when updateFileContent edits the file', async () => {
    const files = new Map<string, string>([
      [
        '/proto/app.ts',
        `import {Component} from '@angular/core';
import {DepDir} from './dep';
@Component({
  selector: 'proto-v1',
  imports: [DepDir],
  template: '<p dep>v1</p>',
})
export class ProtoV1 {}
`,
      ],
      [
        '/proto/dep.ts',
        `import {Directive} from '@angular/core';
@Directive({selector: '[dep]'})
export class DepDir {}
`,
      ],
    ]);
    const {host: baseHost} = createTsTestHost(files, resolveFixtureNodeModules());
    let depLoadStarted!: () => void;
    const depLoadReached = new Promise<void>((resolve) => {
      depLoadStarted = resolve;
    });
    let releaseFirstDepLoad!: () => void;
    const firstDepLoadGate = new Promise<void>((resolve) => {
      releaseFirstDepLoad = resolve;
    });
    let gatedFirstDepLoad = false;

    const host: AnalyzerHost = {
      resolve: (requests) => baseHost.resolve(requests),
      async load(requests) {
        if (!gatedFirstDepLoad && requests.some((r) => r.id === '/proto/dep.ts')) {
          gatedFirstDepLoad = true;
          depLoadStarted();
          await firstDepLoadGate;
        }
        return baseHost.load(requests);
      },
    };

    const analyzer = await createAnalyzer({
      host,
      wasmBinding: resolveWasmBinding(),
      entryPoints: ['/proto/app.ts'],
      optimize: true,
    });

    try {
      const metadataPromise = analyzer.getMetadataForFile('/proto/app.ts');
      await depLoadReached;

      await analyzer.updateFileContent([
        {
          filePath: '/proto/app.ts',
          content: `import {Component} from '@angular/core';
import {DepDir} from './dep';
@Component({
  selector: 'proto-v2',
  imports: [DepDir],
  template: '<p dep>v2</p>',
})
export class ProtoV2 {}
`,
        },
      ]);

      // The restarted lookup completes with `ProtoV2` without waiting for the stalled first batch.
      const meta = await metadataPromise;
      expect(meta?.classes.map((c) => c.className)).toEqual(['ProtoV2']);

      releaseFirstDepLoad();
      const followUp = await analyzer.getMetadataForFile('/proto/app.ts');
      expect(followUp?.classes.map((c) => c.className)).toEqual(['ProtoV2']);
    } finally {
      releaseFirstDepLoad();
      analyzer.close();
    }
  });

  it('preserves processed output cache across virtual edits omitting idKind and switches roots via virtual setEntryPoints', async () => {
    const appId = '\0virtual:app';
    const switchedId = '\0virtual:switched';
    const siblingPath = '/workspace/sibling.ts';
    const sources = new Map<string, string>([
      [
        siblingPath,
        `import {Component} from '@angular/core';
@Component({selector: 'sib-cmp', template: '<p>sibling</p>'})
export class SiblingCmp {}
`,
      ],
      [
        appId,
        `import {Component} from '@angular/core';
@Component({selector: 'virt-app', template: '<p>v1</p>'})
export class VirtAppCmp {}
`,
      ],
      [
        switchedId,
        `import {Component} from '@angular/core';
@Component({selector: 'virt-switched', template: '<p>switched</p>'})
export class VirtSwitchedCmp {}
`,
      ],
    ]);

    const {host: baseHost} = createTsTestHost(sources, resolveFixtureNodeModules());
    const host: AnalyzerHost = {
      resolve: (requests) => baseHost.resolve(requests),
      async load(requests) {
        const fallback = await baseHost.load(requests);
        return requests.map((req, idx) => {
          if (req.id === appId || req.id === switchedId) {
            return {code: sources.get(req.id)!, format: 'ts'};
          }
          return fallback[idx] ?? null;
        });
      },
    };

    const analyzer = await createAnalyzer({
      host,
      wasmBinding: resolveWasmBinding(),
      entryPoints: [siblingPath, {id: appId, idKind: 'virtual'}],
      optimize: true,
    });

    try {
      const compiler = new HybridCompiler(analyzer, {
        optimize: true,
        rootDir: '/workspace',
      });
      const first = await compiler.compile();
      const firstSibling = first.get(siblingPath);
      expect(firstSibling).toBeDefined();
      expect(first.get(appId)!.magicString.toString()).toContain('v1');

      // Two consecutive updates omitting `idKind` on a known virtual ID must not wipe
      // `processedFiles` or mark `siblingPath` dirty.
      const v2 = `import {Component} from '@angular/core';
@Component({selector: 'virt-app', template: '<p>v2</p>'})
export class VirtAppCmp {}
`;
      sources.set(appId, v2);
      await compiler.updateFileContent([{filePath: appId, content: v2}]);
      const second = await compiler.compile();
      expect(second.get(siblingPath)).toBe(firstSibling);
      expect(second.get(appId)!.magicString.toString()).toContain('v2');

      const v3 = `import {Component} from '@angular/core';
@Component({selector: 'virt-app', template: '<p>v3</p>'})
export class VirtAppCmp {}
`;
      sources.set(appId, v3);
      await compiler.updateFileContent([{filePath: appId, content: v3}]);
      const third = await compiler.compile();
      expect(third.get(siblingPath)).toBe(firstSibling);
      expect(third.get(appId)!.magicString.toString()).toContain('v3');

      await compiler.setEntryPoints([{id: switchedId, idKind: 'virtual'}]);
      const fourth = await compiler.compile();
      expect([...fourth.keys()]).toEqual([switchedId]);
      expect(fourth.get(switchedId)!.magicString.toString()).toContain('switched');
    } finally {
      analyzer.close();
    }
  });

  it('cancels an in-flight host batch when breaking out of analyze early and completes concurrent getMetadataForFile', async () => {
    const files = new Map<string, string>([
      ['/early/fast.ts', `export const FAST = 1;\n`],
      ['/early/slow.ts', `import './slow-dep';\nexport const SLOW = 2;\n`],
      [
        '/early/other.ts',
        `import {Component} from '@angular/core';
@Component({selector: 'other-cmp', template: '<b>other</b>'})
export class OtherCmp {}
`,
      ],
    ]);

    const {host: baseHost} = createTsTestHost(files, resolveFixtureNodeModules());
    let slowResolveEntered!: () => void;
    const slowResolveInFlight = new Promise<void>((resolve) => {
      slowResolveEntered = resolve;
    });
    let releaseSlowResolve!: () => void;
    const slowResolveGate = new Promise<void>((resolve) => {
      releaseSlowResolve = resolve;
    });

    const host: AnalyzerHost = {
      async resolve(requests) {
        if (requests.some((r) => r.specifier === './slow-dep')) {
          slowResolveEntered();
          await slowResolveGate;
        }
        return baseHost.resolve(requests);
      },
      load: (requests) => baseHost.load(requests),
    };

    const analyzer = await createAnalyzer({
      host,
      wasmBinding: resolveWasmBinding(),
      entryPoints: ['/early/fast.ts', '/early/slow.ts'],
      optimize: false,
    });

    try {
      let metaPromise!: Promise<Awaited<ReturnType<typeof analyzer.getMetadataForFile>>>;
      for await (const chunk of analyzer.analyze()) {
        expect(chunk.files.map((f) => f.filePath)).toContain('/early/fast.ts');
        await slowResolveInFlight;
        metaPromise = analyzer.getMetadataForFile('/early/other.ts');
        await Promise.resolve();
        break;
      }

      // Completes even though `slowResolveGate` is still un-released.
      const otherMeta = await metaPromise;
      expect(otherMeta?.classes.map((c) => c.className)).toEqual(['OtherCmp']);
    } finally {
      releaseSlowResolve();
      analyzer.close();
    }
  });

  it('falls back to host.load with external: true in getFileContent when an external module is uncached', async () => {
    const extDtsPath = '/nm/@my/ext/index.d.ts';
    const extDtsContent = `import * as i0 from '@angular/core';
export declare class ExtDir {
  static ɵdir: i0.ɵɵDirectiveDeclaration<ExtDir, '[extDir]', never, {}, {}, never, never, true, never>;
}
`;
    const files = new Map<string, string>([
      [
        '/ext/app.ts',
        `import {Component} from '@angular/core';
import {ExtDir} from '@my/ext';
@Component({selector: 'ext-app', imports: [ExtDir], template: '<div extDir></div>'})
export class ExtApp {}
`,
      ],
    ]);

    const {host: baseHost} = createTsTestHost(files, resolveFixtureNodeModules());
    const observedLoadRequests: LoadRequest[] = [];
    let recordLoads = false;

    const host: AnalyzerHost = {
      async resolve(requests) {
        const fallback = await baseHost.resolve(requests);
        return requests.map((req, idx) => {
          if (req.specifier === '@my/ext') {
            return {id: extDtsPath, idKind: 'path', format: 'dts', external: true};
          }
          return fallback[idx] ?? null;
        });
      },
      async load(requests) {
        if (recordLoads) {
          observedLoadRequests.push(...requests);
        }
        const fallback = await baseHost.load(requests);
        return requests.map((req, idx) => {
          if (req.id === extDtsPath) {
            return {code: extDtsContent, format: 'dts'};
          }
          return fallback[idx] ?? null;
        });
      },
    };

    const analyzer = await createAnalyzer({
      host,
      wasmBinding: resolveWasmBinding(),
      entryPoints: ['/ext/app.ts'],
      optimize: true,
    });

    try {
      const meta = await analyzer.getMetadataForFile('/ext/app.ts');
      expect(meta?.classes[0]?.component?.resolvedDeclarations?.map((d) => d.name)).toContain(
        'ExtDir',
      );

      // Evict the engine's cached `ParseFile` for `extDtsPath` while `FileIdInterner` retains its
      // `external: true` metadata, forcing `getFileContent` through `host.load`.
      await analyzer.invalidateFiles([{filePath: extDtsPath, updateType: FileUpdateType.Changed}]);

      recordLoads = true;
      const content = await analyzer.getFileContent(extDtsPath);
      expect(content).toBe(extDtsContent);
      expect(observedLoadRequests).toEqual([{id: extDtsPath, kind: 'module', external: true}]);
    } finally {
      analyzer.close();
    }
  });
});
