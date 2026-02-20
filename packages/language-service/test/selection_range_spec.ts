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

function expectParentChainContainment(
  selectionRange: ts.SelectionRange | undefined,
  template: string,
  templateOffset: number = 0,
): void {
  expect(selectionRange).withContext('Selection range should be defined').toBeDefined();
  if (!selectionRange) return;

  let child: ts.SelectionRange | undefined = selectionRange;
  while (child?.parent) {
    const parent: ts.SelectionRange = child.parent;
    const childStart = child.textSpan.start;
    const childEnd = child.textSpan.start + child.textSpan.length;
    const parentStart = parent.textSpan.start;
    const parentEnd = parent.textSpan.start + parent.textSpan.length;

    expect(parentStart <= childStart && parentEnd >= childEnd)
      .withContext(
        `Parent range must contain child range.\n` +
          `Child: ${JSON.stringify({start: childStart - templateOffset, end: childEnd - templateOffset})} => "${template.substring(childStart - templateOffset, childEnd - templateOffset)}"\n` +
          `Parent: ${JSON.stringify({start: parentStart - templateOffset, end: parentEnd - templateOffset})} => "${template.substring(parentStart - templateOffset, parentEnd - templateOffset)}"`,
      )
      .toBeTrue();

    child = parent;
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
 * @param options Optional configuration for imports, standalone components, etc.
 */
function verifySelectionRanges(
  env: LanguageServiceTestEnv,
  template: string,
  componentMembers: string,
  cursors: CursorSpec[],
  options?: {
    /** Additional imports for the component module (e.g. ['NgStyle', 'NgIf']). Source: @angular/common */
    imports?: string[];
    /** When true, sets preserveWhitespaces: true in @Component decorator */
    preserveWhitespaces?: boolean;
  },
): void {
  const angularImports = options?.imports ?? [];
  const importStatement =
    angularImports.length > 0
      ? `import {${angularImports.join(', ')}} from '@angular/common';`
      : '';
  const importsArray = angularImports.length > 0 ? `imports: [${angularImports.join(', ')}],` : '';
  const preserveWS = options?.preserveWhitespaces ? 'preserveWhitespaces: true,' : '';

  // --- External template mode ---
  const externalFiles = {
    'app.html': template,
    'app.ts': `
      import {Component} from '@angular/core';
      ${importStatement}

      @Component({
        selector: 'my-app',
        templateUrl: './app.html',
        ${importsArray}
        ${preserveWS}
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
      .withContext(
        `[external][${cursor.label}] cursorAt "${cursor.cursorAt}" not found in template`,
      )
      .toBeGreaterThanOrEqual(0);
    const pos = matchIndex + (cursor.offset ?? 0);

    const selectionRange = externalProject.getSelectionRangeAtPosition('app.html', pos);
    verifyExpansionChain(selectionRange, template, cursor.chain);
    expectParentChainContainment(selectionRange, template);
  }

  // --- Inline template mode ---
  {
    // Use backticks so single quotes and newlines in template work without escaping.
    // Only escape ${ (template literal interpolation), not bare $ (e.g. $event).
    const escapedForBacktick = template
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${');
    const inlineFiles = {
      'app.ts': `
        import {Component} from '@angular/core';
        ${importStatement}

        @Component({
          selector: 'my-app',
          template: \`${escapedForBacktick}\`,
          ${importsArray}
          ${preserveWS}
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
      expectParentChainContainment(selectionRange, template, templateOffset);
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
      verifySelectionRanges(env, '<div>content</div>', '', [
        {
          label: 'content text',
          cursorAt: 'content',
          chain: ['content', '<div>content</div>'],
        },
      ]);
    });

    it('should return selection range for nested elements', () => {
      verifySelectionRanges(env, '<div><span>nested</span></div>', '', [
        {
          label: 'nested text',
          cursorAt: 'nested',
          chain: ['nested', '<span>nested</span>', '<div><span>nested</span></div>'],
        },
      ]);
    });
  });

  describe('inline templates', () => {
    it('should handle template literals (backtick templates)', () => {
      // Multiline template with nested elements — tests whitespace handling
      const template = `
              <section>
                <article>content</article>
              </section>
            `;
      verifySelectionRanges(env, template, '', [
        {
          label: 'cursor on content text inside article',
          cursorAt: 'content',
          chain: [
            'content',
            '<article>content</article>',
            // Children span (whitespace + article + whitespace inside section)
            `
                <article>content</article>
              `,
            // Full section element
            `<section>
                <article>content</article>
              </section>`,
            // Full template (whitespace before section + section + whitespace after)
            template,
          ],
        },
      ]);
    });

    it('should work with @if control flow blocks in inline templates', () => {
      const template = `
              @if (show) {
                <div>conditional content</div>
              }
            `;
      // Manually compute the expected intermediate substrings:
      const ifBody = `
                <div>conditional content</div>
              `;
      const ifBlock = `@if (show) {
                <div>conditional content</div>
              }`;
      // Root span: from start whitespace up to closing brace (the full meaningful content)
      const rootSpan = template.substring(0, template.lastIndexOf('}') + 1);
      verifySelectionRanges(env, template, `show = true;`, [
        {
          label: 'cursor on conditional text content',
          cursorAt: 'conditional content',
          chain: [
            'conditional',
            'conditional content',
            '<div>conditional content</div>',
            ifBody,
            ifBlock,
            rootSpan,
          ],
        },
      ]);
    });

    it('should work with interpolation in inline templates', () => {
      // name → siblings text → <span>
      verifySelectionRanges(env, '<span>Hello {{name}}!</span>', `name = 'World';`, [
        {
          label: 'cursor on name in interpolation',
          cursorAt: 'name',
          chain: ['name', 'Hello {{name}}!', '<span>Hello {{name}}!</span>'],
        },
      ]);
    });

    it('should work with bound attributes in inline templates', () => {
      // isActive → [class.active]="isActive" (full attr) → element
      // keySpan (class.active) is NOT included when cursor is on the expression
      verifySelectionRanges(
        env,
        '<div [class.active]="isActive">Content</div>',
        `isActive = true;`,
        [
          {
            label: 'cursor on isActive in class binding',
            cursorAt: 'isActive"',
            chain: [
              'isActive',
              '[class.active]="isActive"',
              '<div [class.active]="isActive">Content</div>',
            ],
          },
        ],
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
      // Complex element with text attributes, bound attributes, and mixed content
      const template =
        '<div data-test="test1" [style.color]="color" style="border: 1px solid"><strong>TEST 1</strong><br>Actual: BLUE text</div>';
      verifySelectionRanges(env, template, `color = 'blue';`, [
        {
          label: 'cursor on BLUE in text content',
          cursorAt: 'BLUE',
          chain: [
            'BLUE',
            'Actual: BLUE text',
            '<strong>TEST 1</strong><br>Actual: BLUE text',
            template,
          ],
        },
      ]);
    });

    it('should expand through nested elements in backtick inline template', () => {
      // Nested divs with style attributes — expansion from style attribute value
      const template =
        '<div style="padding: 20px;"><div style="margin: 10px;"><strong style="color: red;">TEXT</strong></div></div>';
      verifySelectionRanges(env, template, '', [
        {
          label: 'cursor on color in strong style value',
          cursorAt: 'color: red',
          chain: [
            'color: red;',
            'style="color: red;"',
            '<strong style="color: red;">TEXT</strong>',
            '<div style="margin: 10px;"><strong style="color: red;">TEXT</strong></div>',
            template,
          ],
        },
      ]);
    });

    it('should handle multi-line opening tag in backtick inline template', () => {
      // Multiline element with attributes on separate lines
      const template = `<div
              style="border: 1px solid black;">
              Actual content
            </div>`;
      verifySelectionRanges(env, template, '', [
        {
          label: 'cursor on style keyword in multiline opening tag',
          cursorAt: 'style',
          chain: ['style', 'style="border: 1px solid black;"', template],
        },
      ]);
    });

    describe('sibling expansion', () => {
      it('should include all siblings before parent element', () => {
        // In <h1><span>a</span><span>b</span></h1>, selection should expand:
        // a → <span>a</span> → <span>a</span><span>b</span> (siblings) → <h1>...</h1>
        verifySelectionRanges(env, '<h1><span>a</span><span>b</span></h1>', '', [
          {
            label: 'cursor on a text inside first span',
            cursorAt: '>a<',
            offset: 1, // skip the '>' to land on 'a'
            chain: [
              'a',
              '<span>a</span>',
              '<span>a</span><span>b</span>',
              '<h1><span>a</span><span>b</span></h1>',
            ],
          },
        ]);
      });

      it('should expand interpolation before siblings content', () => {
        // In <span>{{user.name}} - {{user.phone}}</span>, selection should expand:
        // user → user.name → siblings text + interpolation → <span>...</span>
        verifySelectionRanges(
          env,
          '<span>{{user.name}} - {{user.phone}}</span>',
          `user = {name: 'John', phone: '123'};`,
          [
            {
              label: 'cursor on user in user.name',
              cursorAt: 'user.name',
              chain: [
                'user',
                'user.name',
                '{{user.name}} - {{user.phone}}',
                '<span>{{user.name}} - {{user.phone}}</span>',
              ],
            },
          ],
        );
      });

      it('should handle single child without redundant siblings span', () => {
        // In <span>{{user.name}}</span>, with only one child, siblings span is skipped
        verifySelectionRanges(env, '<span>{{user.name}}</span>', `user = {name: 'John'};`, [
          {
            label: 'cursor on name in user.name',
            cursorAt: 'name',
            chain: ['user.name', '{{user.name}}', '<span>{{user.name}}</span>'],
          },
        ]);
      });

      it('should work with multiple text nodes', () => {
        // In <p>Hello {{name}}!</p>, text + interpolation are siblings
        // name → combined siblings → <p>
        verifySelectionRanges(env, '<p>Hello {{name}}!</p>', `name = 'World';`, [
          {
            label: 'cursor on name in interpolation',
            cursorAt: 'name',
            chain: ['name', 'Hello {{name}}!', '<p>Hello {{name}}!</p>'],
          },
        ]);
      });

      it('should expand through nested property access', () => {
        verifySelectionRanges(
          env,
          '<span>{{user.address.city}}</span>',
          `user = {address: {city: 'NYC'}};`,
          [
            {
              label: 'cursor on city',
              cursorAt: 'city',
              chain: [
                'user.address.city',
                '{{user.address.city}}',
                '<span>{{user.address.city}}</span>',
              ],
            },
          ],
        );
      });

      it('should handle control flow blocks', () => {
        verifySelectionRanges(env, '@if (show) { <span>content</span> }', `show = true;`, [
          {
            label: 'cursor on content',
            cursorAt: 'content',
            chain: [
              'content',
              '<span>content</span>',
              ' <span>content</span> ',
              '@if (show) { <span>content</span> }',
            ],
          },
        ]);
      });

      it('should handle bound attributes', () => {
        verifySelectionRanges(env, '<input [value]="userName">', `userName = 'test';`, [
          {
            label: 'cursor on userName',
            cursorAt: 'userName',
            chain: ['userName', '[value]="userName"', '<input [value]="userName">'],
          },
        ]);
      });

      it('should preserve parent containment for attribute cursor with child content', () => {
        const template = `<div [title]="userName">
  <span>One</span>
  <span>Two</span>
</div>`;

        verifySelectionRanges(env, template, `userName = 'test';`, [
          {
            label: 'cursor on userName in bound attribute with multiple children',
            cursorAt: 'userName',
            chain: ['userName', '[title]="userName"', template],
          },
        ]);
      });

      it('should handle event handlers', () => {
        verifySelectionRanges(
          env,
          '<button (click)="handleClick()">Click</button>',
          `handleClick() {}`,
          [
            {
              label: 'cursor on handleClick',
              cursorAt: 'handleClick',
              chain: [
                'handleClick',
                'handleClick()',
                '(click)="handleClick()"',
                '<button (click)="handleClick()">Click</button>',
              ],
            },
          ],
        );
      });

      it('should group multiple attributes as siblings', () => {
        verifySelectionRanges(
          env,
          '<input id="name" class="form-control" type="text" placeholder="Enter name">',
          ``,
          [
            {
              label: 'cursor on name value in id attribute',
              cursorAt: 'name',
              chain: [
                'name',
                'id="name"',
                'id="name" class="form-control" type="text" placeholder="Enter name"',
                '<input id="name" class="form-control" type="text" placeholder="Enter name">',
              ],
            },
          ],
        );
      });
    });
  });

  describe('control flow blocks', () => {
    describe('@for blocks', () => {
      it('should handle @for loop with track expression', () => {
        const template = '@for (item of items; track item.id) { <div>{{item.name}}</div> }';
        verifySelectionRanges(env, template, `items = [{id: 1, name: 'Item 1'}];`, [
          {
            label: 'cursor on item in item.name',
            cursorAt: 'item.name',
            chain: [
              'item',
              'item.name',
              '{{item.name}}',
              '<div>{{item.name}}</div>',
              ' <div>{{item.name}}</div> ',
              template,
            ],
          },
        ]);
      });

      it('should handle @for with @empty block', () => {
        // @for with @empty: cursor on text inside @empty block
        const template = `@for (item of items; track item) {
            <li>{{item}}</li>
          } @empty {
            <p>No items</p>
          }`;
        // Compute expected chain substrings from the template
        const emptyContent = template.substring(
          template.indexOf('{', template.indexOf('@empty')) + 1,
          template.lastIndexOf('}'),
        );
        const emptyBlock = template.substring(template.indexOf('@empty'));

        verifySelectionRanges(env, template, `items: string[] = [];`, [
          {
            label: 'cursor on No in empty block',
            cursorAt: 'No items',
            // No (word) → No items (text) → <p> → @empty content → @empty block → full @for
            chain: ['No', 'No items', '<p>No items</p>', emptyContent, emptyBlock, template],
          },
        ]);
      });

      it('should handle nested @for loops', () => {
        // Nested @for: cursor on property access inside inner loop
        const template = `@for (row of rows; track row) {
            @for (cell of row.cells; track cell) {
              <span>{{cell.value}}</span>
            }
          }`;
        // Compute expected chain substrings
        const innerForIdx = template.indexOf('@for (cell');
        const innerBraceOpen = template.indexOf('{', innerForIdx);
        const innerBraceClose = template.indexOf(
          '}',
          template.indexOf('</span>') + '</span>'.length,
        );
        const innerForBody = template.substring(innerBraceOpen + 1, innerBraceClose);
        const innerFor = template.substring(innerForIdx, innerBraceClose + 1);
        const outerBraceOpen = template.indexOf('{');
        const outerForBody = template.substring(outerBraceOpen + 1, innerBraceClose + 1);

        verifySelectionRanges(env, template, `rows = [{cells: [{value: 'A1'}]}];`, [
          {
            label: 'cursor on cell in cell.value',
            cursorAt: 'cell.value',
            // cell → cell.value → {{cell.value}} → <span> → inner body → inner @for → outer body → outer @for
            chain: [
              'cell',
              'cell.value',
              '{{cell.value}}',
              '<span>{{cell.value}}</span>',
              innerForBody,
              innerFor,
              outerForBody,
              template,
            ],
          },
        ]);
      });
    });

    describe('@switch blocks', () => {
      it('should handle @switch with multiple @case blocks', () => {
        // @switch with @case and @default: cursor on text inside first @case
        const template = `@switch (status) {
            @case ('active') { <span class="active">Active</span> }
            @case ('inactive') { <span class="inactive">Inactive</span> }
            @default { <span>Unknown</span> }
          }`;
        // Compute expected chain substrings
        const caseOpenBrace = template.indexOf('{', template.indexOf("@case ('active')"));
        const caseCloseBrace = template.indexOf('}', caseOpenBrace);
        const caseBody = template.substring(caseOpenBrace + 1, caseCloseBrace);
        const caseBlock = template.substring(
          template.indexOf("@case ('active')"),
          caseCloseBrace + 1,
        );
        const defaultCloseBrace = template.lastIndexOf('}', template.lastIndexOf('}') - 1);
        const allCases = template.substring(template.indexOf('@case'), defaultCloseBrace + 1);

        verifySelectionRanges(env, template, `status = 'active';`, [
          {
            label: 'cursor on Active text inside first @case',
            cursorAt: '>Active<',
            offset: 1,
            // Active → <span> → @case body → @case block → all case groups → @switch
            chain: [
              'Active',
              '<span class="active">Active</span>',
              caseBody,
              caseBlock,
              allCases,
              template,
            ],
          },
        ]);
      });

      it('should handle @switch with expression in @case', () => {
        // @switch with expression in @case: cursor on @case expression
        const template = `@switch (value) {
            @case (computedValue) { <div>Match</div> }
          }`;
        const caseBlock = template.substring(
          template.indexOf('@case'),
          template.indexOf('}', template.indexOf('Match</div>')) + 1,
        );

        verifySelectionRanges(env, template, `value = 1;\n        computedValue = 1;`, [
          {
            label: 'cursor on computedValue in @case condition',
            cursorAt: 'computedValue',
            // computedValue → @case block → @switch block
            chain: ['computedValue', caseBlock, template],
          },
        ]);
      });
    });

    describe('@defer blocks', () => {
      it('should handle @defer with @loading and @error blocks', () => {
        const template = `@defer {
            <heavy-component />
          } @loading {
            <p>Loading...</p>
          } @error {
            <p>Error occurred</p>
          }`;
        const loadingBraceOpen = template.indexOf('{', template.indexOf('@loading'));
        const loadingBraceClose = template.indexOf('}', template.indexOf('Loading...</p>'));
        const loadingContent = template.substring(loadingBraceOpen + 1, loadingBraceClose);
        const loadingBlock = template.substring(
          template.indexOf('@loading'),
          loadingBraceClose + 1,
        );

        verifySelectionRanges(env, template, '', [
          {
            label: 'cursor on Loading text inside @loading block',
            cursorAt: 'Loading...',
            // Loading (word) → Loading... (text) → <p> → @loading content → @loading → @defer
            chain: [
              'Loading',
              'Loading...',
              '<p>Loading...</p>',
              loadingContent,
              loadingBlock,
              template,
            ],
          },
        ]);
      });

      it('should handle @defer with @placeholder block', () => {
        const template = `@defer {
            <main-content />
          } @placeholder (minimum 500ms) {
            <p>Placeholder content</p>
          }`;
        const phBraceOpen = template.indexOf('{', template.indexOf('@placeholder'));
        const phBraceClose = template.indexOf('}', template.indexOf('Placeholder content</p>'));
        const phContent = template.substring(phBraceOpen + 1, phBraceClose);
        const phBlock = template.substring(template.indexOf('@placeholder'), phBraceClose + 1);

        verifySelectionRanges(env, template, '', [
          {
            label: 'cursor on Placeholder text inside @placeholder block',
            cursorAt: 'Placeholder content',
            // Placeholder (word) → Placeholder content (text) → <p> → content → @placeholder → @defer
            chain: [
              'Placeholder',
              'Placeholder content',
              '<p>Placeholder content</p>',
              phContent,
              phBlock,
              template,
            ],
          },
        ]);
      });

      it('should expand through @defer when trigger expression', () => {
        const template = `@defer (when isReady) {
            <heavy-component />
          }`;
        verifySelectionRanges(env, template, `isReady = false;`, [
          {
            label: 'cursor on isReady in when condition',
            cursorAt: 'isReady',
            // isReady → when isReady (trigger span) → @defer block
            chain: ['isReady', 'when isReady', template],
          },
        ]);
      });

      it('should expand through @defer when trigger with property access', () => {
        const template = `@defer (when data.isLoaded) {
            <result-view [data]="data" />
          }`;
        verifySelectionRanges(env, template, `data = { isLoaded: false };`, [
          {
            label: 'cursor on isLoaded in when condition with property access',
            cursorAt: 'isLoaded',
            // Cursor on "isLoaded" is within the PropertyRead span for "data.isLoaded"
            // data.isLoaded → when data.isLoaded (trigger) → @defer block
            chain: ['data.isLoaded', 'when data.isLoaded', template],
          },
        ]);
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
        expectParentChainContainment(selectionRange, template);

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
        expectParentChainContainment(selectionRange, template);

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        // Cursor is on 'isLoggedIn', so innermost should be 'user.isLoggedIn'
        expect(innermostText)
          .withContext('Innermost should be user.isLoggedIn')
          .toBe('user.isLoggedIn');
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
        expectParentChainContainment(selectionRange, template);

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
        expect(depth)
          .withContext('Should have at least 6 levels for deep nesting')
          .toBeGreaterThanOrEqual(6);

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
        verifySelectionRanges(env, `<span>{{ value | uppercase }}</span>`, `value = 'hello';`, [
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
        ]);
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
        verifySelectionRanges(
          env,
          '<span>{{ formatValue(value, "currency", 2) }}</span>',
          `value = 100;
        formatValue(v: number, type: string, decimals: number) { return v.toString(); }`,
          [
            {
              label: 'cursor on currency string argument',
              cursorAt: 'currency',
              chain: [
                'currency',
                '"currency"',
                'value, "currency", 2',
                'formatValue(value, "currency", 2)',
                '{{ formatValue(value, "currency", 2) }}',
                '<span>{{ formatValue(value, "currency", 2) }}</span>',
              ],
            },
          ],
        );
      });

      it('should expand from method name through property chain', () => {
        verifySelectionRanges(
          env,
          '<span>{{ items.filter(isActive).map(getName).join(", ") }}</span>',
          `items: any[] = [];
        isActive = (x: any) => true;
        getName = (x: any) => x.name;`,
          [
            {
              label: 'cursor on filter in method chain',
              cursorAt: 'filter',
              chain: [
                'items.filter',
                'items.filter(isActive)',
                'items.filter(isActive).map',
                'items.filter(isActive).map(getName)',
                'items.filter(isActive).map(getName).join',
                'items.filter(isActive).map(getName).join(", ")',
                '{{ items.filter(isActive).map(getName).join(", ") }}',
                '<span>{{ items.filter(isActive).map(getName).join(", ") }}</span>',
              ],
            },
          ],
        );
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
        verifySelectionRanges(
          env,
          '<span>{{ a ? b ? "AB" : "A" : "None" }}</span>',
          `a = true;
        b = true;`,
          [
            {
              label: 'cursor on inner b',
              cursorAt: ' b ',
              offset: 1,
              chain: [
                'b',
                'b ? "AB" : "A"',
                'a ? b ? "AB" : "A" : "None"',
                '{{ a ? b ? "AB" : "A" : "None" }}',
                '<span>{{ a ? b ? "AB" : "A" : "None" }}</span>',
              ],
            },
          ],
        );
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
        verifySelectionRanges(env, '<span>{{ user?.getName?.() }}</span>', `user: any = null;`, [
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
        ]);
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
        verifySelectionRanges(env, '<app-list [items]="[1, 2, 3, 4, 5]"></app-list>', ``, [
          {
            label: 'cursor on array literal',
            cursorAt: '[1,',
            chain: [
              '[1, 2, 3, 4, 5]',
              '[items]="[1, 2, 3, 4, 5]"',
              '<app-list [items]="[1, 2, 3, 4, 5]"></app-list>',
            ],
          },
        ]);
      });

      it('should handle object literal in binding', () => {
        verifySelectionRanges(
          env,
          `<app-config [options]="{theme: 'dark', size: 'large'}"></app-config>`,
          ``,
          [
            {
              label: 'cursor on theme key in object literal',
              cursorAt: 'theme',
              chain: [
                "{theme: 'dark', size: 'large'}",
                `[options]="{theme: 'dark', size: 'large'}"`,
                `<app-config [options]="{theme: 'dark', size: 'large'}"></app-config>`,
              ],
            },
          ],
        );
      });
    });

    describe('arrow function expressions', () => {
      it('should expand through arrow function body', () => {
        verifySelectionRanges(env, `<div>{{ x => x * 2 }}</div>`, ``, [
          {
            label: 'cursor on x in body',
            cursorAt: 'x * 2',
            chain: ['x', 'x * 2', 'x => x * 2', '{{ x => x * 2 }}', '<div>{{ x => x * 2 }}</div>'],
          },
        ]);
      });

      it('should handle arrow function in property binding', () => {
        verifySelectionRanges(
          env,
          `<button [disabled]="items.some(item => item.invalid)">Submit</button>`,
          `items = [{invalid: false}];`,
          [
            {
              label: 'cursor on item in item.invalid',
              cursorAt: 'item.invalid',
              chain: [
                'item',
                'item.invalid',
                'item => item.invalid',
                'items.some(item => item.invalid)',
                '[disabled]="items.some(item => item.invalid)"',
                '<button [disabled]="items.some(item => item.invalid)">Submit</button>',
              ],
            },
          ],
        );
      });
    });

    describe('pipe expressions', () => {
      it('should expand through pipe chains from input expression', () => {
        verifySelectionRanges(
          env,
          `<div>{{ name | uppercase | slice:0:5 }}</div>`,
          `name = 'Angular';`,
          [
            {
              label: 'cursor on name',
              cursorAt: 'name',
              chain: [
                'name',
                'name | uppercase',
                'name | uppercase | slice:0:5',
                '{{ name | uppercase | slice:0:5 }}',
                '<div>{{ name | uppercase | slice:0:5 }}</div>',
              ],
            },
          ],
        );
      });

      it('should expand from pipe argument in chained pipes', () => {
        verifySelectionRanges(
          env,
          `<div>{{ name | uppercase | slice:0:5 }}</div>`,
          `name = 'Angular';`,
          [
            {
              label: 'cursor on 5 (second arg to slice pipe)',
              cursorAt: ':5',
              offset: 1,
              chain: [
                '5',
                'slice:0:5',
                'name | uppercase | slice:0:5',
                '{{ name | uppercase | slice:0:5 }}',
                '<div>{{ name | uppercase | slice:0:5 }}</div>',
              ],
            },
          ],
        );
      });
    });

    describe('literal expressions', () => {
      it('should expand through array literals', () => {
        verifySelectionRanges(env, `<div [items]="[1, 2, 3]"></div>`, ``, [
          {
            label: 'cursor on first element',
            cursorAt: '1',
            chain: ['1', '[1, 2, 3]', '[items]="[1, 2, 3]"', '<div [items]="[1, 2, 3]"></div>'],
          },
        ]);
      });

      it('should expand through object literals', () => {
        verifySelectionRanges(env, `<div [config]="{theme: 'dark', size: 10}"></div>`, ``, [
          {
            label: 'cursor on dark string literal',
            cursorAt: "'dark'",
            chain: [
              'dark',
              "'dark'",
              "{theme: 'dark', size: 10}",
              `[config]="{theme: 'dark', size: 10}"`,
              `<div [config]="{theme: 'dark', size: 10}"></div>`,
            ],
          },
        ]);
      });
    });

    describe('unary expressions', () => {
      it('should expand through prefix not', () => {
        // *ngIf desugars in the template AST. The chain walks through the desugared attribute.
        // isHidden → !isHidden → ngIf="!isHidden (partial attr) → element
        // keySpan (ngIf) is NOT included when cursor is on the expression
        verifySelectionRanges(env, '<div *ngIf="!isHidden">Content</div>', `isHidden = false;`, [
          {
            label: 'cursor on isHidden in *ngIf',
            cursorAt: 'isHidden',
            chain: [
              'isHidden',
              '!isHidden',
              'ngIf="!isHidden',
              '<div *ngIf="!isHidden">Content</div>',
            ],
          },
        ]);
      });
    });

    describe('non-null assertion', () => {
      it('should expand through non-null assertion', () => {
        // NonNullAssert(user).name — cursor on "name" lands on the PropertyRead
        // The chain shows user!.name (whole expression) directly since cursor is on the property
        verifySelectionRanges(env, '<span>{{user!.name}}</span>', `user: any;`, [
          {
            label: 'cursor on name in user!.name',
            cursorAt: 'name',
            chain: ['user!.name', '{{user!.name}}', '<span>{{user!.name}}</span>'],
          },
        ]);
      });
    });

    describe('binary expressions', () => {
      it('should expand through arithmetic with precedence', () => {
        // a + b * c: Binary(+, a, Binary(*, b, c))
        // Cursor on b: b → b * c (inner Binary) → a + b * c (outer Binary) → interpolation → element
        verifySelectionRanges(env, '<span>{{a + b * c}}</span>', `a = 1; b = 2; c = 3;`, [
          {
            label: 'cursor on b in b * c',
            cursorAt: 'b * c',
            chain: ['b', 'b * c', 'a + b * c', '{{a + b * c}}', '<span>{{a + b * c}}</span>'],
          },
        ]);
      });

      it('should expand through comparison operator', () => {
        // count > 10 in a bound attribute binding
        verifySelectionRanges(env, '<div [hidden]="count > 10">Content</div>', `count = 5;`, [
          {
            label: 'cursor on count in count > 10',
            cursorAt: 'count',
            chain: [
              'count',
              'count > 10',
              '[hidden]="count > 10"',
              '<div [hidden]="count > 10">Content</div>',
            ],
          },
        ]);
      });

      it('should expand through logical AND', () => {
        // Structural directive with logical AND — desugars like *ngIf
        // keySpan (ngIf) is NOT included when cursor is on the expression
        verifySelectionRanges(
          env,
          '<div *ngIf="isA && isB">Visible</div>',
          `isA = true; isB = true;`,
          [
            {
              label: 'cursor on isB in logical AND',
              cursorAt: 'isB',
              chain: [
                'isB',
                'isA && isB',
                'ngIf="isA && isB',
                '<div *ngIf="isA && isB">Visible</div>',
              ],
            },
          ],
        );
      });

      it('should expand through nullish coalescing chain', () => {
        // a ?? b ?? c: left-associative Binary(??, Binary(??, a, b), c)
        // Cursor on b: b → a ?? b (inner Binary) → a ?? b ?? c (outer) → interpolation → element
        verifySelectionRanges(
          env,
          '<span>{{a ?? b ?? c}}</span>',
          `a: string | null = null; b: string | null = null; c = 'default';`,
          [
            {
              label: 'cursor on b in nullish coalescing chain',
              cursorAt: ' b ',
              offset: 1,
              chain: [
                'b',
                'a ?? b',
                'a ?? b ?? c',
                '{{a ?? b ?? c}}',
                '<span>{{a ?? b ?? c}}</span>',
              ],
            },
          ],
        );
      });
    });

    describe('parenthesized expressions', () => {
      it('should expand through parenthesized expression', () => {
        // (a + b) * c: parentheses create an intermediate grouping step
        // a → a + b (inner Binary) → (a + b) (parens) → (a + b) * c (outer Binary) → interpolation → element
        verifySelectionRanges(env, '<span>{{(a + b) * c}}</span>', `a = 1; b = 2; c = 3;`, [
          {
            label: 'cursor on a in (a + b)',
            cursorAt: 'a + b',
            chain: [
              'a',
              'a + b',
              '(a + b)',
              '(a + b) * c',
              '{{(a + b) * c}}',
              '<span>{{(a + b) * c}}</span>',
            ],
          },
        ]);
      });
    });

    describe('chain expressions', () => {
      it('should expand through semicolon chain in event', () => {
        // Event binding with multiple statements separated by semicolons
        // doA → doA() (Call) → doA(); doB() (Chain) → full attr → element
        // keySpan (click) NOT included when cursor is on the handler expression
        verifySelectionRanges(
          env,
          '<button (click)="doA(); doB()">Click</button>',
          `doA() {} doB() {}`,
          [
            {
              label: 'cursor on doA in semicolon chain',
              cursorAt: 'doA',
              chain: [
                'doA',
                'doA()',
                'doA(); doB()',
                '(click)="doA(); doB()"',
                '<button (click)="doA(); doB()">Click</button>',
              ],
            },
          ],
        );
      });
    });

    describe('edge cases', () => {
      it('should handle empty interpolation', () => {
        // Empty interpolation {{}} has no expression nodes, just the interpolation itself
        verifySelectionRanges(env, '<span>{{}}</span>', '', [
          {
            label: 'cursor inside empty interpolation',
            cursorAt: '{{}}',
            offset: 2,
            chain: ['{{}}', '<span>{{}}</span>'],
          },
        ]);
      });

      it('should handle self-closing element with binding', () => {
        // Self-closing element: expression → full attr → element
        // keySpan (value) NOT included when cursor is on the expression
        verifySelectionRanges(env, '<input [value]="name" />', `name = 'test';`, [
          {
            label: 'cursor on name in self-closing input',
            cursorAt: 'name"',
            chain: ['name', '[value]="name"', '<input [value]="name" />'],
          },
        ]);
      });

      it('should handle template reference variable', () => {
        // Reference variable #myInput used in sibling interpolation
        verifySelectionRanges(env, '<input #myInput><span>{{myInput.value}}</span>', ``, [
          {
            label: 'cursor on myInput in interpolation',
            cursorAt: 'myInput.value',
            chain: [
              'myInput',
              'myInput.value',
              '{{myInput.value}}',
              '<span>{{myInput.value}}</span>',
              '<input #myInput><span>{{myInput.value}}</span>',
            ],
          },
        ]);
      });

      it('should handle deeply nested elements', () => {
        // 5-level nesting: each level becomes a step in the chain
        verifySelectionRanges(
          env,
          '<div><section><article><p><span>deep</span></p></article></section></div>',
          '',
          [
            {
              label: 'cursor on deep in deeply nested span',
              cursorAt: 'deep',
              chain: [
                'deep',
                '<span>deep</span>',
                '<p><span>deep</span></p>',
                '<article><p><span>deep</span></p></article>',
                '<section><article><p><span>deep</span></p></article></section>',
                '<div><section><article><p><span>deep</span></p></article></section></div>',
              ],
            },
          ],
        );
      });

      it('should handle multiple bindings on same element', () => {
        // Element with multiple bindings: each binding has its own chain ending at the element
        // keySpan NOT included when cursor is on the expression
        const template =
          '<div [title]="titleVal" [hidden]="isHidden" (click)="onClick()">Text</div>';
        verifySelectionRanges(env, template, `titleVal = 'hi'; isHidden = false; onClick() {}`, [
          {
            label: 'cursor on titleVal in title binding',
            cursorAt: 'titleVal',
            chain: [
              'titleVal',
              '[title]="titleVal"',
              '[title]="titleVal" [hidden]="isHidden" (click)="onClick()"',
              template,
            ],
          },
          {
            label: 'cursor on isHidden in hidden binding',
            cursorAt: 'isHidden',
            chain: [
              'isHidden',
              '[hidden]="isHidden"',
              '[title]="titleVal" [hidden]="isHidden" (click)="onClick()"',
              template,
            ],
          },
        ]);
      });

      it('should handle @let declaration', () => {
        // @let creates a template variable — cursor on usage in interpolation
        verifySelectionRanges(
          env,
          '@let total = price * quantity; <span>{{total}}</span>',
          `price = 10; quantity = 3;`,
          [
            {
              label: 'cursor on total in interpolation',
              cursorAt: '{{total}}',
              offset: 2,
              chain: [
                'total',
                '{{total}}',
                '<span>{{total}}</span>',
                '@let total = price * quantity; <span>{{total}}</span>',
              ],
            },
          ],
        );
      });
    });
  });

  describe('binding patterns', () => {
    describe('two-way binding', () => {
      it('should handle banana-in-a-box syntax', () => {
        verifySelectionRanges(env, '<input [(ngModel)]="userName">', `userName = '';`, [
          {
            label: 'cursor on userName',
            cursorAt: 'userName',
            chain: ['userName', '[(ngModel)]="userName"', '<input [(ngModel)]="userName">'],
          },
        ]);
      });
    });

    describe('class and style bindings', () => {
      it('should handle [class.name] binding', () => {
        verifySelectionRanges(
          env,
          '<div [class.active]="isActive" [class.disabled]="isDisabled">Content</div>',
          `isActive = true;
        isDisabled = false;`,
          [
            {
              label: 'cursor on isActive',
              cursorAt: 'isActive',
              chain: [
                'isActive',
                '[class.active]="isActive"',
                '[class.active]="isActive" [class.disabled]="isDisabled"',
                '<div [class.active]="isActive" [class.disabled]="isDisabled">Content</div>',
              ],
            },
          ],
        );
      });

      it('should handle [style.property] binding', () => {
        verifySelectionRanges(
          env,
          '<div [style.width.px]="containerWidth" [style.background-color]="bgColor">Content</div>',
          `containerWidth = 200;
        bgColor = 'blue';`,
          [
            {
              label: 'cursor on containerWidth',
              cursorAt: 'containerWidth',
              chain: [
                'containerWidth',
                '[style.width.px]="containerWidth"',
                '[style.width.px]="containerWidth" [style.background-color]="bgColor"',
                '<div [style.width.px]="containerWidth" [style.background-color]="bgColor">Content</div>',
              ],
            },
          ],
        );
      });
    });

    describe('attribute bindings', () => {
      it('should handle [attr.name] binding', () => {
        verifySelectionRanges(
          env,
          '<button [attr.aria-label]="buttonLabel" [attr.data-testid]="testId">Click</button>',
          `buttonLabel = 'Submit form';
        testId = 'submit-btn';`,
          [
            {
              label: 'cursor on buttonLabel',
              cursorAt: 'buttonLabel',
              chain: [
                'buttonLabel',
                '[attr.aria-label]="buttonLabel"',
                '[attr.aria-label]="buttonLabel" [attr.data-testid]="testId"',
                '<button [attr.aria-label]="buttonLabel" [attr.data-testid]="testId">Click</button>',
              ],
            },
          ],
        );
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
        expectParentChainContainment(selectionRange, template);

        // Verify innermost is nameInput
        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText)
          .withContext('Innermost should contain nameInput')
          .toContain('nameInput');
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
        expectParentChainContainment(selectionRange, template);

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
        expectParentChainContainment(selectionRange, template);

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
        expectParentChainContainment(selectionRange, template);

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
        expectParentChainContainment(selectionRange, template);

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
        expectParentChainContainment(selectionRange, template);

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
        expectParentChainContainment(selectionRange, template);

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
        expect(depth)
          .withContext('Should have at least 5 levels for deep nesting')
          .toBeGreaterThanOrEqual(5);
      });
    });

    describe('mixed content', () => {
      it('should handle elements with mixed text, interpolation and elements', () => {
        verifySelectionRanges(
          env,
          '<p>Hello <strong>{{user.name}}</strong>, welcome to <em>{{siteName}}</em>!</p>',
          `user = {name: 'John'};
        siteName = 'My App';`,
          [
            {
              label: 'cursor on user in user.name',
              cursorAt: 'user.name',
              chain: [
                'user',
                'user.name',
                '{{user.name}}',
                '<strong>{{user.name}}</strong>',
                'Hello <strong>{{user.name}}</strong>, welcome to <em>{{siteName}}</em>!',
                '<p>Hello <strong>{{user.name}}</strong>, welcome to <em>{{siteName}}</em>!</p>',
              ],
            },
          ],
        );
      });
    });

    describe('component inputs with complex expressions', () => {
      it('should handle input with function call returning object', () => {
        verifySelectionRanges(
          env,
          '<app-config [settings]="getSettings({theme: currentTheme, locale: userLocale})"></app-config>',
          `currentTheme = 'dark';
        userLocale = 'en-US';
        getSettings(opts: any) { return opts; }`,
          [
            {
              label: 'cursor on currentTheme',
              cursorAt: 'currentTheme',
              chain: [
                'currentTheme',
                '{theme: currentTheme, locale: userLocale}',
                'getSettings({theme: currentTheme, locale: userLocale})',
                '[settings]="getSettings({theme: currentTheme, locale: userLocale})"',
                '<app-config [settings]="getSettings({theme: currentTheme, locale: userLocale})"></app-config>',
              ],
            },
          ],
        );
      });
    });

    describe('event handlers with complex expressions', () => {
      it('should handle event with ternary and method call', () => {
        verifySelectionRanges(
          env,
          '<button (click)="isEnabled ? handleClick($event, item.id) : noOp()">Action</button>',
          `isEnabled = true;
        item = {id: 1};
        handleClick(event: Event, id: number) {}
        noOp() {}`,
          [
            {
              label: 'cursor on handleClick',
              cursorAt: 'handleClick',
              chain: [
                'handleClick',
                'handleClick($event, item.id)',
                'isEnabled ? handleClick($event, item.id) : noOp()',
                '(click)="isEnabled ? handleClick($event, item.id) : noOp()"',
                '<button (click)="isEnabled ? handleClick($event, item.id) : noOp()">Action</button>',
              ],
            },
          ],
        );
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
        expectParentChainContainment(selectionRange, template);

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
        expect(selectionRange)
          .withContext('Selection range should be defined for ICU content')
          .toBeDefined();
        if (selectionRange) {
          expectParentChainContainment(selectionRange, template);
        }
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
        expectParentChainContainment(selectionRange, template);

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
        expect(selectionRange)
          .withContext('Selection range should be defined for ICU select')
          .toBeDefined();
        if (selectionRange) {
          expectParentChainContainment(selectionRange, template);
        }
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
          expectParentChainContainment(selectionRange, template);
          const text = template.substring(
            selectionRange.textSpan.start,
            selectionRange.textSpan.start + selectionRange.textSpan.length,
          );
          expect(text).withContext('If range exists, should be the element').toContain('div');
        }
      });

      it('should handle self-closing element', () => {
        verifySelectionRanges(env, '<input type="text" [value]="name" />', `name = '';`, [
          {
            label: 'cursor on name in [value]',
            cursorAt: 'name',
            chain: [
              'name',
              '[value]="name"',
              'type="text" [value]="name"',
              '<input type="text" [value]="name" />',
            ],
          },
        ]);
      });

      it('should handle multiple interpolations in single text node', () => {
        verifySelectionRanges(
          env,
          '<span>{{a}} + {{b}} = {{a + b}}</span>',
          `a = 1;
        b = 2;`,
          [
            {
              label: 'cursor on first a in {{a}}',
              cursorAt: '{{a}}',
              offset: 2,
              chain: ['a', '{{a}} + {{b}} = {{a + b}}', '<span>{{a}} + {{b}} = {{a + b}}</span>'],
            },
          ],
        );
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
        expectParentChainContainment(selectionRange, template);

        const innermostText = template.substring(
          selectionRange.textSpan.start,
          selectionRange.textSpan.start + selectionRange.textSpan.length,
        );
        expect(innermostText).withContext('Innermost should be Content').toBe('Content');
      });

      it('should handle attribute with empty value', () => {
        verifySelectionRanges(env, '<input disabled="">', ``, [
          {
            label: 'cursor on disabled',
            cursorAt: 'disabled',
            chain: ['disabled', 'disabled=""', '<input disabled="">'],
          },
        ]);
      });
    });

    describe('element content selection bug', () => {
      it('should NOT include part of opening tag when selecting content', () => {
        // Bug reproduction: selecting text inside element content should expand to:
        // text → element containing text → children grouped → full element
        // NOT: text → partial opening tag + content
        verifySelectionRanges(
          env,
          '<div data-test-id="test1" style="border: 1px solid"><strong>BLUE text</strong><br>More content</div>',
          ``,
          [
            {
              label: 'cursor on BLUE',
              cursorAt: 'BLUE',
              chain: [
                'BLUE', // Word at cursor
                'BLUE text', // Text node (line is same, deduplicated)
                '<strong>BLUE text</strong>', // Strong element
                '<strong>BLUE text</strong><br>More content', // Siblings grouped
                '<div data-test-id="test1" style="border: 1px solid"><strong>BLUE text</strong><br>More content</div>', // Full element
              ],
            },
          ],
        );
      });

      it('should handle complex element with many attributes and bound properties', () => {
        // Complex template similar to user's bug report — many attributes + NgStyle
        const template = `<div data-test-id="test1" myDirectiveA [style.backgroundColor]="'rgb(0, 0, 255)'" [style.color]="'rgb(255, 255, 0)'" [ngStyle]="{'border': '5px solid green'}" [style]="{'padding': '20px', 'margin': '10px'}" style="border: 1px 2px 3px var(--help);"><strong>TEST 1: Template</strong><br>Expected: BLUE background<br>Actual: This should be BLUE with YELLOW text</div>`;
        verifySelectionRanges(
          env,
          template,
          '',
          [
            {
              label: 'cursor on should in text content (not in attributes)',
              cursorAt: 'should be BLUE',
              chain: [
                'should',
                'Actual: This should be BLUE with YELLOW text',
                '<strong>TEST 1: Template</strong><br>Expected: BLUE background<br>Actual: This should be BLUE with YELLOW text',
                template,
              ],
            },
          ],
          {imports: ['NgStyle']},
        );
      });

      it('should handle multiline template similar to user bug report', () => {
        // Template with newlines — similar to the user's actual template
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

        verifySelectionRanges(
          env,
          template,
          '',
          [
            {
              label: 'cursor on should in multiline text content',
              cursorAt: 'should be BLUE',
              chain: [
                'should',
                'Actual: This should be BLUE with YELLOW text ← TEMPLATE WINS',
                '\nActual: This should be BLUE with YELLOW text ← TEMPLATE WINS\n',
                '\n<strong>TEST 1: Template [style.backgroundColor]</strong><br>\nExpected: BLUE background rgb(0, 0, 255)<br>\nExpected: YELLOW text rgb(255, 255, 0)<br>\nActual: This should be BLUE with YELLOW text ← TEMPLATE WINS\n',
                template,
              ],
            },
          ],
          {imports: ['NgStyle']},
        );
      });
    });

    describe('inline style and class attributes', () => {
      // NOTE: Granular CSS selection (individual properties, values) is handled by
      // CSS LSP delegation at the VS Code server level, not in the core language service.
      // These tests verify the core Angular AST selection behavior.

      it('should select full style attribute value', () => {
        verifySelectionRanges(env, '<div style="color: red; background: blue">Content</div>', ``, [
          {
            label: 'cursor on red in style value',
            cursorAt: 'red',
            chain: [
              'color: red; background: blue', // Full style value (core LS)
              'style="color: red; background: blue"', // Full attribute
              '<div style="color: red; background: blue">Content</div>', // Full element
            ],
          },
        ]);
      });

      it('should select full class attribute value', () => {
        verifySelectionRanges(env, '<div class="foo bar baz">Content</div>', ``, [
          {
            label: 'cursor on bar in class value',
            cursorAt: 'bar',
            chain: [
              'foo bar baz', // Full class value (core LS)
              'class="foo bar baz"', // Full attribute
              '<div class="foo bar baz">Content</div>', // Full element
            ],
          },
        ]);
      });
    });

    describe('nested plain elements', () => {
      it('should expand through nested divs when cursor is on style attribute', () => {
        // Reproduces bug where expanding from style attribute skips parent elements
        verifySelectionRanges(
          env,
          '<div style="padding: 20px;"><div style="margin: 10px;"><strong style="color: red;">TEXT</strong></div></div>',
          ``,
          [
            {
              label: 'cursor on color: red value',
              cursorAt: 'color: red',
              chain: [
                'color: red;', // attribute value
                'style="color: red;"', // full attribute
                '<strong style="color: red;">TEXT</strong>', // strong element
                '<div style="margin: 10px;"><strong style="color: red;">TEXT</strong></div>', // inner div
                '<div style="padding: 20px;"><div style="margin: 10px;"><strong style="color: red;">TEXT</strong></div></div>', // outer div
              ],
            },
          ],
        );
      });

      it('should not skip parent elements for deeply nested elements', () => {
        verifySelectionRanges(
          env,
          '<div id="outer"><h2>Title</h2><div id="inner"><strong style="color: #080;">PASS</strong><br>Info text</div></div>',
          ``,
          [
            {
              label: 'cursor on PASS',
              cursorAt: 'PASS',
              chain: [
                'PASS',
                '<strong style="color: #080;">PASS</strong>',
                '<strong style="color: #080;">PASS</strong><br>Info text',
                '<div id="inner"><strong style="color: #080;">PASS</strong><br>Info text</div>',
                '<h2>Title</h2><div id="inner"><strong style="color: #080;">PASS</strong><br>Info text</div>',
                '<div id="outer"><h2>Title</h2><div id="inner"><strong style="color: #080;">PASS</strong><br>Info text</div></div>',
              ],
            },
          ],
        );
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
        expectParentChainContainment(selectionRange, template);

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
          .withContext(
            `Outermost should start with '<div', got: "${outermostText.substring(0, 50)}"`,
          )
          .toBe(true);
        expect(outermostText.endsWith('</div>'))
          .withContext(`Outermost should end with '</div>'`)
          .toBe(true);
      });
    });

    describe('user expectation tests', () => {
      it('should expand from property in simple interpolation to full element', () => {
        verifySelectionRanges(env, `<h1>{{ title }}</h1>`, `title = 'Hello';`, [
          {
            label: 'cursor on title',
            cursorAt: 'title',
            chain: ['title', '{{ title }}', '<h1>{{ title }}</h1>'],
          },
        ]);
      });

      it('should expand from signal call through interpolation', () => {
        verifySelectionRanges(env, `<p>Count: {{ count() }}</p>`, `count = signal(0);`, [
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
        ]);
      });

      it('should expand from property in event handler', () => {
        verifySelectionRanges(env, `<button (click)="onClick()">Go</button>`, `onClick() {}`, [
          {
            label: 'cursor on onClick',
            cursorAt: 'onClick',
            chain: [
              'onClick',
              'onClick()',
              '(click)="onClick()"',
              '<button (click)="onClick()">Go</button>',
            ],
          },
        ]);
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
        verifySelectionRanges(env, `<div [class]="classes"></div>`, `classes = 'active';`, [
          {
            label: 'cursor on classes',
            cursorAt: 'classes',
            chain: ['classes', '[class]="classes"', '<div [class]="classes"></div>'],
          },
        ]);
      });

      it('should expand from text content through parent elements', () => {
        const template = `<main>\n  <section>\n    <p>Hello World</p>\n  </section>\n</main>`;
        // Use verifySelectionRanges to test BOTH external (.html) and inline (backtick) templates
        verifySelectionRanges(env, template, ``, [
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
        ]);
      });

      it('should handle multiline template with interpolation in inline mode', () => {
        verifySelectionRanges(env, `<div>\n  <span>{{ value }}</span>\n</div>`, `value = 42;`, [
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
        ]);
      });
    });
  });

  describe('preserveWhitespaces', () => {
    it('should produce identical chain for compact templates regardless of preserveWhitespaces', () => {
      // For compact single-line templates, preserveWhitespaces has no effect
      verifySelectionRanges(
        env,
        `<div><span>text</span></div>`,
        ``,
        [
          {
            label: 'compact template with preserveWhitespaces',
            cursorAt: 'text',
            chain: ['text', '<span>text</span>', '<div><span>text</span></div>'],
          },
        ],
        {preserveWhitespaces: true},
      );
    });

    it('should include whitespace text nodes as siblings when preserveWhitespaces is true', () => {
      // With preserveWhitespaces: true, the newlines/indentation become Text nodes,
      // which affects the sibling span (all children grouped together).
      const template = `<div>\n  <span>content</span>\n</div>`;
      verifySelectionRanges(
        env,
        template,
        ``,
        [
          {
            label: 'whitespace-preserved multiline',
            cursorAt: 'content',
            chain: [
              'content',
              '<span>content</span>',
              '\n  <span>content</span>\n',
              '<div>\n  <span>content</span>\n</div>',
            ],
          },
        ],
        {preserveWhitespaces: true},
      );
    });

    it('should handle interpolation in whitespace-preserved template', () => {
      // With preserveWhitespaces, the interpolation is embedded in a larger text block
      // that includes surrounding whitespace, so {{ name }} is not a separate step.
      const template = `<div>\n  {{ name }}\n</div>`;
      verifySelectionRanges(
        env,
        template,
        `name = 'test';`,
        [
          {
            label: 'interpolation with preserved whitespace',
            cursorAt: 'name',
            chain: ['name', '\n  {{ name }}\n', '<div>\n  {{ name }}\n</div>'],
          },
        ],
        {preserveWhitespaces: true},
      );
    });
  });
});
