/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs/promises';
import * as path from 'path';
import {resolveFixtureNodeModules, resolveWasmBinding, TestFile} from './utils.js';
import {createAnalyzer, FileUpdateType} from '../api.js';
import {makeClassKey} from '../src/compiler-utils.js';
import {HybridCompiler} from '../src/hybrid_compiler.js';
import {buildTypeCheckingConfig} from '../src/tcb.js';

async function createCompiler(
  testName: string,
  files: TestFile[],
  incremental = true,
): Promise<{compiler: HybridCompiler; root: string}> {
  // `Cache` keeps an uppercase component in every path, which the analyzer case-folds on
  // case-insensitive platforms.
  const tmpBase = process.env['TEST_TMPDIR'] || path.resolve(process.cwd(), '.tmp');
  const root = path.resolve(tmpBase, 'Cache_Invalidation', testName);
  await fs.rm(root, {recursive: true, force: true});
  const virtualFiles: Record<string, string> = {};
  for (const f of files) {
    const full = path.join(root, f.path);
    await fs.mkdir(path.dirname(full), {recursive: true});
    await fs.writeFile(full, f.content);
    virtualFiles[full] = f.content;
  }

  const tsconfigPath = path.join(root, 'tsconfig.json');
  const analyzer = await createAnalyzer(tsconfigPath, {
    backend: 'wasm',
    wasmBinding: resolveWasmBinding(),
    virtualFiles,
    optimize: true,
    nodeModulesPathOverride: resolveFixtureNodeModules(),
  });
  const compiler = new HybridCompiler(analyzer, {
    optimize: true,
    incremental,
    tcbConfig: buildTypeCheckingConfig({strictTemplates: true}),
  });
  await compiler.init();
  return {compiler, root};
}

const TSCONFIG: TestFile = {
  path: 'tsconfig.json',
  content: JSON.stringify({compilerOptions: {}, files: ['main.ts']}),
};
const MAIN: TestFile = {path: 'main.ts', content: 'export const main = 1;\n'};

function componentSource(template: string): string {
  return `
    import {Component} from '@angular/core';
    @Component({selector: 'app-loose', template: '${template}'})
    export class LooseComponent {
      value = 'x';
    }
  `;
}

function directiveSource(input: string): string {
  return `
    import {Directive, Input} from '@angular/core';
    @Directive({selector: '[dir]'})
    export class Dir {
      @Input() ${input}: string = '';
    }
  `;
}

const DEPENDENT_SOURCE = `
  import {Component} from '@angular/core';
  import {Dir} from './Shared/dir';
  @Component({
    selector: 'app-dependent',
    imports: [Dir],
    template: '<div dir [first]="value" [second]="value"></div>',
  })
  export class DependentComponent {
    value = 'x';
  }
`;

describe('HybridCompiler fileCache invalidation', () => {
  it('drops the entry of an edited file whose path the analyzer case-folds', async () => {
    const {compiler, root} = await createCompiler('edited_file', [
      TSCONFIG,
      MAIN,
      {path: 'Feature/loose.ts', content: componentSource('<span>{{value}}</span>')},
    ]);
    try {
      const loosePath = path.join(root, 'Feature/loose.ts');
      expect(await compiler.getTcbForFile(loosePath)).toContain('LooseComponent');
      const key = (await compiler.getClassMetadata(loosePath))!.filePath;
      expect(compiler.fileCache.has(key)).toBe(true);

      const updated = componentSource('<b>{{value.length}}</b>');
      await fs.writeFile(loosePath, updated);
      await compiler.updateFileContent([{filePath: loosePath, content: updated}]);

      expect(compiler.fileCache.has(key)).toBe(false);
      expect(await compiler.getTcbForFile(loosePath)).toContain('.length');
    } finally {
      compiler.analyzer.close();
    }
  });

  it('drops the entry of a file outside the entrypoints when a file it depends on changes', async () => {
    const {compiler, root} = await createCompiler('dependent_file', [
      TSCONFIG,
      MAIN,
      {path: 'Shared/dir.ts', content: directiveSource('first')},
      {path: 'dependent.ts', content: DEPENDENT_SOURCE},
    ]);
    try {
      const dependentPath = path.join(root, 'dependent.ts');
      const before = await compiler.getTcbForFile(dependentPath);
      const key = (await compiler.getClassMetadata(dependentPath))!.filePath;
      expect(compiler.fileCache.has(key)).toBe(true);
      expect(before).toContain('_t1.first');
      expect(before).not.toContain('_t1.second');

      const dirPath = path.join(root, 'Shared/dir.ts');
      const updated = directiveSource('second');
      await fs.writeFile(dirPath, updated);
      await compiler.updateFileContent([{filePath: dirPath, content: updated}]);

      expect(compiler.fileCache.has(key)).toBe(false);
      const after = await compiler.getTcbForFile(dependentPath);
      expect(after).toContain('_t1.second');
      expect(after).not.toContain('_t1.first');
    } finally {
      compiler.analyzer.close();
    }
  });

  it('drops the entry of a file that only the delta pass after an update finds stale', async () => {
    // `cmp.ts` does not import `mod.ts`, so adding `Dir` to the module's declarations does not
    // invalidate it through the import graph: the engine only finds it when it diffs its
    // component mapping and scope registry at the start of the delta pass that `updateFileContent`
    // runs. Readers must not be served the old entry in between that pass and the next `compile()`.
    const moduleSource = (declarations: string) => `
      import {NgModule} from '@angular/core';
      import {Cmp} from './cmp';
      import {Dir} from './Shared/dir';
      @NgModule({declarations: [${declarations}]})
      export class Mod {}
    `;
    const {compiler, root} = await createCompiler('ngmodule_scope', [
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {},
          files: ['cmp.ts', 'Shared/dir.ts', 'mod.ts'],
        }),
      },
      {
        path: 'Shared/dir.ts',
        content: directiveSource('first').replace("'[dir]'}", "'[dir]', standalone: false}"),
      },
      {
        path: 'cmp.ts',
        content: `
          import {Component} from '@angular/core';
          @Component({selector: 'app-cmp', standalone: false, template: '<div dir [first]="value"></div>'})
          export class Cmp {
            value = 'x';
          }
        `,
      },
      {path: 'mod.ts', content: moduleSource('Cmp')},
    ]);
    try {
      const cmpPath = path.join(root, 'cmp.ts');
      expect(await compiler.getTcbForFile(cmpPath)).not.toContain('_t1.first');
      const key = (await compiler.getClassMetadata(cmpPath))!.filePath;
      expect(compiler.fileCache.has(key)).toBe(true);

      const modPath = path.join(root, 'mod.ts');
      const updated = moduleSource('Cmp, Dir');
      await fs.writeFile(modPath, updated);
      await compiler.updateFileContent([{filePath: modPath, content: updated}]);

      expect(compiler.fileCache.get(key)?.preparedTcbData).toBeUndefined();
      expect(compiler.fileCache.get(key)?.tcb).toBeUndefined();
      expect(await compiler.getTcbForFile(cmpPath)).toContain('_t1.first');
    } finally {
      compiler.analyzer.close();
    }
  });

  it('invalidates compiled entrypoint and loose dependents when applyInvalidations receives analyzer invalidations', async () => {
    const {compiler, root} = await createCompiler('apply_invalidations_dependents', [
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {},
          files: ['Shared/dir.ts', 'entry_dependent.ts'],
        }),
      },
      {path: 'Shared/dir.ts', content: directiveSource('first')},
      {path: 'entry_dependent.ts', content: DEPENDENT_SOURCE},
      {path: 'loose_dependent.ts', content: DEPENDENT_SOURCE},
    ]);
    try {
      await compiler.compile();
      const entryDependentPath = path.join(root, 'entry_dependent.ts');
      const looseDependentPath = path.join(root, 'loose_dependent.ts');
      expect(await compiler.getTcbForFile(entryDependentPath)).toContain('_t1.first');
      expect(await compiler.getTcbForFile(looseDependentPath)).toContain('_t1.first');

      const dirPath = path.join(root, 'Shared/dir.ts');
      const updated = directiveSource('second');
      await fs.writeFile(dirPath, updated);
      const canonical = await compiler.analyzer.canonicalPaths?.([dirPath]);
      const invalidatedTsFiles = await compiler.analyzer.updateFileContent([
        {filePath: dirPath, content: updated},
      ]);
      compiler.applyInvalidations(
        [{filePath: dirPath, updateType: FileUpdateType.Changed}],
        invalidatedTsFiles,
        canonical,
      );

      const entryAfter = await compiler.getTcbForFile(entryDependentPath);
      expect(entryAfter).toContain('_t1.second');
      expect(entryAfter).not.toContain('_t1.first');

      const looseAfter = await compiler.getTcbForFile(looseDependentPath);
      expect(looseAfter).toContain('_t1.second');
      expect(looseAfter).not.toContain('_t1.first');
    } finally {
      compiler.analyzer.close();
    }
  });

  it('invalidates a prefetched loose component with an indirect template and its consumer when the imported constant changes', async () => {
    const childSource = `
      import {Component} from '@angular/core';
      import {CHILD_TMPL} from './slots';
      @Component({selector: 'app-child', template: CHILD_TMPL})
      export class ChildCmp {}
    `;
    const parentSource = `
      import {Component} from '@angular/core';
      import {ChildCmp} from './child';
      @Component({
        selector: 'app-parent',
        imports: [ChildCmp],
        template: '<app-child>@if (show) {<div slot-a>1</div><span slot-a>2</span>}</app-child>',
      })
      export class ParentCmp {
        show = true;
      }
    `;
    const {compiler, root} = await createCompiler('loose_indirect_template', [
      TSCONFIG,
      MAIN,
      {
        path: 'slots.ts',
        content: `export const CHILD_TMPL = '<ng-content select="[slot-a]"></ng-content>';\n`,
      },
      {path: 'child.ts', content: childSource},
      {path: 'parent.ts', content: parentSource},
    ]);
    try {
      const slotsPath = path.join(root, 'slots.ts');
      const childPath = path.join(root, 'child.ts');
      const parentPath = path.join(root, 'parent.ts');

      // Process only `parent.ts` first so `child.ts` is populated via `resolveNgContentSelectors`
      // prefetch rather than a direct bind/process pass.
      const firstParent = await compiler.processFile(parentPath, parentSource);
      expect((firstParent.diagnostics ?? []).filter((d) => d.code === 8011).length).toBe(2);

      const updatedSlots = `export const CHILD_TMPL = '<ng-content select="[slot-b]"></ng-content>';\n`;
      await fs.writeFile(slotsPath, updatedSlots);
      await compiler.updateFileContent([{filePath: slotsPath, content: updatedSlots}]);

      const secondParent = await compiler.processFile(parentPath, parentSource);
      expect((secondParent.diagnostics ?? []).filter((d) => d.code === 8011)).toEqual([]);

      const childProcessed = await compiler.processFile(childPath, childSource);
      expect(childProcessed.magicString.toString()).toContain('slot-b');
      expect(childProcessed.magicString.toString()).not.toContain('slot-a');
    } finally {
      compiler.analyzer.close();
    }
  });

  it('re-binds cross-file <ng-content> selectors on ensureBound when incremental is false', async () => {
    const childSource = (slot: string) => `
      import {Component} from '@angular/core';
      @Component({selector: 'app-child', template: '<ng-content select="[${slot}]"></ng-content>'})
      export class ChildCmp {}
    `;
    const parentSource = `
      import {Component} from '@angular/core';
      import {ChildCmp} from './child';
      @Component({
        selector: 'app-parent',
        imports: [ChildCmp],
        template: '<app-child><div slot-a>1</div></app-child>',
      })
      export class ParentCmp {}
    `;
    const {compiler, root} = await createCompiler(
      'non_incremental_ensure_bound',
      [
        {
          path: 'tsconfig.json',
          content: JSON.stringify({compilerOptions: {}, files: ['child.ts', 'parent.ts']}),
        },
        {path: 'child.ts', content: childSource('slot-a')},
        {path: 'parent.ts', content: parentSource},
      ],
      /* incremental */ false,
    );
    try {
      const childPath = path.join(root, 'child.ts');
      const parentPath = path.join(root, 'parent.ts');
      const parentMeta = (await compiler.getClassMetadata(parentPath))!;
      const classKey = makeClassKey('ParentCmp', parentMeta.classes[0].span.start);

      const beforeBound = await compiler.getBoundTarget(parentPath, classKey);
      expect(beforeBound!.getUsedDirectives()[0].ngContentSelectors).toEqual(['[slot-a]']);

      const updatedChild = childSource('slot-b');
      await fs.writeFile(childPath, updatedChild);
      await compiler.updateFileContent([{filePath: childPath, content: updatedChild}]);

      const afterBound = await compiler.getBoundTarget(parentPath, classKey);
      expect(afterBound!.getUsedDirectives()[0].ngContentSelectors).toEqual(['[slot-b]']);
    } finally {
      compiler.analyzer.close();
    }
  });
});

describe('HybridCompiler inline TCB namespace alias collisions', () => {
  it('avoids namespaceAliasConflicts when generating inline TCB imports', async () => {
    const inlineSource = `
      import {Component} from '@angular/core';
      import {Dir} from './Shared/dir';
      const i0 = 1;
      @Component({
        selector: 'app-inline',
        imports: [Dir],
        template: '<div dir [first]="value"></div>',
      })
      class InlineComponent {
        value = String(i0);
      }
    `;
    const {compiler, root} = await createCompiler('inline_tcb_collision', [
      TSCONFIG,
      MAIN,
      {path: 'Shared/dir.ts', content: directiveSource('first')},
      {path: 'inline.ts', content: inlineSource},
    ]);
    try {
      const inlinePath = path.join(root, 'inline.ts');
      const tcb = await compiler.getTcbForFile(inlinePath);
      expect(tcb).not.toBeNull();
      expect(tcb).not.toContain('import * as i0 ');
      expect(tcb).toContain("import * as i0_1 from './Shared/dir'");
    } finally {
      compiler.analyzer.close();
    }
  });
});
