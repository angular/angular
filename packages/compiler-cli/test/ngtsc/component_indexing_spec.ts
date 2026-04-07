/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AbsoluteFsPath, getFileSystem, PathManipulation} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {
  AbsoluteSourceSpan,
  IdentifierKind,
  IndexedComponent,
  TopLevelIdentifier,
} from '../../src/ngtsc/indexer';
import {ParseSourceFile} from '@angular/compiler';

import {NgtscTestEnvironment} from './env';

runInEachFileSystem(() => {
  describe('ngtsc component indexing', () => {
    let fs: PathManipulation;
    let env!: NgtscTestEnvironment;
    let testSourceFile: AbsoluteFsPath;
    let testTemplateFile: AbsoluteFsPath;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup();
      env.tsconfig();
      fs = getFileSystem();
      testSourceFile = fs.resolve(env.basePath, 'test.ts');
      testTemplateFile = fs.resolve(env.basePath, 'test.html');
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
        env.write(testSourceFile, componentContent);
        const indexed = env.driveIndexer();
        expect(indexed.size).toBe(1);

        const [[decl, indexedComp]] = Array.from(indexed.entries());

        expect(decl.getText()).toContain('export class TestCmp {}');
        expect(indexedComp).toEqual(
          jasmine.objectContaining<IndexedComponent>({
            name: 'TestCmp',
            selector: 'test-cmp',
            file: new ParseSourceFile(componentContent, testSourceFile),
          }),
        );
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
        env.write(testSourceFile, componentContent);
        const indexed = env.driveIndexer();
        const [[_, indexedComp]] = Array.from(indexed.entries());
        const template = indexedComp.template;

        expect(template).toEqual({
          identifiers: new Set<TopLevelIdentifier>([
            {
              name: 'foo',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(127, 130),
              target: null,
            },
          ]),
          usedComponents: new Set(),
          isInline: true,
          file: new ParseSourceFile(componentContent, testSourceFile),
        });
      });

      it('should index external templates', () => {
        env.write(
          testSourceFile,
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: './test.html',
        })
        export class TestCmp { foo = 0; }
      `,
        );
        env.write(testTemplateFile, '{{foo}}');
        const indexed = env.driveIndexer();
        const [[_, indexedComp]] = Array.from(indexed.entries());
        const template = indexedComp.template;

        expect(template).toEqual({
          identifiers: new Set<TopLevelIdentifier>([
            {
              name: 'foo',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(2, 5),
              target: null,
            },
          ]),
          usedComponents: new Set(),
          isInline: false,
          file: new ParseSourceFile('{{foo}}', testTemplateFile),
        });
      });

      it('should index templates compiled without preserving whitespace', () => {
        env.tsconfig({
          preserveWhitespaces: false,
        });

        env.write(
          testSourceFile,
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: './test.html',
        })
        export class TestCmp { foo = 0; }
      `,
        );
        env.write(testTemplateFile, '  \n  {{foo}}');
        const indexed = env.driveIndexer();
        const [[_, indexedComp]] = Array.from(indexed.entries());
        const template = indexedComp.template;

        expect(template).toEqual({
          identifiers: new Set<TopLevelIdentifier>([
            {
              name: 'foo',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(7, 10),
              target: null,
            },
          ]),
          usedComponents: new Set(),
          isInline: false,
          file: new ParseSourceFile('  \n  {{foo}}', testTemplateFile),
        });
      });

      it('should generate information about used components', () => {
        env.write(
          testSourceFile,
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: './test.html',
          standalone: false,
        })
        export class TestCmp {}
      `,
        );
        env.write(testTemplateFile, '<div></div>');
        env.write(
          'test_import.ts',
          `
        import {Component, NgModule} from '@angular/core';
        import {TestCmp} from './test';

        @Component({
          templateUrl: './test_import.html',
          standalone: false,
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
      `,
        );
        env.write('test_import.html', '<test-cmp></test-cmp>');
        const indexed = env.driveIndexer();
        expect(indexed.size).toBe(2);

        const indexedComps = Array.from(indexed.values());
        const testComp = indexedComps.find((comp) => comp.name === 'TestCmp');
        const testImportComp = indexedComps.find((cmp) => cmp.name === 'TestImportCmp');
        expect(testComp).toBeDefined();
        expect(testImportComp).toBeDefined();

        expect(testComp!.template.usedComponents.size).toBe(0);
        expect(testImportComp!.template.usedComponents.size).toBe(1);

        const [usedComp] = Array.from(testImportComp!.template.usedComponents);
        expect(indexed.get(usedComp)).toEqual(testComp);
      });
    });
  });
});
