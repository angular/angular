/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscTestEnvironment} from './env';

describe('ngtsc component indexing', () => {
  let env !: NgtscTestEnvironment;

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

      const [[decl, indexedComp]] = indexed.entries();

      expect(decl.getText()).toContain('export class TestCmp {}');
      expect(indexedComp.name).toBe('TestCmp');
      expect(indexedComp.selector).toBe('test-cmp');
      expect(indexedComp.sourceFile).toContain('/test.ts');
      expect(indexedComp.content).toBe(componentContent);
      expect(indexedComp.template.identifiers.size).toBe(0);
      expect(indexedComp.template.usedComponents.size).toBe(0);
    });

    // Ignore inline templates for until the indexer module no longer has to restore templates.
    // TODO(ayazhafiz): Fix once `restoreTemplate` in indexer module is removed.
    it('should ignore index inline templates', () => {
      const componentContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div>{{foo}}</div>',
        })
        export class TestCmp { foo = 0; }
      `;
      env.write('test.ts', componentContent);
      const indexed = env.driveIndexer();
      const [[_, indexedComp]] = indexed.entries();
      const template = indexedComp.template;

      expect(template.identifiers.size).toBe(0);
      expect(template.usedComponents.size).toBe(0);
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
      env.write('test.html', '<div>{{foo}}</div>');
      const indexed = env.driveIndexer();
      const [[_, indexedComp]] = indexed.entries();
      const template = indexedComp.template;

      expect(template.identifiers.size).toBe(1);
      expect(template.usedComponents.size).toBe(0);

      const [identifier] = template.identifiers.values();

      expect(identifier.name).toBe('foo');
      expect(identifier.span.start).toBe(7);
      expect(identifier.span.end).toBe(10);
      expect(identifier.file.content).toBe('<div>{{foo}}</div>');
      expect(identifier.file.url).toContain('/test.html');
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

      const [usedComp] = testImportComp !.template.usedComponents;
      expect(indexed.get(usedComp)).toEqual(testComp);
    });
  });
});
