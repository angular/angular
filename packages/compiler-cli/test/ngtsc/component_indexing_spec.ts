/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, IdentifierKind} from '@angular/compiler-cli/src/ngtsc/indexer';
import {ParseSourceFile} from '@angular/compiler/src/compiler';
import * as path from 'path';
import {NgtscTestEnvironment} from './env';

describe('ngtsc component indexing', () => {
  let env !: NgtscTestEnvironment;

  function testPath(testFile: string): string { return path.posix.join(env.basePath, testFile); }

  beforeEach(() => {
    env = NgtscTestEnvironment.setup();
    env.tsconfig();
  });

  describe('indexing metadata', () => {
    it('should generate component metadata', () => {
      const componentContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div></div>',
        })
        export class TestCmp {}
    `;
      env.write('test.ts', componentContent);
      const indexed = env.driveIndexer();
      expect(indexed.size).toBe(1);

      const [[decl, indexedComp]] = Array.from(indexed.entries());

      expect(decl.getText()).toContain('export class TestCmp {}');
      expect(indexedComp).toEqual(jasmine.objectContaining({
        name: 'TestCmp',
        selector: 'test-cmp',
        file: new ParseSourceFile(componentContent, testPath('test.ts')),
      }));
    });

    it('should index inline templates', () => {
      const componentContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '{{foo}}',
        })
        export class TestCmp { foo = 0; }
      `;
      env.write('test.ts', componentContent);
      const indexed = env.driveIndexer();
      const [[_, indexedComp]] = Array.from(indexed.entries());
      const template = indexedComp.template;

      expect(template).toEqual({
        identifiers: new Set([{
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(127, 130),
        }]),
        usedComponents: new Set(),
        isInline: true,
        file: new ParseSourceFile(componentContent, testPath('test.ts')),
      });
    });

    it('should index external templates', () => {
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: './test.html',
        })
        export class TestCmp { foo = 0; }
      `);
      env.write('test.html', '{{foo}}');
      const indexed = env.driveIndexer();
      const [[_, indexedComp]] = Array.from(indexed.entries());
      const template = indexedComp.template;

      expect(template).toEqual({
        identifiers: new Set([{
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(2, 5),
        }]),
        usedComponents: new Set(),
        isInline: false,
        file: new ParseSourceFile('{{foo}}', testPath('test.html')),
      });
    });

    it('should index templates compiled without preserving whitespace', () => {
      env.tsconfig({
        preserveWhitespaces: false,
      });

      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: './test.html',
        })
        export class TestCmp { foo = 0; }
      `);
      env.write('test.html', '<div>  \n  {{foo}}</div>');
      const indexed = env.driveIndexer();
      const [[_, indexedComp]] = Array.from(indexed.entries());
      const template = indexedComp.template;

      expect(template).toEqual({
        identifiers: new Set([{
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(12, 15),
        }]),
        usedComponents: new Set(),
        isInline: false,
        file: new ParseSourceFile('<div>  \n  {{foo}}</div>', testPath('test.html')),
      });
    });

    it('should generated information about used components', () => {
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: './test.html',
        })
        export class TestCmp {}
      `);
      env.write('test.html', '<div></div>');
      env.write('test_import.ts', `
        import {Component, NgModule} from '@angular/core';
        import {TestCmp} from './test';

        @Component({
          templateUrl: './test_import.html',
        })
        export class TestImportCmp {}

        @NgModule({
          declarations: [
            TestCmp,
            TestImportCmp,
          ],
          bootstrap: [TestImportCmp]
        })
        export class TestModule {}
      `);
      env.write('test_import.html', '<test-cmp></test-cmp>');
      const indexed = env.driveIndexer();
      expect(indexed.size).toBe(2);

      const indexedComps = Array.from(indexed.values());
      const testComp = indexedComps.find(comp => comp.name === 'TestCmp');
      const testImportComp = indexedComps.find(cmp => cmp.name === 'TestImportCmp');
      expect(testComp).toBeDefined();
      expect(testImportComp).toBeDefined();

      expect(testComp !.template.usedComponents.size).toBe(0);
      expect(testImportComp !.template.usedComponents.size).toBe(1);

      const [usedComp] = Array.from(testImportComp !.template.usedComponents);
      expect(indexed.get(usedComp)).toEqual(testComp);
    });
  });
});
