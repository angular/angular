/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runPipeline, TestFile} from './utils.js';

describe('import hoisting', () => {
  it('should hoist imports written below a top-level statement above it', async () => {
    const out = await compile([TOOLTIP, DIALOG_LAYOUT, PRIMARY_BUTTON, BUTTON_WIDGET]);
    const widget = out.get('/out/button_widget.ts')!;

    expect(statementOrder(widget)).toEqual([
      "import {Component} from '@angular/core';",
      "import {PrimaryButton} from './primary_button';",
      "import {DialogLayoutComponent} from './dialog_layout';",
      "import {TooltipDirective} from './tooltip';",
      'const COMPONENT_IMPORTS',
    ]);
  });

  it('should place generated imports after the hoisted ones but above the body', async () => {
    const out = await compile([TOOLTIP, DIALOG_LAYOUT, PRIMARY_BUTTON, BUTTON_WIDGET]);
    const widget = out.get('/out/button_widget.ts')!;

    const lastHoisted = widget.indexOf("import {TooltipDirective} from './tooltip';");
    const generated = widget.indexOf("import * as i0 from '@angular/core';");
    const body = widget.indexOf('const COMPONENT_IMPORTS');

    expect(lastHoisted).toBeGreaterThan(-1);
    expect(generated).toBeGreaterThan(lastHoisted);
    expect(body).toBeGreaterThan(generated);
  });

  it('should keep each hoisted declaration on its own line', async () => {
    const out = await compile([TOOLTIP, DIALOG_LAYOUT, PRIMARY_BUTTON, BUTTON_WIDGET]);
    const widget = out.get('/out/button_widget.ts')!;

    // No declaration may be glued onto the end of the one it was hoisted behind, and none may
    // open a blank line in the middle of the import block.
    expect(widget).not.toMatch(/;[ \t]*import\s/);
    expect(widget).not.toMatch(/^import .*;\n\n(?:\/\/ @ts-ignore\n)?import /m);
  });

  it('should move a re-export written above the imports below them and place constant pool after the imports', async () => {
    // `export * from` is not an `ImportDeclaration`, so it stays below the hoisted imports
    // and the constant pool (`_c0`), which are inserted right after the imports.
    const out = await compile([TOOLTIP, REEXPORT_FIRST]);
    const source = out.get('/out/reexport_first.ts')!;

    const imported = source.indexOf("import {Component} from '@angular/core';");
    const constantPool = source.indexOf('const _c0 =');
    const reexported = source.indexOf("export * from './tooltip';");
    const classDecl = source.indexOf('export class ReexportFirstComponent');

    expect(imported).toBeGreaterThan(-1);
    expect(constantPool).toBeGreaterThan(imported);
    expect(reexported).toBeGreaterThan(constantPool);
    expect(classDecl).toBeGreaterThan(reexported);
  });

  it('should place shared constant pool statements at module scope when components are declared in sibling function scopes', async () => {
    const siblingScoped: TestFile = {
      path: '/sibling_scoped.ts',
      content: `import {Component, Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'join'})
export class JoinPipe implements PipeTransform {
  transform(value: unknown, sep = ','): string {
    return Array.isArray(value) ? value.join(sep) : String(value);
  }
}

function firstTest() {
  @Component({
    template: \`{{ ['foo', 'bar', 'baz'] | join:' - ' }}\`,
    imports: [JoinPipe],
  })
  class TestComponent {}
  return TestComponent;
}

function secondTest() {
  @Component({
    template: \`{{ ['foo', 'bar', 'baz'] | join }}\`,
    imports: [JoinPipe],
  })
  class TestComponent {}
  return TestComponent;
}
`,
    };
    const out = await compile([siblingScoped]);
    const source = out.get('/out/sibling_scoped.ts')!;

    const generatedImport = source.indexOf("import * as i0 from '@angular/core';");
    const constantPool = source.indexOf('const _c0 =');
    const firstFn = source.indexOf('function firstTest()');

    expect(generatedImport).toBeGreaterThan(-1);
    expect(constantPool).toBeGreaterThan(generatedImport);
    expect(firstFn).toBeGreaterThan(constantPool);
  });

  it('should leave a file whose imports already lead it untouched', async () => {
    const out = await compile([TOOLTIP, ALREADY_ORDERED]);
    const source = out.get('/out/already_ordered.ts')!;

    expect(source).toContain(
      "import {Component} from '@angular/core';\nimport {TooltipDirective} from './tooltip';\n",
    );
  });

  it('should not hoist an out-of-order import that @defer removes', async () => {
    const deferred: TestFile = {
      path: '/deferred_widget.ts',
      content: `import {Component} from '@angular/core';

const EAGER = [TooltipDirective];

import {DialogLayoutComponent} from './dialog_layout';
import {TooltipDirective} from './tooltip';

@Component({
  selector: 'app-deferred-widget',
  imports: [TooltipDirective],
  deferredImports: [DialogLayoutComponent],
  template: '<span appTooltip="Hi"></span>@defer {<app-dialog-layout></app-dialog-layout>}',
})
export class DeferredWidget {}
`,
    };
    const out = await compile([TOOLTIP, DIALOG_LAYOUT, deferred]);
    const source = out.get('/out/deferred_widget.ts')!;

    expect(source).not.toContain("from './dialog_layout'");
    expect(statementOrder(source)).toEqual([
      "import {Component} from '@angular/core';",
      "import {TooltipDirective} from './tooltip';",
    ]);
    expect(source).not.toMatch(/^import .*;\n\n(?:\/\/ @ts-ignore\n)?import /m);
  });
});

const TOOLTIP: TestFile = {
  path: '/tooltip.ts',
  content: `
import {Directive} from '@angular/core';

@Directive({selector: '[appTooltip]'})
export class TooltipDirective {}
`,
};

const DIALOG_LAYOUT: TestFile = {
  path: '/dialog_layout.ts',
  content: `
import {Component} from '@angular/core';

@Component({selector: 'app-dialog-layout', template: '<ng-content></ng-content>'})
export class DialogLayoutComponent {}
`,
};

const PRIMARY_BUTTON: TestFile = {
  path: '/primary_button.ts',
  content: `
import {Directive} from '@angular/core';

@Directive({selector: '[app-primary-button]'})
export class PrimaryButton {}
`,
};

/** The reproduction from the bug report, verbatim. */
const BUTTON_WIDGET: TestFile = {
  path: '/button_widget.ts',
  content: `import {Component} from '@angular/core';
import {PrimaryButton} from './primary_button';

const COMPONENT_IMPORTS = [
  PrimaryButton,
  TooltipDirective,
  DialogLayoutComponent,
];

import {DialogLayoutComponent} from './dialog_layout';
import {TooltipDirective} from './tooltip';

@Component({
  selector: 'app-button-widget',
  imports: [COMPONENT_IMPORTS],
  template: \`
    <app-dialog-layout>
      <button app-primary-button appTooltip="Save">Save</button>
    </app-dialog-layout>
  \`,
})
export class ButtonWidget {}
`,
};

const REEXPORT_FIRST: TestFile = {
  path: '/reexport_first.ts',
  content: `export * from './tooltip';
import {Component} from '@angular/core';

@Component({selector: 'app-reexport-first', template: '<div [id]="[1, 2]"></div>'})
export class ReexportFirstComponent {}
`,
};

const ALREADY_ORDERED: TestFile = {
  path: '/already_ordered.ts',
  content: `import {Component} from '@angular/core';
import {TooltipDirective} from './tooltip';

@Component({
  selector: 'app-already-ordered',
  imports: [TooltipDirective],
  template: '<span appTooltip="Hi"></span>',
})
export class AlreadyOrdered {}
`,
};

async function compile(files: TestFile[]): Promise<Map<string, string>> {
  const tsconfig: TestFile = {
    path: '/tsconfig.json',
    content: JSON.stringify({
      compilerOptions: {strict: true},
      files: files.map((f) => f.path),
    }),
  };
  const outputs = await runPipeline([tsconfig, ...files], {optimize: false, format: false});
  return new Map(outputs.map((o) => [o.path, o.content]));
}

/**
 * The file's top-level statements, reduced to a recognisable prefix, in emitted order. Generated
 * statements are dropped so the assertion is about the source ones' relative order alone.
 */
function statementOrder(source: string): string[] {
  return source
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('import {') || line.startsWith('const COMPONENT_IMPORTS'))
    .map((line) => (line.startsWith('const COMPONENT_IMPORTS') ? 'const COMPONENT_IMPORTS' : line));
}
