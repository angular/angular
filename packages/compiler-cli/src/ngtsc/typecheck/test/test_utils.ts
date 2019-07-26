/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssSelector, ParseSourceFile, R3TargetBinder, SelectorMatcher, parseTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {AbsoluteFsPath, LogicalFileSystem, absoluteFrom} from '../../file_system';
import {TestFile} from '../../file_system/testing';
import {AbsoluteModuleStrategy, LocalIdentifierStrategy, LogicalProjectStrategy, Reference, ReferenceEmitter} from '../../imports';
import {ClassDeclaration, TypeScriptReflectionHost, isNamedClassDeclaration} from '../../reflection';
import {makeProgram} from '../../testing';
import {getRootDirs} from '../../util/src/typescript';
import {TypeCheckBlockMetadata, TypeCheckableDirectiveMeta, TypeCheckingConfig} from '../src/api';
import {TypeCheckContext} from '../src/context';
import {Diagnostic} from '../src/diagnostics';
import {Environment} from '../src/environment';
import {generateTypeCheckBlock} from '../src/type_check_block';

export function typescriptLibDts(): TestFile {
  return {
    name: absoluteFrom('/lib.d.ts'),
    contents: `
      type Partial<T> = { [P in keyof T]?: T[P]; };
      type Pick<T, K extends keyof T> = { [P in K]: T[P]; };
      type NonNullable<T> = T extends null | undefined ? never : T;
      
      // The following native type declarations are required for proper type inference
      declare interface Function {
        call(...args: any[]): any;
      }
      declare interface Array<T> {
        length: number;
      }
      declare interface String {
        length: number;
      }
      
      declare interface HTMLElement {}
      declare interface HTMLDivElement extends HTMLElement {}
      declare interface HTMLImageElement extends HTMLElement {
        src: string;
        alt: string;
        width: number;
        height: number;
      }
      declare interface HTMLQuoteElement extends HTMLElement {
        cite: string;
      }
      declare interface HTMLElementTagNameMap {
        "blockquote": HTMLQuoteElement;
        "div": HTMLDivElement;
        "img": HTMLImageElement;
      }
      declare interface Document {
        createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
        createElement(tagName: string): HTMLElement;
      }
      declare const document: Document;
  `
  };
}

export function angularCoreDts(): TestFile {
  return {
    name: absoluteFrom('/node_modules/@angular/core/index.d.ts'),
    contents: `
    export declare class TemplateRef<C> {
      abstract readonly elementRef: unknown;
      abstract createEmbeddedView(context: C): unknown;
    }
  `
  };
}

export function ngForDeclaration(): TestDeclaration {
  return {
    type: 'directive',
    file: absoluteFrom('/ngfor.d.ts'),
    selector: '[ngForOf]',
    name: 'NgForOf',
    inputs: {ngForOf: 'ngForOf'},
    hasNgTemplateContextGuard: true,
  };
}

export function ngForDts(): TestFile {
  return {
    name: absoluteFrom('/ngfor.d.ts'),
    contents: `
    export declare class NgForOf<T> {
      ngForOf: T[];
      ngForTrackBy: TrackByFunction<T>;
      static ngTemplateContextGuard<T>(dir: NgForOf<T>, ctx: any): ctx is NgForOfContext<T>;
    }

    export interface TrackByFunction<T> {
      (index: number, item: T): any;
    }
    
    export declare class NgForOfContext<T> {
      $implicit: T;
      index: number;
      count: number;
      readonly odd: boolean;
      readonly even: boolean;
      readonly first: boolean;
      readonly last: boolean;
    }`,
  };
}

export const ALL_ENABLED_CONFIG: TypeCheckingConfig = {
  applyTemplateContextGuards: true,
  checkQueries: false,
  checkTemplateBodies: true,
  checkTypeOfBindings: true,
  checkTypeOfPipes: true,
  strictSafeNavigationTypes: true,
};

// Remove 'ref' from TypeCheckableDirectiveMeta and add a 'selector' instead.
export type TestDirective =
    Partial<Pick<TypeCheckableDirectiveMeta, Exclude<keyof TypeCheckableDirectiveMeta, 'ref'>>>&
    {selector: string, name: string, file?: AbsoluteFsPath, type: 'directive'};
export type TestPipe = {
  name: string,
  file?: AbsoluteFsPath,
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
  const templateUrl = 'synthetic.html';
  const {nodes} = parseTemplate(template, templateUrl);

  const {matcher, pipes} = prepareDeclarations(declarations, decl => getClass(sf, decl.name));
  const binder = new R3TargetBinder(matcher);
  const boundTarget = binder.bind({template: nodes});

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

export function typecheck(
    template: string, source: string, declarations: TestDeclaration[] = [],
    additionalSources: {name: AbsoluteFsPath; contents: string}[] = []): Diagnostic[] {
  const typeCheckFilePath = absoluteFrom('/_typecheck_.ts');
  const files = [
    typescriptLibDts(),
    angularCoreDts(),
    // Add the typecheck file to the program, as the typecheck program is created with the
    // assumption that the typecheck file was already a root file in the original program.
    {name: typeCheckFilePath, contents: 'export const TYPECHECK = true;'},
    {name: absoluteFrom('/main.ts'), contents: source},
    ...additionalSources,
  ];
  const {program, host, options} = makeProgram(files, {strictNullChecks: true}, undefined, false);
  const sf = program.getSourceFile(absoluteFrom('/main.ts')) !;
  const checker = program.getTypeChecker();
  const logicalFs = new LogicalFileSystem(getRootDirs(host, options));
  const emitter = new ReferenceEmitter([
    new LocalIdentifierStrategy(),
    new AbsoluteModuleStrategy(
        program, checker, options, host, new TypeScriptReflectionHost(checker)),
    new LogicalProjectStrategy(checker, logicalFs),
  ]);
  const ctx = new TypeCheckContext(ALL_ENABLED_CONFIG, emitter, typeCheckFilePath);

  const templateUrl = 'synthetic.html';
  const templateFile = new ParseSourceFile(template, templateUrl);
  const {nodes, errors} = parseTemplate(template, templateUrl);
  if (errors !== undefined) {
    throw new Error('Template parse errors: \n' + errors.join('\n'));
  }

  const {matcher, pipes} = prepareDeclarations(declarations, decl => {
    let declFile = sf;
    if (decl.file !== undefined) {
      declFile = program.getSourceFile(decl.file) !;
      if (declFile === undefined) {
        throw new Error(`Unable to locate ${decl.file} for ${decl.type} ${decl.name}`);
      }
    }
    return getClass(declFile, decl.name);
  });
  const binder = new R3TargetBinder(matcher);
  const boundTarget = binder.bind({template: nodes});
  const clazz = new Reference(getClass(sf, 'TestComponent'));

  ctx.addTemplate(clazz, boundTarget, pipes, templateFile);
  return ctx.calculateTemplateDiagnostics(program, host, options).diagnostics;
}

function prepareDeclarations(
    declarations: TestDeclaration[],
    resolveDeclaration: (decl: TestDeclaration) => ClassDeclaration<ts.ClassDeclaration>) {
  const matcher = new SelectorMatcher();
  for (const decl of declarations) {
    if (decl.type !== 'directive') {
      continue;
    }

    const selector = CssSelector.parse(decl.selector);
    const meta: TypeCheckableDirectiveMeta = {
      name: decl.name,
      ref: new Reference(resolveDeclaration(decl)),
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

  const pipes = new Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>();
  for (const decl of declarations) {
    if (decl.type === 'pipe') {
      pipes.set(decl.pipeName, new Reference(resolveDeclaration(decl)));
    }
  }

  return {matcher, pipes};
}

export function getClass(sf: ts.SourceFile, name: string): ClassDeclaration<ts.ClassDeclaration> {
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
