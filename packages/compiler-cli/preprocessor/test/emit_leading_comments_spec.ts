/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {runPipeline, TestFile} from './utils.js';

const TSCONFIG = JSON.stringify({
  compilerOptions: {
    target: 'es2022',
    module: 'esnext',
    moduleResolution: 'bundler',
    experimentalDecorators: true,
  },
  files: ['pragmas.ts'],
  angularCompilerOptions: {},
});

const COMPONENT = `
@Component({selector: 'my-cmp', template: '<div></div>', standalone: false})
export class MyCmp {}
`;

/**
 * Whether `tsc` would honor a `@ts-nocheck` in `content`.
 */
function nocheckActive(content: string): boolean {
  const sourceFile = ts.createSourceFile(
    'pragmas.ts',
    content,
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TS,
  );
  const directive = (sourceFile as {checkJsDirective?: {enabled: boolean}}).checkJsDirective;
  return directive !== undefined && directive.enabled === false;
}

/** The `types`/`path`/`lib` references `tsc` resolved out of the file's triple-slash directives. */
function referencedTypes(content: string): string[] {
  const sourceFile = ts.createSourceFile(
    'pragmas.ts',
    content,
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TS,
  );
  return sourceFile.typeReferenceDirectives.map((directive) => directive.fileName);
}

/** The text of each comment in the file's leading trivia, in source order. */
function leadingComments(content: string): string[] {
  return (ts.getLeadingCommentRanges(content, 0) ?? []).map((range) =>
    content.slice(range.pos, range.end),
  );
}

async function emit(source: string): Promise<string> {
  const files: TestFile[] = [
    {path: '/tsconfig.json', content: TSCONFIG},
    {path: '/pragmas.ts', content: source},
  ];
  const outputs = await runPipeline(files, {optimize: false, format: false});
  const emitted = outputs.find((file) => file.path.endsWith('/pragmas.ts'));
  if (!emitted) {
    throw new Error('pipeline produced no output for pragmas.ts');
  }
  return emitted.content;
}

describe('emitted file-level pragmas', () => {
  /**
   * Each case pairs a layout with the reason it is interesting. The generated imports are anchored
   * on the file's import block, so the cases that used to break are the ones whose *first*
   * statement is not an import — the scan stopped there and fell back to an offset at or before
   * the pragma.
   */
  const CASES: Array<{name: string; source: string}> = [
    {
      name: 'pragma directly above the import block',
      source: `// @ts-nocheck
import {Component} from '@angular/core';
${COMPONENT}`,
    },
    {
      name: 'pragma between a detached banner and the import block',
      source: `/**
 * @fileoverview Header.
 */

// @ts-nocheck

import {Component} from '@angular/core';
${COMPONENT}`,
    },
    {
      name: 'a re-export precedes the import block',
      source: `// @ts-nocheck
export * from './other';
import {Component} from '@angular/core';
${COMPONENT}`,
    },
    {
      name: 'a const declaration precedes the import block',
      source: `// @ts-nocheck
export const VERSION = '1';
import {Component} from '@angular/core';
${COMPONENT}`,
    },
    {
      name: 'pragma attached to a statement that precedes the import block',
      source: `/**
 * @fileoverview Header.
 */

// @ts-nocheck
export enum Mode {
  A,
}
import {Component} from '@angular/core';
${COMPONENT}`,
    },
    {
      name: 'an ordinary comment is butted directly against the pragma',
      source: `// Prose describing this file.
// @ts-nocheck
export const VERSION = '1';
import {Component} from '@angular/core';
${COMPONENT}`,
    },
  ];

  for (const {name, source} of CASES) {
    it(`honors @ts-nocheck when ${name}`, async () => {
      // Guards the fixture itself: a layout `tsc` already ignores would make the real assertion
      // pass vacuously.
      expect(nocheckActive(source)).toBe(true);

      const emitted = await emit(source);

      // Positive control — without it this would still pass if the compiler stopped emitting
      // imports altogether.
      expect(emitted).toContain('import * as i0 from');
      expect(nocheckActive(emitted)).toBe(true);
    });
  }

  it('keeps triple-slash directives in the leading trivia', async () => {
    // Subject to the same leading-comment rule as `@ts-nocheck`, and displaced by the same splice.
    const source = `/// <reference types="node" />
export const VERSION = '1';
import {Component} from '@angular/core';
${COMPONENT}`;
    expect(referencedTypes(source)).toEqual(['node']);

    const emitted = await emit(source);

    expect(emitted).toContain('import * as i0 from');
    expect(referencedTypes(emitted)).toEqual(['node']);
  });

  it('keeps a @fileoverview banner first when another comment precedes it', async () => {
    // A copyright line butted directly against the banner is attached to the banner, not to a
    // declaration, so the leading-comment scan must look past it. Stopping there drops the
    // insertion point to offset 0 and splices the generated imports above the `@fileoverview`,
    // which Closure only honors while it is the first comment in the file.
    const source = `// Copyright 2024 Google LLC
/**
 * @fileoverview Header.
 */
export const VERSION = '1';
import {Component} from '@angular/core';
${COMPONENT}`;

    const emitted = await emit(source);

    // Positive control — without it this would pass if no imports were emitted at all.
    expect(emitted).toContain('import * as i0 from');
    // The banner must still be in the file's *leading trivia*, with the copyright line intact
    // above it. Asserting on the comment ranges rather than raw indices also catches the banner
    // being dropped outright.
    expect(leadingComments(emitted)).toEqual([
      '// Copyright 2024 Google LLC',
      '/**\n * @fileoverview Header.\n */',
    ]);
  });

  it('keeps the empty line separating a @fileoverview banner from the file body', async () => {
    // Closure rejects a banner that is glued to the first statement: "file comments must be at
    // the top of the file, separated from the file body by an empty line." The insertion point
    // sits right after the banner, so splicing there consumed exactly that empty line.
    const source = `/**
 * @fileoverview Re-export some private APIs. Ideally users should be using
 * only the public APIs.
 */

export const VERSION = '1';
import {Component} from '@angular/core';
${COMPONENT}`;

    const emitted = await emit(source);

    expect(emitted).toContain('import * as i0 from');
    const bannerEnd = emitted.indexOf('*/') + '*/'.length;
    expect(bannerEnd).toBeGreaterThan(1);
    // The banner must be followed by a blank line, not by the spliced imports.
    expect(emitted.slice(bannerEnd)).toMatch(/^\r?\n\r?\n/);
  });

  it('keeps a triple-slash directive below an attached comment in the leading trivia', async () => {
    // The third file-header shape, reached through the same scan.
    const source = `// Prose describing this file.
/// <reference types="node" />
export const VERSION = '1';
import {Component} from '@angular/core';
${COMPONENT}`;
    expect(referencedTypes(source)).toEqual(['node']);

    const emitted = await emit(source);

    expect(emitted).toContain('import * as i0 from');
    expect(referencedTypes(emitted)).toEqual(['node']);
  });

  it('keeps a line-scoped @ts-expect-error attached to the statement it suppresses', async () => {
    // Unlike `@ts-nocheck`, `@ts-expect-error` applies to the next line only. Splicing imports
    // between it and its target would resurrect the suppressed error and make the directive
    // itself an unused suppression (TS2578).
    const source = `/** Doc. */
// @ts-expect-error
export const VERSION: number = 'not a number';
import {Component} from '@angular/core';
${COMPONENT}`;

    const emitted = await emit(source);

    expect(emitted).toContain('import * as i0 from');
    const pragma = emitted.indexOf('// @ts-expect-error');
    const target = emitted.indexOf('export const VERSION');
    expect(pragma).toBeGreaterThanOrEqual(0);
    // Nothing at all may sit between the pragma line and the statement it suppresses.
    expect(emitted.slice(pragma, target).trim()).toBe('// @ts-expect-error');
  });

  it('emits generated imports after the last import rather than the leading run', async () => {
    // The ordering ngtsc produces by partitioning statements into
    // `[...existingImports, ...newImports, ...extraStatements, ...body]`.
    const source = `export const VERSION = '1';
import {Component} from '@angular/core';
${COMPONENT}`;
    const emitted = await emit(source);

    const existingImport = emitted.indexOf(`import {Component} from '@angular/core';`);
    const generatedImport = emitted.indexOf('import * as i0 from');
    expect(existingImport).toBeGreaterThanOrEqual(0);
    expect(generatedImport).toBeGreaterThan(existingImport);
  });

  it('does not splice generated code past the class that consumes it', async () => {
    // Constant-pool statements share the insertion point with the generated imports, and the
    // class definition reads them at class-definition time. Anchoring past the class would put
    // those `const`s below their use and fail at runtime with a temporal dead zone error, so a
    // trailing import must not drag the insertion point down with it.
    const source = `import {Component} from '@angular/core';
${COMPONENT}
import {other} from './other';
`;
    const emitted = await emit(source);

    const generatedImport = emitted.indexOf('import * as i0 from');
    const classStart = emitted.indexOf('export class MyCmp');
    expect(generatedImport).toBeGreaterThanOrEqual(0);
    expect(generatedImport).toBeLessThan(classStart);
  });
});
