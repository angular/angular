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
      expect(indexed.length).toBe(1);

      const [component] = indexed;
      expect(component.name).toBe('TestCmp');
      expect(component.selector).toBe('test-cmp');
      expect(component.content).toBe(componentContent);
      expect(component.sourceFile).toContain('/test.ts');
      expect(component.declaration.getText()).toContain('export class TestCmp {}');
    });

    it('should index inline templates', () => {
      const componentContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div>{{foo}}</div>',
        })
        export class TestCmp { foo = 0; }
      `;
      env.write('test.ts', componentContent);
      const [{template}] = env.driveIndexer();
      const [identifier] = template.identifiers;

      expect(identifier.name).toBe('foo');
      expect(identifier.span).toEqual({start: 132, end: 135});
      expect(identifier.file.content).toBe(componentContent);
      expect(identifier.file.url).toBe('test.ts');
    });

    it('should index external templates', () => {
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: './test-cmp.html',
        })
        export class TestCmp { foo = 0; }
      `);
      env.write('test-cmp.html', '<div>{{foo}}</div>');
      const [{template}] = env.driveIndexer();
      const [identifier] = template.identifiers;

      expect(identifier.name).toBe('foo');
      expect(identifier.span).toEqual({start: 7, end: 10});
      expect(identifier.file.content).toBe('<div>{{foo}}</div>');
      expect(identifier.file.url).toContain('/test-cmp.html');
    });
  });
});
