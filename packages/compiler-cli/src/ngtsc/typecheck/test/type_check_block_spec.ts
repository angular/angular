/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, ExternalExpr, R3TargetBinder, SelectorMatcher, parseTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {ImportMode, Reference, ReferenceEmitStrategy, ReferenceEmitter} from '../../imports';
import {ClassDeclaration, isNamedClassDeclaration} from '../../reflection';
import {ImportManager} from '../../translator';
import {TypeCheckBlockMetadata} from '../src/api';
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
});

function getClass(sf: ts.SourceFile, name: string): ClassDeclaration<ts.ClassDeclaration> {
  for (const stmt of sf.statements) {
    if (isNamedClassDeclaration(stmt) && stmt.name.text === name) {
      return stmt;
    }
  }
  throw new Error(`Class ${name} not found in file`);
}


function tcb(template: string): string {
  const sf = ts.createSourceFile('synthetic.ts', 'class Test {}', ts.ScriptTarget.Latest, true);

  const clazz = getClass(sf, 'Test');
  const {nodes} = parseTemplate(template, 'synthetic.html');
  const matcher = new SelectorMatcher();
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
