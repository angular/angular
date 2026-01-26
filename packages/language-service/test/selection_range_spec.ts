/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {LanguageServiceTestEnv} from '../testing';
import {createModuleAndProjectWithDeclarations} from '../testing/src/util';

describe('selection range', () => {
  let env: LanguageServiceTestEnv;

  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  describe('external templates', () => {
    it('should return selection range for element in external template', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            templateUrl: './app.html',
          })
          export class AppComponent {}
        `,
        'app.html': '<div>content</div>',
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      // Position on "content" text
      const selectionRange = project.getSelectionRangeAtPosition('app.html', 6);

      expect(selectionRange).toBeDefined();
      // Should have a parent chain
      expect(selectionRange!.parent).toBeDefined();
    });

    it('should return selection range for nested elements', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            templateUrl: './app.html',
          })
          export class AppComponent {}
        `,
        'app.html': '<div><span>nested</span></div>',
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      // Position on "nested" text
      const selectionRange = project.getSelectionRangeAtPosition('app.html', 12);

      expect(selectionRange).toBeDefined();
      // Should expand: text -> span -> div
      let range = selectionRange;
      let depth = 0;
      while (range) {
        depth++;
        range = range.parent;
      }
      // At least 3 levels: text, span, div
      expect(depth).toBeGreaterThanOrEqual(3);
    });
  });

  describe('inline templates', () => {
    it('should return selection range for element in inline template', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<div>content</div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Position inside the template on "content"
      const contentPos = appFile.contents.indexOf('content');

      const selectionRange = project.getSelectionRangeAtPosition('app.ts', contentPos);

      expect(selectionRange).toBeDefined();
      expect(selectionRange!.parent).toBeDefined();
    });

    it('should return selection range for nested elements in inline template', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<div><span>nested</span></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Position on "nested" text
      const nestedPos = appFile.contents.indexOf('nested');

      const selectionRange = project.getSelectionRangeAtPosition('app.ts', nestedPos);

      expect(selectionRange).toBeDefined();
      // Should expand: text -> span -> div
      let range = selectionRange;
      let depth = 0;
      while (range) {
        depth++;
        range = range.parent;
      }
      // At least 3 levels: text, span, div
      expect(depth).toBeGreaterThanOrEqual(3);
    });

    it('should handle template literals (backtick templates)', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: \`
              <section>
                <article>content</article>
              </section>
            \`,
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Position on "content"
      const contentPos = appFile.contents.indexOf('>content<') + 1;

      const selectionRange = project.getSelectionRangeAtPosition('app.ts', contentPos);

      expect(selectionRange).toBeDefined();
      // Should have parent chain: text -> article -> section
      let range = selectionRange;
      let depth = 0;
      while (range) {
        depth++;
        range = range.parent;
      }
      expect(depth).toBeGreaterThanOrEqual(3);
    });

    it('should work with @if control flow blocks in inline templates', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: \`
              @if (show) {
                <div>conditional content</div>
              }
            \`,
          })
          export class AppComponent {
            show = true;
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Position on "conditional content"
      const contentPos = appFile.contents.indexOf('conditional content');

      const selectionRange = project.getSelectionRangeAtPosition('app.ts', contentPos);

      expect(selectionRange).toBeDefined();
      // Should have parent chain: text -> div -> @if block
      let range = selectionRange;
      let depth = 0;
      while (range) {
        depth++;
        range = range.parent;
      }
      expect(depth).toBeGreaterThanOrEqual(3);
    });

    it('should work with interpolation in inline templates', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<span>Hello {{name}}!</span>',
          })
          export class AppComponent {
            name = 'World';
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Position on "name" in interpolation
      const namePos = appFile.contents.indexOf('{{name}}') + 2;

      const selectionRange = project.getSelectionRangeAtPosition('app.ts', namePos);

      expect(selectionRange).toBeDefined();
    });

    it('should work with bound attributes in inline templates', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<div [class.active]="isActive">Content</div>',
          })
          export class AppComponent {
            isActive = true;
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Position on "isActive" in binding
      const activePos = appFile.contents.indexOf('isActive">');

      const selectionRange = project.getSelectionRangeAtPosition('app.ts', activePos);

      expect(selectionRange).toBeDefined();
    });

    it('should return undefined for position outside template', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<div>content</div>',
          })
          export class AppComponent {
            // Position here should not return selection range
            someProperty = 'value';
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Position on "someProperty"
      const propPos = appFile.contents.indexOf('someProperty');

      const selectionRange = project.getSelectionRangeAtPosition('app.ts', propPos);

      expect(selectionRange).toBeUndefined();
    });
  });
});
