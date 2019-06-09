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


describe('type check blocks', () => {
  it('should generate a basic block for a binding',
     () => { expect(tcb('{{hello}} {{world}}')).toContain('"" + ctx.hello + ctx.world;'); });

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
    expect(tcb(TEMPLATE)).toContain('(ctx.a!);');
  });

  it('should handle keyed property access', () => {
    const TEMPLATE = `{{a[b]}}`;
    expect(tcb(TEMPLATE)).toContain('ctx.a[ctx.b];');
  });

  it('should translate unclaimed bindings to their property equivalent', () => {
    const TEMPLATE = `<label [for]="'test'"></label>`;
    expect(tcb(TEMPLATE)).toContain('_t1.htmlFor = "test";');
  });

  it('should handle empty bindings', () => {
    const TEMPLATE = `<input [type]="">`;
    expect(tcb(TEMPLATE)).toContain('_t1.type = undefined;');
  });

  it('should handle bindings without value', () => {
    const TEMPLATE = `<input [type]>`;
    expect(tcb(TEMPLATE)).toContain('_t1.type = undefined;');
  });

  it('should handle implicit vars on ng-template', () => {
    const TEMPLATE = `<ng-template let-a></ng-template>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
  });

  it('should handle implicit vars when using microsyntax', () => {
    const TEMPLATE = `<div *ngFor="let user of users"></div>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
  });

  it('should generate a forward element reference correctly', () => {
    const TEMPLATE = `
      {{ i.value }}
      <input #i>
    `;
    expect(tcb(TEMPLATE)).toContain('var _t1 = document.createElement("input"); "" + _t1.value;');
  });

  it('should generate a forward directive reference correctly', () => {
    const TEMPLATE = `
      {{d.value}}
      <div dir #d="dir"></div>
    `;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      exportAs: ['dir'],
    }];
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t1 = Dir.ngTypeCtor({}); "" + _t1.value; var _t2 = document.createElement("div");');
  });

  it('should handle style and class bindings specially', () => {
    const TEMPLATE = `
      <div [style]="a" [class]="b"></div>
    `;
    const block = tcb(TEMPLATE);
    expect(block).toContain('ctx.a; ctx.b;');

    // There should be no assignments to the class or style properties.
    expect(block).not.toContain('.class = ');
    expect(block).not.toContain('.style = ');
  });

  it('should handle $any casts', () => {
    const TEMPLATE = `{{$any(a)}}`;
    const block = tcb(TEMPLATE);
    expect(block).toContain('(ctx.a as any);');
  });

  describe('template guards', () => {
    it('should emit invocation guards', () => {
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'NgIf',
        selector: '[ngIf]',
        inputs: {'ngIf': 'ngIf'},
        ngTemplateGuards: [{
          inputName: 'ngIf',
          type: 'invocation',
        }]
      }];
      const TEMPLATE = `<div *ngIf="person"></div>`;
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('if (NgIf.ngTemplateGuard_ngIf(_t1, ctx.person))');
    });

    it('should emit binding guards', () => {
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'NgIf',
        selector: '[ngIf]',
        inputs: {'ngIf': 'ngIf'},
        ngTemplateGuards: [{
          inputName: 'ngIf',
          type: 'binding',
        }]
      }];
      const TEMPLATE = `<div *ngIf="person !== null"></div>`;
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('if (ctx.person !== null)');
    });
  });

  describe('config', () => {
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      exportAs: ['dir'],
      inputs: {'dirInput': 'dirInput'},
      hasNgTemplateContextGuard: true,
    }];
    const BASE_CONFIG: TypeCheckingConfig = {
      applyTemplateContextGuards: true,
      checkQueries: false,
      checkTemplateBodies: true,
      checkTypeOfBindings: true,
      checkTypeOfPipes: true,
      strictSafeNavigationTypes: true,
    };

    describe('config.applyTemplateContextGuards', () => {
      const TEMPLATE = `<div *dir></div>`;
      const GUARD_APPLIED = 'if (Dir.ngTemplateContextGuard(';

      it('should apply template context guards when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(GUARD_APPLIED);
      });
      it('should not apply template context guards when disabled', () => {
        const DISABLED_CONFIG = {...BASE_CONFIG, applyTemplateContextGuards: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).not.toContain(GUARD_APPLIED);
      });
    });

    describe('config.checkTemplateBodies', () => {
      const TEMPLATE = `<ng-template>{{a}}</ng-template>`;

      it('should descend into template bodies when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('ctx.a;');
      });
      it('should not descend into template bodies when disabled', () => {
        const DISABLED_CONFIG = {...BASE_CONFIG, checkTemplateBodies: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).not.toContain('ctx.a;');
      });
    });

    describe('config.checkTypeOfBindings', () => {
      const TEMPLATE = `<div dir [dirInput]="a" [nonDirInput]="a"></div>`;

      it('should check types of bindings when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('Dir.ngTypeCtor({ dirInput: ctx.a })');
        expect(block).toContain('.nonDirInput = ctx.a;');
      });
      it('should not check types of bindings when disabled', () => {
        const DISABLED_CONFIG = {...BASE_CONFIG, checkTypeOfBindings: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('Dir.ngTypeCtor({ dirInput: (ctx.a as any) })');
        expect(block).toContain('.nonDirInput = (ctx.a as any);');
      });
    });


    describe('config.checkTypeOfPipes', () => {
      const TEMPLATE = `{{a | test:b:c}}`;
      const PIPES: TestDeclaration[] = [{
        type: 'pipe',
        name: 'TestPipe',
        pipeName: 'test',
      }];

      it('should check types of pipes when enabled', () => {
        const block = tcb(TEMPLATE, PIPES);
        expect(block).toContain('(null as TestPipe).transform(ctx.a, ctx.b, ctx.c);');
      });
      it('should not check types of pipes when disabled', () => {
        const DISABLED_CONFIG = {...BASE_CONFIG, checkTypeOfPipes: false};
        const block = tcb(TEMPLATE, PIPES, DISABLED_CONFIG);
        expect(block).toContain('(null as any).transform(ctx.a, ctx.b, ctx.c);');
      });
    });

    describe('config.strictSafeNavigationTypes', () => {
      const TEMPLATE = `{{a?.b}} {{a?.method()}}`;

      it('should use undefined for safe navigation operations when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('(ctx.a != null ? ctx.a!.method() : undefined)');
        expect(block).toContain('(ctx.a != null ? ctx.a!.b : undefined)');
      });
      it('should use an \'any\' type for safe navigation operations when disabled', () => {
        const DISABLED_CONFIG = {...BASE_CONFIG, strictSafeNavigationTypes: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('(ctx.a != null ? ctx.a!.method() : null as any)');
        expect(block).toContain('(ctx.a != null ? ctx.a!.b : null as any)');
      });
    });
  });
});

it('should generate a circular directive reference correctly', () => {
  const TEMPLATE = `
  <div dir #d="dir" [input]="d"></div>
`;
  const DIRECTIVES: TestDirective[] = [{
    type: 'directive',
    name: 'Dir',
    selector: '[dir]',
    exportAs: ['dir'],
    inputs: {input: 'input'},
  }];
  expect(tcb(TEMPLATE, DIRECTIVES)).toContain('var _t2 = Dir.ngTypeCtor({ input: (null!) });');
});

it('should generate circular references between two directives correctly', () => {
  const TEMPLATE = `
    <div #a="dirA" dir-a [inputA]="b">A</div>
    <div #b="dirB" dir-b [inputB]="a">B</div>
`;
  const DIRECTIVES: TestDirective[] = [
    {
      type: 'directive',
      name: 'DirA',
      selector: '[dir-a]',
      exportAs: ['dirA'],
      inputs: {inputA: 'inputA'},
    },
    {
      type: 'directive',
      name: 'DirB',
      selector: '[dir-b]',
      exportAs: ['dirB'],
      inputs: {inputA: 'inputB'},
    }
  ];
  expect(tcb(TEMPLATE, DIRECTIVES))
      .toContain(
          'var _t3 = DirB.ngTypeCtor({ inputA: (null!) }); ' +
          'var _t2 = DirA.ngTypeCtor({ inputA: _t3 });');
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
    {selector: string, name: string, type: 'directive'};
type TestPipe = {
  name: string,
  pipeName: string,
  type: 'pipe',
};

type TestDeclaration = TestDirective | TestPipe;

function tcb(
    template: string, declarations: TestDeclaration[] = [], config?: TypeCheckingConfig): string {
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

  const tcb = generateTypeCheckBlock(
      FakeEnvironment.newFake(config), new Reference(clazz), ts.createIdentifier('Test_TCB'), meta);

  const res = ts.createPrinter().printNode(ts.EmitHint.Unspecified, tcb, sf);
  return res.replace(/\s+/g, ' ');
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
