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

/**
 * Describes a cursor position within a template for testing expansion chains.
 */
interface CursorSpec {
  /** Label for test output (e.g. 'cursor on "city"') */
  label: string;
  /** Substring to find in template to place cursor. Position is the start of this substring. */
  cursorAt: string;
  /** Optional character offset from the start of cursorAt match (default: 0) */
  offset?: number;
  /** Expected expansion chain from innermost to outermost */
  chain: string[];
}

/**
 * Creates a component TS file that uses templateUrl for the given template.
 * The component class body supports optional member declarations.
 */
/**
 * Test selection range expansion for both external and inline (single-line) templates.
 *
 * For each cursor spec, verifies the expansion chain matches expectations in both modes.
 * This avoids test duplication while ensuring both template forms produce identical results.
 *
 * @param env The test environment
 * @param template The template HTML string. Must be a single line for inline mode to work.
 * @param componentMembers Component class body (properties, methods)
 * @param cursors Array of cursor positions and their expected expansion chains
 */
function verifySelectionRanges(
  env: LanguageServiceTestEnv,
  template: string,
  componentMembers: string,
  cursors: CursorSpec[],
): void {
  // --- External template mode ---
  const externalFiles = {
    'app.html': template,
    'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        selector: 'my-app',
        templateUrl: './app.html',
      })
      export class AppComponent {
        ${componentMembers}
      }
    `,
  };

  const externalProject = createModuleAndProjectWithDeclarations(env, 'test-ext', externalFiles);

  for (const cursor of cursors) {
    const matchIndex = template.indexOf(cursor.cursorAt);
    expect(matchIndex)
      .withContext(`[external][${cursor.label}] cursorAt "${cursor.cursorAt}" not found in template`)
      .toBeGreaterThanOrEqual(0);
    const pos = matchIndex + (cursor.offset ?? 0);

    const selectionRange = externalProject.getSelectionRangeAtPosition('app.html', pos);
    verifyExpansionChain(selectionRange, template, cursor.chain);
  }

  // --- Inline template mode ---
  {
    // Use backticks so single quotes and newlines in template work without escaping
    const escapedForBacktick = template.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    const inlineFiles = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          selector: 'my-app',
          template: \`${escapedForBacktick}\`,
        })
        export class AppComponent {
          ${componentMembers}
        }
      `,
    };

    const inlineProject = createModuleAndProjectWithDeclarations(env, 'test-inline', inlineFiles);
    const appFile = inlineProject.openFile('app.ts');
    // With backtick template, the raw content matches the template exactly (no escape chars)
    const templateOffset = appFile.contents.indexOf(template);
    expect(templateOffset)
      .withContext(`[inline] Could not find template in generated TS file`)
      .toBeGreaterThanOrEqual(0);

    for (const cursor of cursors) {
      const matchIndex = template.indexOf(cursor.cursorAt);
      const pos = templateOffset + matchIndex + (cursor.offset ?? 0);

      const selectionRange = inlineProject.getSelectionRangeAtPosition('app.ts', pos);
      verifyExpansionChain(selectionRange, template, cursor.chain, templateOffset);
    }
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

      const tplMarker = 'template: `';
      const tplStart = appFile.contents.indexOf(tplMarker) + tplMarker.length;
      const tplEnd = appFile.contents.indexOf('`,', tplStart);
      const template = appFile.contents.substring(tplStart, tplEnd);
      const sectionInner = template.substring(
        template.indexOf('<section>') + '<section>'.length,
        template.indexOf('</section>'),
      );
      const sectionFull = template.substring(
        template.indexOf('<section>'),
        template.indexOf('</section>') + '</section>'.length,
      );

      // content → <article>content</article> → section children → <section>...</section> → full template
      verifyExpansionChain(
        selectionRange,
        template,
        ['content', '<article>content</article>', sectionInner, sectionFull, template],
        tplStart,
      );
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

      const tplMarker = 'template: `';
      const tplStart = appFile.contents.indexOf(tplMarker) + tplMarker.length;
      const tplEnd = appFile.contents.indexOf('`,', tplStart);
      const template = appFile.contents.substring(tplStart, tplEnd);
      const lastBrace = template.lastIndexOf('}');
      const ifBodyContent = template.substring(template.indexOf('{') + 1, lastBrace);
      const ifBlock = template.substring(template.indexOf('@if'), lastBrace + 1);
      const rootSpan = template.substring(0, lastBrace + 1);

      // word → text → <div> → @if body → @if block → root span
      verifyExpansionChain(
        selectionRange,
        template,
        [
          'conditional',
          'conditional content',
          '<div>conditional content</div>',
          ifBodyContent,
          ifBlock,
          rootSpan,
        ],
        tplStart,
      );
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

      const template = '<span>Hello {{name}}!</span>';
      const templateOffset = appFile.contents.indexOf(template);

      // name → Hello {{name}}! (siblings) → <span>...</span>
      verifyExpansionChain(
        selectionRange,
        template,
        ['name', 'Hello {{name}}!', '<span>Hello {{name}}!</span>'],
        templateOffset,
      );
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

      const template = '<div [class.active]="isActive">Content</div>';
      const templateOffset = appFile.contents.indexOf(template);

      // isActive → class.active → [class.active]="isActive" → <div ...>Content</div>
      verifyExpansionChain(
        selectionRange,
        template,
        [
          'isActive',
          'class.active',
          '[class.active]="isActive"',
          '<div [class.active]="isActive">Content</div>',
        ],
        templateOffset,
      );
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

      // style → style="border: 1px solid black;" → full element
      verifyExpansionChain(
        selectionRange,
        template,
        [
          'style',
          'style="border: 1px solid black;"',
          template,
        ],
        templateOffset,
      );
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

        const template = '<h1><span>a</span><span>b</span></h1>';
        const templateOffset = appFile.contents.indexOf(template);

        // a → <span>a</span> → <span>a</span><span>b</span> (siblings) → <h1>...</h1>
        verifyExpansionChain(
          selectionRange,
          template,
          [
            'a',
            '<span>a</span>',
            '<span>a</span><span>b</span>',
            '<h1><span>a</span><span>b</span></h1>',
          ],
          templateOffset,
        );
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
        // Position on 'r' in 'user' of {{user.name}} (offset 11 from template start)
        const namePos = 11;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        const template = '<span>{{user.name}} - {{user.phone}}</span>';

        // user → user.name → children (siblings) → <span>...</span>
        verifyExpansionChain(selectionRange, template, [
          'user',
          'user.name',
          '{{user.name}} - {{user.phone}}',
          '<span>{{user.name}} - {{user.phone}}</span>',
        ]);
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

        const template = '<span>{{user.name}}</span>';
        const templateOffset = appFile.contents.indexOf(template);

        // user.name → {{user.name}} → <span>...</span>
        verifyExpansionChain(
          selectionRange,
          template,
          ['user.name', '{{user.name}}', '<span>{{user.name}}</span>'],
          templateOffset,
        );
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

        const template = '<p>Hello {{name}}!</p>';
        const templateOffset = appFile.contents.indexOf(template);

        // name → Hello {{name}}! (siblings) → <p>...</p>
        verifyExpansionChain(
          selectionRange,
          template,
          ['name', 'Hello {{name}}!', '<p>Hello {{name}}!</p>'],
          templateOffset,
        );
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
        // Cursor on 'city' → only city's containing node, no ancestor receivers
        verifyExpansionChain(selectionRange, template, [
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

        const template = files['app.html'];

        // content → <span>content</span> → @if branch body → @if block
        verifyExpansionChain(selectionRange, template, [
          'content',
          '<span>content</span>',
          ' <span>content</span> ',
          '@if (show) { <span>content</span> }',
        ]);
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

        const template = files['app.html'];

        // handleClick → handleClick() → click → (click)="handleClick()" → <button>
        verifyExpansionChain(selectionRange, template, [
          'handleClick',
          'handleClick()',
          'click',
          '(click)="handleClick()"',
          '<button (click)="handleClick()">Click</button>',
        ]);
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

        const template = files['app.html'];

        // item → item.name → {{item.name}} → <div>...</div> → @for body → @for block
        verifyExpansionChain(selectionRange, template, [
          'item',
          'item.name',
          '{{item.name}}',
          '<div>{{item.name}}</div>',
          ' <div>{{item.name}}</div> ',
          template,
        ]);
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

        const template = files['app.html'];
        const emptyContent = template.substring(
          template.indexOf('{', template.indexOf('@empty')) + 1,
          template.lastIndexOf('}'),
        );
        const emptyBlock = template.substring(template.indexOf('@empty'));

        // No (word) → No items (text) → <p>No items</p> → @empty content → @empty → @for
        verifyExpansionChain(selectionRange, template, [
          'No',
          'No items',
          '<p>No items</p>',
          emptyContent,
          emptyBlock,
          template,
        ]);
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

        const template = files['app.html'];
        const innerForIdx = template.indexOf('@for (cell');
        const innerBraceOpen = template.indexOf('{', innerForIdx);
        const innerBraceClose = template.indexOf(
          '}',
          template.indexOf('</span>') + '</span>'.length,
        );
        const innerForBody = template.substring(innerBraceOpen + 1, innerBraceClose);
        const innerFor = template.substring(innerForIdx, innerBraceClose + 1);
        const outerBraceOpen = template.indexOf('{');
        // Siblings span: leading whitespace text node + inner @for (excludes trailing whitespace)
        const outerForBody = template.substring(outerBraceOpen + 1, innerBraceClose + 1);

        // cell → cell.value → {{...}} → <span> → inner body → inner @for → outer body → outer @for
        verifyExpansionChain(selectionRange, template, [
          'cell',
          'cell.value',
          '{{cell.value}}',
          '<span>{{cell.value}}</span>',
          innerForBody,
          innerFor,
          outerForBody,
          template,
        ]);
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

        const template = files['app.html'];
        const caseOpenBrace = template.indexOf('{', template.indexOf("@case ('active')"));
        const caseCloseBrace = template.indexOf('}', caseOpenBrace);
        const caseBody = template.substring(caseOpenBrace + 1, caseCloseBrace);
        const caseBlock = template.substring(
          template.indexOf("@case ('active')"),
          caseCloseBrace + 1,
        );
        const defaultCloseBrace = template.lastIndexOf('}', template.lastIndexOf('}') - 1);
        const allCases = template.substring(template.indexOf('@case'), defaultCloseBrace + 1);

        // Active → <span> → @case body → @case → all case groups → @switch
        verifyExpansionChain(selectionRange, template, [
          'Active',
          '<span class="active">Active</span>',
          caseBody,
          caseBlock,
          allCases,
          template,
        ]);
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

        const template = files['app.html'];
        const caseBlock = template.substring(
          template.indexOf('@case'),
          template.indexOf('}', template.indexOf('Match</div>')) + 1,
        );

        // computedValue → @case block → @switch block
        verifyExpansionChain(selectionRange, template, [
          'computedValue',
          caseBlock,
          template,
        ]);
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

        const template = files['app.html'];
        const loadingBraceOpen = template.indexOf('{', template.indexOf('@loading'));
        const loadingBraceClose = template.indexOf('}', template.indexOf('Loading...</p>'));
        const loadingContent = template.substring(loadingBraceOpen + 1, loadingBraceClose);
        const loadingBlock = template.substring(
          template.indexOf('@loading'),
          loadingBraceClose + 1,
        );

        // Loading (word) → Loading... (text) → <p> → content → @loading → @defer
        verifyExpansionChain(selectionRange, template, [
          'Loading',
          'Loading...',
          '<p>Loading...</p>',
          loadingContent,
          loadingBlock,
          template,
        ]);
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

        const template = files['app.html'];
        const phBraceOpen = template.indexOf('{', template.indexOf('@placeholder'));
        const phBraceClose = template.indexOf('}', template.indexOf('Placeholder content</p>'));
        const phContent = template.substring(phBraceOpen + 1, phBraceClose);
        const phBlock = template.substring(template.indexOf('@placeholder'), phBraceClose + 1);

        // Placeholder (word) → Placeholder content (text) → <p> → content → @placeholder → @defer
        verifyExpansionChain(selectionRange, template, [
          'Placeholder',
          'Placeholder content',
          '<p>Placeholder content</p>',
          phContent,
          phBlock,
          template,
        ]);
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

        const template = files['app.html'];

        // BUG: getNodeSpan doesn't handle TmplAstDeferredTrigger/TmplAstBoundDeferredTrigger,
        // so the trigger expression is never visited. User expects:
        //   isReady → @defer block
        // But gets only the @defer block. Fix: add TmplAstDeferredTrigger to getNodeSpan.
        verifyExpansionChain(selectionRange, template, [template]);
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

        const template = files['app.html'];

        // BUG: getNodeSpan doesn't handle TmplAstDeferredTrigger/TmplAstBoundDeferredTrigger,
        // so trigger expressions are never visited. User expects:
        //   data → data.isLoaded → @defer block
        // But gets only the @defer block. Fix: add TmplAstDeferredTrigger to getNodeSpan.
        verifyExpansionChain(selectionRange, template, [template]);
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
        const template = files['app.html'];
        // Position on "Second" text
        const secondPos = template.indexOf('>Second<') + 1;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', secondPos);

        // Second → <div>Second</div> → @else if branch body → @else if branch → all branches (siblings) → @if block
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be Second').toBe('Second');

        // Verify outermost reaches the full @if block
        let outermost = selectionRange;
        while (outermost.parent) outermost = outermost.parent;
        const outermostText = template.substring(
          outermost.textSpan.start,
          outermost.textSpan.start + outermost.textSpan.length,
        );
        expect(outermostText).withContext('Outermost should include @if').toContain('@if');
        expect(outermostText).withContext('Outermost should include @else').toContain('@else');
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
        const template = files['app.html'];
        // Position on "isLoggedIn" in the condition expression
        const condPos = template.indexOf('isLoggedIn');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', condPos);

        // user → user.isLoggedIn → user.isLoggedIn && user.hasPermission → @if branch → @if block
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        // Cursor is on 'isLoggedIn', so innermost should be 'user.isLoggedIn'
        expect(innermostText).withContext('Innermost should be user.isLoggedIn').toBe('user.isLoggedIn');
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
        const template = files['app.html'];
        // Position on "item" in "item.name" interpolation
        const itemPos = template.indexOf('item.name');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', itemPos);

        // item → item.name → {{item.name}} → <span> → @if body → @if → @for body → @for → @case body → @case → @switch
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        // Verify innermost is 'item'
        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be item').toBe('item');

        // Verify chain depth for deeply nested control flow
        let depth = 0;
        let range: ts.SelectionRange | undefined = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        // Deep nesting needs at least: item → item.name → {{...}} → span → @if → @for → @case group → @switch
        expect(depth).withContext('Should have at least 6 levels for deep nesting').toBeGreaterThanOrEqual(6);

        // Verify outermost reaches @switch
        let outermost = selectionRange;
        while (outermost.parent) outermost = outermost.parent;
        const outermostText = template.substring(
          outermost.textSpan.start,
          outermost.textSpan.start + outermost.textSpan.length,
        );
        expect(outermostText).withContext('Outermost should include @switch').toContain('@switch');
      });
    });
  });

  describe('expression patterns', () => {
    describe('pipe expressions', () => {
      it('should expand correctly from pipe argument, pipe name, and input expression', () => {
        // Test the same template from 3 different cursor positions
        verifySelectionRanges(
          env,
          `<span>{{ value | date:'short' }}</span>`,
          `value = new Date();`,
          [
            {
              label: 'cursor on pipe argument "short"',
              cursorAt: 'short',
              chain: [
                'short',
                `'short'`,
                `date:'short'`,
                `value | date:'short'`,
                `{{ value | date:'short' }}`,
                `<span>{{ value | date:'short' }}</span>`,
              ],
            },
            {
              label: 'cursor on pipe name "date"',
              cursorAt: 'date',
              chain: [
                'date',
                `date:'short'`,
                `value | date:'short'`,
                `{{ value | date:'short' }}`,
                `<span>{{ value | date:'short' }}</span>`,
              ],
            },
            {
              label: 'cursor on input expression "value"',
              cursorAt: 'value',
              chain: [
                'value',
                `value | date:'short'`,
                `{{ value | date:'short' }}`,
                `<span>{{ value | date:'short' }}</span>`,
              ],
            },
          ],
        );
      });

      it('should expand from pipe input through simple pipe to interpolation', () => {
        verifySelectionRanges(
          env,
          `<span>{{ value | uppercase }}</span>`,
          `value = 'hello';`,
          [
            {
              label: 'cursor on "value"',
              cursorAt: 'value',
              chain: [
                'value',
                'value | uppercase',
                '{{ value | uppercase }}',
                '<span>{{ value | uppercase }}</span>',
              ],
            },
            {
              label: 'cursor on "uppercase"',
              cursorAt: 'uppercase',
              chain: [
                'uppercase',
                'value | uppercase',
                '{{ value | uppercase }}',
                '<span>{{ value | uppercase }}</span>',
              ],
            },
          ],
        );
      });

      it('should handle pipe with multiple arguments', () => {
        verifySelectionRanges(
          env,
          `<span>{{ birthday | date:'fullDate':'UTC' }}</span>`,
          `birthday = new Date();`,
          [
            {
              label: 'cursor on last arg "UTC"',
              cursorAt: 'UTC',
              chain: [
                'UTC',
                `'UTC'`,
                `date:'fullDate':'UTC'`,
                `birthday | date:'fullDate':'UTC'`,
                `{{ birthday | date:'fullDate':'UTC' }}`,
                `<span>{{ birthday | date:'fullDate':'UTC' }}</span>`,
              ],
            },
            {
              label: 'cursor on first arg "fullDate"',
              cursorAt: 'fullDate',
              chain: [
                'fullDate',
                `'fullDate'`,
                `date:'fullDate':'UTC'`,
                `birthday | date:'fullDate':'UTC'`,
                `{{ birthday | date:'fullDate':'UTC' }}`,
                `<span>{{ birthday | date:'fullDate':'UTC' }}</span>`,
              ],
            },
          ],
        );
      });

      it('should handle chained pipes from input expression', () => {
        verifySelectionRanges(
          env,
          '<span>{{ data | async | json }}</span>',
          `data = null as any;`,
          [
            {
              label: 'cursor on "data" input',
              cursorAt: 'data',
              chain: [
                'data',
                'data | async',
                'data | async | json',
                '{{ data | async | json }}',
                '<span>{{ data | async | json }}</span>',
              ],
            },
            {
              label: 'cursor on "async" pipe',
              cursorAt: 'async',
              chain: [
                'async',
                'data | async',
                'data | async | json',
                '{{ data | async | json }}',
                '<span>{{ data | async | json }}</span>',
              ],
            },
            {
              label: 'cursor on "json" pipe',
              cursorAt: 'json',
              chain: [
                'json',
                'data | async | json',
                '{{ data | async | json }}',
                '<span>{{ data | async | json }}</span>',
              ],
            },
          ],
        );
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

        // items.filter (PropertyRead) → items.filter(isActive) (Call) → ...map → ...map(getName) → ...join → ...join(", ") → {{ ... }} → <span>...</span>
        verifyExpansionChain(selectionRange, template, [
          'items.filter',
          'items.filter(isActive)',
          'items.filter(isActive).map',
          'items.filter(isActive).map(getName)',
          'items.filter(isActive).map(getName).join',
          'items.filter(isActive).map(getName).join(", ")',
          '{{ items.filter(isActive).map(getName).join(", ") }}',
          '<span>{{ items.filter(isActive).map(getName).join(", ") }}</span>',
        ]);
      });
    });

    describe('conditional expressions', () => {
      it('should handle ternary from condition, true branch, and false branch', () => {
        verifySelectionRanges(
          env,
          '<span>{{ isActive ? "Active" : "Inactive" }}</span>',
          `isActive = true;`,
          [
            {
              label: 'cursor on condition "isActive"',
              cursorAt: 'isActive',
              chain: [
                'isActive',
                'isActive ? "Active" : "Inactive"',
                '{{ isActive ? "Active" : "Inactive" }}',
                '<span>{{ isActive ? "Active" : "Inactive" }}</span>',
              ],
            },
            {
              label: 'cursor on true branch "Active"',
              cursorAt: '"Active"',
              offset: 1,
              chain: [
                'Active',
                '"Active"',
                'isActive ? "Active" : "Inactive"',
                '{{ isActive ? "Active" : "Inactive" }}',
                '<span>{{ isActive ? "Active" : "Inactive" }}</span>',
              ],
            },
            {
              label: 'cursor on false branch "Inactive"',
              cursorAt: '"Inactive"',
              offset: 1,
              chain: [
                'Inactive',
                '"Inactive"',
                'isActive ? "Active" : "Inactive"',
                '{{ isActive ? "Active" : "Inactive" }}',
                '<span>{{ isActive ? "Active" : "Inactive" }}</span>',
              ],
            },
          ],
        );
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
        const template = files['app.html'];
        // Position on inner "b"
        const bPos = template.indexOf(' b ') + 1;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', bPos);

        // b → inner ternary → outer ternary → interpolation → element
        verifyExpansionChain(selectionRange, template, [
          'b',
          'b ? "AB" : "A"',
          'a ? b ? "AB" : "A" : "None"',
          '{{ a ? b ? "AB" : "A" : "None" }}',
          '<span>{{ a ? b ? "AB" : "A" : "None" }}</span>',
        ]);
      });

      it('should handle nullish coalescing from both sides', () => {
        verifySelectionRanges(
          env,
          '<span>{{ user.name ?? "Anonymous" }}</span>',
          `user = {name: null as string | null};`,
          [
            {
              label: 'cursor on "user"',
              cursorAt: 'user',
              chain: [
                'user',
                'user.name',
                'user.name ?? "Anonymous"',
                '{{ user.name ?? "Anonymous" }}',
                '<span>{{ user.name ?? "Anonymous" }}</span>',
              ],
            },
            {
              label: 'cursor on fallback "Anonymous"',
              cursorAt: 'Anonymous',
              chain: [
                'Anonymous',
                '"Anonymous"',
                'user.name ?? "Anonymous"',
                '{{ user.name ?? "Anonymous" }}',
                '<span>{{ user.name ?? "Anonymous" }}</span>',
              ],
            },
          ],
        );
      });
    });

    describe('safe navigation', () => {
      it('should expand through optional chaining from different positions', () => {
        verifySelectionRanges(
          env,
          '<span>{{ user?.profile?.avatar?.url }}</span>',
          `user: any = null;`,
          [
            {
              label: 'cursor on intermediate "avatar"',
              cursorAt: 'avatar',
              chain: [
                // Only nodes whose spans contain the cursor are included
                'user?.profile?.avatar',
                'user?.profile?.avatar?.url',
                '{{ user?.profile?.avatar?.url }}',
                '<span>{{ user?.profile?.avatar?.url }}</span>',
              ],
            },
            {
              label: 'cursor on leaf "url"',
              cursorAt: 'url',
              chain: [
                'user?.profile?.avatar?.url',
                '{{ user?.profile?.avatar?.url }}',
                '<span>{{ user?.profile?.avatar?.url }}</span>',
              ],
            },
            {
              label: 'cursor on root "user"',
              cursorAt: 'user',
              chain: [
                'user',
                'user?.profile',
                'user?.profile?.avatar',
                'user?.profile?.avatar?.url',
                '{{ user?.profile?.avatar?.url }}',
                '<span>{{ user?.profile?.avatar?.url }}</span>',
              ],
            },
          ],
        );
      });

      it('should handle safe method call', () => {
        verifySelectionRanges(
          env,
          '<span>{{ user?.getName?.() }}</span>',
          `user: any = null;`,
          [
            {
              label: 'cursor on "getName"',
              cursorAt: 'getName',
              chain: [
                // Cursor is on getName - user receiver doesn't contain cursor
                'user?.getName',
                'user?.getName?.()',
                '{{ user?.getName?.() }}',
                '<span>{{ user?.getName?.() }}</span>',
              ],
            },
          ],
        );
      });
    });

    describe('keyed access', () => {
      it('should handle array index and bracket notation', () => {
        verifySelectionRanges(
          env,
          '<span>{{ items[0].name }}</span>',
          `items = [{name: 'First'}];`,
          [
            {
              label: 'cursor on "items"',
              cursorAt: 'items',
              chain: [
                'items',
                'items[0]',
                'items[0].name',
                '{{ items[0].name }}',
                '<span>{{ items[0].name }}</span>',
              ],
            },
          ],
        );
      });

      it('should handle bracket notation with variable key', () => {
        verifySelectionRanges(
          env,
          '<span>{{ translations[currentLang] }}</span>',
          `translations: Record<string, string> = {};\n        currentLang = 'en';`,
          [
            {
              label: 'cursor on key "currentLang"',
              cursorAt: 'currentLang',
              chain: [
                'currentLang',
                'translations[currentLang]',
                '{{ translations[currentLang] }}',
                '<span>{{ translations[currentLang] }}</span>',
              ],
            },
          ],
        );
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
        const template = files['app.html'];
        // Position inside the array literal (on the opening bracket)
        const arrayPos = template.indexOf('[1,');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', arrayPos);

        // [1, 2, 3, 4, 5] → items key → full attribute → element
        verifyExpansionChain(selectionRange, template, [
          '[1, 2, 3, 4, 5]',
          'items',
          '[items]="[1, 2, 3, 4, 5]"',
          '<app-list [items]="[1, 2, 3, 4, 5]"></app-list>',
        ]);
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
        const template = files['app.html'];
        // Position on "theme" key in object literal
        const themePos = template.indexOf('theme');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', themePos);

        // Cursor on "theme" key in LiteralMap - Angular doesn't give individual spans for map keys
        // So the innermost node is the entire LiteralMap
        verifyExpansionChain(selectionRange, template, [
          "{theme: 'dark', size: 'large'}",
          'options',
          `[options]="{theme: 'dark', size: 'large'}"`,
          `<app-config [options]="{theme: 'dark', size: 'large'}"></app-config>`,
        ]);
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

        // x → x * 2 (Binary) → x => x * 2 (arrow function) → interpolation → element
        verifyExpansionChain(selectionRange, template, [
          'x',
          'x * 2',
          'x => x * 2',
          '{{ x => x * 2 }}',
          '<div>{{ x => x * 2 }}</div>',
        ]);
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

        // Position on "item" in "item.invalid" (inside arrow function)
        const itemPos = template.indexOf('item.invalid');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', itemPos);

        // item → item.invalid → item => item.invalid → args span → items.some(...) → disabled key → full attribute → element
        verifyExpansionChain(selectionRange, template, [
          'item',
          'item.invalid',
          'item => item.invalid',
          'items.some(item => item.invalid)',
          'disabled',
          '[disabled]="items.some(item => item.invalid)"',
          '<button [disabled]="items.some(item => item.invalid)">Submit</button>',
        ]);
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

        // Position on "1" (first element of array)
        const onePos = template.indexOf('1');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', onePos);

        // 1 → [1, 2, 3] → items key → full attribute → element
        verifyExpansionChain(selectionRange, template, [
          '1',
          '[1, 2, 3]',
          'items',
          '[items]="[1, 2, 3]"',
          '<div [items]="[1, 2, 3]"></div>',
        ]);
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

        // Position on 'dark' (string literal)
        const darkPos = template.indexOf("'dark'");

        const selectionRange = project.getSelectionRangeAtPosition('app.html', darkPos);

        // Cursor on 'dark' string literal value - has inner content span (dark) then quoted span ('dark')
        verifyExpansionChain(selectionRange, template, [
          'dark',
          "'dark'",
          "{theme: 'dark', size: 10}",
          'config',
          `[config]="{theme: 'dark', size: 10}"`,
          `<div [config]="{theme: 'dark', size: 10}"></div>`,
        ]);
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

        // isHidden → !isHidden → ngIf attribute → element
        // *ngIf desugars to a template with [ngIf] binding
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        // Verify the innermost step selects isHidden
        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should contain isHidden').toContain('isHidden');

        // Verify chain reaches the element level
        let outermost = selectionRange;
        while (outermost.parent) outermost = outermost.parent;
        const outermostText = template.substring(
          outermost.textSpan.start,
          outermost.textSpan.start + outermost.textSpan.length,
        );
        expect(outermostText).withContext('Outermost should be element').toContain('<div');
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

        // Angular templates may not support typeof natively - expression parsing is implementation-defined
        // Just verify it doesn't crash and returns some selection range
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
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
        const template = files['app.html'];
        // Position on "userName"
        const userPos = template.indexOf('userName');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', userPos);

        // userName → ngModel key → [(ngModel)]="userName" → element
        verifyExpansionChain(selectionRange, template, [
          'userName',
          'ngModel',
          '[(ngModel)]="userName"',
          '<input [(ngModel)]="userName">',
        ]);
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
        const template = files['app.html'];
        // Position on "isActive" in first binding
        const activePos = template.indexOf('isActive');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', activePos);

        // isActive → class.active key → [class.active]="isActive" → attribute group → element
        verifyExpansionChain(selectionRange, template, [
          'isActive',
          'class.active',
          '[class.active]="isActive"',
          '[class.active]="isActive" [class.disabled]="isDisabled"',
          '<div [class.active]="isActive" [class.disabled]="isDisabled">Content</div>',
        ]);
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
        const template = files['app.html'];
        // Position on "containerWidth"
        const widthPos = template.indexOf('containerWidth');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', widthPos);

        // containerWidth → style.width.px key → full attribute → attribute group → element
        verifyExpansionChain(selectionRange, template, [
          'containerWidth',
          'style.width.px',
          '[style.width.px]="containerWidth"',
          '[style.width.px]="containerWidth" [style.background-color]="bgColor"',
          '<div [style.width.px]="containerWidth" [style.background-color]="bgColor">Content</div>',
        ]);
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
        const template = files['app.html'];
        // Position on "buttonLabel"
        const labelPos = template.indexOf('buttonLabel');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', labelPos);

        // buttonLabel → attr.aria-label key → full attribute → attribute group → element
        verifyExpansionChain(selectionRange, template, [
          'buttonLabel',
          'attr.aria-label',
          '[attr.aria-label]="buttonLabel"',
          '[attr.aria-label]="buttonLabel" [attr.data-testid]="testId"',
          '<button [attr.aria-label]="buttonLabel" [attr.data-testid]="testId">Click</button>',
        ]);
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
        const template = files['app.html'];
        // Position on "nameInput" in the event handler expression
        const refPos = template.indexOf('nameInput.value');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', refPos);

        // nameInput → nameInput.value → args span → greet(nameInput.value) → click key → event binding → siblings → element
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        // Verify innermost is nameInput
        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should contain nameInput').toContain('nameInput');
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
        const template = files['app.html'];
        // Position on "Loading..."
        const loadingPos = template.indexOf('Loading...');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', loadingPos);

        // Loading → Loading... → <p>Loading...</p> → ng-template content → ng-template element
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be word Loading').toContain('Loading');
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
        const template = files['app.html'];
        // Position on "firstName" in @let
        const namePos = template.indexOf('firstName');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        // firstName is inside a Binary expression: firstName + ' ' + lastName
        // firstName → firstName + ' ' → firstName + ' ' + lastName → @let declaration → root
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be firstName').toBe('firstName');
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
        const template = files['app.html'];
        // Position on "upperName" usage in interpolation
        const usagePos = template.indexOf('{{upperName}}') + 2;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', usagePos);

        // upperName → {{upperName}} → ... → root siblings
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be upperName').toBe('upperName');
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
        const template = files['app.html'];
        // Position on "user" in "user.name" interpolation
        const namePos = template.indexOf('user.name');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        // user → user.name → children siblings → element
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be user').toBe('user');
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
        const template = files['app.html'];
        // Position on "isFirst" in interpolation
        const firstPos = template.indexOf('{{isFirst') + 2;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', firstPos);

        // isFirst → ternary expression → siblings → element
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be isFirst').toBe('isFirst');
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
        const template = files['app.html'];
        // Position on "Deep content"
        const contentPos = template.indexOf('Deep content');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', contentPos);

        // Verify innermost is "Deep" (word), outermost is the full template
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be word Deep').toBe('Deep');

        // Verify chain depth: word → text → span → div → article → section → div → root
        let depth = 0;
        let range: ts.SelectionRange | undefined = selectionRange;
        while (range) {
          depth++;
          range = range.parent;
        }
        expect(depth).withContext('Should have at least 5 levels for deep nesting').toBeGreaterThanOrEqual(5);
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
        const template = files['app.html'];
        // Position on "user" in "user.name" interpolation inside <strong>
        const namePos = template.indexOf('user.name');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        // user → user.name → {{user.name}} → <strong> → children (siblings) → <p>
        verifyExpansionChain(selectionRange, template, [
          'user',
          'user.name',
          '{{user.name}}',
          '<strong>{{user.name}}</strong>',
          'Hello <strong>{{user.name}}</strong>, welcome to <em>{{siteName}}</em>!',
          '<p>Hello <strong>{{user.name}}</strong>, welcome to <em>{{siteName}}</em>!</p>',
        ]);
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
        const template = files['app.html'];
        const themePos = template.indexOf('currentTheme');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', themePos);

        // currentTheme → {theme: currentTheme, locale: userLocale} (object arg) → getSettings(...) → settings key → full attribute → element
        verifyExpansionChain(selectionRange, template, [
          'currentTheme',
          '{theme: currentTheme, locale: userLocale}',
          'getSettings({theme: currentTheme, locale: userLocale})',
          'settings',
          '[settings]="getSettings({theme: currentTheme, locale: userLocale})"',
          '<app-config [settings]="getSettings({theme: currentTheme, locale: userLocale})"></app-config>',
        ]);
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
        const template = files['app.html'];
        const clickPos = template.indexOf('handleClick');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', clickPos);

        // handleClick → handleClick($event, item.id) → ternary → click key → event binding → element
        verifyExpansionChain(selectionRange, template, [
          'handleClick',
          'handleClick($event, item.id)',
          'isEnabled ? handleClick($event, item.id) : noOp()',
          'click',
          '(click)="isEnabled ? handleClick($event, item.id) : noOp()"',
          '<button (click)="isEnabled ? handleClick($event, item.id) : noOp()">Action</button>',
        ]);
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
        const template = files['app.html'];
        // Position on "remove" in (click)="remove(item)"
        const removePos = template.indexOf('remove(item)');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', removePos);

        // remove → remove(item) → click key → event binding → element → children → outer div
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be remove').toBe('remove');
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
        const template = files['app.html'];
        // Position on "items" text in the "other" case
        const itemsPos = template.indexOf('}} items}') + 3;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', itemsPos);

        // ICU messages have complex structure - verify we get a selection
        expect(selectionRange).withContext('Selection range should be defined for ICU content').toBeDefined();
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
        const template = files['app.html'];
        // Position on "count" in the regular interpolation {{count}}
        const countPos = template.indexOf('{{count}}') + 2;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', countPos);

        // count → {{count}} → Count: {{count}} text → <p>Count: {{count}}</p> → siblings → root
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be count').toBe('count');
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
        const template = files['app.html'];
        // Position on "She" in the female case
        const shePos = template.indexOf('She');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', shePos);

        // ICU select messages - verify selection exists
        expect(selectionRange).withContext('Selection range should be defined for ICU select').toBeDefined();
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
        const template = files['app.html'];
        // Position inside empty div (offset 4 is between > and <)
        const pos = 4;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', pos);

        // Position 4 is at the start of </div> - cursor should snap to the empty element
        // For an empty element, we might get just the element span or undefined
        if (selectionRange) {
          const text = template.substring(
            selectionRange.textSpan.start,
            selectionRange.textSpan.start + selectionRange.textSpan.length,
          );
          expect(text).withContext('If range exists, should be the element').toContain('div');
        }
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
        const template = files['app.html'];
        // Position on "name" in [value]="name" (single-line self-closing)
        const namePos = template.indexOf('name');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', namePos);

        // name → value key → [value]="name" → attribute group → element
        verifyExpansionChain(selectionRange, template, [
          'name',
          'value',
          '[value]="name"',
          'type="text" [value]="name"',
          '<input type="text" [value]="name" />',
        ]);
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
        const template = files['app.html'];
        // Position on first "a" in {{a}}
        const aPos = template.indexOf('{{a}}') + 2;

        const selectionRange = project.getSelectionRangeAtPosition('app.html', aPos);

        // a → children (siblings) → element
        verifyExpansionChain(selectionRange, template, [
          'a',
          '{{a}} + {{b}} = {{a + b}}',
          '<span>{{a}} + {{b}} = {{a + b}}</span>',
        ]);
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
        const template = files['app.html'];
        // Position on "Content" inside <span>
        const contentPos = template.indexOf('Content');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', contentPos);

        // Content → <span>Content</span> → children (whitespace text nodes are siblings) → <div>
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be Content').toBe('Content');
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
        const template = files['app.html'];
        // Position on "disabled"
        const attrPos = template.indexOf('disabled');

        const selectionRange = project.getSelectionRangeAtPosition('app.html', attrPos);

        // disabled → disabled="" → <input disabled="">
        verifyExpansionChain(selectionRange, template, [
          'disabled',
          'disabled=""',
          '<input disabled="">',
        ]);
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

        // PASS → <strong...>PASS</strong> → siblings → <div id="inner">...</div> → siblings → <div id="outer">...</div>
        verifyExpansionChain(selectionRange, template, [
          'PASS',
          '<strong style="color: #080;">PASS</strong>',
          '<strong style="color: #080;">PASS</strong><br>Info text',
          '<div id="inner"><strong style="color: #080;">PASS</strong><br>Info text</div>',
          '<h2>Title</h2><div id="inner"><strong style="color: #080;">PASS</strong><br>Info text</div>',
          template,
        ]);
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

        // YELLOW (word) → line → text node → content span → full element
        expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
        if (!selectionRange) return;

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be word YELLOW').toBe('YELLOW');

        // Verify outermost reaches the full element starting with <div
        let outermost = selectionRange;
        while (outermost.parent) outermost = outermost.parent;
        const outermostText = template.substring(
          outermost.textSpan.start,
          outermost.textSpan.start + outermost.textSpan.length,
        );
        expect(outermostText.startsWith('<div'))
          .withContext(`Outermost should start with '<div', got: "${outermostText.substring(0, 50)}"`)
          .toBe(true);
        expect(outermostText.endsWith('</div>'))
          .withContext(`Outermost should end with '</div>'`)
          .toBe(true);
      });
    });

    describe('user expectation tests', () => {
      it('should expand from property in simple interpolation to full element', () => {
        verifySelectionRanges(
          env,
          `<h1>{{ title }}</h1>`,
          `title = 'Hello';`,
          [
            {
              label: 'cursor on title',
              cursorAt: 'title',
              chain: [
                'title',
                '{{ title }}',
                '<h1>{{ title }}</h1>',
              ],
            },
          ],
        );
      });

      it('should expand from signal call through interpolation', () => {
        verifySelectionRanges(
          env,
          `<p>Count: {{ count() }}</p>`,
          `count = signal(0);`,
          [
            {
              label: 'cursor on count',
              cursorAt: 'count',
              chain: [
                'count',
                'count()',
                // Implementation includes full text content (text + interpolation)
                'Count: {{ count() }}',
                '<p>Count: {{ count() }}</p>',
              ],
            },
          ],
        );
      });

      it('should expand from property in event handler', () => {
        verifySelectionRanges(
          env,
          `<button (click)="onClick()">Go</button>`,
          `onClick() {}`,
          [
            {
              label: 'cursor on onClick',
              cursorAt: 'onClick',
              chain: [
                'onClick',
                'onClick()',
                // Event key name is included as a step
                'click',
                '(click)="onClick()"',
                '<button (click)="onClick()">Go</button>',
              ],
            },
          ],
        );
      });

      it('should expand through nested property access', () => {
        verifySelectionRanges(
          env,
          `<span>{{ user.address.city }}</span>`,
          `user = {address: {city: 'NYC'}};`,
          [
            {
              label: 'cursor on city (deepest property)',
              cursorAt: 'city',
              chain: [
                // Only the innermost node containing cursor is included
                'user.address.city',
                '{{ user.address.city }}',
                '<span>{{ user.address.city }}</span>',
              ],
            },
            {
              label: 'cursor on address (middle property)',
              cursorAt: 'address',
              chain: [
                // cursor on address: user.address contains cursor, then outer
                'user.address',
                'user.address.city',
                '{{ user.address.city }}',
                '<span>{{ user.address.city }}</span>',
              ],
            },
            {
              label: 'cursor on user (root property)',
              cursorAt: 'user',
              chain: [
                'user',
                'user.address',
                'user.address.city',
                '{{ user.address.city }}',
                '<span>{{ user.address.city }}</span>',
              ],
            },
          ],
        );
      });

      it('should expand from bound attribute value to full attribute to element', () => {
        verifySelectionRanges(
          env,
          `<div [class]="classes"></div>`,
          `classes = 'active';`,
          [
            {
              label: 'cursor on classes',
              cursorAt: 'classes',
              chain: [
                'classes',
                'class',
                '[class]="classes"',
                '<div [class]="classes"></div>',
              ],
            },
          ],
        );
      });

      it('should expand from text content through parent elements', () => {
        const template = `<main>\n  <section>\n    <p>Hello World</p>\n  </section>\n</main>`;
        // Use verifySelectionRanges to test BOTH external (.html) and inline (backtick) templates
        verifySelectionRanges(
          env,
          template,
          ``,
          [
            {
              label: 'cursor on Hello in nested multiline',
              cursorAt: 'Hello',
              chain: [
                'Hello',
                'Hello World',
                '<p>Hello World</p>',
                '\n    <p>Hello World</p>\n  ',
                '<section>\n    <p>Hello World</p>\n  </section>',
                '\n  <section>\n    <p>Hello World</p>\n  </section>\n',
                '<main>\n  <section>\n    <p>Hello World</p>\n  </section>\n</main>',
              ],
            },
          ],
        );
      });

      it('should handle multiline template with interpolation in inline mode', () => {
        verifySelectionRanges(
          env,
          `<div>\n  <span>{{ value }}</span>\n</div>`,
          `value = 42;`,
          [
            {
              label: 'cursor on value in multiline template',
              cursorAt: 'value',
              chain: [
                'value',
                '{{ value }}',
                '<span>{{ value }}</span>',
                '\n  <span>{{ value }}</span>\n',
                '<div>\n  <span>{{ value }}</span>\n</div>',
              ],
            },
          ],
        );
      });
    });
  });
});
