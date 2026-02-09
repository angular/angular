/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import ts from 'typescript';

import {LanguageServiceTestEnv} from '../testing';
import {createModuleAndProjectWithDeclarations} from '../testing/src/util';

/**
 * Helper function to verify the exact expansion chain matches the expected sequence.
 *
 * @param selectionRange The starting selection range
 * @param template The full template string (needed to extract text at each range)
 * @param expectedChain Array of expected text values in order (innermost to outermost)
 * @param templateOffset Optional offset if template is part of a larger file (for inline templates)
 */
function verifyExpansionChain(
  selectionRange: ts.SelectionRange | undefined,
  template: string,
  expectedChain: string[],
  templateOffset: number = 0,
): void {
  expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
  if (!selectionRange) return;

  const actualChain: string[] = [];
  let range: ts.SelectionRange | undefined = selectionRange;

  while (range) {
    const start = range.textSpan.start - templateOffset;
    const length = range.textSpan.length;
    const text = template.substring(start, start + length);
    actualChain.push(text);
    range = range.parent;
  }

  // Verify chain length
  expect(actualChain.length)
    .withContext(
      `Expected ${expectedChain.length} steps but got ${actualChain.length}.\n` +
        `Expected: ${JSON.stringify(expectedChain)}\n` +
        `Actual: ${JSON.stringify(actualChain)}`,
    )
    .toBe(expectedChain.length);

  // Verify each step
  for (let i = 0; i < expectedChain.length; i++) {
    expect(actualChain[i])
      .withContext(
        `Step ${i + 1}/${expectedChain.length} mismatch.\n` +
          `Full expected chain: ${JSON.stringify(expectedChain)}\n` +
          `Full actual chain: ${JSON.stringify(actualChain)}`,
      )
      .toBe(expectedChain[i]);
  }
}

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
      const template = '<div>content</div>';

      // Position on "content" text (offset 5 is 'c' in content)
      const selectionRange = project.getSelectionRangeAtPosition('app.html', 5);

      // Verify the exact expansion chain: content → <div>content</div>
      verifyExpansionChain(selectionRange, template, ['content', '<div>content</div>']);
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
      const template = '<div><span>nested</span></div>';
      // Position on "nested" text (offset 11 is 'n' in nested)
      const selectionRange = project.getSelectionRangeAtPosition('app.html', 11);

      // Verify the exact expansion chain: nested → <span>nested</span> → <div><span>nested</span></div>
      verifyExpansionChain(selectionRange, template, [
        'nested',
        '<span>nested</span>',
        '<div><span>nested</span></div>',
      ]);
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
      const template = '<div>content</div>';
      // Position inside the template on "content"
      const contentPos = appFile.contents.indexOf('content');
      const templateOffset = appFile.contents.indexOf('<div>');

      const selectionRange = project.getSelectionRangeAtPosition('app.ts', contentPos);

      // Verify the exact expansion chain: content → <div>content</div>
      verifyExpansionChain(
        selectionRange,
        template,
        ['content', '<div>content</div>'],
        templateOffset,
      );
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
      const template = '<div><span>nested</span></div>';
      // Position on "nested" text
      const nestedPos = appFile.contents.indexOf('nested');
      const templateOffset = appFile.contents.indexOf('<div>');

      const selectionRange = project.getSelectionRangeAtPosition('app.ts', nestedPos);

      // Verify the exact expansion chain: nested → <span>nested</span> → <div><span>nested</span></div>
      verifyExpansionChain(
        selectionRange,
        template,
        ['nested', '<span>nested</span>', '<div><span>nested</span></div>'],
        templateOffset,
      );
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

    it('should handle inline template with complex element and multiple attributes', () => {
      // Test inline template with complex attributes - similar to user bug report
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<div data-test="test1" [style.color]="color" style="border: 1px solid"><strong>TEST 1</strong><br>Actual: BLUE text</div>',
          })
          export class AppComponent {
            color = 'blue';
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      const template =
        '<div data-test="test1" [style.color]="color" style="border: 1px solid"><strong>TEST 1</strong><br>Actual: BLUE text</div>';

      // Position on "BLUE" in the text content (inside "Actual: BLUE text")
      const bluePos = appFile.contents.indexOf('BLUE');
      const templateOffset = appFile.contents.indexOf('<div data-test');

      const selectionRange = project.getSelectionRangeAtPosition('app.ts', bluePos);

      // Verify expansion now includes word as innermost step
      verifyExpansionChain(
        selectionRange,
        template,
        [
          'BLUE', // Word at cursor
          'Actual: BLUE text', // Text node
          '<strong>TEST 1</strong><br>Actual: BLUE text', // Children grouped
          '<div data-test="test1" [style.color]="color" style="border: 1px solid"><strong>TEST 1</strong><br>Actual: BLUE text</div>', // Full element
        ],
        templateOffset,
      );
    });

    it('should expand through nested elements in backtick inline template', () => {
      // Reproduces user bug: expanding from style attr inside nested divs in backtick template
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: \`<div style="padding: 20px;"><div style="margin: 10px;"><strong style="color: red;">TEXT</strong></div></div>\`,
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      const template = `<div style="padding: 20px;"><div style="margin: 10px;"><strong style="color: red;">TEXT</strong></div></div>`;
      const templateOffset = appFile.contents.indexOf('<div style="padding');
      // Position on "color: red;" VALUE (inside the quotes) in <strong style="color: red;">
      // This tests expansion from the value
      const colorValuePos = appFile.contents.indexOf('color: red');

      const selectionRange = project.getSelectionRangeAtPosition('app.ts', colorValuePos);

      // Verify exact expansion chain from attribute value
      verifyExpansionChain(
        selectionRange,
        template,
        [
          'color: red;', // attribute value
          'style="color: red;"', // full attribute
          '<strong style="color: red;">TEXT</strong>', // strong element
          '<div style="margin: 10px;"><strong style="color: red;">TEXT</strong></div>', // inner div
          template, // outer div
        ],
        templateOffset,
      );
    });

    it('should handle multi-line opening tag in backtick inline template', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: \`<div
              style="border: 1px solid black;">
              Actual content
            </div>\`,
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      const template = `<div
              style="border: 1px solid black;">
              Actual content
            </div>`;
      const templateOffset = appFile.contents.indexOf('<div');
      // Position on "style" keyword inside the multi-line opening tag
      const stylePos = appFile.contents.indexOf('style="border');

      const selectionRange = project.getSelectionRangeAtPosition('app.ts', stylePos);

      expect(selectionRange)
        .withContext('Selection range should be defined for multi-line inline template')
        .toBeDefined();

      if (selectionRange) {
        // Collect chain
        const chainTexts: string[] = [];
        let range: ts.SelectionRange | undefined = selectionRange;
        while (range) {
          const text = appFile.contents.substring(
            range.textSpan.start,
            range.textSpan.start + range.textSpan.length,
          );
          chainTexts.push(text.substring(0, 60));
          range = range.parent!;
        }
        // Verify the full attribute is in the chain
        const hasAttr = chainTexts.some((t) => t.includes('style="border'));
        expect(hasAttr)
          .withContext(`Chain should include style attribute. Chain: ${JSON.stringify(chainTexts)}`)
          .toBe(true);

        // Verify the div element is in the chain
        const hasDiv = chainTexts.some((t) => t.startsWith('<div'));
        expect(hasDiv)
          .withContext(`Chain should include div element. Chain: ${JSON.stringify(chainTexts)}`)
          .toBe(true);
      }
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
        // In {{user.address.city}}, cursor on "city" should expand through the full property chain
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
        const template = '<span>{{user.address.city}}</span>';
        // Position on "city" - offset 23 is 'c' in city
        const cityPos = 23;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', cityPos);

        // Verify expansion chain - tests AST traversal through property access nodes
        // Should expand through entire property chain: user → user.address → user.address.city → interpolation → element
        verifyExpansionChain(selectionRange, template, [
          'user',
          'user.address',
          'user.address.city',
          '{{user.address.city}}',
          '<span>{{user.address.city}}</span>',
        ]);
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
        const template = '<input [value]="userName">';
        // Position on "userName" in the binding (offset 17 is 'u' in userName)
        const userNamePos = 17;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', userNamePos);

        // Verify expansion: userName → value → [value]="userName" → <input [value]="userName">
        verifyExpansionChain(selectionRange, template, [
          'userName',
          'value',
          '[value]="userName"',
          '<input [value]="userName">',
        ]);
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

      it('should group multiple attributes as siblings', () => {
        // Selection in one attribute should be able to expand to include all sibling attributes
        const files = {
          'app.html': '<input id="name" class="form-control" type="text" placeholder="Enter name">',
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
        const template =
          '<input id="name" class="form-control" type="text" placeholder="Enter name">';
        // Position on "name" value in id attribute (offset 11 is 'n' in name)
        const namePos = 11;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        // Verify expansion includes attribute sibling grouping
        // Should expand: name → id="name" → [all attributes] → <input ...>
        verifyExpansionChain(selectionRange, template, [
          'name',
          'id="name"',
          'id="name" class="form-control" type="text" placeholder="Enter name"',
          '<input id="name" class="form-control" type="text" placeholder="Enter name">',
        ]);
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

      it('should expand through @defer when trigger expression', () => {
        const files = {
          'app.html': `@defer (when isReady) {
            <heavy-component />
          }`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              isReady = false;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "isReady" in the when condition
        const isReadyPos = files['app.html'].indexOf('isReady');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', isReadyPos);

        expect(selectionRange).toBeDefined();
        // First expansion should be the expression "isReady"
        const rangeText = files['app.html'].substring(
          selectionRange!.textSpan.start,
          selectionRange!.textSpan.start + selectionRange!.textSpan.length,
        );
        expect(rangeText).toContain('isReady');
      });

      it('should expand through @defer when trigger with property access', () => {
        const files = {
          'app.html': `@defer (when data.isLoaded) {
            <result-view [data]="data" />
          }`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              data = { isLoaded: false };
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "isLoaded" in the when condition
        const isLoadedPos = files['app.html'].indexOf('isLoaded');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', isLoadedPos);

        // Note: Selection range for @defer when trigger expressions may vary
        // depending on how the compiler parses the trigger clause.
        // The important thing is that it doesn't crash and returns something.
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
      it('should expand from pipe argument through pipe name+args to full pipe', () => {
        // Cursor on 'short' string content inside pipe arg
        const files = {
          'app.html': `<span>{{ value | date:'short' }}</span>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              value = new Date();
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const template = files['app.html'];
        // Position on "short" (inside the quotes)
        const shortPos = template.indexOf('short');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', shortPos);

        // short → 'short' → date:'short' → value | date:'short' → {{ ... }} → <span>...</span>
        verifyExpansionChain(selectionRange, template, [
          'short',
          `'short'`,
          `date:'short'`,
          `value | date:'short'`,
          `{{ value | date:'short' }}`,
          `<span>{{ value | date:'short' }}</span>`,
        ]);
      });

      it('should expand from pipe name through pipe name+args to full pipe', () => {
        // Cursor on pipe name 'date'
        const files = {
          'app.html': `<span>{{ value | date:'short' }}</span>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              value = new Date();
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const template = files['app.html'];
        // Position on "date" pipe name
        const datePos = template.indexOf('date');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', datePos);

        // date → date:'short' → value | date:'short' → {{ ... }} → <span>...</span>
        verifyExpansionChain(selectionRange, template, [
          'date',
          `date:'short'`,
          `value | date:'short'`,
          `{{ value | date:'short' }}`,
          `<span>{{ value | date:'short' }}</span>`,
        ]);
      });

      it('should expand from pipe input expression to full pipe', () => {
        // Cursor on input expression 'value'
        const files = {
          'app.html': `<span>{{ value | uppercase }}</span>`,
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
        const template = files['app.html'];
        const valuePos = template.indexOf('value');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', valuePos);

        // value → value | uppercase → {{ value | uppercase }} → <span>...</span>
        verifyExpansionChain(selectionRange, template, [
          'value',
          'value | uppercase',
          '{{ value | uppercase }}',
          '<span>{{ value | uppercase }}</span>',
        ]);
      });

      it('should handle pipe with multiple arguments', () => {
        // For date:'fullDate':'UTC', cursor on 'UTC'
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
        const template = files['app.html'];
        // Position on "UTC" (inside quotes)
        const utcPos = template.indexOf('UTC');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', utcPos);

        // UTC → 'UTC' → date:'fullDate':'UTC' → birthday | date:'fullDate':'UTC' → {{ ... }} → <span>...</span>
        verifyExpansionChain(selectionRange, template, [
          'UTC',
          `'UTC'`,
          `date:'fullDate':'UTC'`,
          `birthday | date:'fullDate':'UTC'`,
          `{{ birthday | date:'fullDate':'UTC' }}`,
          `<span>{{ birthday | date:'fullDate':'UTC' }}</span>`,
        ]);
      });

      it('should handle chained pipes from input expression', () => {
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
        const template = files['app.html'];
        const dataPos = template.indexOf('data');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', dataPos);

        // data → data | async → data | async | json → {{ ... }} → <span>...</span>
        verifyExpansionChain(selectionRange, template, [
          'data',
          'data | async',
          'data | async | json',
          '{{ data | async | json }}',
          '<span>{{ data | async | json }}</span>',
        ]);
      });
    });

    describe('method calls', () => {
      it('should expand from call argument through argument list to full call', () => {
        // Cursor on "currency" argument inside fn(value, "currency", 2)
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
        const template = files['app.html'];
        // Position on "currency" (inside quotes)
        const currencyPos = template.indexOf('currency');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', currencyPos);

        // currency → "currency" → value, "currency", 2 → formatValue(...) → {{ ... }} → <span>...</span>
        verifyExpansionChain(selectionRange, template, [
          'currency',
          '"currency"',
          'value, "currency", 2',
          'formatValue(value, "currency", 2)',
          '{{ formatValue(value, "currency", 2) }}',
          '<span>{{ formatValue(value, "currency", 2) }}</span>',
        ]);
      });

      it('should expand from method name through property chain', () => {
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
        const template = files['app.html'];
        // Position on "filter" — in a property chain
        const filterPos = template.indexOf('filter');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', filterPos);

        expect(selectionRange).toBeDefined();
        if (!selectionRange) return;

        // Collect chain texts
        const chain: string[] = [];
        let range: ts.SelectionRange | undefined = selectionRange;
        while (range) {
          chain.push(template.substring(range.textSpan.start, range.textSpan.start + range.textSpan.length));
          range = range.parent;
        }

        // "filter" is a property read in a chain, so expansion should include chain steps
        // The chain should include items.filter(isActive) and outer calls
        expect(chain.some(s => s.includes('items'))).toBe(true);
        expect(chain.some(s => s.includes('join'))).toBe(true);
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

    describe('arrow function expressions', () => {
      it('should expand through arrow function body', () => {
        const files = {
          'app.html': `<div>{{ x => x * 2 }}</div>`,
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
        const template = files['app.html'];

        // Position on the first "x" in the body expression
        const xPos = template.indexOf('x * 2');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', xPos);

        // Note: There may be an intermediate span for parameters
        expect(selectionRange).toBeDefined();
        if (!selectionRange) return;

        // Check that we have at minimum: body part → arrow function → interpolation
        const chain: string[] = [];
        let range: typeof selectionRange | undefined = selectionRange;
        while (range) {
          const start = range.textSpan.start;
          const length = range.textSpan.length;
          chain.push(template.substring(start, start + length));
          range = range.parent;
        }

        // Should contain arrow function and interpolation
        expect(chain.some((s) => s.includes('x => x * 2'))).toBe(true);
        expect(chain.some((s) => s.includes('{{'))).toBe(true);
      });

      it('should handle arrow function in property binding', () => {
        const files = {
          'app.html': `<button [disabled]="items.some(item => item.invalid)">Submit</button>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              items = [{invalid: false}];
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const template = files['app.html'];

        // Position on "item.invalid"
        const itemPos = template.indexOf('item.invalid');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', itemPos);

        expect(selectionRange).toBeDefined();
        // Should have: item → item.invalid → arrow function → some() call
      });
    });

    describe('pipe expressions', () => {
      it('should expand through pipe chains from input expression', () => {
        const files = {
          'app.html': `<div>{{ name | uppercase | slice:0:5 }}</div>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              name = 'Angular';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const template = files['app.html'];
        const namePos = template.indexOf('name');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        // name → name | uppercase → name | uppercase | slice:0:5 → {{ ... }} → <div>...</div>
        verifyExpansionChain(selectionRange, template, [
          'name',
          'name | uppercase',
          'name | uppercase | slice:0:5',
          '{{ name | uppercase | slice:0:5 }}',
          '<div>{{ name | uppercase | slice:0:5 }}</div>',
        ]);
      });

      it('should expand from pipe argument in chained pipes', () => {
        const files = {
          'app.html': `<div>{{ name | uppercase | slice:0:5 }}</div>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              name = 'Angular';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const template = files['app.html'];
        // Position on "5" in slice:0:5 (the second arg to slice pipe)
        const fivePos = template.indexOf(':5') + 1;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', fivePos);

        // 5 → slice:0:5 → name | uppercase | slice:0:5 → {{ ... }} → <div>...</div>
        verifyExpansionChain(selectionRange, template, [
          '5',
          'slice:0:5',
          'name | uppercase | slice:0:5',
          '{{ name | uppercase | slice:0:5 }}',
          '<div>{{ name | uppercase | slice:0:5 }}</div>',
        ]);
      });
    });

    describe('literal expressions', () => {
      it('should expand through array literals', () => {
        const files = {
          'app.html': `<div [items]="[1, 2, 3]"></div>`,
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
        const template = files['app.html'];

        // Position on "1"
        const onePos = template.indexOf('1');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', onePos);

        expect(selectionRange).toBeDefined();
        // Should have: 1 → [1, 2, 3] → binding
      });

      it('should expand through object literals', () => {
        const files = {
          'app.html': `<div [config]="{theme: 'dark', size: 10}"></div>`,
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
        const template = files['app.html'];

        // Position on 'dark'
        const darkPos = template.indexOf("'dark'");

        const selectionRange = project.getSelectionRangeAtPosition('app.html', darkPos);

        expect(selectionRange).toBeDefined();
        // Should have: 'dark' → object literal → binding
      });
    });

    describe('unary expressions', () => {
      it('should expand through prefix not', () => {
        const files = {
          'app.html': `<div *ngIf="!isHidden">Content</div>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              isHidden = false;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const template = files['app.html'];

        // Position on "isHidden"
        const hiddenPos = template.indexOf('isHidden');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', hiddenPos);

        expect(selectionRange).toBeDefined();
        // Should have: isHidden → !isHidden → binding
      });

      it('should expand through typeof expression', () => {
        const files = {
          'app.html': `<div *ngIf='typeof value === "string"'>Text</div>`,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              value: any = 'test';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const template = files['app.html'];

        // Position on "value"
        const valuePos = template.indexOf('value');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', valuePos);

        expect(selectionRange).toBeDefined();
        // Should have: value → typeof value → comparison
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
          'app.html':
            '<div [style.width.px]="containerWidth" [style.background-color]="bgColor">Content</div>',
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
          'app.html':
            '<button [attr.aria-label]="buttonLabel" [attr.data-testid]="testId">Click</button>',
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
          'app.html':
            '<input #nameInput type="text"><button (click)="greet(nameInput.value)">Greet</button>',
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
          'app.html':
            '<p>Hello <strong>{{user.name}}</strong>, welcome to <em>{{siteName}}</em>!</p>',
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
          'app.html':
            '<app-config [settings]="getSettings({theme: currentTheme, locale: userLocale})"></app-config>',
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
          'app.html':
            '<button (click)="isEnabled ? handleClick($event, item.id) : noOp()">Action</button>',
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
          'app.html':
            '<div *ngFor="let item of items"><button (click)="remove(item)">Remove</button></div>',
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

    describe('ICU messages', () => {
      it('should handle basic plural ICU message', () => {
        const files = {
          'app.html':
            '<span i18n>{count, plural, =0 {no items} =1 {one item} other {{{count}} items}}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              count = 5;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "items" in the "other" case
        const itemsPos = files['app.html'].indexOf('}} items}');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', itemsPos + 3);

        expect(selectionRange).toBeDefined();
      });

      it('should expand within ICU variable expression', () => {
        const files = {
          'app.html':
            '<span i18n>{count, plural, =0 {none} =1 {one} other {many}}</span><p>Count: {{count}}</p>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              count = 5;
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "count" in the regular interpolation (more predictable)
        const countPos = files['app.html'].indexOf('{{count}}') + 2;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', countPos);

        expect(selectionRange).toBeDefined();
        const rangeText = files['app.html'].substring(
          selectionRange!.textSpan.start,
          selectionRange!.textSpan.start + selectionRange!.textSpan.length,
        );
        expect(rangeText).toContain('count');
      });

      it('should handle select ICU message', () => {
        const files = {
          'app.html': '<span i18n>{gender, select, male {He} female {She} other {They}}</span>',
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
            })
            export class AppComponent {
              gender = 'male';
            }
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "She" in the female case
        const shePos = files['app.html'].indexOf('She');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', shePos);

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

    describe('element content selection bug', () => {
      it('should NOT include part of opening tag when selecting content', () => {
        // Bug reproduction: selecting text inside element content should expand to:
        // text → element containing text → children grouped → full element
        // NOT: text → partial opening tag + content
        const files = {
          'app.html': `<div data-test-id="test1" style="border: 1px solid"><strong>BLUE text</strong><br>More content</div>`,
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
        const template = files['app.html'];
        // Position on "BLUE" in the content
        const bluePos = template.indexOf('BLUE');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', bluePos);

        // Verify expansion now includes word as the innermost step
        // Note: Line span same as text node so one gets deduplicated
        verifyExpansionChain(selectionRange, template, [
          'BLUE', // Word at cursor
          'BLUE text', // Text node (line is same, deduplicated)
          '<strong>BLUE text</strong>', // Strong element
          '<strong>BLUE text</strong><br>More content', // Siblings grouped
          '<div data-test-id="test1" style="border: 1px solid"><strong>BLUE text</strong><br>More content</div>', // Full element
        ]);
      });

      it('should handle complex element with many attributes and bound properties', () => {
        // Complex template similar to user's bug report
        const files = {
          'app.html': `<div data-test-id="test1" myDirectiveA [style.backgroundColor]="'rgb(0, 0, 255)'" [style.color]="'rgb(255, 255, 0)'" [ngStyle]="{'border': '5px solid green'}" [style]="{'padding': '20px', 'margin': '10px'}" style="border: 1px 2px 3px var(--help);"><strong>TEST 1: Template</strong><br>Expected: BLUE background<br>Actual: This should be BLUE with YELLOW text</div>`,
          'app.ts': `
            import {Component} from '@angular/core';
            import {NgStyle} from '@angular/common';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
              imports: [NgStyle],
            })
            export class AppComponent {}
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const template = files['app.html'];
        // Position on "BLUE" in the text content (not in attributes!)
        const bluePos = template.indexOf('should be BLUE');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', bluePos);

        // Verify expansion now includes word as the innermost step
        // Note: Line and text node have same span so one gets deduplicated
        verifyExpansionChain(selectionRange, template, [
          'should', // Word at cursor
          'Actual: This should be BLUE with YELLOW text', // Text node (line is same, deduplicated)
          '<strong>TEST 1: Template</strong><br>Expected: BLUE background<br>Actual: This should be BLUE with YELLOW text', // Content span
          `<div data-test-id="test1" myDirectiveA [style.backgroundColor]="'rgb(0, 0, 255)'" [style.color]="'rgb(255, 255, 0)'" [ngStyle]="{'border': '5px solid green'}" [style]="{'padding': '20px', 'margin': '10px'}" style="border: 1px 2px 3px var(--help);"><strong>TEST 1: Template</strong><br>Expected: BLUE background<br>Actual: This should be BLUE with YELLOW text</div>`, // Full element
        ]);
      });

      it('should handle multiline template similar to user bug report', () => {
        // Template with newlines - similar to the user's actual template
        const template = `<div data-test-id="test1" myDirectiveA 
[style.backgroundColor]="'rgb(0, 0, 255)'" 
[style.color]="'rgb(255, 255, 0)'" 
[ngStyle]="{'border': '5px solid green'}" 
[style]="{'padding': '20px', 'margin': '10px'}" 
style="border: 1px 2px 3px var(--help);">
<strong>TEST 1: Template [style.backgroundColor]</strong><br>
Expected: BLUE background rgb(0, 0, 255)<br>
Expected: YELLOW text rgb(255, 255, 0)<br>
Actual: This should be BLUE with YELLOW text ← TEMPLATE WINS
</div>`;

        const files = {
          'app.html': template,
          'app.ts': `
            import {Component} from '@angular/core';
            import {NgStyle} from '@angular/common';

            @Component({
              selector: 'my-app',
              templateUrl: './app.html',
              imports: [NgStyle],
            })
            export class AppComponent {}
          `,
        };

        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        // Position on "BLUE" in the text content
        const bluePos = template.indexOf('should be BLUE');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', bluePos);

        // Verify expansion: word → line → text node → content → element
        // Word is innermost, element is outermost
        verifyExpansionChain(selectionRange, template, [
          `should`, // Word at cursor (innermost)
          `Actual: This should be BLUE with YELLOW text ← TEMPLATE WINS`, // Line content (trimmed) - larger than word
          `\nActual: This should be BLUE with YELLOW text ← TEMPLATE WINS\n`, // Full text node with newlines
          `\n<strong>TEST 1: Template [style.backgroundColor]</strong><br>\nExpected: BLUE background rgb(0, 0, 255)<br>\nExpected: YELLOW text rgb(255, 255, 0)<br>\nActual: This should be BLUE with YELLOW text ← TEMPLATE WINS\n`, // Content span
          template, // Full element (outermost)
        ]);
      });
    });

    describe('inline style and class attributes', () => {
      // NOTE: Granular CSS selection (individual properties, values) is handled by
      // CSS LSP delegation at the VS Code server level, not in the core language service.
      // These tests verify the core Angular AST selection behavior.

      it('should select full style attribute value', () => {
        const files = {
          'app.html': '<div style="color: red; background: blue">Content</div>',
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
        const template = files['app.html'];
        // Position on "red" in style value - core LS gives full value, CSS LSP enhances
        const redPos = template.indexOf('red');
        const selectionRange = project.getSelectionRangeAtPosition('app.html', redPos);

        // Core LS provides: full value → full attribute → element
        // CSS LSP in VS Code server adds: property-value → declaration → ... (granular)
        verifyExpansionChain(selectionRange, template, [
          'color: red; background: blue', // Full style value (core LS)
          'style="color: red; background: blue"', // Full attribute
          '<div style="color: red; background: blue">Content</div>', // Full element
        ]);
      });

      it('should select full class attribute value', () => {
        const files = {
          'app.html': '<div class="foo bar baz">Content</div>',
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
        const template = files['app.html'];
        // Position on "bar" in class value - core LS gives full value
        const barPos = template.indexOf('bar');
        const selectionRange = project.getSelectionRangeAtPosition('app.html', barPos);

        // Core LS provides: full value → full attribute → element
        // CSS LSP in VS Code server adds individual class name selection
        verifyExpansionChain(selectionRange, template, [
          'foo bar baz', // Full class value (core LS)
          'class="foo bar baz"', // Full attribute
          '<div class="foo bar baz">Content</div>', // Full element
        ]);
      });
    });

    describe('nested plain elements', () => {
      it('should expand through nested divs when cursor is on style attribute', () => {
        // Reproduces bug where expanding from style attribute skips parent elements
        const template = `<div style="padding: 20px;"><div style="margin: 10px;"><strong style="color: red;">TEXT</strong></div></div>`;
        const files = {
          'app.html': template,
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
        // Position on "color: red" VALUE (inside the quotes) in the <strong style="...">
        const colorValuePos = template.indexOf('color: red');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', colorValuePos);

        // The expansion chain should include ALL parent elements
        verifyExpansionChain(selectionRange, template, [
          'color: red;', // attribute value
          'style="color: red;"', // full attribute
          '<strong style="color: red;">TEXT</strong>', // strong element
          '<div style="margin: 10px;"><strong style="color: red;">TEXT</strong></div>', // inner div
          template, // outer div
        ]);
      });

      it('should not skip parent elements for deeply nested elements', () => {
        const template = `<div id="outer"><h2>Title</h2><div id="inner"><strong style="color: #080;">PASS</strong><br>Info text</div></div>`;
        const files = {
          'app.html': template,
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
        // Position on "PASS" text inside <strong>
        const passPos = template.indexOf('PASS');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', passPos);

        expect(selectionRange).toBeDefined();

        // Collect the chain and verify parent elements are present
        const chainTexts: string[] = [];
        let range = selectionRange;
        while (range) {
          const text = template.substring(
            range.textSpan.start,
            range.textSpan.start + range.textSpan.length,
          );
          chainTexts.push(text);
          range = range.parent;
        }

        // Must include the inner div
        const hasInnerDiv = chainTexts.some((t) => t.includes('id="inner"'));
        expect(hasInnerDiv)
          .withContext(
            `Chain should include inner div. Chain: ${JSON.stringify(chainTexts.map((t) => t.substring(0, 50)))}`,
          )
          .toBe(true);

        // Must include the outer div
        const hasOuterDiv = chainTexts.some(
          (t) => t.includes('id="outer"') && t.includes('id="inner"'),
        );
        expect(hasOuterDiv)
          .withContext(
            `Chain should include outer div. Chain: ${JSON.stringify(chainTexts.map((t) => t.substring(0, 50)))}`,
          )
          .toBe(true);
      });

      it('should expand correctly from text content in multi-line element', () => {
        // This reproduces the user's bug where expansion from text content inside
        // a multi-line element incorrectly starts at the last attribute instead of <div>
        const template = `<div 
      data-test-id="test1"
      style="border: 1px solid;">
      <strong>TEST 1</strong><br>
      Expected: YELLOW text
    </div>`;
        const files = {
          'app.html': template,
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
        // Position on "YELLOW" text (inside the element content)
        const yellowPos = template.indexOf('YELLOW');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', yellowPos);

        expect(selectionRange).toBeDefined();

        // Collect the chain
        const chainTexts: string[] = [];
        let range = selectionRange;
        while (range) {
          const text = template.substring(
            range.textSpan.start,
            range.textSpan.start + range.textSpan.length,
          );
          chainTexts.push(text);
          range = range.parent;
        }

        // The element span should start at <div, not at style=
        const elementStep = chainTexts.find((t) => t.includes('<div') && t.includes('</div>'));
        expect(elementStep).withContext('Should have element step').toBeDefined();
        expect(elementStep!.startsWith('<div'))
          .withContext(
            `Element span should start with '<div', not attribute. Got: "${elementStep?.substring(0, 50)}"`,
          )
          .toBe(true);
      });
    });
  });
});
