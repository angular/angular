/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {LanguageServiceTestEnv, OpenBuffer} from '../testing';
import {TokenEncodingConsts, TokenType, TokenModifier} from '../src/semantic_tokens';

describe('semantic tokens', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should return no classifications with format "Original"', () => {
    const {templateFile} = setup('<test-comp/>');
    const actual = templateFile.getEncodedSemanticClassifications(
      undefined,
      ts.SemanticClassificationFormat.Original,
    );

    expect(actual.spans).toHaveSize(0);
    expect(actual.endOfLineState).toBe(ts.EndOfLineState.None);
  });

  it('should classify components in external template', () => {
    const template = `
    <!-- top level -->
    <test-comp></test-comp>
    <test-comp />

    <!-- nested -->
    <div>
      <unknown-comp>
        <test-comp/>
      </unknown-comp>
    </div>
    <test-comp>
      content
    </test-comp>

    <!-- template -->
    <ng-template>
      <test-comp/>
    </ng-template>
    
    <!-- content -->
    <ng-content>
      <test-comp/>
    </ng-content>

    <!-- defer -->
    @defer {
      <test-comp />
    } @placeholder {
      <test-comp />
    } @loading {
      <test-comp />
    } @error {
      <test-comp />
    }

    <!-- switch -->
    @switch (true) {
      @case (1) {
        <test-comp/>
      } @case (2) {
        <test-comp/>
      } @default {
        <test-comp/>
      }
    }

    <!-- for -->
    @for (item of items;track item) {
      <li> <test-comp/> </li>
    } @empty {
      <li> <test-comp/> </li>
    }
    
    <!-- if / else -->
    @if (true) {
      <test-comp/>
    } @else if (false) {
      <test-comp/>
    } @else {
      <test-comp/>
    }`;
    const {templateFile} = setup(template);
    const actual = templateFile.getEncodedSemanticClassifications();

    expectClassifications(
      templateFile,
      actual,
      // top level
      semanticToken('class', 'test-comp', 29),
      semanticToken('class', 'test-comp', 41),
      semanticToken('class', 'test-comp', 57),

      // nested
      semanticToken('class', 'test-comp', 131),
      semanticToken('class', 'test-comp', 181),
      semanticToken('class', 'test-comp', 212),

      // template
      semanticToken('class', 'test-comp', 271),

      // ng-content
      semanticToken('class', 'test-comp', 352),

      // @defer
      semanticToken('class', 'test-comp', 422),
      semanticToken('class', 'test-comp', 463),
      semanticToken('class', 'test-comp', 500),
      semanticToken('class', 'test-comp', 535),

      // @switch
      semanticToken('class', 'test-comp', 623),
      semanticToken('class', 'test-comp', 664),
      semanticToken('class', 'test-comp', 704),

      // @for
      semanticToken('class', 'test-comp', 798),
      semanticToken('class', 'test-comp', 843),

      // @if/else
      semanticToken('class', 'test-comp', 919),
      semanticToken('class', 'test-comp', 963),
      semanticToken('class', 'test-comp', 996),
    );
  });

  it('should classify components in inline template', () => {
    const {templateFile, templateStart} = setupInlineTemplate('<test-comp/>');
    const actual = templateFile.getEncodedSemanticClassifications();
    expectClassifications(
      templateFile,
      actual,
      semanticToken('class', 'test-comp', templateStart + 1),
    );
  });

  it('should perform classification in given range', () => {
    const template = `
    <test-comp>
      <!-- RANGE START -->
      <div>
        <test-comp/>
      </div>
      <!-- RANGE END -->

      <test-comp />
    </test-comp>
  `;
    const {templateFile} = setup(template);
    const actual = templateFile.getEncodedSemanticClassifications({
      start: template.indexOf('RANGE START'),
      length: template.indexOf('RANGE END') - template.indexOf('RANGE START'),
    });

    expectClassifications(templateFile, actual, semanticToken('class', 'test-comp', 65));
  });

  it('should exclude non-component directives', () => {
    const template = `
    <button>Test</button>
    <button test>Test</button>
    `;
    const {templateFile} = setup(template, '', {
      'ButtonDirective': `
        @Directive({
          selector: "button"
        })
        export class ButtonDirective {}
      `,
      'TestDirective': `
        @Directive({
          selector: "[test]"
        })
        export class TestDirective {}
      `,
    });
    const actual = templateFile.getEncodedSemanticClassifications();
    expectClassifications(templateFile, actual);
  });
});

function setup(
  template: string,
  classContents: string = '',
  otherDeclarations: {[name: string]: string} = {},
): {
  templateFile: OpenBuffer;
} {
  const decls = ['AppCmp', ...Object.keys(otherDeclarations)];

  const otherDirectiveClassDecls = Object.values(otherDeclarations).join('\n\n');

  const env = LanguageServiceTestEnv.setup();
  const project = env.addProject('test', {
    'test.ts': `
         import { Component, Directive, Input, Output, NgModule } from '@angular/core';

         @Component({
           templateUrl: './test.html',
           selector: 'app-cmp',
         })
         export class AppCmp {
           ${classContents}
         }

        @Component({
          selector: 'test-comp',
          template: '<div>Testing: {{name}}</div>',
        })
        export class TestComponent {
          @Input() name!: string;
          @Output() testEvent!: EventEmitter<string>;
        }
         ${otherDirectiveClassDecls}

         @NgModule({
           declarations: [${decls.join(', ')}],
         })
         export class AppModule {}
         `,
    'test.html': template,
  });
  return {templateFile: project.openFile('test.html')};
}

function setupInlineTemplate(
  template: string,
  classContents: string = '',
  otherDeclarations: {[name: string]: string} = {},
): {
  templateFile: OpenBuffer;
  templateStart: number;
} {
  const decls = ['AppCmp', ...Object.keys(otherDeclarations)];

  const otherDirectiveClassDecls = Object.values(otherDeclarations).join('\n\n');

  const env = LanguageServiceTestEnv.setup();
  const project = env.addProject('test', {
    'test.ts': `
         import { Component, Input, Output, NgModule } from '@angular/core';

         @Component({
           template: '${template}',
           selector: 'app-cmp',
         })
         export class AppCmp {
           ${classContents}
         }

        @Component({
          selector: 'test-comp',
          template: '<div>Testing: {{name}}</div>',
        })
        export class TestComponent {
          @Input() name!: string;
          @Output() testEvent!: EventEmitter<string>;
        }
         ${otherDirectiveClassDecls}

         @NgModule({
           declarations: [${decls.join(', ')}],
         })
         export class AppModule {}
         `,
  });
  return {templateFile: project.openFile('test.ts'), templateStart: 123};
}

function expectClassifications(
  buffer: OpenBuffer,
  actual: ts.Classifications,
  ...expected: TestClassification[]
) {
  expect(actual.spans.length).toBe(expected.length * 3);
  expect(actual.endOfLineState).toBe(ts.EndOfLineState.None);

  for (const expectedToken of expected) {
    const {start, length, type} = findTokenAtPosition(actual.spans, expectedToken.position);
    const text = buffer.contents.substring(start, start + length);

    expect(start).toBe(expectedToken.position);
    expect(text).toBe(expectedToken.text);
    expect(type).toBe(expectedToken.type);
  }
}

interface TestClassification {
  type: string;
  text: string;
  position: number;
}

/**
 * Creates a semantic token
 * @param type type and modifiers in dot notation, e.g. `class.defaultLibrary`.
 * @param text the expected text to be highlighted
 * @param position the expected offset to the start of the token
 *
 */
function semanticToken(type: string, text: string, position: number): TestClassification {
  return {
    type,
    text,
    position,
  };
}

/**
 * Converts the token type bit set to a human readable string
 * @param classification the encoded bit set
 */
function convertToString(classification: number) {
  const typeIdx =
    classification > TokenEncodingConsts.typeOffset
      ? (classification >> TokenEncodingConsts.typeOffset) - 1
      : 0;
  const modifiers = classification & TokenEncodingConsts.modifierMask;

  const typeName = TOKEN_TYPES[typeIdx];
  const modifierNames = Object.keys(TOKEN_MODIFIERS)
    .filter((i) => modifiers & (1 << parseInt(i)))
    .map(([_, name]) => name);

  return [typeName, ...modifierNames].join('.');
}

function findTokenAtPosition(spans: number[], pos: number) {
  const idx = spans.findIndex((n, i) => i % 3 === 0 && pos === n);
  expect(idx).withContext(`Expected token for position ${pos}`).toBeGreaterThanOrEqual(0);

  return {
    start: spans[idx],
    length: spans[idx + 1],
    type: convertToString(spans[idx + 2]),
  };
}

/**
 * Mappings to string representation of token types
 */
const TOKEN_TYPES: {[type: number]: string} = {
  [TokenType.class]: 'class',
  [TokenType.enum]: 'enum',
  [TokenType.interface]: 'interface',
  [TokenType.namespace]: 'namespace',
  [TokenType.typeParameter]: 'typeParameter',
  [TokenType.type]: 'type',
  [TokenType.parameter]: 'parameter',
  [TokenType.variable]: 'variable',
  [TokenType.enumMember]: 'enumMember',
  [TokenType.property]: 'property',
  [TokenType.function]: 'function',
  [TokenType.member]: 'member',
};

/**
 * Mappings to string representation of token modifiers
 */
const TOKEN_MODIFIERS: {[type: number]: string} = {
  [TokenModifier.declaration]: 'declaration',
  [TokenModifier.static]: 'static',
  [TokenModifier.async]: 'async',
  [TokenModifier.readonly]: 'readonly',
  [TokenModifier.defaultLibrary]: 'defaultLibrary',
  [TokenModifier.local]: 'local',
};
