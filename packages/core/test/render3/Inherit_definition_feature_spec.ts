/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, InjectionToken} from '../../src/core';
import {ComponentDef, DirectiveDef, InheritDefinitionFeature, NgOnChangesFeature, ProvidersFeature, RenderFlags, bind, defineBase, defineComponent, defineDirective, directiveInject, element, elementProperty, load} from '../../src/render3/index';

import {ComponentFixture, createComponent} from './render_util';

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

    const finalDef = SubDirective.ngDirectiveDef as DirectiveDef<any>;


    expect(finalDef.onInit).toBe(SuperDirective.prototype.ngOnInit);
    expect(finalDef.onDestroy).toBe(SuperDirective.prototype.ngOnDestroy);
    expect(finalDef.afterContentChecked).toBe(SuperDirective.prototype.ngAfterContentChecked);
    expect(finalDef.afterContentInit).toBe(SuperDirective.prototype.ngAfterContentInit);
    expect(finalDef.afterViewChecked).toBe(SubDirective.prototype.ngAfterViewChecked);
    expect(finalDef.afterViewInit).toBe(SubDirective.prototype.ngAfterViewInit);
    expect(finalDef.doCheck).toBe(SubDirective.prototype.ngDoCheck);
  });

  it('should inherit inputs', () => {
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

    const subDef = SubDirective.ngDirectiveDef as DirectiveDef<any>;

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

    const subDef = SubDirective.ngDirectiveDef as DirectiveDef<any>;

    expect(subDef.outputs).toEqual({
      foo: 'superFoo',
      bar: 'superBar',
      baz: 'subBaz',
      qux: 'subQux',
    });
  });

  it('should detect EMPTY inputs and outputs', () => {
    class SuperDirective {
      static ngDirectiveDef = defineDirective({
        inputs: {
          testIn: 'testIn',
        },
        outputs: {
          testOut: 'testOut',
        },
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        factory: () => new SuperDirective(),
      });
    }

    class SubDirective extends SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [InheritDefinitionFeature]
      });
    }

    const subDef = SubDirective.ngDirectiveDef as DirectiveDef<any>;

    expect(subDef.inputs).toEqual({
      testIn: 'testIn',
    });
    expect(subDef.outputs).toEqual({
      testOut: 'testOut',
    });
  });

  it('should inherit inputs from ngBaseDefs along the way', () => {

    class Class5 {
      input5 = 'data, so data';

      static ngBaseDef = defineBase({
        inputs: {
          input5: 'input5',
        },
      });
    }

    class Class4 extends Class5 {
      input4 = 'hehe';

      static ngDirectiveDef = defineDirective({
        inputs: {
          input4: 'input4',
        },
        type: Class4,
        selectors: [['', 'superDir', '']],
        factory: () => new Class4(),
        features: [InheritDefinitionFeature],
      });
    }

    class Class3 extends Class4 {}

    class Class2 extends Class3 {
      input3 = 'wee';

      static ngBaseDef = defineBase({
        inputs: {
          input3: ['alias3', 'input3'],
        }
      }) as any;
    }

    class Class1 extends Class2 {
      input1 = 'test';
      input2 = 'whatever';

      static ngDirectiveDef = defineDirective({
        type: Class1,
        inputs: {
          input1: 'input1',
          input2: 'input2',
        },
        selectors: [['', 'subDir', '']],
        factory: () => new Class1(),
        features: [InheritDefinitionFeature],
      });
    }

    const subDef = Class1.ngDirectiveDef as DirectiveDef<any>;

    expect(subDef.inputs).toEqual({
      input1: 'input1',
      input2: 'input2',
      alias3: 'input3',
      input4: 'input4',
      input5: 'input5',
    });
    expect(subDef.declaredInputs).toEqual({
      input1: 'input1',
      input2: 'input2',
      input3: 'input3',
      input4: 'input4',
      input5: 'input5',
    });
  });

  it('should inherit outputs from ngBaseDefs along the way', () => {

    class Class5 {
      output5 = 'data, so data';

      static ngBaseDef = defineBase({
        outputs: {
          output5: 'alias5',
        },
      });
    }

    class Class4 extends Class5 {
      output4 = 'hehe';

      static ngDirectiveDef = defineDirective({
        outputs: {
          output4: 'alias4',
        },
        type: Class4,
        selectors: [['', 'superDir', '']],
        factory: () => new Class4(),
        features: [InheritDefinitionFeature],
      });
    }

    class Class3 extends Class4 {}

    class Class2 extends Class3 {
      output3 = 'wee';

      static ngBaseDef = defineBase({
        outputs: {
          output3: 'alias3',
        }
      }) as any;
    }

    class Class1 extends Class2 {
      output1 = 'test';
      output2 = 'whatever';

      static ngDirectiveDef = defineDirective({
        type: Class1,
        outputs: {
          output1: 'alias1',
          output2: 'alias2',
        },
        selectors: [['', 'subDir', '']],
        factory: () => new Class1(),
        features: [InheritDefinitionFeature],
      });
    }

    const subDef = Class1.ngDirectiveDef as DirectiveDef<any>;

    expect(subDef.outputs).toEqual({
      alias1: 'output1',
      alias2: 'output2',
      alias3: 'output3',
      alias4: 'output4',
      alias5: 'output5',
    });
  });

  it('should compose hostBindings', () => {
    let subDir !: SubDirective;

    class SuperDirective {
      id = 'my-id';

      static ngDirectiveDef = defineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        hostBindings: (directiveIndex: number, elementIndex: number) => {
          const instance = load(directiveIndex) as SuperDirective;
          elementProperty(elementIndex, 'id', bind(instance.id));
        },
        hostVars: 1,
        factory: () => new SuperDirective(),
      });
    }

    class SubDirective extends SuperDirective {
      title = 'my-title';

      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        hostBindings: (directiveIndex: number, elementIndex: number) => {
          const instance = load(directiveIndex) as SubDirective;
          elementProperty(elementIndex, 'title', bind(instance.title));
        },
        hostVars: 1,
        factory: () => subDir = new SubDirective(),
        features: [InheritDefinitionFeature]
      });
    }


    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        element(0, 'div', ['subDir', '']);
      }
    }, 1, 0, [SubDirective]);

    const fixture = new ComponentFixture(App);
    const divEl = fixture.hostElement.querySelector('div') as HTMLElement;

    expect(divEl.id).toEqual('my-id');
    expect(divEl.title).toEqual('my-title');

    subDir.title = 'new-title';
    fixture.update();
    expect(divEl.id).toEqual('my-id');
    expect(divEl.title).toEqual('new-title');

    subDir.id = 'new-id';
    fixture.update();
    expect(divEl.id).toEqual('new-id');
    expect(divEl.title).toEqual('new-title');
  });

  it('should compose viewQuery', () => {
    const log: Array<[string, RenderFlags, any]> = [];

    class SuperComponent {
      static ngComponentDef = defineComponent({
        type: SuperComponent,
        template: () => {},
        consts: 0,
        vars: 0,
        selectors: [['', 'superDir', '']],
        viewQuery: <T>(rf: RenderFlags, ctx: T) => {
          log.push(['super', rf, ctx]);
        },
        factory: () => new SuperComponent(),
      });
    }

    class SubComponent extends SuperComponent {
      static ngComponentDef = defineComponent({
        type: SubComponent,
        template: () => {},
        consts: 0,
        vars: 0,
        selectors: [['', 'subDir', '']],
        viewQuery: (directiveIndex: number, elementIndex: number) => {
          log.push(['sub', directiveIndex, elementIndex]);
        },
        factory: () => new SubComponent(),
        features: [InheritDefinitionFeature]
      });
    }

    const subDef = SubComponent.ngComponentDef as ComponentDef<any>;

    const context = {foo: 'bar'};

    subDef.viewQuery !(1, context);

    expect(log).toEqual([['super', 1, context], ['sub', 1, context]]);
  });

  it('should compose contentQueries', () => {
    const log: string[] = [];

    class SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        contentQueries: () => { log.push('super'); },
        factory: () => new SuperDirective(),
      });
    }

    class SubDirective extends SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        contentQueries: () => { log.push('sub'); },
        factory: () => new SubDirective(),
        features: [InheritDefinitionFeature]
      });
    }

    const subDef = SubDirective.ngDirectiveDef as DirectiveDef<any>;

    subDef.contentQueries !(0);

    expect(log).toEqual(['super', 'sub']);
  });

  it('should compose contentQueriesRefresh', () => {
    const log: Array<[string, number, number]> = [];

    class SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        contentQueriesRefresh: (directiveIndex: number, queryIndex: number) => {
          log.push(['super', directiveIndex, queryIndex]);
        },
        factory: () => new SuperDirective(),
      });
    }

    class SubDirective extends SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        contentQueriesRefresh: (directiveIndex: number, queryIndex: number) => {
          log.push(['sub', directiveIndex, queryIndex]);
        },
        factory: () => new SubDirective(),
        features: [InheritDefinitionFeature]
      });
    }

    const subDef = SubDirective.ngDirectiveDef as DirectiveDef<any>;

    subDef.contentQueriesRefresh !(1, 2);

    expect(log).toEqual([['super', 1, 2], ['sub', 1, 2]]);
  });

  it('should throw if inheriting a component from a directive', () => {
    class SuperComponent {
      static ngComponentDef = defineComponent({
        type: SuperComponent,
        template: () => {},
        selectors: [['', 'superDir', '']],
        consts: 0,
        vars: 0,
        factory: () => new SuperComponent()
      });
    }

    expect(() => {
      class SubDirective extends SuperComponent{static ngDirectiveDef = defineDirective({
                                                  type: SubDirective,
                                                  selectors: [['', 'subDir', '']],
                                                  factory: () => new SubDirective(),
                                                  features: [InheritDefinitionFeature]
                                                });}
    }).toThrowError('Directives cannot inherit Components');
  });

  it('should inherit ngOnChanges', () => {
    const log: string[] = [];
    let subDir !: SubDirective;

    class SuperDirective {
      someInput = '';

      ngOnChanges() { log.push('on changes!'); }

      static ngDirectiveDef = defineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        factory: () => new SuperDirective(),
        features: [NgOnChangesFeature],
        inputs: {someInput: 'someInput'}
      });
    }

    class SubDirective extends SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        factory: () => subDir = new SubDirective(),
        features: [InheritDefinitionFeature],
      });
    }

    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        element(0, 'div', ['subDir', '']);
      }
    }, 1, 0, [SubDirective]);

    const fixture = new ComponentFixture(App);
    expect(log).toEqual(['on changes!']);
  });

  it('should NOT inherit providers', () => {
    let otherDir !: OtherDirective;

    const SOME_DIRS = new InjectionToken('someDirs');

    // providers: [{ provide: SOME_DIRS, useClass: SuperDirective, multi: true }]
    class SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        factory: () => new SuperDirective(),
        features: [ProvidersFeature([{provide: SOME_DIRS, useClass: SuperDirective, multi: true}])],
      });
    }

    // providers: [{ provide: SOME_DIRS, useClass: SubDirective, multi: true }]
    class SubDirective extends SuperDirective {
      static ngDirectiveDef = defineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [
          ProvidersFeature([{provide: SOME_DIRS, useClass: SubDirective, multi: true}]),
          InheritDefinitionFeature
        ],
      });
    }

    class OtherDirective {
      constructor(@Inject(SOME_DIRS) public dirs: any) {}

      static ngDirectiveDef = defineDirective({
        type: OtherDirective,
        selectors: [['', 'otherDir', '']],
        factory: () => otherDir = new OtherDirective(directiveInject(SOME_DIRS)),
      });
    }

    /** <div otherDir subDir></div> */
    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        element(0, 'div', ['otherDir', '', 'subDir', '']);
      }
    }, 1, 0, [OtherDirective, SubDirective, SuperDirective]);

    const fixture = new ComponentFixture(App);
    expect(otherDir.dirs.length).toEqual(1);
    expect(otherDir.dirs[0] instanceof SubDirective).toBe(true);
  });
});
