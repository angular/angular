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

  describe('control flow blocks', () => {
    describe('@for blocks', () => {
      it('should handle @for loop with track expression', () => {
        const files = {
          'app.html': '@for (item of items; track item.id) { <div>{{item.name}}</div> }',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              items = [{id: 1, name: 'Item 1'}];
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "item.name" in interpolation
        const namePos = files['app.html'].indexOf('item.name');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        expect(selectionRange).toBeDefined();
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        // Should expand: item.name -> {{item.name}} -> div -> @for block
        expect(depth).toBeGreaterThanOrEqual(4);
      });

      it('should handle @for with @empty block', () => {
        const files = {
          'app.html': `@for (item of items; track item) {
            <li>{{item}}</li>
          } @empty {
            <p>No items</p>
          }`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              items: string[] = [];
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "No items" text in @empty block
        const emptyPos = files['app.html'].indexOf('No items');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', emptyPos);

        expect(selectionRange).toBeDefined();
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        // Should expand: text -> p -> @empty -> @for block
        expect(depth).toBeGreaterThanOrEqual(3);
      });

      it('should handle nested @for loops', () => {
        const files = {
          'app.html': `@for (row of rows; track row) {
            @for (cell of row.cells; track cell) {
              <span>{{cell.value}}</span>
            }
          }`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              rows = [{cells: [{value: 'A1'}]}];
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "cell.value"
        const cellPos = files['app.html'].indexOf('cell.value');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', cellPos);

        expect(selectionRange).toBeDefined();
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        // Should expand: cell.value -> {{...}} -> span -> inner @for -> outer @for
        expect(depth).toBeGreaterThanOrEqual(5);
      });
    });

    describe('@switch blocks', () => {
      it('should handle @switch with multiple @case blocks', () => {
        const files = {
          'app.html': `@switch (status) {
            @case ('active') { <span class="active">Active</span> }
            @case ('inactive') { <span class="inactive">Inactive</span> }
            @default { <span>Unknown</span> }
          }`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              status = 'active';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "Active" text
        const activePos = files['app.html'].indexOf('>Active<') + 1;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', activePos);

        expect(selectionRange).toBeDefined();
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        // Should expand: text -> span -> @case -> @switch
        expect(depth).toBeGreaterThanOrEqual(3);
      });

      it('should handle @switch with expression in @case', () => {
        const files = {
          'app.html': `@switch (value) {
            @case (computedValue) { <div>Match</div> }
          }`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              value = 1;
              computedValue = 1;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "computedValue" in @case
        const casePos = files['app.html'].indexOf('computedValue');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', casePos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('@defer blocks', () => {
      it('should handle @defer with @loading and @error blocks', () => {
        const files = {
          'app.html': `@defer {
            <heavy-component />
          } @loading {
            <p>Loading...</p>
          } @error {
            <p>Error occurred</p>
          }`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {}
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "Loading..." text
        const loadingPos = files['app.html'].indexOf('Loading...');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', loadingPos);

        expect(selectionRange).toBeDefined();
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        // Should expand: text -> p -> @loading -> @defer
        expect(depth).toBeGreaterThanOrEqual(3);
      });

      it('should handle @defer with @placeholder block', () => {
        const files = {
          'app.html': `@defer {
            <main-content />
          } @placeholder (minimum 500ms) {
            <p>Placeholder content</p>
          }`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {}
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "Placeholder content"
        const placeholderPos = files['app.html'].indexOf('Placeholder content');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', placeholderPos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('@if with @else', () => {
      it('should handle @if with @else if and @else', () => {
        const files = {
          'app.html': `@if (condition1) {
            <div>First</div>
          } @else if (condition2) {
            <div>Second</div>
          } @else {
            <div>Default</div>
          }`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              condition1 = false;
              condition2 = false;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "Second" text
        const secondPos = files['app.html'].indexOf('>Second<') + 1;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', secondPos);

        expect(selectionRange).toBeDefined();
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        // Should expand: text -> div -> @else if branch -> @if block
        expect(depth).toBeGreaterThanOrEqual(3);
      });

      it('should handle selection on @if condition expression', () => {
        const files = {
          'app.html': '@if (user.isLoggedIn && user.hasPermission) { <div>Content</div> }',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              user = {isLoggedIn: true, hasPermission: true};
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "isLoggedIn"
        const condPos = files['app.html'].indexOf('isLoggedIn');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', condPos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('nested control flow', () => {
      it('should handle @if inside @for inside @switch', () => {
        const files = {
          'app.html': `@switch (mode) {
            @case ('list') {
              @for (item of items; track item.id) {
                @if (item.visible) {
                  <span>{{item.name}}</span>
                }
              }
            }
          }`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              mode = 'list';
              items = [{id: 1, name: 'Test', visible: true}];
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "item.name"
        const itemPos = files['app.html'].indexOf('item.name');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', itemPos);

        expect(selectionRange).toBeDefined();
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        // Deep nesting: item.name -> {{...}} -> span -> @if -> @for -> @case -> @switch
        expect(depth).toBeGreaterThanOrEqual(6);
      });
    });
  });

  describe('expression patterns', () => {
    describe('pipe expressions', () => {
      it('should handle single pipe', () => {
        const files = {
          'app.html': '<span>{{ value | uppercase }}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              value = 'hello';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "value"
        const valuePos = files['app.html'].indexOf('value');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', valuePos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle chained pipes', () => {
        const files = {
          'app.html': '<span>{{ data | async | json }}</span>',
          'app.ts': `
            import {Component} from '@angular/core';
            import {of} from 'rxjs';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              data = of({name: 'test'});
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "data"
        const dataPos = files['app.html'].indexOf('data');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', dataPos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle pipe with arguments', () => {
        const files = {
          'app.html': `<span>{{ birthday | date:'fullDate':'UTC' }}</span>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              birthday = new Date();
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "birthday"
        const birthdayPos = files['app.html'].indexOf('birthday');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', birthdayPos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('method calls', () => {
      it('should handle method call with arguments', () => {
        const files = {
          'app.html': '<span>{{ formatValue(value, "currency", 2) }}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              value = 100;
              formatValue(v: number, type: string, decimals: number) { return v.toString(); }
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "formatValue"
        const methodPos = files['app.html'].indexOf('formatValue');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', methodPos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle chained method calls', () => {
        const files = {
          'app.html': '<span>{{ items.filter(isActive).map(getName).join(", ") }}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              items: any[] = [];
              isActive = (x: any) => true;
              getName = (x: any) => x.name;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "filter"
        const filterPos = files['app.html'].indexOf('filter');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', filterPos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('conditional expressions', () => {
      it('should handle ternary operator', () => {
        const files = {
          'app.html': '<span>{{ isActive ? "Active" : "Inactive" }}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              isActive = true;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "isActive"
        const condPos = files['app.html'].indexOf('isActive');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', condPos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle nested ternary', () => {
        const files = {
          'app.html': '<span>{{ a ? b ? "AB" : "A" : "None" }}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              a = true;
              b = true;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on inner "b"
        const bPos = files['app.html'].indexOf(' b ') + 1;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', bPos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle nullish coalescing', () => {
        const files = {
          'app.html': '<span>{{ user.name ?? "Anonymous" }}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              user = {name: null as string | null};
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "user.name"
        const userPos = files['app.html'].indexOf('user.name');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', userPos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('safe navigation', () => {
      it('should handle optional chaining', () => {
        const files = {
          'app.html': '<span>{{ user?.profile?.avatar?.url }}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              user: any = null;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "avatar"
        const avatarPos = files['app.html'].indexOf('avatar');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', avatarPos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle safe method call', () => {
        const files = {
          'app.html': '<span>{{ user?.getName?.() }}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              user: any = null;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "getName"
        const namePos = files['app.html'].indexOf('getName');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('keyed access', () => {
      it('should handle array index access', () => {
        const files = {
          'app.html': '<span>{{ items[0].name }}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              items = [{name: 'First'}];
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "items"
        const itemsPos = files['app.html'].indexOf('items');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', itemsPos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle bracket notation with variable key', () => {
        const files = {
          'app.html': '<span>{{ translations[currentLang] }}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              translations: Record<string, string> = {};
              currentLang = 'en';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "currentLang"
        const langPos = files['app.html'].indexOf('currentLang');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', langPos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('literal expressions', () => {
      it('should handle array literal in binding', () => {
        const files = {
          'app.html': '<app-list [items]="[1, 2, 3, 4, 5]"></app-list>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {}
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position inside the array literal
        const arrayPos = files['app.html'].indexOf('[1,');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', arrayPos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle object literal in binding', () => {
        const files = {
          'app.html': `<app-config [options]="{theme: 'dark', size: 'large'}"></app-config>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {}
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "theme"
        const themePos = files['app.html'].indexOf('theme');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', themePos);

        expect(selectionRange).toBeDefined();
      });
    });
  });

  describe('binding patterns', () => {
    describe('two-way binding', () => {
      it('should handle banana-in-a-box syntax', () => {
        const files = {
          'app.html': '<input [(ngModel)]="userName">',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              userName = '';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "userName"
        const userPos = files['app.html'].indexOf('userName');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', userPos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('class and style bindings', () => {
      it('should handle [class.name] binding', () => {
        const files = {
          'app.html': '<div [class.active]="isActive" [class.disabled]="isDisabled">Content</div>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              isActive = true;
              isDisabled = false;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "isActive"
        const activePos = files['app.html'].indexOf('isActive');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', activePos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle [style.property] binding', () => {
        const files = {
          'app.html': '<div [style.width.px]="containerWidth" [style.background-color]="bgColor">Content</div>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              containerWidth = 200;
              bgColor = 'blue';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "containerWidth"
        const widthPos = files['app.html'].indexOf('containerWidth');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', widthPos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('attribute bindings', () => {
      it('should handle [attr.name] binding', () => {
        const files = {
          'app.html': '<button [attr.aria-label]="buttonLabel" [attr.data-testid]="testId">Click</button>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              buttonLabel = 'Submit form';
              testId = 'submit-btn';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "buttonLabel"
        const labelPos = files['app.html'].indexOf('buttonLabel');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', labelPos);

        expect(selectionRange).toBeDefined();
      });
    });
  });

  describe('template features', () => {
    describe('template references', () => {
      it('should handle template reference variable', () => {
        const files = {
          'app.html': '<input #nameInput type="text"><button (click)="greet(nameInput.value)">Greet</button>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              greet(name: string) { console.log('Hello', name); }
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "nameInput" in the event handler
        const refPos = files['app.html'].indexOf('nameInput.value');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', refPos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle reference on ng-template', () => {
        const files = {
          'app.html': `
            <ng-template #loadingTemplate>
              <p>Loading...</p>
            </ng-template>
            <div *ngIf="data; else loadingTemplate">{{data}}</div>
          `,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              data: string | null = null;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "Loading..."
        const loadingPos = files['app.html'].indexOf('Loading...');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', loadingPos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('@let declarations', () => {
      it('should handle @let with expression', () => {
        const files = {
          'app.html': `@let fullName = firstName + ' ' + lastName;
            <span>{{fullName}}</span>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              firstName = 'John';
              lastName = 'Doe';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "firstName" in @let
        const namePos = files['app.html'].indexOf('firstName');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle @let with pipe and usage', () => {
        const files = {
          'app.html': `@let upperName = name | uppercase;
            <div>{{upperName}}</div>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              name = 'test';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "upperName" usage
        const usagePos = files['app.html'].indexOf('{{upperName}}') + 2;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', usagePos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('structural directives', () => {
      it('should handle *ngIf with as syntax', () => {
        const files = {
          'app.html': '<div *ngIf="user$ | async as user">Welcome, {{user.name}}</div>',
          'app.ts': `
            import {Component} from '@angular/core';
            import {of} from 'rxjs';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              user$ = of({name: 'John'});
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "user.name"
        const namePos = files['app.html'].indexOf('user.name');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle *ngFor with multiple local variables', () => {
        const files = {
          'app.html': `<li *ngFor="let item of items; index as i; first as isFirst; last as isLast; trackBy: trackFn">
            {{i}}: {{item.name}} {{isFirst ? '(first)' : ''}} {{isLast ? '(last)' : ''}}
          </li>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              items = [{id: 1, name: 'A'}, {id: 2, name: 'B'}];
              trackFn(index: number, item: any) { return item.id; }
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "isFirst"
        const firstPos = files['app.html'].indexOf('{{isFirst');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', firstPos + 2);

        expect(selectionRange).toBeDefined();
      });
    });
  });

  describe('complex scenarios', () => {
    describe('deeply nested templates', () => {
      it('should handle 5+ levels of nesting', () => {
        const files = {
          'app.html': `
            <div class="level-1">
              <section class="level-2">
                <article class="level-3">
                  <div class="level-4">
                    <span class="level-5">Deep content</span>
                  </div>
                </article>
              </section>
            </div>
          `,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {}
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "Deep content"
        const contentPos = files['app.html'].indexOf('Deep content');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', contentPos);

        expect(selectionRange).toBeDefined();
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        // Should have many levels: text -> span -> div -> article -> section -> div
        expect(depth).toBeGreaterThanOrEqual(5);
      });
    });

    describe('mixed content', () => {
      it('should handle elements with mixed text, interpolation and elements', () => {
        const files = {
          'app.html': '<p>Hello <strong>{{user.name}}</strong>, welcome to <em>{{siteName}}</em>!</p>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              user = {name: 'John'};
              siteName = 'My App';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "user.name"
        const namePos = files['app.html'].indexOf('user.name');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        expect(selectionRange).toBeDefined();
        let depth = 0;
        let range = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        expect(depth).toBeGreaterThanOrEqual(3);
      });
    });

    describe('component inputs with complex expressions', () => {
      it('should handle input with function call returning object', () => {
        const files = {
          'app.html': '<app-config [settings]="getSettings({theme: currentTheme, locale: userLocale})"></app-config>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              currentTheme = 'dark';
              userLocale = 'en-US';
              getSettings(opts: any) { return opts; }
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "currentTheme"
        const themePos = files['app.html'].indexOf('currentTheme');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', themePos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('event handlers with complex expressions', () => {
      it('should handle event with ternary and method call', () => {
        const files = {
          'app.html': '<button (click)="isEnabled ? handleClick($event, item.id) : noOp()">Action</button>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              isEnabled = true;
              item = {id: 1};
              handleClick(event: Event, id: number) {}
              noOp() {}
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "handleClick"
        const clickPos = files['app.html'].indexOf('handleClick');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', clickPos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle event with arrow function', () => {
        const files = {
          'app.html': '<div *ngFor="let item of items"><button (click)="remove(item)">Remove</button></div>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              items = [1, 2, 3];
              remove(item: number) { this.items = this.items.filter(i => i !== item); }
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "remove(item)"
        const removePos = files['app.html'].indexOf('remove(item)');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', removePos);

        expect(selectionRange).toBeDefined();
      });
    });

    describe('edge cases', () => {
      it('should handle empty element', () => {
        const files = {
          'app.html': '<div></div>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {}
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position inside empty div
        const pos = 4;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', pos);

        // May or may not return a range for empty content
        // Just verify it doesn't throw
        expect(true).toBe(true);
      });

      it('should handle self-closing element', () => {
        const files = {
          'app.html': '<input type="text" [value]="name" />',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              name = '';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "name"
        const namePos = files['app.html'].indexOf('name');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle multiple interpolations in single text node', () => {
        const files = {
          'app.html': '<span>{{a}} + {{b}} = {{a + b}}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              a = 1;
              b = 2;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on first "a"
        const aPos = files['app.html'].indexOf('{{a}}') + 2;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', aPos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle whitespace-only text nodes', () => {
        const files = {
          'app.html': `<div>
            <span>Content</span>
          </div>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {}
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "Content"
        const contentPos = files['app.html'].indexOf('Content');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', contentPos);

        expect(selectionRange).toBeDefined();
      });

      it('should handle attribute with empty value', () => {
        const files = {
          'app.html': '<input disabled="">',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {}
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "disabled"
        const attrPos = files['app.html'].indexOf('disabled');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', attrPos);

        expect(selectionRange).toBeDefined();
      });
    });
  });
});
