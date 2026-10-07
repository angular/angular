/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runPipeline, TestFile} from './utils.js';

describe('generateExtraImportsInLocalMode with template-induced cycles', () => {
  it('should not emit side-effect imports that close a template cycle', async () => {
    const out = await compile();

    for (const path of ['/out/rich_text_view.ts', '/out/text_view.ts', '/out/tooltip_view.ts']) {
      expect(sideEffectImports(out.get(path)!))
        .withContext(path)
        .toEqual([]);
    }
  });

  it('should still emit side-effect imports for a declaration outside the cycle', async () => {
    // `PlainView` is declared by the same module and matched by `RichTextView`'s template, but
    // nothing in the cycle depends on it, so importing it closes nothing.
    const out = await compile();

    expect(sideEffectImports(out.get('/out/plain_view.ts')!)).toEqual([]);
    expect(sideEffectImports(out.get('/out/consumer_view.ts')!)).toEqual(['./plain_view']);
  });

  it('should emit no cyclic file dependency across the whole unit', async () => {
    const out = await compile();

    const graph = new Map<string, string[]>();
    for (const [path, source] of out) {
      graph.set(
        path,
        sideEffectImports(source).map((specifier) => resolve(path, specifier)),
      );
    }

    expect(cyclicNodes(graph)).toEqual([]);
  });
});

const RICH_TEXT_VIEW: TestFile = {
  path: '/rich_text_view.ts',
  content: `
import {Component, Input} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-rich-text-view',
  template: \`
    <app-text-view [text]="content"></app-text-view>
    <app-tooltip-view [label]="content"></app-tooltip-view>
    <app-plain-view></app-plain-view>
  \`,
})
export class RichTextView {
  @Input() content = '';
}
`,
};

const TEXT_VIEW: TestFile = {
  path: '/text_view.ts',
  content: `
import {Component, Input} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-text-view',
  template: \`
    <span>{{ text }}</span>
    <app-tooltip-view [label]="text"></app-tooltip-view>
  \`,
})
export class TextView {
  @Input() text = '';
}
`,
};

const TOOLTIP_VIEW: TestFile = {
  path: '/tooltip_view.ts',
  content: `
import {Component, Input} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-tooltip-view',
  template: \`
    <div class="tooltip">
      <app-rich-text-view [content]="label"></app-rich-text-view>
    </div>
  \`,
})
export class TooltipView {
  @Input() label = '';
}
`,
};

/** A leaf: declared by the module, matched by others, but matching nobody itself. */
const PLAIN_VIEW: TestFile = {
  path: '/plain_view.ts',
  content: `
import {Component} from '@angular/core';

@Component({standalone: false, selector: 'app-plain-view', template: '<em>plain</em>'})
export class PlainView {}
`,
};

/** Depends on the leaf only, so its extra import is safe and must survive. */
const CONSUMER_VIEW: TestFile = {
  path: '/consumer_view.ts',
  content: `
import {Component} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-consumer-view',
  template: '<app-plain-view></app-plain-view>',
})
export class ConsumerView {}
`,
};

const BADGE_DIRECTIVE: TestFile = {
  path: '/badge_directive.ts',
  content: `
import {Directive} from '@angular/core';

@Directive({standalone: false, selector: '[appBadge]'})
export class BadgeDirective {}
`,
};

const TEXT_MODULE: TestFile = {
  path: '/text_module.ts',
  content: `
import {NgModule} from '@angular/core';
import {RichTextView} from './rich_text_view';
import {TextView} from './text_view';
import {TooltipView} from './tooltip_view';
import {PlainView} from './plain_view';
import {ConsumerView} from './consumer_view';
import {BadgeDirective} from './badge_directive';

@NgModule({
  declarations: [RichTextView, TextView, TooltipView, PlainView, ConsumerView, BadgeDirective],
  exports: [RichTextView, TextView, TooltipView, PlainView, ConsumerView, BadgeDirective],
})
export class TextModule {}
`,
};

const UNIT = [
  BADGE_DIRECTIVE,
  RICH_TEXT_VIEW,
  TEXT_VIEW,
  TOOLTIP_VIEW,
  PLAIN_VIEW,
  CONSUMER_VIEW,
  TEXT_MODULE,
];

async function compile(): Promise<Map<string, string>> {
  const tsconfig: TestFile = {
    path: '/tsconfig.json',
    content: JSON.stringify({
      compilerOptions: {strict: true},
      angularCompilerOptions: {generateExtraImportsInLocalMode: true},
      files: UNIT.map((f) => f.path),
    }),
  };
  const outputs = await runPipeline([tsconfig, ...UNIT], {optimize: false, format: false});
  return new Map(outputs.map((o) => [o.path, o.content]));
}

function sideEffectImports(source: string): string[] {
  return [...source.matchAll(/^\s*import\s+'([^']+)';\s*$/gm)].map((m) => m[1]);
}

/** Resolve a relative specifier emitted in `from` back to an output path. */
function resolve(from: string, specifier: string): string {
  const dir = from.slice(0, from.lastIndexOf('/'));
  const segments = `${dir}/${specifier}`.split('/');
  const resolved: string[] = [];
  for (const segment of segments) {
    if (segment === '.' || segment === '') {
      continue;
    }
    if (segment === '..') {
      resolved.pop();
      continue;
    }
    resolved.push(segment);
  }
  return `/${resolved.join('/')}.ts`;
}

/** Nodes of `graph` that lie on a cycle, sorted, so a failure names the offending files. */
function cyclicNodes(graph: ReadonlyMap<string, readonly string[]>): string[] {
  const state = new Map<string, 'visiting' | 'done'>();
  const path: string[] = [];
  const cyclic = new Set<string>();

  const visit = (node: string): void => {
    const seen = state.get(node);
    if (seen === 'done') {
      return;
    }
    if (seen === 'visiting') {
      for (let i = path.lastIndexOf(node); i < path.length; i++) {
        cyclic.add(path[i]);
      }
      return;
    }
    state.set(node, 'visiting');
    path.push(node);
    for (const next of graph.get(node) ?? []) {
      visit(next);
    }
    path.pop();
    state.set(node, 'done');
  };

  for (const node of graph.keys()) {
    visit(node);
  }
  return [...cyclic].sort();
}
