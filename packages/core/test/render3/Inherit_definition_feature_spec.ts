/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DoCheck, EventEmitter, Input, OnChanges, Output, SimpleChange, SimpleChanges} from '../../src/core';
import {InheritDefinitionFeature} from '../../src/render3/features/inherit_definition_feature';
import {DirectiveDefInternal, NgOnChangesFeature, defineComponent, defineDirective} from '../../src/render3/index';

describe('InheritDefinitionFeature', () => {
  it('should inherit lifecycle hooks', () => {
    class SuperDirective {
      ngOnInit() {}
      ngOnDestroy() {}
      ngAfterContentInit() {}
      ngAfterContentChecked() {}
      ngAfterViewInit() {}
      ngAfterViewChecked() {}
      ngDoCheck() {}
    }

    class SubDirective extends SuperDirective {
      ngAfterViewInit() {}
      ngAfterViewChecked() {}
      ngDoCheck() {}

      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [InheritDefinitionFeature]
      });
    }

    const finalDef = SubDirective.ngDirectiveDef as DirectiveDefInternal<any>;


    expect(finalDef.onInit).toBe(SuperDirective.prototype.ngOnInit);
    expect(finalDef.onDestroy).toBe(SuperDirective.prototype.ngOnDestroy);
    expect(finalDef.afterContentChecked).toBe(SuperDirective.prototype.ngAfterContentChecked);
    expect(finalDef.afterContentInit).toBe(SuperDirective.prototype.ngAfterContentInit);
    expect(finalDef.afterViewChecked).toBe(SubDirective.prototype.ngAfterViewChecked);
    expect(finalDef.afterViewInit).toBe(SubDirective.prototype.ngAfterViewInit);
    expect(finalDef.doCheck).toBe(SubDirective.prototype.ngDoCheck);
  });

  it('should inherit inputs', () => {
    // tslint:disable-next-line:class-as-namespace
    class SuperDirective {
      static ngDirectiveDef = defineDirective({
        inputs: {
          superFoo: ['foo', 'declaredFoo'],
          superBar: 'bar',
          superBaz: 'baz',
        },
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        factory: () => new SuperDirective(),
      });
    }

    // tslint:disable-next-line:class-as-namespace
    class SubDirective extends SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        inputs: {
          subBaz: 'baz',
          subQux: 'qux',
        },
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [InheritDefinitionFeature]
      });
    }

    const subDef = SubDirective.ngDirectiveDef as DirectiveDefInternal<any>;

    expect(subDef.inputs).toEqual({
      foo: 'superFoo',
      bar: 'superBar',
      baz: 'subBaz',
      qux: 'subQux',
    });
    expect(subDef.declaredInputs).toEqual({
      declaredFoo: 'superFoo',
      bar: 'superBar',
      baz: 'subBaz',
      qux: 'subQux',
    });
  });

  it('should inherit outputs', () => {
    // tslint:disable-next-line:class-as-namespace
    class SuperDirective {
      static ngDirectiveDef = defineDirective({
        outputs: {
          superFoo: 'foo',
          superBar: 'bar',
          superBaz: 'baz',
        },
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        factory: () => new SuperDirective(),
      });
    }

    // tslint:disable-next-line:class-as-namespace
    class SubDirective extends SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        outputs: {
          subBaz: 'baz',
          subQux: 'qux',
        },
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [InheritDefinitionFeature]
      });
    }

    const subDef = SubDirective.ngDirectiveDef as DirectiveDefInternal<any>;

    expect(subDef.outputs).toEqual({
      foo: 'superFoo',
      bar: 'superBar',
      baz: 'subBaz',
      qux: 'subQux',
    });
  });

  it('should compose hostBindings', () => {
    const log: Array<[string, number, number]> = [];

    // tslint:disable-next-line:class-as-namespace
    class SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        hostBindings: (directiveIndex: number, elementIndex: number) => {
          log.push(['super', directiveIndex, elementIndex]);
        },
        factory: () => new SuperDirective(),
      });
    }

    // tslint:disable-next-line:class-as-namespace
    class SubDirective extends SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        hostBindings: (directiveIndex: number, elementIndex: number) => {
          log.push(['sub', directiveIndex, elementIndex]);
        },
        factory: () => new SubDirective(),
        features: [InheritDefinitionFeature]
      });
    }

    const subDef = SubDirective.ngDirectiveDef as DirectiveDefInternal<any>;

    subDef.hostBindings !(1, 2);

    expect(log).toEqual([['super', 1, 2], ['sub', 1, 2]]);
  });

  it('should throw if inheriting a component from a directive', () => {
    // tslint:disable-next-line:class-as-namespace
    class SuperComponent {
      static ngComponentDef = defineComponent({
        type: SuperComponent,
        template: () => {},
        selectors: [['', 'superDir', '']],
        factory: () => new SuperComponent()
      });
    }

    expect(() => {
      // tslint:disable-next-line:class-as-namespace
      class SubDirective extends SuperComponent{static ngDirectiveDef = defineDirective({
                                                  type: SubDirective,
                                                  selectors: [['', 'subDir', '']],
                                                  factory: () => new SubDirective(),
                                                  features: [InheritDefinitionFeature]
                                                });}
    }).toThrowError('Directives cannot inherit Components');
  });

  it('should run inherited features', () => {
    const log: any[] = [];

    // tslint:disable-next-line:class-as-namespace
    class SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        factory: () => new SuperDirective(),
        features: [
          (arg: any) => { log.push('super1', arg); },
          (arg: any) => { log.push('super2', arg); },
        ]
      });
    }

    class SubDirective extends SuperDirective {
      @Output()
      baz = new EventEmitter();

      @Output()
      qux = new EventEmitter();

      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [InheritDefinitionFeature, (arg: any) => { log.push('sub1', arg); }]
      });
    }

    const superDef = SuperDirective.ngDirectiveDef as DirectiveDefInternal<any>;
    const subDef = SubDirective.ngDirectiveDef as DirectiveDefInternal<any>;

    expect(log).toEqual([
      'super1',
      superDef,
      'super2',
      superDef,
      'super1',
      subDef,
      'super2',
      subDef,
      'sub1',
      subDef,
    ]);
  });
});
