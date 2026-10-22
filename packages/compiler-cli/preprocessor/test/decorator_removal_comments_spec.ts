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
  files: ['cmp.ts'],
  angularCompilerOptions: {},
});

async function emit(source: string): Promise<string> {
  const files: TestFile[] = [
    {path: '/tsconfig.json', content: TSCONFIG},
    {path: '/cmp.ts', content: source},
  ];
  const outputs = await runPipeline(files, {optimize: false, format: false});
  const emitted = outputs.find((file) => file.path.endsWith('/cmp.ts'));
  if (!emitted) {
    throw new Error('pipeline produced no output for cmp.ts');
  }
  return emitted.content;
}

/** Below ES2022, field initializers move into a synthesized constructor. */
function lowerToEs2020(content: string): string {
  return ts.transpileModule(content, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      useDefineForClassFields: false,
    },
  }).outputText;
}

describe('stripped decorators keep the JSDoc above them attached', () => {
  it('keeps an untyped @param on the setter an @Input() decorated', async () => {
    const emitted = await emit(`import {Component, Input} from '@angular/core';

@Component({selector: 'week-picker', template: '', standalone: true})
export class WeekPicker {
  /**
   * Sets the initial week range.
   * @param range The initial week range.
   */
  @Input()
  set initialRange(range: string|undefined) {}

  /** The picker's label. */
  @Input() label = '';
}
`);

    expect(emitted).not.toContain('@Input()');
    expect(emitted).toContain('   */\n  set initialRange(');
    expect(emitted).toContain("/** The picker's label. */\n  label = '';");

    // A detached JSDoc would move from the setter into the constructor.
    const lowered = lowerToEs2020(emitted);
    expect(lowered).toContain('   */\n    set initialRange(');
    const constructorStart = lowered.indexOf('constructor() {');
    const constructorBody = lowered.slice(
      constructorStart,
      lowered.indexOf('\n    }\n', constructorStart),
    );
    expect(constructorBody).toContain("this.label = '';");
    expect(constructorBody).not.toContain('@param');
  });

  it('keeps the class JSDoc directly above the class', async () => {
    const emitted = await emit(`import {Component} from '@angular/core';

/** A component. */
@Component({selector: 'my-cmp', template: '', standalone: true})
export class MyCmp {}
`);

    expect(emitted).not.toContain('@Component(');
    expect(emitted).toContain('/** A component. */\nexport class MyCmp');
  });

  it('stops at a comment written between the decorator and the member', async () => {
    const emitted = await emit(`import {Component, Input} from '@angular/core';

@Component({selector: 'my-cmp', template: '', standalone: true})
export class MyCmp {
  /** Docs. */
  @Input()
  // Kept.
  value = 0;
}
`);

    expect(emitted).toContain('/** Docs. */\n  // Kept.\n  value = 0;');
  });

  it('strips every decorator stacked on one member', async () => {
    const emitted = await emit(`import {Component, HostBinding, Input} from '@angular/core';

@Component({selector: 'my-cmp', template: '', standalone: true})
export class MyCmp {
  /** Docs. */
  @Input()
  @HostBinding('class.active')
  active = false;
}
`);

    expect(emitted).toContain('/** Docs. */\n  active = false;');
  });
});
