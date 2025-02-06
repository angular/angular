/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {absoluteFrom} from '../../file_system';
import {initMockFileSystem} from '../../file_system/testing';
import {NgtscTestCompilerHost} from '../../testing';
import {ImportManager} from '../src/import_manager/import_manager';

describe('import manager', () => {
  it('should be possible to import a symbol', () => {
    const {testFile, emit} = createTestProgram('');
    const manager = new ImportManager();
    const ref = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(ref)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { input } from "@angular/core";
      input;
    `),
    );
  });

  it('should be possible to import a namespace', () => {
    const {testFile, emit} = createTestProgram('');
    const manager = new ImportManager();

    const ref = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: null,
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(ref)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import * as i0 from "@angular/core";
      i0;
    `),
    );
  });

  it('should be possible to import multiple symbols', () => {
    const {testFile, emit} = createTestProgram('');
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const outputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'output',
      requestedFile: testFile,
    });

    const res = emit(manager, [
      ts.factory.createExpressionStatement(inputRef),
      ts.factory.createExpressionStatement(outputRef),
    ]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { input, output } from "@angular/core";
      input;
      output;
    `),
    );
  });

  it('should be possible to import multiple namespaces', () => {
    const {testFile, emit} = createTestProgram('');
    const manager = new ImportManager();

    const coreNamespace = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: null,
      requestedFile: testFile,
    });

    const interopNamespace = manager.addImport({
      exportModuleSpecifier: '@angular/core/rxjs-interop',
      exportSymbolName: null,
      requestedFile: testFile,
    });

    const res = emit(manager, [
      ts.factory.createExpressionStatement(coreNamespace),
      ts.factory.createExpressionStatement(interopNamespace),
    ]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import * as i0 from "@angular/core";
      import * as i1 from "@angular/core/rxjs-interop";
      i0;
      i1;
    `),
    );
  });

  it('should be possible to generate a namespace import and re-use it for future symbols', () => {
    const {testFile, emit} = createTestProgram('');
    const manager = new ImportManager();

    const coreNamespace = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: null,
      requestedFile: testFile,
    });

    const outputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'output',
      requestedFile: testFile,
    });

    const res = emit(manager, [
      ts.factory.createExpressionStatement(coreNamespace),
      ts.factory.createExpressionStatement(outputRef),
    ]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import * as i0 from "@angular/core";
      i0;
      i0.output;
    `),
    );
  });

  it('should always generate a new namespace import if there is only a named import', () => {
    const {testFile, emit} = createTestProgram('');
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const coreNamespace = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: null,
      requestedFile: testFile,
    });

    const res = emit(manager, [
      ts.factory.createExpressionStatement(inputRef),
      ts.factory.createExpressionStatement(coreNamespace),
    ]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import * as i0 from "@angular/core";
      import { input } from "@angular/core";
      input;
      i0;
    `),
    );
  });

  it('should be able to re-use existing source file namespace imports for symbols', () => {
    const {testFile, emit} = createTestProgram(`
      import * as existingImport from '@angular/core';
    `);
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(inputRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import * as existingImport from '@angular/core';
      existingImport.input;
    `),
    );
  });

  it('should re-use existing source file namespace imports for a namespace request', () => {
    const {testFile, emit} = createTestProgram(`
      import * as existingImport from '@angular/core';
    `);
    const manager = new ImportManager();

    const coreRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: null,
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(coreRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import * as existingImport from '@angular/core';
      existingImport;
    `),
    );
  });

  it('should be able to re-use existing source named bindings', () => {
    const {testFile, emit} = createTestProgram(`
      import {input} from '@angular/core';
    `);
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(inputRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { input } from '@angular/core';
      input;
    `),
    );
  });

  it('should be able to add symbols to an existing source file named import', () => {
    const {testFile, emit} = createTestProgram(`
      import {input} from '@angular/core';

      const x = input();
    `);
    const manager = new ImportManager();

    const outputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'output',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(outputRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { input, output } from '@angular/core';
      output;
      const x = input();
    `),
    );
  });

  it(
    'should be able to add symbols to an existing source file named import, ' +
      'while still eliding unused specifiers of the updated import',
    () => {
      const {testFile, emit} = createTestProgram(`
        import {input} from '@angular/core';
      `);
      const manager = new ImportManager();

      const outputRef = manager.addImport({
        exportModuleSpecifier: '@angular/core',
        exportSymbolName: 'output',
        requestedFile: testFile,
      });

      const res = emit(manager, [ts.factory.createExpressionStatement(outputRef)]);

      expect(res).toBe(
        omitLeadingWhitespace(`
        import { output } from '@angular/core';
        output;
      `),
      );
    },
  );

  it('should not re-use an original file import if re-use is disabled', () => {
    const {testFile, emit} = createTestProgram(`
      import {input} from '@angular/core';
    `);
    const manager = new ImportManager({
      disableOriginalSourceFileReuse: true,
    });

    const outputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'output',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(outputRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { output } from "@angular/core";
      output;
    `),
    );
  });

  it('should not re-use an original namespace import if re-use is disabled', () => {
    const {testFile, emit} = createTestProgram(`
      import * as existingCore from '@angular/core';
    `);
    const manager = new ImportManager({
      disableOriginalSourceFileReuse: true,
    });

    const outputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'output',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(outputRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { output } from "@angular/core";
      output;
    `),
    );
  });

  it('should be able to always prefer namespace imports for new imports', () => {
    const {testFile, emit} = createTestProgram(``);
    const manager = new ImportManager({
      forceGenerateNamespacesForNewImports: true,
    });

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const outputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'output',
      requestedFile: testFile,
    });

    const res = emit(manager, [
      ts.factory.createExpressionStatement(inputRef),
      ts.factory.createExpressionStatement(outputRef),
    ]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import * as i0 from "@angular/core";
      i0.input;
      i0.output;
    `),
    );
  });

  it(
    'should be able to always prefer namespace imports for new imports, ' +
      'but still re-use source file namespace imports',
    () => {
      const {testFile, emit} = createTestProgram(`
        import * as existingNamespace from '@angular/core';
       `);
      const manager = new ImportManager({
        forceGenerateNamespacesForNewImports: true,
      });

      const inputRef = manager.addImport({
        exportModuleSpecifier: '@angular/core',
        exportSymbolName: 'input',
        requestedFile: testFile,
      });

      const outputRef = manager.addImport({
        exportModuleSpecifier: '@angular/core',
        exportSymbolName: 'output',
        requestedFile: testFile,
      });

      const res = emit(manager, [
        ts.factory.createExpressionStatement(inputRef),
        ts.factory.createExpressionStatement(outputRef),
      ]);

      expect(res).toBe(
        omitLeadingWhitespace(`
        import * as existingNamespace from '@angular/core';
        existingNamespace.input;
        existingNamespace.output;
      `),
      );
    },
  );

  it(
    'should be able to always prefer namespace imports for new imports, ' +
      'but still re-use source file individual imports',
    () => {
      const {testFile, emit} = createTestProgram(`
        import {Dir} from 'bla';

        const x = new Dir();
       `);
      const manager = new ImportManager({
        forceGenerateNamespacesForNewImports: true,
      });

      const blaRef = manager.addImport({
        exportModuleSpecifier: 'bla',
        exportSymbolName: 'Dir',
        requestedFile: testFile,
      });

      const res = emit(manager, [ts.factory.createExpressionStatement(blaRef)]);

      expect(res).toBe(
        omitLeadingWhitespace(`
        import { Dir } from 'bla';
        Dir;
        const x = new Dir();
      `),
      );
    },
  );

  it('should not change existing unrelated imports', () => {
    const {testFile, emit} = createTestProgram(`
      import {MyComp} from './bla';

      console.log(MyComp);
    `);
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(inputRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { MyComp } from './bla';
      import { input } from "@angular/core";
      input;
      console.log(MyComp);
    `),
    );
  });

  it('should be able to add a side effect import', () => {
    const {testFile, emit} = createTestProgram(``);
    const manager = new ImportManager();

    manager.addSideEffectImport(testFile, '@angular/core');

    const res = emit(manager, []);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import "@angular/core";
    `),
    );
  });

  it('should avoid conflicts with existing top-level identifiers', () => {
    const {testFile, emit} = createTestProgram(`
      const input = 1;
    `);
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(inputRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { input as input_1 } from "@angular/core";
      input_1;
      const input = 1;
    `),
    );
  });

  it('should avoid conflicts with existing deep identifiers', () => {
    const {testFile, emit} = createTestProgram(`
      function x() {
        const p = () => {
          const input = 1;
        };
      }
    `);
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(inputRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { input as input_1 } from "@angular/core";
      input_1;
      function x() {
        const p = () => {
          const input = 1;
        };
      }
    `),
    );
  });

  it('should avoid an import specifier alias if similar import is generated in different', () => {
    const {testFile, emit} = createTestProgram(``);
    const manager = new ImportManager();

    manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: ts.createSourceFile('other_file', '', ts.ScriptTarget.Latest),
    });

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(inputRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
        import { input } from "@angular/core";
        input;
    `),
    );
  });

  it('should avoid an import alias specifier if identifier is free to use', () => {
    const {testFile, emit} = createTestProgram(``);
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(inputRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { input } from "@angular/core";
      input;
    `),
    );
  });

  it('should avoid collisions with generated identifiers', () => {
    const {testFile, emit} = createTestProgram(``);
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const inputRef2 = manager.addImport({
      exportModuleSpecifier: '@angular/core2',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const res = emit(manager, [
      ts.factory.createExpressionStatement(inputRef),
      ts.factory.createExpressionStatement(inputRef2),
    ]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { input } from "@angular/core";
      import { input as input_1 } from "@angular/core2";
      input;
      input_1;
    `),
    );
  });

  it('should avoid collisions with generated identifiers', () => {
    const {testFile, emit} = createTestProgram(``);
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const inputRef2 = manager.addImport({
      exportModuleSpecifier: '@angular/core2',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const res = emit(manager, [
      ts.factory.createExpressionStatement(inputRef),
      ts.factory.createExpressionStatement(inputRef2),
    ]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { input } from "@angular/core";
      import { input as input_1 } from "@angular/core2";
      input;
      input_1;
    `),
    );
  });

  it('should re-use previous similar generated imports', () => {
    const {testFile, emit} = createTestProgram(``);
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const inputRef2 = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const res = emit(manager, [
      ts.factory.createExpressionStatement(inputRef),
      ts.factory.createExpressionStatement(inputRef2),
    ]);

    expect(inputRef).toBe(inputRef2);
    expect(res).toBe(
      omitLeadingWhitespace(`
      import { input } from "@angular/core";
      input;
      input;
    `),
    );
  });

  it('should not re-use original source file type-only imports', () => {
    const {testFile, emit} = createTestProgram(`
      import type {input} from '@angular/core';
    `);
    const manager = new ImportManager();

    const ref = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'bla',
      requestedFile: testFile,
    });
    const res = emit(manager, [ts.factory.createExpressionStatement(ref)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { bla } from "@angular/core";
      bla;
    `),
    );
  });

  it('should not re-use original source file type-only import specifiers', () => {
    const {testFile, emit} = createTestProgram(`
      import {type input} from '@angular/core'; // existing.
    `);
    const manager = new ImportManager();

    const ref = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'bla',
      requestedFile: testFile,
    });
    const res = emit(manager, [ts.factory.createExpressionStatement(ref)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { bla } from '@angular/core'; // existing.
      bla;
    `),
    );
  });

  it('should allow for a specific alias to be passed in', () => {
    const {testFile, emit} = createTestProgram(`
      import { input } from "@angular/core";

      input();
    `);
    const manager = new ImportManager();

    const fooRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'foo',
      unsafeAliasOverride: 'bar',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(fooRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
        import { input, foo as bar } from "@angular/core";
        bar;
        input();
      `),
    );
  });

  it('should allow for a specific alias to be passed in when reuse is disabled', () => {
    const {testFile, emit} = createTestProgram(`
      import { input } from "@angular/core";

      input();
    `);
    const manager = new ImportManager({
      disableOriginalSourceFileReuse: true,
    });

    const fooRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'foo',
      unsafeAliasOverride: 'bar',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(fooRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
        import { input } from "@angular/core";
        import { foo as bar } from "@angular/core";
        bar;
        input();
      `),
    );
  });

  it('should reuse a pre-existing import that has the same name and alias', () => {
    const {testFile, emit} = createTestProgram(`
      import { foo as bar } from "@angular/core";
      bar();
    `);
    const manager = new ImportManager();

    const fooRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'foo',
      unsafeAliasOverride: 'bar',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(fooRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
        import { foo as bar } from "@angular/core";
        bar;
        bar();
      `),
    );
  });

  it('should reuse import if both the name and alias are the same when added through `addImport`', () => {
    const {testFile, emit} = createTestProgram('');
    const manager = new ImportManager();

    const firstRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'foo',
      unsafeAliasOverride: 'bar',
      requestedFile: testFile,
    });

    const secondRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'foo',
      unsafeAliasOverride: 'bar',
      requestedFile: testFile,
    });

    const res = emit(manager, [
      ts.factory.createExpressionStatement(firstRef),
      ts.factory.createExpressionStatement(secondRef),
    ]);

    expect(res).toBe(
      omitLeadingWhitespace(`
        import { foo as bar } from "@angular/core";
        bar;
        bar;
      `),
    );
  });

  it('should not reuse import if symbol is imported under a different alias', () => {
    const {testFile, emit} = createTestProgram('');
    const manager = new ImportManager();

    const barRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'foo',
      unsafeAliasOverride: 'bar',
      requestedFile: testFile,
    });

    const bazRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'foo',
      unsafeAliasOverride: 'baz',
      requestedFile: testFile,
    });

    const res = emit(manager, [
      ts.factory.createExpressionStatement(barRef),
      ts.factory.createExpressionStatement(bazRef),
    ]);

    expect(res).toBe(
      omitLeadingWhitespace(`
        import { foo as bar, foo as baz } from "@angular/core";
        bar;
        baz;
      `),
    );
  });

  it('should not attempt to de-duplicate imports with an explicit alias', () => {
    const {testFile, emit} = createTestProgram('');
    const manager = new ImportManager();

    const fooRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'foo',
      requestedFile: testFile,
    });

    const barRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'bar',
      unsafeAliasOverride: 'foo',
      requestedFile: testFile,
    });

    const res = emit(manager, [
      ts.factory.createExpressionStatement(fooRef),
      ts.factory.createExpressionStatement(barRef),
    ]);

    expect(res).toBe(
      omitLeadingWhitespace(`
        import { foo, bar as foo } from "@angular/core";
        foo;
        foo;
      `),
    );
  });

  it('should remove a pre-existing import from a declaration', () => {
    const {testFile, emit} = createTestProgram(`
      import { input, output, model } from '@angular/core';
      input();
      output();
      model();
    `);
    const manager = new ImportManager();

    manager.removeImport(testFile, 'output', '@angular/core');
    const res = emit(manager, []);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { input, model } from '@angular/core';
      input();
      output();
      model();
    `),
    );
  });

  it('should remove the entire declaration if all pre-existing imports are removed', () => {
    const {testFile, emit} = createTestProgram(`
      import { input, output } from '@angular/core';
      input();
      output();
    `);
    const manager = new ImportManager();

    manager.removeImport(testFile, 'input', '@angular/core');
    manager.removeImport(testFile, 'output', '@angular/core');

    expect(emit(manager, [])).toBe(
      omitLeadingWhitespace(`
      input();
      output();
      export {};
    `),
    );
  });

  it('should remove a pre-existing aliased import', () => {
    const {testFile, emit} = createTestProgram(`
      import { input, output as foo } from '@angular/core';
      input();
      foo();
    `);
    const manager = new ImportManager();

    manager.removeImport(testFile, 'output', '@angular/core');

    expect(emit(manager, [])).toBe(
      omitLeadingWhitespace(`
      import { input } from '@angular/core';
      input();
      foo();
    `),
    );
  });

  it('should remove all pre-existing instances of a specific import', () => {
    const {testFile, emit} = createTestProgram(`
      import { input, input as foo } from '@angular/core';
      import { input as bar } from '@angular/core';
      input();
      foo();
      bar();
    `);
    const manager = new ImportManager();

    manager.removeImport(testFile, 'input', '@angular/core');

    expect(emit(manager, [])).toBe(
      omitLeadingWhitespace(`
      input();
      foo();
      bar();
      export {};
    `),
    );
  });

  it('should be able to remove from an import that is being modified', () => {
    const {testFile, emit} = createTestProgram(`
      import { input } from '@angular/core';
      input();
    `);
    const manager = new ImportManager();

    const ref = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'foo',
      requestedFile: testFile,
    });

    manager.removeImport(testFile, 'input', '@angular/core');
    const res = emit(manager, [ts.factory.createExpressionStatement(ref)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { foo } from '@angular/core';
      foo;
      input();
    `),
    );
  });

  it('should be able to remove a symbol from a newly-created import declaration', () => {
    const {testFile, emit} = createTestProgram('');
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const outputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'output',
      requestedFile: testFile,
    });

    manager.removeImport(testFile, 'input', '@angular/core');

    const res = emit(manager, [
      ts.factory.createExpressionStatement(inputRef),
      ts.factory.createExpressionStatement(outputRef),
    ]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { output } from "@angular/core";
      input;
      output;
    `),
    );
  });

  it('should add a symbol if addImport is called after removeImport', () => {
    const {testFile, emit} = createTestProgram('');
    const manager = new ImportManager();

    manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    manager.removeImport(testFile, 'input', '@angular/core');

    const ref = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const res = emit(manager, [ts.factory.createExpressionStatement(ref)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      import { input } from "@angular/core";
      input;
    `),
    );
  });

  it('should remove a newly-added aliased import', () => {
    const {testFile, emit} = createTestProgram('');
    const manager = new ImportManager();

    const inputRef = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      unsafeAliasOverride: 'foo',
      requestedFile: testFile,
    });

    manager.removeImport(testFile, 'input', '@angular/core');

    const res = emit(manager, [ts.factory.createExpressionStatement(inputRef)]);

    expect(res).toBe(
      omitLeadingWhitespace(`
      foo;
    `),
    );
  });

  it('should work when using an isolated transform', () => {
    const {testFile} = createTestProgram('import { input } from "@angular/core";');
    const manager = new ImportManager();
    const ref = manager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: testFile,
    });

    const extraStatements = [ts.factory.createExpressionStatement(ref)];
    const transformer = manager.toTsTransform(new Map([[testFile.fileName, extraStatements]]));

    const result = ts.transform(testFile, [transformer]);
    expect(result.diagnostics?.length ?? 0).toBe(0);
    expect(result.transformed.length).toBe(1);

    const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});
    const output = printer.printFile(result.transformed[0]);
    expect(output).toBe(
      omitLeadingWhitespace(`
      import { input } from "@angular/core";
      input;
    `),
    );
  });
});

function createTestProgram(text: string): {
  testFile: ts.SourceFile;
  emit: (manager: ImportManager, extraStatements: ts.Statement[]) => string;
} {
  const fs = initMockFileSystem('Native');
  const options: ts.CompilerOptions = {
    rootDir: '/',
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext,
    skipLibCheck: true,
    types: [],
  };

  fs.ensureDir(absoluteFrom('/'));
  fs.writeFile(absoluteFrom('/test.ts'), text);

  const program = ts.createProgram({
    rootNames: ['/test.ts'],
    options,
    host: new NgtscTestCompilerHost(fs, options),
  });

  const testFile = program.getSourceFile('/test.ts');
  if (testFile === undefined) {
    throw new Error('Could not get test source file from program.');
  }

  const emit = (manager: ImportManager, newStatements: ts.Statement[]) => {
    const transformer = manager.toTsTransform(new Map([[testFile.fileName, newStatements]]));

    let emitResult: string | null = null;
    const {emitSkipped} = program.emit(
      testFile,
      (fileName, resultText) => {
        if (fileName === '/test.js') {
          emitResult = resultText;
        }
      },
      undefined,
      undefined,
      {before: [transformer]},
    );

    if (emitSkipped || emitResult === null) {
      throw new Error(`Unexpected emit failure when emitting test file.`);
    }

    return omitLeadingWhitespace(emitResult);
  };

  return {testFile, emit};
}

/** Omits the leading whitespace for each line of the given text. */
function omitLeadingWhitespace(text: string): string {
  return text.replace(/^\s+/gm, '');
}
