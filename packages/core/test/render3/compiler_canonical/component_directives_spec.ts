/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, HostBinding, HostListener, Injectable, Input, NgModule, OnDestroy, Optional, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {ComponentDefInternal} from '../../../src/render3/interfaces/definition';
import {renderComponent, toHtml} from '../render_util';



/// See: `normative.md`
describe('components & directives', () => {
  type $RenderFlags$ = $r3$.ɵRenderFlags;
  type $any$ = any;
  type $number$ = number;

  it('should instantiate directives', () => {
    type $ChildComponent$ = ChildComponent;
    type $MyComponent$ = MyComponent;

    const log: string[] = [];
    @Component({selector: 'child', template: 'child-view'})
    class ChildComponent {
      constructor() { log.push('ChildComponent'); }
      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: ChildComponent,
        selectors: [['child']],
        factory: function ChildComponent_Factory() { return new ChildComponent(); },
        consts: 1,
        vars: 0,
        template: function ChildComponent_Template(rf: $RenderFlags$, ctx: $ChildComponent$) {
          if (rf & 1) {
            $r3$.ɵtext(0, 'child-view');
          }
        }
      });
      // /NORMATIVE
    }

    @Directive({
      selector: '[some-directive]',
    })
    class SomeDirective {
      constructor() { log.push('SomeDirective'); }
      // NORMATIVE
      static ngDirectiveDef = $r3$.ɵdefineDirective({
        type: SomeDirective,
        selectors: [['', 'some-directive', '']],
        factory: () => new SomeDirective(),
      });
      // /NORMATIVE
    }

    // Important: keep arrays outside of function to not create new instances.
    // NORMATIVE
    const $e0_attrs$ = ['some-directive', ''];
    // /NORMATIVE

    @Component({selector: 'my-component', template: `<child some-directive></child>!`})
    class MyComponent {
      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyComponent,
        selectors: [['my-component']],
        factory: () => new MyComponent(),
        consts: 2,
        vars: 0,
        template: function(rf: $RenderFlags$, ctx: $MyComponent$) {
          if (rf & 1) {
            $r3$.ɵelement(0, 'child', $e0_attrs$);
            $r3$.ɵtext(1, '!');
          }
        }
      });
      // /NORMATIVE
    }

    // NON-NORMATIVE (done by defineNgModule)
    (MyComponent.ngComponentDef as ComponentDefInternal<any>).directiveDefs = [
      (ChildComponent.ngComponentDef as ComponentDefInternal<any>), SomeDirective.ngDirectiveDef
    ];
    // /NON-NORMATIVE

    expect(renderComp(MyComponent)).toEqual('<child some-directive="">child-view</child>!');
    expect(log).toEqual(['ChildComponent', 'SomeDirective']);
  });

  it('should support host bindings', () => {
    type $MyApp$ = MyApp;

    @Directive({selector: '[hostBindingDir]'})
    class HostBindingDir {
      @HostBinding('id') dirId = 'some id';

      // NORMATIVE
      static ngDirectiveDef = $r3$.ɵdefineDirective({
        type: HostBindingDir,
        selectors: [['', 'hostBindingDir', '']],
        factory: function HostBindingDir_Factory() { return new HostBindingDir(); },
        hostVars: 1,
        hostBindings: function HostBindingDir_HostBindings(dirIndex: $number$, elIndex: $number$) {
          $r3$.ɵelementProperty(
              elIndex, 'id', $r3$.ɵbind($r3$.ɵloadDirective<HostBindingDir>(dirIndex).dirId));
        }
      });
      // /NORMATIVE
    }

    const $e0_attrs$ = ['hostBindingDir', ''];

    @Component({
      selector: 'my-app',
      template: `
        <div hostBindingDir></div>
      `
    })
    class MyApp {
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: function MyApp_Factory() { return new MyApp(); },
        consts: 1,
        vars: 0,
        template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵelement(0, 'div', $e0_attrs$);
          }
        }
      });
    }

    // NON-NORMATIVE (done by defineNgModule)
    (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
        [HostBindingDir.ngDirectiveDef];
    // /NON-NORMATIVE

    expect(renderComp(MyApp)).toEqual(`<div hostbindingdir="" id="some id"></div>`);
  });

  it('should support host listeners', () => {
    type $MyApp$ = MyApp;

    @Directive({selector: '[hostlistenerDir]'})
    class HostListenerDir {
      @HostListener('click')
      onClick() {}

      // NORMATIVE
      static ngDirectiveDef = $r3$.ɵdefineDirective({
        selectors: [['', 'hostListenerDir', '']],
        type: HostListenerDir,
        factory: function HostListenerDir_Factory() {
          const $dir$ = new HostListenerDir();
          $r3$.ɵlistener(
              'click', function HostListenerDir_click_Handler(event: any) { $dir$.onClick(); });
          return $dir$;
        },
      });
      // /NORMATIVE
    }

    const $e0_attrs$ = ['hostListenerDir', ''];

    @Component({
      selector: 'my-app',
      template: `
        <button hostListenerDir>Click</button>
      `
    })
    class MyApp {
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: function MyApp_Factory() { return new MyApp(); },
        consts: 2,
        vars: 0,
        template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'button', $e0_attrs$);
            $r3$.ɵtext(1, 'Click');
            $r3$.ɵelementEnd();
          }
        }
      });
    }

    // NON-NORMATIVE (done by defineNgModule)
    (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
        [HostListenerDir.ngDirectiveDef];
    // /NON-NORMATIVE

    expect(renderComp(MyApp)).toEqual(`<button hostlistenerdir="">Click</button>`);
  });


  it('should support setting of host attributes', () => {
    type $MyApp$ = MyApp;

    @Directive({selector: '[hostAttributeDir]', host: {'role': 'listbox'}})
    class HostAttributeDir {
      // NORMATIVE
      static ngDirectiveDef = $r3$.ɵdefineDirective({
        selectors: [['', 'hostAttributeDir', '']],
        type: HostAttributeDir,
        factory: function HostAttributeDir_Factory() { return new HostAttributeDir(); },
        attributes: ['role', 'listbox']
      });
      // /NORMATIVE
    }

    const $e0_attrs$ = ['hostAttributeDir', ''];

    @Component({
      selector: 'my-app',
      template: `
        <div hostAttributeDir></div>
      `
    })
    class MyApp {
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: function MyApp_Factory() { return new MyApp(); },
        consts: 1,
        vars: 0,
        template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵelement(0, 'div', $e0_attrs$);
          }
        }
      });
    }

    // NON-NORMATIVE (done by defineNgModule)
    (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
        [HostAttributeDir.ngDirectiveDef];
    // /NON-NORMATIVE

    expect(renderComp(MyApp)).toEqual(`<div hostattributedir="" role="listbox"></div>`);
  });

  it('should support bindings of host attributes', () => {
    type $MyApp$ = MyApp;

    @Directive({selector: '[hostBindingDir]'})
    class HostBindingDir {
      @HostBinding('attr.aria-label') label = 'some label';

      // NORMATIVE
      static ngDirectiveDef = $r3$.ɵdefineDirective({
        type: HostBindingDir,
        selectors: [['', 'hostBindingDir', '']],
        factory: function HostBindingDir_Factory() { return new HostBindingDir(); },
        hostVars: 1,
        hostBindings: function HostBindingDir_HostBindings(dirIndex: $number$, elIndex: $number$) {
          $r3$.ɵelementAttribute(
              elIndex, 'aria-label',
              $r3$.ɵbind($r3$.ɵloadDirective<HostBindingDir>(dirIndex).label));
        }
      });
      // /NORMATIVE
    }

    const $e0_attrs$ = ['hostBindingDir', ''];

    @Component({
      selector: 'my-app',
      template: `
        <div hostBindingDir></div>
      `
    })
    class MyApp {
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: function MyApp_Factory() { return new MyApp(); },
        consts: 1,
        vars: 0,
        template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵelement(0, 'div', $e0_attrs$);
          }
        }
      });
    }

    // NON-NORMATIVE (done by defineNgModule)
    (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
        [HostBindingDir.ngDirectiveDef];
    // /NON-NORMATIVE

    expect(renderComp(MyApp)).toEqual(`<div aria-label="some label" hostbindingdir=""></div>`);
  });

  it('should support onPush components', () => {
    type $MyApp$ = MyApp;
    type $MyComp$ = MyComp;

    @Component({
      selector: 'my-comp',
      template: `
        {{ name }}
      `,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class MyComp {
      // TODO(issue/24571): remove '!'.
      @Input() name !: string;

      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyComp,
        selectors: [['my-comp']],
        factory: function MyComp_Factory() { return new MyComp(); },
        consts: 1,
        vars: 1,
        template: function MyComp_Template(rf: $RenderFlags$, ctx: $MyComp$) {
          if (rf & 1) {
            $r3$.ɵtext(0);
          }
          if (rf & 2) {
            $r3$.ɵtextBinding(0, $r3$.ɵbind(ctx.name));
          }
        },
        inputs: {name: 'name'},
        changeDetection: ChangeDetectionStrategy.OnPush
      });
      // /NORMATIVE
    }

    @Component({
      selector: 'my-app',
      template: `
        <my-comp [name]="name"></my-comp>
      `
    })
    class MyApp {
      name = 'some name';

      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyApp,
        selectors: [['my-app']],
        factory: function MyApp_Factory() { return new MyApp(); },
        consts: 1,
        vars: 1,
        template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
          if (rf & 1) {
            $r3$.ɵelement(0, 'my-comp');
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(0, 'name', $r3$.ɵbind(ctx.name));
          }
        }
      });
    }

    // NON-NORMATIVE (done by defineNgModule)
    (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
        [(MyComp.ngComponentDef as ComponentDefInternal<any>)];
    // /NON-NORMATIVE

    expect(renderComp(MyApp)).toEqual(`<my-comp>some name</my-comp>`);
  });

  xit('should support structural directives', () => {
    type $MyComponent$ = MyComponent;

    function C1(rf1: $RenderFlags$, ctx1: $any$) {
      if (rf1 & 1) {
        $r3$.ɵelementStart(0, 'li');
        $r3$.ɵtext(1);
        $r3$.ɵelementEnd();
      }
      if (rf1 & 2) {
        const $comp$ = $r3$.ɵnextContext();
        const $foo$ = $r3$.ɵreference(1);
        $r3$.ɵtextBinding(1, $r3$.ɵinterpolation2('', $comp$.salutation, ' ', $foo$, ''));
      }
    }

    const log: string[] = [];
    @Directive({
      selector: '[if]',
    })
    class IfDirective {
      constructor(template: TemplateRef<any>) { log.push('ifDirective'); }
      // NORMATIVE
      static ngDirectiveDef = $r3$.ɵdefineDirective({
        type: IfDirective,
        selectors: [['', 'if', '']],
        factory: () => new IfDirective($r3$.ɵdirectiveInject(TemplateRef as any)),
      });
      // /NORMATIVE
    }

    // Important: keep arrays outside of function to not create new instances.
    // NORMATIVE
    const $e0_locals$ = ['foo', ''];
    // /NORMATIVE

    @Component(
        {selector: 'my-component', template: `<ul #foo><li *if>{{salutation}} {{foo}}</li></ul>`})
    class MyComponent {
      salutation = 'Hello';
      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyComponent,
        selectors: [['my-component']],
        factory: () => new MyComponent(),
        consts: 3,
        vars: 0,
        template: function(rf: $RenderFlags$, ctx: $MyComponent$) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'ul', null, $e0_locals$);
            $r3$.ɵtemplate(2, C1, 2, 1, '', ['if', '']);
            $r3$.ɵelementEnd();
          }
        }
      });
      // /NORMATIVE
    }

    expect(renderComp(MyComponent)).toEqual('<child some-directive="">child-view</child>!');
    expect(log).toEqual(['ChildComponent', 'SomeDirective']);
  });

  describe('value composition', () => {
    type $MyArrayComp$ = MyArrayComp;

    @Component({
      selector: 'my-array-comp',
      template: `
          {{ names[0] }} {{ names[1] }}
      `
    })
    class MyArrayComp {
      // TODO(issue/24571): remove '!'.
      @Input() names !: string[];

      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyArrayComp,
        selectors: [['my-array-comp']],
        factory: function MyArrayComp_Factory() { return new MyArrayComp(); },
        consts: 1,
        vars: 2,
        template: function MyArrayComp_Template(rf: $RenderFlags$, ctx: $MyArrayComp$) {
          if (rf & 1) {
            $r3$.ɵtext(0);
          }
          if (rf & 2) {
            $r3$.ɵtextBinding(0, $r3$.ɵinterpolation2('', ctx.names[0], ' ', ctx.names[1], ''));
          }
        },
        inputs: {names: 'names'}
      });
    }

    it('should support array literals of constants', () => {
      type $MyApp$ = MyApp;

      // NORMATIVE
      const $e0_arr$ = ['Nancy', 'Bess'];
      // /NORMATIVE

      @Component({
        selector: 'my-app',
        template: `
        <my-array-comp [names]="['Nancy', 'Bess']"></my-array-comp>
      `
      })
      class MyApp {
        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: function MyApp_Factory() { return new MyApp(); },
          consts: 1,
          vars: 0,
          template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
            if (rf & 1) {
              $r3$.ɵelement(0, 'my-array-comp');
            }
            if (rf & 2) {
              $r3$.ɵelementProperty(0, 'names', rf & 1 ? $e0_arr$ : $r3$.ɵNO_CHANGE);
            }
          }
        });
        // /NORMATIVE
      }

      // NON-NORMATIVE (done by defineNgModule)
      (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
          [(MyArrayComp.ngComponentDef as ComponentDefInternal<any>)];
      // /NON-NORMATIVE

      expect(renderComp(MyApp)).toEqual(`<my-array-comp>Nancy Bess</my-array-comp>`);
    });

    it('should support array literals of constants inside function calls', () => {
      type $MyApp$ = MyApp;

      // NORMATIVE
      const $e0_ff$ = () => ['Nancy', 'Bess'];
      // /NORMATIVE

      @Component({
        selector: 'my-app',
        template: `
          <my-array-comp [names]="someFn(['Nancy', 'Bess'])"></my-array-comp>
        `
      })
      class MyApp {
        someFn(arr: string[]): string[] {
          arr[0] = arr[0].toUpperCase();
          return arr;
        }

        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: function MyApp_Factory() { return new MyApp(); },
          consts: 1,
          vars: 2,
          template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
            if (rf & 1) {
              $r3$.ɵelement(0, 'my-array-comp');
            }
            if (rf & 2) {
              $r3$.ɵelementProperty(
                  0, 'names', $r3$.ɵbind(ctx.someFn($r3$.ɵpureFunction0(1, $e0_ff$))));
            }
          }
        });
        // /NORMATIVE
      }

      // NON-NORMATIVE (done by defineNgModule)
      (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
          [(MyArrayComp.ngComponentDef as ComponentDefInternal<any>)];
      // /NON-NORMATIVE

      expect(renderComp(MyApp)).toEqual(`<my-array-comp>NANCY Bess</my-array-comp>`);
    });

    it('should support array literals of constants inside expressions', () => {
      type $MyApp$ = MyApp;
      type $MyComp$ = MyComp;

      @Component({selector: 'my-comp', template: `{{ num }}`})
      class MyComp {
        // TODO(issue/24571): remove '!'.
        num !: number;

        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComp,
          selectors: [['my-comp']],
          factory: function MyComp_Factory() { return new MyComp(); },
          consts: 1,
          vars: 1,
          template: function MyComp_Template(rf: $RenderFlags$, ctx: $MyComp$) {
            if (rf & 1) {
              $r3$.ɵtext(0);
            }
            if (rf & 2) {
              // clang-format wants to break this line by changing the second 'ɵ' to an invalid
              // unicode sequence.
              // clang-format off
              $r3$.ɵtextBinding(0, $r3$.ɵbind(ctx.num));
              // clang-format on
            }
          },
          inputs: {num: 'num'}
        });
      }

      // NORMATIVE
      const $e0_ff$ = () => ['Nancy', 'Bess'];
      // /NORMATIVE

      @Component({
        selector: 'my-app',
        template: `
          <my-comp [num]="['Nancy', 'Bess'].length + 1"></my-comp>
        `
      })
      class MyApp {
        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: function MyApp_Factory() { return new MyApp(); },
          consts: 1,
          vars: 2,
          template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
            if (rf & 1) {
              $r3$.ɵelement(0, 'my-comp');
            }
            if (rf & 2) {
              $r3$.ɵelementProperty(
                  0, 'num', $r3$.ɵbind($r3$.ɵpureFunction0(1, $e0_ff$).length + 1));
            }
          }
        });
        // /NORMATIVE
      }

      // NON-NORMATIVE (done by defineNgModule)
      (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
          [(MyComp.ngComponentDef as ComponentDefInternal<any>)];
      // /NON-NORMATIVE

      expect(renderComp(MyApp)).toEqual(`<my-comp>3</my-comp>`);
    });


    it('should support array literals', () => {
      type $MyApp$ = MyApp;

      // NORMATIVE
      const $e0_ff$ = (v: any) => ['Nancy', v];
      // /NORMATIVE

      @Component({
        selector: 'my-app',
        template: `
        <my-array-comp [names]="['Nancy', customName]"></my-array-comp>
      `
      })
      class MyApp {
        customName = 'Bess';

        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: function MyApp_Factory() { return new MyApp(); },
          consts: 1,
          vars: 3,
          template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
            if (rf & 1) {
              $r3$.ɵelement(0, 'my-array-comp');
            }
            if (rf & 2) {
              $r3$.ɵelementProperty(
                  0, 'names', $r3$.ɵbind($r3$.ɵpureFunction1(1, $e0_ff$, ctx.customName)));
            }
          }
        });
        // /NORMATIVE
      }

      // NON-NORMATIVE (done by defineNgModule)
      (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
          [(MyArrayComp.ngComponentDef as ComponentDefInternal<any>)];
      // /NON-NORMATIVE

      expect(renderComp(MyApp)).toEqual(`<my-array-comp>Nancy Bess</my-array-comp>`);
    });

    it('should support 9+ bindings in array literals', () => {
      type $MyComp$ = MyComp;

      @Component({
        selector: 'my-comp',
        template: `
          {{ names[0] }}
          {{ names[1] }}
          {{ names[3] }}
          {{ names[4] }}
          {{ names[5] }}
          {{ names[6] }}
          {{ names[7] }}
          {{ names[8] }}
          {{ names[9] }}
          {{ names[10] }}
          {{ names[11] }}
        `
      })
      class MyComp {
        // TODO(issue/24571): remove '!'.
        @Input() names !: string[];

        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComp,
          selectors: [['my-comp']],
          factory: function MyComp_Factory() { return new MyComp(); },
          consts: 12,
          vars: 12,
          template: function MyComp_Template(rf: $RenderFlags$, ctx: $MyComp$) {
            if (rf & 1) {
              $r3$.ɵtext(0);
              $r3$.ɵtext(1);
              $r3$.ɵtext(2);
              $r3$.ɵtext(3);
              $r3$.ɵtext(4);
              $r3$.ɵtext(5);
              $r3$.ɵtext(6);
              $r3$.ɵtext(7);
              $r3$.ɵtext(8);
              $r3$.ɵtext(9);
              $r3$.ɵtext(10);
              $r3$.ɵtext(11);
            }
            if (rf & 2) {
              $r3$.ɵtextBinding(0, $r3$.ɵbind(ctx.names[0]));
              $r3$.ɵtextBinding(1, $r3$.ɵbind(ctx.names[1]));
              $r3$.ɵtextBinding(2, $r3$.ɵbind(ctx.names[2]));
              $r3$.ɵtextBinding(3, $r3$.ɵbind(ctx.names[3]));
              $r3$.ɵtextBinding(4, $r3$.ɵbind(ctx.names[4]));
              $r3$.ɵtextBinding(5, $r3$.ɵbind(ctx.names[5]));
              $r3$.ɵtextBinding(6, $r3$.ɵbind(ctx.names[6]));
              $r3$.ɵtextBinding(7, $r3$.ɵbind(ctx.names[7]));
              $r3$.ɵtextBinding(8, $r3$.ɵbind(ctx.names[8]));
              $r3$.ɵtextBinding(9, $r3$.ɵbind(ctx.names[9]));
              $r3$.ɵtextBinding(10, $r3$.ɵbind(ctx.names[10]));
              $r3$.ɵtextBinding(11, $r3$.ɵbind(ctx.names[11]));
            }
          },
          inputs: {names: 'names'}
        });
      }

      // NORMATIVE
      const $e0_ff$ =
          (v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any,
           v8: any) => ['start-', v0, v1, v2, v3, v4, '-middle-', v5, v6, v7, v8, '-end'];
      // /NORMATIVE

      @Component({
        selector: 'my-app',
        template: `
        <my-comp [names]="['start-', n0, n1, n2, n3, n4, '-middle-', n5, n6, n7, n8, '-end']">
        </my-comp>
      `
      })
      class MyApp {
        n0 = 'a';
        n1 = 'b';
        n2 = 'c';
        n3 = 'd';
        n4 = 'e';
        n5 = 'f';
        n6 = 'g';
        n7 = 'h';
        n8 = 'i';

        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: function MyApp_Factory() { return new MyApp(); },
          consts: 1,
          vars: 10,
          template: function MyApp_Template(rf: $RenderFlags$, c: $any$) {
            if (rf & 1) {
              $r3$.ɵelement(0, 'my-comp');
            }
            if (rf & 2) {
              $r3$.ɵelementProperty(
                  0, 'names',
                  $r3$.ɵbind($r3$.ɵpureFunctionV(
                      1, $e0_ff$, [c.n0, c.n1, c.n2, c.n3, c.n4, c.n5, c.n6, c.n7, c.n8])));
            }
          }
        });
        // /NORMATIVE
      }

      // NON-NORMATIVE (done by defineNgModule)
      (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
          [(MyComp.ngComponentDef as ComponentDefInternal<any>)];
      // /NON-NORMATIVE

      expect(renderComp(MyApp)).toEqual(`<my-comp>start-abcde-middle-fghi-end</my-comp>`);
    });

    it('should support object literals', () => {
      type $ObjectComp$ = ObjectComp;
      type $MyApp$ = MyApp;

      @Component({
        selector: 'object-comp',
        template: `
          <p> {{ config['duration'] }} </p>
          <p> {{ config.animation }} </p>
        `
      })
      class ObjectComp {
        // TODO(issue/24571): remove '!'.
        config !: {[key: string]: any};

        static ngComponentDef = $r3$.ɵdefineComponent({
          type: ObjectComp,
          selectors: [['object-comp']],
          factory: function ObjectComp_Factory() { return new ObjectComp(); },
          consts: 4,
          vars: 2,
          template: function ObjectComp_Template(rf: $RenderFlags$, ctx: $ObjectComp$) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, 'p');
              $r3$.ɵtext(1);
              $r3$.ɵelementEnd();
              $r3$.ɵelementStart(2, 'p');
              $r3$.ɵtext(3);
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵtextBinding(1, $r3$.ɵbind(ctx.config['duration']));
              $r3$.ɵtextBinding(3, $r3$.ɵbind(ctx.config.animation));
            }
          },
          inputs: {config: 'config'}
        });
      }

      // NORMATIVE
      const $e0_ff$ = (v: any) => { return {'duration': 500, animation: v}; };
      // /NORMATIVE

      @Component({
        selector: 'my-app',
        template: `
        <object-comp [config]="{'duration': 500, animation: name}"></object-comp>
      `
      })
      class MyApp {
        name = 'slide';

        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: function MyApp_Factory() { return new MyApp(); },
          consts: 1,
          vars: 3,
          template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
            if (rf & 1) {
              $r3$.ɵelement(0, 'object-comp');
            }
            if (rf & 2) {
              $r3$.ɵelementProperty(
                  0, 'config', $r3$.ɵbind($r3$.ɵpureFunction1(1, $e0_ff$, ctx.name)));
            }
          }
        });
        // /NORMATIVE
      }

      // NON-NORMATIVE (done by defineNgModule)
      (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
          [(ObjectComp.ngComponentDef as ComponentDefInternal<any>)];
      // /NON-NORMATIVE

      expect(renderComp(MyApp)).toEqual(`<object-comp><p>500</p><p>slide</p></object-comp>`);
    });

    it('should support expressions nested deeply in object/array literals', () => {
      type $NestedComp$ = NestedComp;
      type $MyApp$ = MyApp;

      @Component({
        selector: 'nested-comp',
        template: `
          <p> {{ config.animation }} </p>
          <p> {{config.actions[0].opacity }} </p>
          <p> {{config.actions[1].duration }} </p>
        `
      })
      class NestedComp {
        // TODO(issue/24571): remove '!'.
        config !: {[key: string]: any};

        static ngComponentDef = $r3$.ɵdefineComponent({
          type: NestedComp,
          selectors: [['nested-comp']],
          factory: function NestedComp_Factory() { return new NestedComp(); },
          consts: 6,
          vars: 3,
          template: function NestedComp_Template(rf: $RenderFlags$, ctx: $NestedComp$) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, 'p');
              $r3$.ɵtext(1);
              $r3$.ɵelementEnd();
              $r3$.ɵelementStart(2, 'p');
              $r3$.ɵtext(3);
              $r3$.ɵelementEnd();
              $r3$.ɵelementStart(4, 'p');
              $r3$.ɵtext(5);
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵtextBinding(1, $r3$.ɵbind(ctx.config.animation));
              $r3$.ɵtextBinding(3, $r3$.ɵbind(ctx.config.actions[0].opacity));
              $r3$.ɵtextBinding(5, $r3$.ɵbind(ctx.config.actions[1].duration));
            }
          },
          inputs: {config: 'config'}
        });
      }

      // NORMATIVE
      const $e0_ff$ = (v: any) => { return {opacity: 1, duration: v}; };
      const $c0$ = {opacity: 0, duration: 0};
      const $e0_ff_1$ = (v: any) => [$c0$, v];
      const $e0_ff_2$ = (v1: any, v2: any) => { return {animation: v1, actions: v2}; };
      // /NORMATIVE

      @Component({
        selector: 'my-app',
        template: `
        <nested-comp [config]="{animation: name, actions: [{ opacity: 0, duration: 0}, {opacity: 1, duration: duration }]}">
        </nested-comp>
      `
      })
      class MyApp {
        name = 'slide';
        duration = 100;

        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: function MyApp_Factory() { return new MyApp(); },
          consts: 1,
          vars: 8,
          template: function MyApp_Template(rf: $RenderFlags$, ctx: $MyApp$) {
            if (rf & 1) {
              $r3$.ɵelement(0, 'nested-comp');
            }
            if (rf & 2) {
              $r3$.ɵelementProperty(
                  0, 'config',
                  $r3$.ɵbind($r3$.ɵpureFunction2(
                      5, $e0_ff_2$, ctx.name,
                      $r3$.ɵpureFunction1(
                          3, $e0_ff_1$, $r3$.ɵpureFunction1(1, $e0_ff$, ctx.duration)))));
            }
          }
        });
        // /NORMATIVE
      }

      // NON-NORMATIVE (done by defineNgModule)
      (MyApp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
          [(NestedComp.ngComponentDef as ComponentDefInternal<any>)];
      // /NON-NORMATIVE

      expect(renderComp(MyApp))
          .toEqual(`<nested-comp><p>slide</p><p>0</p><p>100</p></nested-comp>`);
    });

  });

});

function renderComp<T>(type: $r3$.ɵComponentType<T>): string {
  return toHtml(renderComponent(type));
}
