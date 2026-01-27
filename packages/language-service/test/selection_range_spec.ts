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

    describe('sibling expansion', () => {
      it('should include all siblings before parent element', () => {
        // In <h1><span>a</span><span>b</span></h1>, selection should expand:
        // a -> <span>a</span> -> <span>a</span><span>b</span> -> <h1>...</h1>
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              template: '<h1><span>a</span><span>b</span></h1>',
            })
            export class AppComponent {}
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');
        // Position on "a" text inside first span
        const aPos = appFile.contents.indexOf('>a<') + 1;

        const selectionRange = project.getSelectionRangeAtPosition('app.ts', aPos);

        expect(selectionRange).toBeDefined();

        // Collect all ranges in the chain
        const ranges: Array<{start: number; length: number}> = [];
        let range = selectionRange;
        while (range) {
          ranges.push(range.textSpan);
          range = range.parent;
        }

        // The chain should include:
        // 1. "a" (the text node)
        // 2. "<span>a</span>" (the span element)
        // 3. "<span>a</span><span>b</span>" (all siblings/content)
        // 4. "<h1><span>a</span><span>b</span></h1>" (the h1 element)

        // Find the template in the source
        const templateStart = appFile.contents.indexOf('<h1>');
        const template = '<h1><span>a</span><span>b</span></h1>';

        // Verify we have at least 4 levels
        expect(ranges.length).toBeGreaterThanOrEqual(4);

        // The last range (outermost) should be the h1
        const outermost = ranges[ranges.length - 1];
        expect(outermost.length).toBe(template.length);

        // There should be an intermediate range covering both spans
        const siblingsSpan = '<span>a</span><span>b</span>';
        const siblingsRange = ranges.find((r) => r.length === siblingsSpan.length);
        expect(siblingsRange).toBeDefined();
      });

      it('should expand interpolation before siblings content', () => {
        // In <span>{{user.name}} - {{user.phone}}</span>, selection should expand:
        // user.name -> {{user.name}} -> {{user.name}} - {{user.phone}} -> <span>...</span>
        const files = {
          'app.html': '<span>{{user.name}} - {{user.phone}}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              user = {name: 'John', phone: '123'};
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "name" in {{user.name}} - position 11 is 'n' in user.name
        const namePos = 11;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        expect(selectionRange).toBeDefined();

        // Collect all ranges with their actual text
        const template = '<span>{{user.name}} - {{user.phone}}</span>';
        const rangeTexts: string[] = [];
        let range = selectionRange;
        while (range) {
          const text = template.substring(
            range.textSpan.start,
            range.textSpan.start + range.textSpan.length,
          );
          rangeTexts.push(
            `[${range.textSpan.start}-${range.textSpan.start + range.textSpan.length}]: "${text}"`,
          );
          range = range.parent;
        }

        // Should have at least 3 levels:
        // Expression (user.name), BoundText ({{user.name}}), Element (<span>...)
        // Content span may be skipped if it equals element content
        expect(rangeTexts.length).toBeGreaterThanOrEqual(3);
      });

      it('should handle single child without redundant siblings span', () => {
        // In <span>{{user.name}}</span>, with only one child, we shouldn't add siblings span
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              template: '<span>{{user.name}}</span>',
            })
            export class AppComponent {
              user = {name: 'John'};
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');
        // Position on "name"
        const namePos = appFile.contents.indexOf('user.name') + 5;

        const selectionRange = project.getSelectionRangeAtPosition('app.ts', namePos);

        expect(selectionRange).toBeDefined();

        // Collect all ranges
        const ranges: Array<{start: number; length: number}> = [];
        let range = selectionRange;
        while (range) {
          ranges.push(range.textSpan);
          range = range.parent;
        }

        // Should NOT have duplicate spans - each span should be unique
        const uniqueLengths = new Set(ranges.map((r) => `${r.start}-${r.length}`));
        expect(uniqueLengths.size).toBe(ranges.length);
      });

      it('should work with multiple text nodes', () => {
        // In <p>Hello {{name}}!</p>, should expand properly
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              template: '<p>Hello {{name}}!</p>',
            })
            export class AppComponent {
              name = 'World';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const appFile = project.openFile('app.ts');
        // Position on "name"
        const namePos = appFile.contents.indexOf('{{name}}') + 2;

        const selectionRange = project.getSelectionRangeAtPosition('app.ts', namePos);

        expect(selectionRange).toBeDefined();

        // Should have at least 2 levels (expression -> BoundText)
        // More levels are better but we need at least the basics
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        expect(depth).toBeGreaterThanOrEqual(2);
      });

      it('should expand through nested property access', () => {
        // In {{user.address.city}}, cursor on "city" should expand:
        // city -> user.address.city -> {{user.address.city}} -> element
        const files = {
          'app.html': '<span>{{user.address.city}}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              user = {address: {city: 'NYC'}};
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "city" - after the second dot
        const cityPos = 17;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', cityPos);

        expect(selectionRange).toBeDefined();

        // Should have multiple levels
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        expect(depth).toBeGreaterThanOrEqual(2);
      });

      it('should handle control flow blocks', () => {
        // @if block should expand properly
        const files = {
          'app.html': '@if (show) { <span>content</span> }',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              show = true;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "content" text
        const contentPos = 20;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', contentPos);

        expect(selectionRange).toBeDefined();

        // Should expand: content -> span -> @if block
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        expect(depth).toBeGreaterThanOrEqual(3);
      });

      it('should handle bound attributes', () => {
        // Selection in [value]="expr" should expand properly
        const files = {
          'app.html': '<input [value]="userName">',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              userName = 'test';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "userName" in the binding
        const userNamePos = 17;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', userNamePos);

        expect(selectionRange).toBeDefined();

        // Should expand: userName -> [value]="userName" -> input
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        expect(depth).toBeGreaterThanOrEqual(2);
      });

      it('should handle event handlers', () => {
        // Selection in (click)="handler()" should expand properly
        const files = {
          'app.html': '<button (click)="handleClick()">Click</button>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              handleClick() {}
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "handleClick" in the event
        const handlePos = 18;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', handlePos);

        expect(selectionRange).toBeDefined();

        // Should have at least 2 levels
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        expect(depth).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
