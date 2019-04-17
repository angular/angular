/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssSelector, R3TargetBinder, SelectorMatcher, parseTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {Reference} from '../../imports';
import {ClassDeclaration, isNamedClassDeclaration} from '../../reflection';
import {TypeCheckBlockMetadata, TypeCheckableDirectiveMeta, TypeCheckingConfig} from '../src/api';
import {Environment} from '../src/environment';
import {generateTypeCheckBlock} from '../src/type_check_block';

// Remove 'ref' from TypeCheckableDirectiveMeta and add a 'selector' instead.
export type TestDirective =
    Partial<Pick<TypeCheckableDirectiveMeta, Exclude<keyof TypeCheckableDirectiveMeta, 'ref'>>>&
    {selector: string, name: string, type: 'directive'};
export type TestPipe = {
  name: string,
  pipeName: string,
  type: 'pipe',
};

export type TestDeclaration = TestDirective | TestPipe;

export function tcb(
    template: string, declarations: TestDeclaration[] = [], config?: TypeCheckingConfig,
    options?: {emitSpans?: boolean}): string {
  const classes = ['Test', ...declarations.map(decl => decl.name)];
  const code = classes.map(name => `class ${name}<T extends string> {}`).join('\n');

  const sf = ts.createSourceFile('synthetic.ts', code, ts.ScriptTarget.Latest, true);
  const clazz = getClass(sf, 'Test');
  const {nodes} = parseTemplate(template, 'synthetic.html');
  const matcher = new SelectorMatcher();

  for (const decl of declarations) {
    if (decl.type !== 'directive') {
      continue;
    }
    const selector = CssSelector.parse(decl.selector);
    const meta: TypeCheckableDirectiveMeta = {
      name: decl.name,
      ref: new Reference(getClass(sf, decl.name)),
      exportAs: decl.exportAs || null,
      hasNgTemplateContextGuard: decl.hasNgTemplateContextGuard || false,
      inputs: decl.inputs || {},
      isComponent: decl.isComponent || false,
      ngTemplateGuards: decl.ngTemplateGuards || [],
      outputs: decl.outputs || {},
      queries: decl.queries || [],
    };
    matcher.addSelectables(selector, meta);
  }

  const binder = new R3TargetBinder(matcher);
  const boundTarget = binder.bind({template: nodes});

  const pipes = new Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>();
  for (const decl of declarations) {
    if (decl.type === 'pipe') {
      pipes.set(decl.pipeName, new Reference(getClass(sf, decl.name)));
    }
  }

  const meta: TypeCheckBlockMetadata = {boundTarget, pipes};

  config = config || {
    applyTemplateContextGuards: true,
    checkQueries: false,
    checkTypeOfBindings: true,
    checkTypeOfPipes: true,
    checkTemplateBodies: true,
    strictSafeNavigationTypes: true,
  };
  options = options || {
    emitSpans: false,
  };

  const tcb = generateTypeCheckBlock(
      FakeEnvironment.newFake(config), new Reference(clazz), ts.createIdentifier('Test_TCB'), meta);

  const removeComments = !options.emitSpans;
  const res = ts.createPrinter({removeComments}).printNode(ts.EmitHint.Unspecified, tcb, sf);
  return res.replace(/\s+/g, ' ');
}

function getClass(sf: ts.SourceFile, name: string): ClassDeclaration<ts.ClassDeclaration> {
  for (const stmt of sf.statements) {
    if (isNamedClassDeclaration(stmt) && stmt.name.text === name) {
      return stmt;
    }
  }
  throw new Error(`Class ${name} not found in file`);
}

class FakeEnvironment /* implements Environment */ {
  constructor(readonly config: TypeCheckingConfig) {}

  typeCtorFor(dir: TypeCheckableDirectiveMeta): ts.Expression {
    return ts.createPropertyAccess(ts.createIdentifier(dir.name), 'ngTypeCtor');
  }

  pipeInst(ref: Reference<ClassDeclaration<ts.ClassDeclaration>>): ts.Expression {
    return ts.createParen(ts.createAsExpression(ts.createNull(), this.referenceType(ref)));
  }

  reference(ref: Reference<ClassDeclaration<ts.ClassDeclaration>>): ts.Expression {
    return ref.node.name;
  }

  referenceType(ref: Reference<ClassDeclaration<ts.ClassDeclaration>>): ts.TypeNode {
    return ts.createTypeReferenceNode(ref.node.name, /* typeArguments */ undefined);
  }

  referenceCoreType(name: string, typeParamCount: number = 0): ts.TypeNode {
    const typeArgs: ts.TypeNode[] = [];
    for (let i = 0; i < typeParamCount; i++) {
      typeArgs.push(ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
    }

    const qName = ts.createQualifiedName(ts.createIdentifier('ng'), name);
    return ts.createTypeReferenceNode(qName, typeParamCount > 0 ? typeArgs : undefined);
  }

  getPreludeStatements(): ts.Statement[] { return []; }

  static newFake(config: TypeCheckingConfig): Environment {
    return new FakeEnvironment(config) as Environment;
  }
}
