/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssSelector, Expression, ExternalExpr, R3TargetBinder, SelectorMatcher, parseTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {ImportMode, Reference, ReferenceEmitStrategy, ReferenceEmitter} from '../../imports';
import {ClassDeclaration, isNamedClassDeclaration} from '../../reflection';
import {ImportManager} from '../../translator';
import {TypeCheckBlockMetadata, TypeCheckableDirectiveMeta} from '../src/api';
import {generateTypeCheckBlock} from '../src/type_check_block';


describe('type check blocks', () => {
  it('should generate a basic block for a binding',
     () => { expect(tcb('{{hello}}')).toContain('ctx.hello;'); });

  it('should generate literal map expressions', () => {
    const TEMPLATE = '{{ method({foo: a, bar: b}) }}';
    expect(tcb(TEMPLATE)).toContain('ctx.method({ "foo": ctx.a, "bar": ctx.b });');
  });

  it('should generate literal array expressions', () => {
    const TEMPLATE = '{{ method([a, b]) }}';
    expect(tcb(TEMPLATE)).toContain('ctx.method([ctx.a, ctx.b]);');
  });

  it('should handle non-null assertions', () => {
    const TEMPLATE = `{{a!}}`;
    expect(tcb(TEMPLATE)).toContain('ctx.a!;');
  });

  it('should handle keyed property access', () => {
    const TEMPLATE = `{{a[b]}}`;
    expect(tcb(TEMPLATE)).toContain('ctx.a[ctx.b];');
  });

  it('should generate a forward element reference correctly', () => {
    const TEMPLATE = `
      {{ i.value }}
      <input #i>
    `;
    expect(tcb(TEMPLATE)).toContain('var _t1 = document.createElement("input"); _t1.value;');
  });

  it('should generate a forward directive reference correctly', () => {
    const TEMPLATE = `
      {{d.value}}
      <div dir #d="dir"></div>
    `;
    const DIRECTIVES: TestDirective[] = [{
      name: 'Dir',
      selector: '[dir]',
      exportAs: ['dir'],
    }];
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t1 = i0.Dir.ngTypeCtor({}); _t1.value; var _t2 = document.createElement("div");');
  });
});

it('should generate a circular directive reference correctly', () => {
  const TEMPLATE = `
  <div dir #d="dir" [input]="d"></div>
`;
  const DIRECTIVES: TestDirective[] = [{
    name: 'Dir',
    selector: '[dir]',
    exportAs: ['dir'],
    inputs: {input: 'input'},
  }];
  expect(tcb(TEMPLATE, DIRECTIVES)).toContain('var _t2 = i0.Dir.ngTypeCtor({ input: (null!) });');
});

it('should generate circular references between two directives correctly', () => {
  const TEMPLATE = `
    <div #a="dirA" dir-a [inputA]="b">A</div>
    <div #b="dirB" dir-b [inputB]="a">B</div>
`;
  const DIRECTIVES: TestDirective[] = [
    {
      name: 'DirA',
      selector: '[dir-a]',
      exportAs: ['dirA'],
      inputs: {inputA: 'inputA'},
    },
    {
      name: 'DirB',
      selector: '[dir-b]',
      exportAs: ['dirB'],
      inputs: {inputA: 'inputB'},
    }
  ];
  expect(tcb(TEMPLATE, DIRECTIVES))
      .toContain(
          'var _t3 = i0.DirB.ngTypeCtor({ inputA: (null!) });' +
          ' var _t2 = i1.DirA.ngTypeCtor({ inputA: _t3 });');
});

function getClass(sf: ts.SourceFile, name: string): ClassDeclaration<ts.ClassDeclaration> {
  for (const stmt of sf.statements) {
    if (isNamedClassDeclaration(stmt) && stmt.name.text === name) {
      return stmt;
    }
  }
  throw new Error(`Class ${name} not found in file`);
}

// Remove 'ref' from TypeCheckableDirectiveMeta and add a 'selector' instead.
type TestDirective =
    Partial<Pick<TypeCheckableDirectiveMeta, Exclude<keyof TypeCheckableDirectiveMeta, 'ref'>>>&
    {selector: string, name: string};

function tcb(template: string, directives: TestDirective[] = []): string {
  const classes = ['Test', ...directives.map(dir => dir.name)];
  const code = classes.map(name => `class ${name} {}`).join('\n');

  const sf = ts.createSourceFile('synthetic.ts', code, ts.ScriptTarget.Latest, true);
  const clazz = getClass(sf, 'Test');
  const {nodes} = parseTemplate(template, 'synthetic.html');
  const matcher = new SelectorMatcher();

  for (const dir of directives) {
    const selector = CssSelector.parse(dir.selector);
    const meta: TypeCheckableDirectiveMeta = {
      name: dir.name,
      ref: new Reference(getClass(sf, dir.name)),
      exportAs: dir.exportAs || null,
      hasNgTemplateContextGuard: dir.hasNgTemplateContextGuard || false,
      inputs: dir.inputs || {},
      isComponent: dir.isComponent || false,
      ngTemplateGuards: dir.ngTemplateGuards || [],
      outputs: dir.outputs || {},
      queries: dir.queries || [],
    };
    matcher.addSelectables(selector, meta);
  }

  const binder = new R3TargetBinder(matcher);
  const boundTarget = binder.bind({template: nodes});

  const meta: TypeCheckBlockMetadata = {
    boundTarget,
    fnName: 'Test_TCB',
  };

  const im = new ImportManager(undefined, 'i');
  const tcb =
      generateTypeCheckBlock(clazz, meta, im, new ReferenceEmitter([new FakeReferenceStrategy()]));

  const res = ts.createPrinter().printNode(ts.EmitHint.Unspecified, tcb, sf);
  return res.replace(/\s+/g, ' ');
}

class FakeReferenceStrategy implements ReferenceEmitStrategy {
  emit(ref: Reference<ts.Node>, context: ts.SourceFile, importMode?: ImportMode): Expression {
    return new ExternalExpr({
      moduleName: `types/${ref.debugName}`,
      name: ref.debugName,
    });
  }
}
