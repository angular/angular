/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, Inject, InjectionToken, QueryList, ɵAttributeMarker as AttributeMarker} from '../../src/core';
import {ΔallocHostVars, Δbind, ComponentDef, ΔcontentQuery, ΔdefineBase, ΔdefineComponent, ΔdefineDirective, DirectiveDef, ΔdirectiveInject, Δelement, ΔelementEnd, ΔelementProperty, ΔelementStart, ΔInheritDefinitionFeature, Δload, ΔloadContentQuery, ΔloadViewQuery, ΔNgOnChangesFeature, ΔProvidersFeature, ΔqueryRefresh, RenderFlags, ΔviewQuery,} from '../../src/render3/index';

import {ComponentFixture, createComponent, getDirectiveOnNode} from './render_util';

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

      static ngDirectiveDef = ΔdefineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [ΔInheritDefinitionFeature]
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
      static ngDirectiveDef = ΔdefineDirective({
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
      static ngDirectiveDef = ΔdefineDirective({
        type: SubDirective,
        inputs: {
          subBaz: 'baz',
          subQux: 'qux',
        },
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [ΔInheritDefinitionFeature]
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
      foo: 'declaredFoo',
      bar: 'bar',
      baz: 'baz',
      qux: 'qux',
    });
  });

  it('should inherit outputs', () => {
    class SuperDirective {
      static ngDirectiveDef = ΔdefineDirective({
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
      static ngDirectiveDef = ΔdefineDirective({
        type: SubDirective,
        outputs: {
          subBaz: 'baz',
          subQux: 'qux',
        },
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [ΔInheritDefinitionFeature]
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
      static ngDirectiveDef = ΔdefineDirective({
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
      static ngDirectiveDef = ΔdefineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [ΔInheritDefinitionFeature]
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

      static ngBaseDef = ΔdefineBase({
        inputs: {
          input5: 'input5',
        },
      });
    }

    class Class4 extends Class5 {
      input4 = 'hehe';

      static ngDirectiveDef = ΔdefineDirective({
        inputs: {
          input4: 'input4',
        },
        type: Class4,
        selectors: [['', 'superDir', '']],
        factory: () => new Class4(),
        features: [ΔInheritDefinitionFeature],
      });
    }

    class Class3 extends Class4 {}

    class Class2 extends Class3 {
      input3 = 'wee';

      static ngBaseDef = ΔdefineBase({
        inputs: {
          input3: ['alias3', 'input3'],
        }
      }) as any;
    }

    class Class1 extends Class2 {
      input1 = 'test';
      input2 = 'whatever';

      static ngDirectiveDef = ΔdefineDirective({
        type: Class1,
        inputs: {
          input1: 'input1',
          input2: 'input2',
        },
        selectors: [['', 'subDir', '']],
        factory: () => new Class1(),
        features: [ΔInheritDefinitionFeature],
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
      alias3: 'input3',
      input4: 'input4',
      input5: 'input5',
    });
  });

  it('should inherit outputs from ngBaseDefs along the way', () => {

    class Class5 {
      output5 = 'data, so data';

      static ngBaseDef = ΔdefineBase({
        outputs: {
          output5: 'alias5',
        },
      });
    }

    class Class4 extends Class5 {
      output4 = 'hehe';

      static ngDirectiveDef = ΔdefineDirective({
        outputs: {
          output4: 'alias4',
        },
        type: Class4,
        selectors: [['', 'superDir', '']],
        factory: () => new Class4(),
        features: [ΔInheritDefinitionFeature],
      });
    }

    class Class3 extends Class4 {}

    class Class2 extends Class3 {
      output3 = 'wee';

      static ngBaseDef = ΔdefineBase({
        outputs: {
          output3: 'alias3',
        }
      }) as any;
    }

    class Class1 extends Class2 {
      output1 = 'test';
      output2 = 'whatever';

      static ngDirectiveDef = ΔdefineDirective({
        type: Class1,
        outputs: {
          output1: 'alias1',
          output2: 'alias2',
        },
        selectors: [['', 'subDir', '']],
        factory: () => new Class1(),
        features: [ΔInheritDefinitionFeature],
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

      static ngDirectiveDef = ΔdefineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        hostBindings: (rf: RenderFlags, ctx: SuperDirective, elementIndex: number) => {
          if (rf & RenderFlags.Create) {
            ΔallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ΔelementProperty(elementIndex, 'id', Δbind(ctx.id));
          }
        },
        factory: () => new SuperDirective(),
      });
    }

    class SubDirective extends SuperDirective {
      title = 'my-title';

      static ngDirectiveDef = ΔdefineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        hostBindings: (rf: RenderFlags, ctx: SubDirective, elementIndex: number) => {
          if (rf & RenderFlags.Create) {
            ΔallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ΔelementProperty(elementIndex, 'title', Δbind(ctx.title));
          }
        },
        factory: () => subDir = new SubDirective(),
        features: [ΔInheritDefinitionFeature]
      });
    }


    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        Δelement(0, 'div', ['subDir', '']);
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

  describe('view query', () => {

    const SomeComp = createComponent('some-comp', (rf: RenderFlags, ctx: any) => {});

    /*
     * class SuperComponent {
     *  @ViewChildren('super') superQuery;
     * }
     */
    class SuperComponent {
      superQuery?: QueryList<any>;
      static ngComponentDef = ΔdefineComponent({
        type: SuperComponent,
        template: () => {},
        consts: 0,
        vars: 0,
        selectors: [['super-comp']],
        viewQuery: <T>(rf: RenderFlags, ctx: any) => {
          if (rf & RenderFlags.Create) {
            ΔviewQuery(['super'], false, null);
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            ΔqueryRefresh(tmp = ΔloadViewQuery<QueryList<any>>()) &&
                (ctx.superQuery = tmp as QueryList<any>);
          }
        },
        factory: () => new SuperComponent(),
      });
    }

    /**
     * <div id="sub" #sub></div>
     * <div id="super" #super></div>
     * <some-comp></some-comp>
     * class SubComponent extends SuperComponent {
     *  @ViewChildren('sub') subQuery;
     * }
     */
    class SubComponent extends SuperComponent {
      subQuery?: QueryList<any>;
      static ngComponentDef = ΔdefineComponent({
        type: SubComponent,
        template: (rf: RenderFlags, ctx: any) => {
          if (rf & RenderFlags.Create) {
            Δelement(0, 'div', ['id', 'sub'], ['sub', '']);
            Δelement(2, 'div', ['id', 'super'], ['super', '']);
            Δelement(4, 'some-comp');
          }
        },
        consts: 5,
        vars: 0,
        selectors: [['sub-comp']],
        viewQuery: (rf: RenderFlags, ctx: any) => {
          if (rf & RenderFlags.Create) {
            ΔviewQuery(['sub'], false, null);
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            ΔqueryRefresh(tmp = ΔloadViewQuery<QueryList<any>>()) &&
                (ctx.subQuery = tmp as QueryList<any>);
          }
        },
        factory: () => new SubComponent(),
        features: [ΔInheritDefinitionFeature],
        directives: [SomeComp]
      });
    }


    it('should compose viewQuery (basic mechanics check)', () => {
      const log: Array<[string, RenderFlags, any]> = [];

      class SuperComponent {
        static ngComponentDef = ΔdefineComponent({
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
        static ngComponentDef = ΔdefineComponent({
          type: SubComponent,
          template: () => {},
          consts: 0,
          vars: 0,
          selectors: [['', 'subDir', '']],
          viewQuery: (rf: RenderFlags, ctx: SubComponent) => {
            log.push(['sub', rf, ctx]);
          },
          factory: () => new SubComponent(),
          features: [ΔInheritDefinitionFeature]
        });
      }

      const subDef = SubComponent.ngComponentDef as ComponentDef<any>;

      const context = {foo: 'bar'};

      subDef.viewQuery !(RenderFlags.Create, context);

      expect(log).toEqual(
          [['super', RenderFlags.Create, context], ['sub', RenderFlags.Create, context]]);
    });



    it('should compose viewQuery (query logic check)', () => {
      const fixture = new ComponentFixture(SubComponent);

      const check = (key: string): void => {
        const qList = (fixture.component as any)[`${key}Query`] as QueryList<any>;
        expect(qList.length).toBe(1);
        expect(qList.first.nativeElement).toEqual(fixture.hostElement.querySelector(`#${key}`));
        expect(qList.first.nativeElement.id).toEqual(key);
      };

      check('sub');
      check('super');
    });

    it('should work with multiple viewQuery comps', () => {
      let subCompOne !: SubComponent;
      let subCompTwo !: SubComponent;

      const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
        if (rf & RenderFlags.Create) {
          Δelement(0, 'sub-comp');
          Δelement(1, 'sub-comp');
        }
        subCompOne = getDirectiveOnNode(0);
        subCompTwo = getDirectiveOnNode(1);
      }, 2, 0, [SubComponent, SuperComponent]);

      const fixture = new ComponentFixture(App);

      const check = (comp: SubComponent): void => {
        const qList = comp.subQuery as QueryList<any>;
        expect(qList.length).toBe(1);
        expect(qList.first.nativeElement).toEqual(fixture.hostElement.querySelector('#sub'));
        expect(qList.first.nativeElement.id).toEqual('sub');
      };

      check(subCompOne);
      check(subCompTwo);
    });

  });


  it('should compose contentQueries (basic mechanics check)', () => {
    const log: string[] = [];

    class SuperDirective {
      static ngDirectiveDef = ΔdefineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        contentQueries: () => { log.push('super'); },
        factory: () => new SuperDirective(),
      });
    }

    class SubDirective extends SuperDirective {
      static ngDirectiveDef = ΔdefineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        contentQueries: () => { log.push('sub'); },
        factory: () => new SubDirective(),
        features: [ΔInheritDefinitionFeature]
      });
    }

    const subDef = SubDirective.ngDirectiveDef as DirectiveDef<any>;

    subDef.contentQueries !(RenderFlags.Create, {}, 0);

    expect(log).toEqual(['super', 'sub']);
  });

  it('should compose contentQueries (verify query sets)', () => {
    let dirInstance: SubDirective;
    class SuperDirective {
      // @ContentChildren('foo')
      foos !: QueryList<ElementRef>;

      static ngDirectiveDef = ΔdefineDirective({
        type: SuperDirective,
        selectors: [['', 'super-dir', '']],
        factory: () => new SuperDirective(),
        contentQueries: (rf: RenderFlags, ctx: any, dirIndex: number) => {
          if (rf & RenderFlags.Create) {
            ΔcontentQuery(dirIndex, ['foo'], true, null);
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            ΔqueryRefresh(tmp = ΔloadContentQuery<ElementRef>()) && (ctx.foos = tmp);
          }
        }
      });
    }

    class SubDirective extends SuperDirective {
      // @ContentChildren('bar')
      bars !: QueryList<ElementRef>;

      static ngDirectiveDef = ΔdefineDirective({
        type: SubDirective,
        selectors: [['', 'sub-dir', '']],
        factory: () => dirInstance = new SubDirective(),
        contentQueries: (rf: RenderFlags, ctx: any, dirIndex: number) => {
          if (rf & RenderFlags.Create) {
            ΔcontentQuery(dirIndex, ['bar'], true, null);
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            ΔqueryRefresh(tmp = ΔloadContentQuery<ElementRef>()) && (ctx.bars = tmp);
          }
        },
        features: [ΔInheritDefinitionFeature]
      });
    }

    /**
     * <div sub-dir>
     *   <span #foo></span>
     *   <span #bar></span>
     * </div>
     */
    const AppComponent = createComponent('app-component', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'div', [AttributeMarker.Bindings, 'sub-dir']);
        {
          Δelement(1, 'span', null, ['foo', '']);
          Δelement(3, 'span', null, ['bar', '']);
        }
        ΔelementEnd();
      }
    }, 5, 0, [SubDirective]);

    const fixture = new ComponentFixture(AppComponent);
    expect(dirInstance !.foos.length).toBe(1);
    expect(dirInstance !.bars.length).toBe(1);
  });

  it('should throw if inheriting a component from a directive', () => {
    class SuperComponent {
      static ngComponentDef = ΔdefineComponent({
        type: SuperComponent,
        template: () => {},
        selectors: [['', 'superDir', '']],
        consts: 0,
        vars: 0,
        factory: () => new SuperComponent()
      });
    }

    expect(() => {
      class SubDirective extends SuperComponent{static ngDirectiveDef = ΔdefineDirective({
                                                  type: SubDirective,
                                                  selectors: [['', 'subDir', '']],
                                                  factory: () => new SubDirective(),
                                                  features: [ΔInheritDefinitionFeature]
                                                });}
    }).toThrowError('Directives cannot inherit Components');
  });

  it('should NOT inherit providers', () => {
    let otherDir !: OtherDirective;

    const SOME_DIRS = new InjectionToken('someDirs');

    // providers: [{ provide: SOME_DIRS, useClass: SuperDirective, multi: true }]
    class SuperDirective {
      static ngDirectiveDef = ΔdefineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        factory: () => new SuperDirective(),
        features:
            [ΔProvidersFeature([{provide: SOME_DIRS, useClass: SuperDirective, multi: true}])],
      });
    }

    // providers: [{ provide: SOME_DIRS, useClass: SubDirective, multi: true }]
    class SubDirective extends SuperDirective {
      static ngDirectiveDef = ΔdefineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        factory: () => new SubDirective(),
        features: [
          ΔProvidersFeature([{provide: SOME_DIRS, useClass: SubDirective, multi: true}]),
          ΔInheritDefinitionFeature
        ],
      });
    }

    class OtherDirective {
      constructor(@Inject(SOME_DIRS) public dirs: any) {}

      static ngDirectiveDef = ΔdefineDirective({
        type: OtherDirective,
        selectors: [['', 'otherDir', '']],
        factory: () => otherDir = new OtherDirective(ΔdirectiveInject(SOME_DIRS)),
      });
    }

    /** <div otherDir subDir></div> */
    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        Δelement(0, 'div', ['otherDir', '', 'subDir', '']);
      }
    }, 1, 0, [OtherDirective, SubDirective, SuperDirective]);

    const fixture = new ComponentFixture(App);
    expect(otherDir.dirs.length).toEqual(1);
    expect(otherDir.dirs[0] instanceof SubDirective).toBe(true);
  });
});
