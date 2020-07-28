/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TypeCheckingConfig} from '../api';

import {ALL_ENABLED_CONFIG, tcb, TestDeclaration, TestDirective} from './test_utils';


describe('type check blocks', () => {
  it('should generate a basic block for a binding', () => {
    expect(tcb('{{hello}} {{world}}')).toContain('"" + ((ctx).hello) + ((ctx).world);');
  });

  it('should generate literal map expressions', () => {
    const TEMPLATE = '{{ method({foo: a, bar: b}) }}';
    expect(tcb(TEMPLATE)).toContain('(ctx).method({ "foo": ((ctx).a), "bar": ((ctx).b) });');
  });

  it('should generate literal array expressions', () => {
    const TEMPLATE = '{{ method([a, b]) }}';
    expect(tcb(TEMPLATE)).toContain('(ctx).method([((ctx).a), ((ctx).b)]);');
  });

  it('should handle non-null assertions', () => {
    const TEMPLATE = `{{a!}}`;
    expect(tcb(TEMPLATE)).toContain('((((ctx).a))!);');
  });

  it('should handle keyed property access', () => {
    const TEMPLATE = `{{a[b]}}`;
    expect(tcb(TEMPLATE)).toContain('(((ctx).a))[((ctx).b)];');
  });

  it('should handle nested ternary expressions', () => {
    const TEMPLATE = `{{a ? b : c ? d : e}}`;
    expect(tcb(TEMPLATE))
        .toContain('(((ctx).a) ? ((ctx).b) : (((ctx).c) ? ((ctx).d) : ((ctx).e)))');
  });

  it('should handle quote expressions as any type', () => {
    const TEMPLATE = `<span [quote]="sql:expression"></span>`;
    expect(tcb(TEMPLATE)).toContain('null as any');
  });

  it('should handle attribute values for directive inputs', () => {
    const TEMPLATE = `<div dir inputA="value"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'DirA',
      selector: '[dir]',
      inputs: {inputA: 'inputA'},
    }];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain('_t2: DirA = (null!); _t2.inputA = ("value");');
  });

  it('should handle multiple bindings to the same property', () => {
    const TEMPLATE = `<div dir-a [inputA]="1" [inputA]="2"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'DirA',
      selector: '[dir-a]',
      inputs: {inputA: 'inputA'},
    }];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).toContain('_t2.inputA = (1);');
    expect(block).toContain('_t2.inputA = (2);');
  });

  it('should handle empty bindings', () => {
    const TEMPLATE = `<div dir-a [inputA]=""></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'DirA',
      selector: '[dir-a]',
      inputs: {inputA: 'inputA'},
    }];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain('_t2.inputA = (undefined);');
  });

  it('should handle bindings without value', () => {
    const TEMPLATE = `<div dir-a [inputA]></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'DirA',
      selector: '[dir-a]',
      inputs: {inputA: 'inputA'},
    }];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain('_t2.inputA = (undefined);');
  });

  it('should handle implicit vars on ng-template', () => {
    const TEMPLATE = `<ng-template let-a></ng-template>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
  });

  it('should handle method calls of template variables', () => {
    const TEMPLATE = `<ng-template let-a>{{a(1)}}</ng-template>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
    expect(tcb(TEMPLATE)).toContain('(_t2).a(1);');
  });

  it('should handle implicit vars when using microsyntax', () => {
    const TEMPLATE = `<div *ngFor="let user of users"></div>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
  });

  describe('type constructors', () => {
    it('should handle missing property bindings', () => {
      const TEMPLATE = `<div dir [inputA]="foo"></div>`;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          fieldA: 'inputA',
          fieldB: 'inputB',
        },
        isGeneric: true,
      }];
      expect(tcb(TEMPLATE, DIRECTIVES))
          .toContain(
              'var _t2 = Dir.ngTypeCtor({ "fieldA": (((ctx).foo)), "fieldB": (null as any) });');
    });

    it('should handle multiple bindings to the same property', () => {
      const TEMPLATE = `<div dir [inputA]="1" [inputA]="2"></div>`;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          fieldA: 'inputA',
        },
        isGeneric: true,
      }];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('"fieldA": (1)');
      expect(block).not.toContain('"fieldA": (2)');
    });


    it('should only apply property bindings to directives', () => {
      const TEMPLATE = `
      <div dir [style.color]="'blue'" [class.strong]="false" [attr.enabled]="true"></div>
    `;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {'color': 'color', 'strong': 'strong', 'enabled': 'enabled'},
        isGeneric: true,
      }];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain(
          'var _t2 = Dir.ngTypeCtor({ "color": (null as any), "strong": (null as any), "enabled": (null as any) });');
      expect(block).toContain('"blue"; false; true;');
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
        isGeneric: true,
      }];
      expect(tcb(TEMPLATE, DIRECTIVES))
          .toContain(
              'var _t3 = Dir.ngTypeCtor((null!)); ' +
              'var _t2 = Dir.ngTypeCtor({ "input": (_t3) });');
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
          isGeneric: true,
        },
        {
          type: 'directive',
          name: 'DirB',
          selector: '[dir-b]',
          exportAs: ['dirB'],
          inputs: {inputB: 'inputB'},
          isGeneric: true,
        }
      ];
      expect(tcb(TEMPLATE, DIRECTIVES))
          .toContain(
              'var _t4 = DirA.ngTypeCtor((null!)); ' +
              'var _t3 = DirB.ngTypeCtor({ "inputB": (_t4) }); ' +
              'var _t2 = DirA.ngTypeCtor({ "inputA": (_t3) });');
    });

    it('should handle empty bindings', () => {
      const TEMPLATE = `<div dir-a [inputA]=""></div>`;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'DirA',
        selector: '[dir-a]',
        inputs: {inputA: 'inputA'},
        isGeneric: true,
      }];
      expect(tcb(TEMPLATE, DIRECTIVES)).toContain('"inputA": (undefined)');
    });

    it('should handle bindings without value', () => {
      const TEMPLATE = `<div dir-a [inputA]></div>`;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'DirA',
        selector: '[dir-a]',
        inputs: {inputA: 'inputA'},
        isGeneric: true,
      }];
      expect(tcb(TEMPLATE, DIRECTIVES)).toContain('"inputA": (undefined)');
    });

    it('should use coercion types if declared', () => {
      const TEMPLATE = `<div dir [inputA]="foo"></div>`;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          fieldA: 'inputA',
        },
        isGeneric: true,
        coercedInputFields: ['fieldA'],
      }];
      expect(tcb(TEMPLATE, DIRECTIVES))
          .toContain(
              'var _t2 = Dir.ngTypeCtor({ "fieldA": (((ctx).foo)) }); ' +
              'var _t3: typeof Dir.ngAcceptInputType_fieldA = (null!); ' +
              '_t3 = (((ctx).foo));');
    });
  });

  it('should generate a forward element reference correctly', () => {
    const TEMPLATE = `
      {{ i.value }}
      <input #i>
    `;
    expect(tcb(TEMPLATE))
        .toContain('var _t1 = document.createElement("input"); "" + ((_t1).value);');
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
            'var _t1: Dir = (null!); "" + ((_t1).value); var _t2 = document.createElement("div");');
  });

  it('should handle style and class bindings specially', () => {
    const TEMPLATE = `
      <div [style]="a" [class]="b"></div>
    `;
    const block = tcb(TEMPLATE);
    expect(block).toContain('((ctx).a); ((ctx).b);');

    // There should be no assignments to the class or style properties.
    expect(block).not.toContain('.class = ');
    expect(block).not.toContain('.style = ');
  });

  it('should only apply property bindings to directives', () => {
    const TEMPLATE = `
      <div dir [style.color]="'blue'" [class.strong]="false" [attr.enabled]="true"></div>
    `;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {'color': 'color', 'strong': 'strong', 'enabled': 'enabled'},
    }];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).toContain('var _t2: Dir = (null!);');
    expect(block).not.toContain('"color"');
    expect(block).not.toContain('"strong"');
    expect(block).not.toContain('"enabled"');
    expect(block).toContain('"blue"; false; true;');
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
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t2: Dir = (null!); ' +
            '_t2.input = (_t2);');
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
            'var _t2: DirA = (null!); ' +
            'var _t3: DirB = (null!); ' +
            '_t2.inputA = (_t3); ' +
            'var _t4 = document.createElement("div"); ' +
            '_t3.inputA = (_t2);');
  });

  it('should handle undeclared properties', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {
        fieldA: 'inputA',
      },
      undeclaredInputFields: ['fieldA']
    }];
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t2: Dir = (null!); ' +
            '(((ctx).foo)); ');
  });

  it('should assign restricted properties to temp variables by default', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {
        fieldA: 'inputA',
      },
      restrictedInputFields: ['fieldA']
    }];
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t2: Dir = (null!); ' +
            'var _t3: typeof _t2["fieldA"] = (null!); ' +
            '_t3 = (((ctx).foo)); ');
  });

  it('should assign properties via element access for field names that are not JS identifiers',
     () => {
       const TEMPLATE = `<div dir [inputA]="foo"></div>`;
       const DIRECTIVES: TestDeclaration[] = [{
         type: 'directive',
         name: 'Dir',
         selector: '[dir]',
         inputs: {
           'some-input.xs': 'inputA',
         },
         stringLiteralInputFields: ['some-input.xs'],
       }];
       const block = tcb(TEMPLATE, DIRECTIVES);
       expect(block).toContain(
           'var _t2: Dir = (null!); ' +
           '_t2["some-input.xs"] = (((ctx).foo)); ');
     });

  it('should handle a single property bound to multiple fields', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {
        field1: 'inputA',
        field2: 'inputA',
      },
    }];
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t2: Dir = (null!); ' +
            '_t2.field2 = _t2.field1 = (((ctx).foo));');
  });

  it('should handle a single property bound to multiple fields, where one of them is coerced',
     () => {
       const TEMPLATE = `<div dir [inputA]="foo"></div>`;
       const DIRECTIVES: TestDeclaration[] = [{
         type: 'directive',
         name: 'Dir',
         selector: '[dir]',
         inputs: {
           field1: 'inputA',
           field2: 'inputA',
         },
         coercedInputFields: ['field1'],
       }];
       expect(tcb(TEMPLATE, DIRECTIVES))
           .toContain(
               'var _t2: Dir = (null!); ' +
               'var _t3: typeof Dir.ngAcceptInputType_field1 = (null!); ' +
               '_t2.field2 = _t3 = (((ctx).foo));');
     });

  it('should handle a single property bound to multiple fields, where one of them is undeclared',
     () => {
       const TEMPLATE = `<div dir [inputA]="foo"></div>`;
       const DIRECTIVES: TestDeclaration[] = [{
         type: 'directive',
         name: 'Dir',
         selector: '[dir]',
         inputs: {
           field1: 'inputA',
           field2: 'inputA',
         },
         undeclaredInputFields: ['field1'],
       }];
       expect(tcb(TEMPLATE, DIRECTIVES))
           .toContain(
               'var _t2: Dir = (null!); ' +
               '_t2.field2 = (((ctx).foo));');
     });

  it('should use coercion types if declared', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {
        fieldA: 'inputA',
      },
      coercedInputFields: ['fieldA'],
    }];
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t2: Dir = (null!); ' +
            'var _t3: typeof Dir.ngAcceptInputType_fieldA = (null!); ' +
            '_t3 = (((ctx).foo));');
  });

  it('should use coercion types if declared, even when backing field is not declared', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {
        fieldA: 'inputA',
      },
      coercedInputFields: ['fieldA'],
      undeclaredInputFields: ['fieldA'],
    }];
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t2: Dir = (null!); ' +
            'var _t3: typeof Dir.ngAcceptInputType_fieldA = (null!); ' +
            '_t3 = (((ctx).foo));');
  });

  it('should handle $any casts', () => {
    const TEMPLATE = `{{$any(a)}}`;
    const block = tcb(TEMPLATE);
    expect(block).toContain('(((ctx).a) as any);');
  });

  describe('experimental DOM checking via lib.dom.d.ts', () => {
    it('should translate unclaimed bindings to their property equivalent', () => {
      const TEMPLATE = `<label [for]="'test'"></label>`;
      const CONFIG = {...ALL_ENABLED_CONFIG, checkTypeOfDomBindings: true};
      expect(tcb(TEMPLATE, /* declarations */ undefined, CONFIG))
          .toContain('_t1["htmlFor"] = ("test");');
    });
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
      expect(block).toContain('if (NgIf.ngTemplateGuard_ngIf(_t1, ((ctx).person)))');
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
      expect(block).toContain('if ((((ctx).person)) !== (null))');
    });
  });

  describe('outputs', () => {
    it('should emit subscribe calls for directive outputs', () => {
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        outputs: {'outputField': 'dirOutput'},
      }];
      const TEMPLATE = `<div dir (dirOutput)="foo($event)"></div>`;
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain(
          '_outputHelper(_t2["outputField"]).subscribe(function ($event): any { (ctx).foo($event); });');
    });

    it('should emit a listener function with AnimationEvent for animation events', () => {
      const TEMPLATE = `<div (@animation.done)="foo($event)"></div>`;
      const block = tcb(TEMPLATE);
      expect(block).toContain(
          'function ($event: animations.AnimationEvent): any { (ctx).foo($event); }');
    });

    it('should emit addEventListener calls for unclaimed outputs', () => {
      const TEMPLATE = `<div (event)="foo($event)"></div>`;
      const block = tcb(TEMPLATE);
      expect(block).toContain(
          '_t1.addEventListener("event", function ($event): any { (ctx).foo($event); });');
    });

    it('should allow to cast $event using $any', () => {
      const TEMPLATE = `<div (event)="foo($any($event))"></div>`;
      const block = tcb(TEMPLATE);
      expect(block).toContain(
          '_t1.addEventListener("event", function ($event): any { (ctx).foo(($event as any)); });');
    });

    it('should detect writes to template variables', () => {
      const TEMPLATE = `<ng-template let-v><div (event)="v = 3"></div></ng-template>`;
      const block = tcb(TEMPLATE);
      expect(block).toContain(
          '_t3.addEventListener("event", function ($event): any { (_t2 = 3); });');
    });
  });

  describe('config', () => {
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      exportAs: ['dir'],
      inputs: {'dirInput': 'dirInput'},
      outputs: {'outputField': 'dirOutput'},
      hasNgTemplateContextGuard: true,
    }];
    const BASE_CONFIG: TypeCheckingConfig = {
      applyTemplateContextGuards: true,
      checkQueries: false,
      checkTemplateBodies: true,
      checkTypeOfInputBindings: true,
      honorAccessModifiersForInputBindings: false,
      strictNullInputBindings: true,
      checkTypeOfAttributes: true,
      checkTypeOfDomBindings: false,
      checkTypeOfOutputEvents: true,
      checkTypeOfAnimationEvents: true,
      checkTypeOfDomEvents: true,
      checkTypeOfDomReferences: true,
      checkTypeOfNonDomReferences: true,
      checkTypeOfPipes: true,
      strictSafeNavigationTypes: true,
      useContextGenericType: true,
      strictLiteralTypes: true,
    };

    describe('config.applyTemplateContextGuards', () => {
      const TEMPLATE = `<div *dir></div>`;
      const GUARD_APPLIED = 'if (Dir.ngTemplateContextGuard(';

      it('should apply template context guards when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(GUARD_APPLIED);
      });
      it('should not apply template context guards when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, applyTemplateContextGuards: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).not.toContain(GUARD_APPLIED);
      });
    });

    describe('config.checkTemplateBodies', () => {
      const TEMPLATE = `<ng-template>{{a}}</ng-template>`;

      it('should descend into template bodies when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('((ctx).a);');
      });
      it('should not descend into template bodies when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, checkTemplateBodies: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).not.toContain('((ctx).a);');
      });
    });

    describe('config.strictNullInputBindings', () => {
      const TEMPLATE = `<div dir [dirInput]="a" [nonDirInput]="b"></div>`;

      it('should include null and undefined when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('_t2.dirInput = (((ctx).a));');
        expect(block).toContain('((ctx).b);');
      });
      it('should use the non-null assertion operator when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, strictNullInputBindings: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('_t2.dirInput = (((ctx).a)!);');
        expect(block).toContain('((ctx).b)!;');
      });
    });

    describe('config.checkTypeOfBindings', () => {
      it('should check types of bindings when enabled', () => {
        const TEMPLATE = `<div dir [dirInput]="a" [nonDirInput]="b"></div>`;
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('_t2.dirInput = (((ctx).a));');
        expect(block).toContain('((ctx).b);');
      });

      it('should not check types of bindings when disabled', () => {
        const TEMPLATE = `<div dir [dirInput]="a" [nonDirInput]="b"></div>`;
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfInputBindings: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('_t2.dirInput = ((((ctx).a) as any));');
        expect(block).toContain('(((ctx).b) as any);');
      });

      it('should wrap the cast to any in parentheses when required', () => {
        const TEMPLATE = `<div dir [dirInput]="a === b"></div>`;
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfInputBindings: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('_t2.dirInput = ((((((ctx).a)) === (((ctx).b))) as any));');
      });
    });

    describe('config.checkTypeOfOutputEvents', () => {
      const TEMPLATE = `<div dir (dirOutput)="foo($event)" (nonDirOutput)="foo($event)"></div>`;

      it('should check types of directive outputs when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(
            '_outputHelper(_t2["outputField"]).subscribe(function ($event): any { (ctx).foo($event); });');
        expect(block).toContain(
            '_t1.addEventListener("nonDirOutput", function ($event): any { (ctx).foo($event); });');
      });
      it('should not check types of directive outputs when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfOutputEvents: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('function ($event: any): any { (ctx).foo($event); }');
        // Note that DOM events are still checked, that is controlled by `checkTypeOfDomEvents`
        expect(block).toContain(
            '_t1.addEventListener("nonDirOutput", function ($event): any { (ctx).foo($event); });');
      });
    });

    describe('config.checkTypeOfAnimationEvents', () => {
      const TEMPLATE = `<div (@animation.done)="foo($event)"></div>`;

      it('should check types of animation events when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(
            'function ($event: animations.AnimationEvent): any { (ctx).foo($event); }');
      });
      it('should not check types of animation events when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfAnimationEvents: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('function ($event: any): any { (ctx).foo($event); }');
      });
    });

    describe('config.checkTypeOfDomEvents', () => {
      const TEMPLATE = `<div dir (dirOutput)="foo($event)" (nonDirOutput)="foo($event)"></div>`;

      it('should check types of DOM events when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(
            '_outputHelper(_t2["outputField"]).subscribe(function ($event): any { (ctx).foo($event); });');
        expect(block).toContain(
            '_t1.addEventListener("nonDirOutput", function ($event): any { (ctx).foo($event); });');
      });
      it('should not check types of DOM events when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfDomEvents: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        // Note that directive outputs are still checked, that is controlled by
        // `checkTypeOfOutputEvents`
        expect(block).toContain(
            '_outputHelper(_t2["outputField"]).subscribe(function ($event): any { (ctx).foo($event); });');
        expect(block).toContain('function ($event: any): any { (ctx).foo($event); }');
      });
    });

    describe('config.checkTypeOfDomReferences', () => {
      const TEMPLATE = `<input #ref>{{ref.value}}`;

      it('should trace references when enabled', () => {
        const block = tcb(TEMPLATE);
        expect(block).toContain('(_t1).value');
      });

      it('should use any for reference types when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfDomReferences: false};
        const block = tcb(TEMPLATE, [], DISABLED_CONFIG);
        expect(block).toContain('(null as any).value');
      });
    });

    describe('config.checkTypeOfNonDomReferences', () => {
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        exportAs: ['dir'],
        inputs: {'dirInput': 'dirInput'},
        outputs: {'outputField': 'dirOutput'},
        hasNgTemplateContextGuard: true,
      }];
      const TEMPLATE =
          `<div dir #ref="dir">{{ref.value}}</div><ng-template #ref2></ng-template>{{ref2.value2}}`;

      it('should trace references to a directive when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('(_t2).value');
      });

      it('should trace references to an <ng-template> when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('((null as any as core.TemplateRef<any>)).value2');
      });

      it('should use any for reference types when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfNonDomReferences: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('(null as any).value');
      });
    });

    describe('config.checkTypeOfAttributes', () => {
      const TEMPLATE = `<textarea dir disabled cols="3" [rows]="2">{{ref.value}}</textarea>`;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {'disabled': 'disabled', 'cols': 'cols', 'rows': 'rows'},
      }];

      it('should assign string value to the input when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('_t2.disabled = ("");');
        expect(block).toContain('_t2.cols = ("3");');
        expect(block).toContain('_t2.rows = (2);');
      });

      it('should use any for attributes but still check bound attributes when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfAttributes: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).not.toContain('"disabled"');
        expect(block).not.toContain('"cols"');
        expect(block).toContain('_t2.rows = (2);');
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
        expect(block).toContain('(null as TestPipe).transform(((ctx).a), ((ctx).b), ((ctx).c));');
      });
      it('should not check types of pipes when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfPipes: false};
        const block = tcb(TEMPLATE, PIPES, DISABLED_CONFIG);
        expect(block).toContain('(null as any).transform(((ctx).a), ((ctx).b), ((ctx).c));');
      });
    });

    describe('config.strictSafeNavigationTypes', () => {
      const TEMPLATE = `{{a?.b}} {{a?.method()}}`;

      it('should use undefined for safe navigation operations when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('((null as any) ? (((ctx).a))!.method() : undefined)');
        expect(block).toContain('((null as any) ? (((ctx).a))!.b : undefined)');
      });
      it('should use an \'any\' type for safe navigation operations when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, strictSafeNavigationTypes: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('((((ctx).a))!.method() as any)');
        expect(block).toContain('((((ctx).a))!.b as any)');
      });
    });

    describe('config.strictSafeNavigationTypes (View Engine bug emulation)', () => {
      const TEMPLATE = `{{a.method()?.b}} {{a()?.method()}}`;
      it('should check the presence of a property/method on the receiver when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('((null as any) ? ((((ctx).a)).method())!.b : undefined)');
        expect(block).toContain('((null as any) ? ((ctx).a())!.method() : undefined)');
      });
      it('should not check the presence of a property/method on the receiver when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, strictSafeNavigationTypes: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('(((((ctx).a)).method()) as any).b');
        expect(block).toContain('(((ctx).a()) as any).method()');
      });
    });

    describe('config.strictContextGenerics', () => {
      const TEMPLATE = `Test`;

      it('should use the generic type of the context when enabled', () => {
        const block = tcb(TEMPLATE);
        expect(block).toContain('function Test_TCB<T extends string>(ctx: Test<T>)');
      });

      it('should use any for the context generic type when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, useContextGenericType: false};
        const block = tcb(TEMPLATE, undefined, DISABLED_CONFIG);
        expect(block).toContain('function Test_TCB(ctx: Test<any>)');
      });
    });

    describe('config.checkAccessModifiersForInputBindings', () => {
      const TEMPLATE = `<div dir [inputA]="foo"></div>`;

      it('should assign restricted properties via element access for field names that are not JS identifiers',
         () => {
           const DIRECTIVES: TestDeclaration[] = [{
             type: 'directive',
             name: 'Dir',
             selector: '[dir]',
             inputs: {
               'some-input.xs': 'inputA',
             },
             restrictedInputFields: ['some-input.xs'],
             stringLiteralInputFields: ['some-input.xs'],
           }];
           const enableChecks:
               TypeCheckingConfig = {...BASE_CONFIG, honorAccessModifiersForInputBindings: true};
           const block = tcb(TEMPLATE, DIRECTIVES, enableChecks);
           expect(block).toContain(
               'var _t2: Dir = (null!); ' +
               '_t2["some-input.xs"] = (((ctx).foo)); ');
         });

      it('should assign restricted properties via property access', () => {
        const DIRECTIVES: TestDeclaration[] = [{
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          inputs: {
            fieldA: 'inputA',
          },
          restrictedInputFields: ['fieldA']
        }];
        const enableChecks:
            TypeCheckingConfig = {...BASE_CONFIG, honorAccessModifiersForInputBindings: true};
        const block = tcb(TEMPLATE, DIRECTIVES, enableChecks);
        expect(block).toContain(
            'var _t2: Dir = (null!); ' +
            '_t2.fieldA = (((ctx).foo)); ');
      });
    });
  });
});
