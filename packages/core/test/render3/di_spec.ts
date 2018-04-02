/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, ElementRef, TemplateRef, ViewContainerRef} from '@angular/core';

import {defineComponent} from '../../src/render3/definition';
import {InjectFlags, bloomAdd, bloomFindPossibleInjector, getOrCreateNodeInjector, injectAttribute} from '../../src/render3/di';
import {NgOnChangesFeature, PublicFeature, defineDirective, directiveInject, injectChangeDetectorRef, injectElementRef, injectTemplateRef, injectViewContainerRef} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, createLNode, createLView, createTView, elementEnd, elementStart, embeddedViewEnd, embeddedViewStart, enterView, interpolation2, leaveView, load, projection, projectionDef, text, textBinding} from '../../src/render3/instructions';
import {LInjector} from '../../src/render3/interfaces/injector';
import {LNodeType} from '../../src/render3/interfaces/node';
import {LViewFlags} from '../../src/render3/interfaces/view';
import {ViewRef} from '../../src/render3/view_ref';

import {createComponent, createDirective, renderComponent, renderToHtml, toHtml} from './render_util';

describe('di', () => {
  describe('no dependencies', () => {
    it('should create directive with no deps', () => {
      class Directive {
        value: string = 'Created';
        static ngDirectiveDef = defineDirective({
          type: Directive,
          selectors: [['', 'dir', '']],
          factory: () => new Directive,
          exportAs: 'dir'
        });
      }

      /** <div dir #dir="dir"> {{ dir.value }}  </div> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['dir', ''], ['dir', 'dir']);
          { text(2); }
          elementEnd();
        }
        const tmp = load(1) as any;
        textBinding(2, bind(tmp.value));
      }

      expect(renderToHtml(Template, {}, [Directive])).toEqual('<div dir="">Created</div>');
    });
  });

  describe('view dependencies', () => {
    it('should create directive with inter view dependencies', () => {
      class DirectiveA {
        value: string = 'A';
        static ngDirectiveDef = defineDirective({
          type: DirectiveA,
          selectors: [['', 'dirA', '']],
          factory: () => new DirectiveA,
          features: [PublicFeature]
        });
      }

      class DirectiveB {
        value: string = 'B';
        static ngDirectiveDef = defineDirective({
          type: DirectiveB,
          selectors: [['', 'dirB', '']],
          factory: () => new DirectiveB,
          features: [PublicFeature]
        });
      }

      class DirectiveC {
        value: string;
        constructor(a: DirectiveA, b: DirectiveB) { this.value = a.value + b.value; }
        static ngDirectiveDef = defineDirective({
          type: DirectiveC,
          selectors: [['', 'dirC', '']],
          factory: () => new DirectiveC(directiveInject(DirectiveA), directiveInject(DirectiveB)),
          exportAs: 'dirC'
        });
      }

      /**
       * <div dirA>
       *  <span dirB dirC #dir="dirC"> {{ dir.value }} </span>
       * </div>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['dirA', '']);
          {
            elementStart(1, 'span', ['dirB', '', 'dirC', ''], ['dir', 'dirC']);
            { text(3); }
            elementEnd();
          }
          elementEnd();
        }
        const tmp = load(2) as any;
        textBinding(3, bind(tmp.value));
      }

      const defs = [DirectiveA, DirectiveB, DirectiveC];
      expect(renderToHtml(Template, {}, defs))
          .toEqual('<div dira=""><span dirb="" dirc="">AB</span></div>');
    });
  });

  describe('ElementRef', () => {
    it('should create directive with ElementRef dependencies', () => {
      class Directive {
        value: string;
        constructor(public elementRef: ElementRef) {
          this.value = (elementRef.constructor as any).name;
        }
        static ngDirectiveDef = defineDirective({
          type: Directive,
          selectors: [['', 'dir', '']],
          factory: () => new Directive(injectElementRef()),
          features: [PublicFeature],
          exportAs: 'dir'
        });
      }

      class DirectiveSameInstance {
        value: boolean;
        constructor(elementRef: ElementRef, directive: Directive) {
          this.value = elementRef === directive.elementRef;
        }
        static ngDirectiveDef = defineDirective({
          type: DirectiveSameInstance,
          selectors: [['', 'dirSame', '']],
          factory: () => new DirectiveSameInstance(injectElementRef(), directiveInject(Directive)),
          exportAs: 'dirSame'
        });
      }

      /**
       * <div dir dirSame #dirSame="dirSame" #dir="dir">
       *   {{ dir.value }} - {{ dirSame.value }}
       * </div>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['dir', '', 'dirSame', ''], ['dirSame', 'dirSame', 'dir', 'dir']);
          { text(3); }
          elementEnd();
        }

        const tmp1 = load(1) as any;
        const tmp2 = load(2) as any;
        textBinding(3, interpolation2('', tmp2.value, '-', tmp1.value, ''));
      }

      const defs = [Directive, DirectiveSameInstance];
      expect(renderToHtml(Template, {}, defs))
          .toEqual('<div dir="" dirsame="">ElementRef-true</div>');
    });
  });

  describe('TemplateRef', () => {
    it('should create directive with TemplateRef dependencies', () => {
      class Directive {
        value: string;
        constructor(public templateRef: TemplateRef<any>) {
          this.value = (templateRef.constructor as any).name;
        }
        static ngDirectiveDef = defineDirective({
          type: Directive,
          selectors: [['', 'dir', '']],
          factory: () => new Directive(injectTemplateRef()),
          features: [PublicFeature],
          exportAs: 'dir'
        });
      }

      class DirectiveSameInstance {
        value: boolean;
        constructor(templateRef: TemplateRef<any>, directive: Directive) {
          this.value = templateRef === directive.templateRef;
        }
        static ngDirectiveDef = defineDirective({
          type: DirectiveSameInstance,
          selectors: [['', 'dirSame', '']],
          factory: () => new DirectiveSameInstance(injectTemplateRef(), directiveInject(Directive)),
          exportAs: 'dirSame'
        });
      }

      /**
       * <ng-template dir dirSame #dir="dir" #dirSame="dirSame">
       *   {{ dir.value }} - {{ dirSame.value }}
       * </ng-template>
       */
      function Template(ctx: any, cm: any) {
        if (cm) {
          container(0, function() {
          }, undefined, ['dir', '', 'dirSame', ''], ['dir', 'dir', 'dirSame', 'dirSame']);
          text(3);
        }
        const tmp1 = load(1) as any;
        const tmp2 = load(2) as any;
        textBinding(3, interpolation2('', tmp1.value, '-', tmp2.value, ''));
      }

      const defs = [Directive, DirectiveSameInstance];
      expect(renderToHtml(Template, {}, defs)).toEqual('TemplateRef-true');
    });
  });

  describe('ViewContainerRef', () => {
    it('should create directive with ViewContainerRef dependencies', () => {
      class Directive {
        value: string;
        constructor(public viewContainerRef: ViewContainerRef) {
          this.value = (viewContainerRef.constructor as any).name;
        }
        static ngDirectiveDef = defineDirective({
          type: Directive,
          selectors: [['', 'dir', '']],
          factory: () => new Directive(injectViewContainerRef()),
          features: [PublicFeature],
          exportAs: 'dir'
        });
      }

      class DirectiveSameInstance {
        value: boolean;
        constructor(viewContainerRef: ViewContainerRef, directive: Directive) {
          this.value = viewContainerRef === directive.viewContainerRef;
        }
        static ngDirectiveDef = defineDirective({
          type: DirectiveSameInstance,
          selectors: [['', 'dirSame', '']],
          factory:
              () => new DirectiveSameInstance(injectViewContainerRef(), directiveInject(Directive)),
          exportAs: 'dirSame'
        });
      }

      /**
       * <div dir dirSame #dir="dir" #dirSame="dirSame">
       *   {{ dir.value }} - {{ dirSame.value }}
       * </div>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['dir', '', 'dirSame', ''], ['dir', 'dir', 'dirSame', 'dirSame']);
          { text(3); }
          elementEnd();
        }

        const tmp1 = load(1) as any;
        const tmp2 = load(2) as any;
        textBinding(3, interpolation2('', tmp1.value, '-', tmp2.value, ''));
      }

      const defs = [Directive, DirectiveSameInstance];
      expect(renderToHtml(Template, {}, defs))
          .toEqual('<div dir="" dirsame="">ViewContainerRef-true</div>');
    });
  });

  describe('ChangeDetectorRef', () => {
    let dir: Directive;
    let dirSameInstance: DirectiveSameInstance;
    let comp: MyComp;

    class MyComp {
      constructor(public cdr: ChangeDetectorRef) {}

      static ngComponentDef = defineComponent({
        type: MyComp,
        selectors: [['my-comp']],
        factory: () => comp = new MyComp(injectChangeDetectorRef()),
        template: function(ctx: MyComp, cm: boolean) {
          if (cm) {
            projectionDef(0);
            projection(1, 0);
          }
        }
      });
    }

    class Directive {
      value: string;
      constructor(public cdr: ChangeDetectorRef) { this.value = (cdr.constructor as any).name; }
      static ngDirectiveDef = defineDirective({
        type: Directive,
        selectors: [['', 'dir', '']],
        factory: () => dir = new Directive(injectChangeDetectorRef()),
        features: [PublicFeature],
        exportAs: 'dir'
      });
    }

    class DirectiveSameInstance {
      constructor(public cdr: ChangeDetectorRef) {}

      static ngDirectiveDef = defineDirective({
        type: DirectiveSameInstance,
        selectors: [['', 'dirSame', '']],
        factory: () => dirSameInstance = new DirectiveSameInstance(injectChangeDetectorRef())
      });
    }

    class IfDirective {
      /* @Input */
      myIf = true;

      constructor(public template: TemplateRef<any>, public vcr: ViewContainerRef) {}

      ngOnChanges() {
        if (this.myIf) {
          this.vcr.createEmbeddedView(this.template);
        }
      }

      static ngDirectiveDef = defineDirective({
        type: IfDirective,
        selectors: [['', 'myIf', '']],
        factory: () => new IfDirective(injectTemplateRef(), injectViewContainerRef()),
        inputs: {myIf: 'myIf'},
        features: [PublicFeature, NgOnChangesFeature()]
      });
    }


    const directives = [MyComp, Directive, DirectiveSameInstance, IfDirective];

    it('should inject current component ChangeDetectorRef into directives on components', () => {
      /** <my-comp dir dirSameInstance #dir="dir"></my-comp> {{ dir.value }} */
      const MyApp = createComponent('my-app', function(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'my-comp', ['dir', '', 'dirSame', ''], ['dir', 'dir']);
          elementEnd();
          text(2);
        }
        const tmp = load(1) as any;
        textBinding(2, bind(tmp.value));
      }, directives);

      const app = renderComponent(MyApp);
      // ChangeDetectorRef is the token, ViewRef has historically been the constructor
      expect(toHtml(app)).toEqual('<my-comp dir="" dirsame=""></my-comp>ViewRef');
      expect((comp !.cdr as ViewRef<MyComp>).context).toBe(comp);

      expect(dir !.cdr).toBe(comp !.cdr);
      expect(dir !.cdr).toBe(dirSameInstance !.cdr);
    });

    it('should inject host component ChangeDetectorRef into directives on elements', () => {

      class MyApp {
        constructor(public cdr: ChangeDetectorRef) {}

        static ngComponentDef = defineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: () => new MyApp(injectChangeDetectorRef()),
          /** <div dir dirSameInstance #dir="dir"> {{ dir.value }} </div> */
          template: function(ctx: any, cm: boolean) {
            if (cm) {
              elementStart(0, 'div', ['dir', '', 'dirSame', ''], ['dir', 'dir']);
              { text(2); }
              elementEnd();
            }
            const tmp = load(1) as any;
            textBinding(2, bind(tmp.value));
          },
          directives: directives
        });
      }

      const app = renderComponent(MyApp);
      expect(toHtml(app)).toEqual('<div dir="" dirsame="">ViewRef</div>');
      expect((app !.cdr as ViewRef<MyApp>).context).toBe(app);

      expect(dir !.cdr).toBe(app.cdr);
      expect(dir !.cdr).toBe(dirSameInstance !.cdr);
    });

    it('should inject host component ChangeDetectorRef into directives in ContentChildren', () => {
      class MyApp {
        constructor(public cdr: ChangeDetectorRef) {}

        static ngComponentDef = defineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: () => new MyApp(injectChangeDetectorRef()),
          /**
           * <my-comp>
           *   <div dir dirSameInstance #dir="dir"></div>
           * </my-comp>
           * {{ dir.value }}
           */
          template: function(ctx: any, cm: boolean) {
            if (cm) {
              elementStart(0, 'my-comp');
              {
                elementStart(1, 'div', ['dir', '', 'dirSame', ''], ['dir', 'dir']);
                elementEnd();
              }
              elementEnd();
              text(3);
            }
            const tmp = load(2) as any;
            textBinding(3, bind(tmp.value));
          },
          directives: directives
        });
      }

      const app = renderComponent(MyApp);
      expect(toHtml(app)).toEqual('<my-comp><div dir="" dirsame=""></div></my-comp>ViewRef');
      expect((app !.cdr as ViewRef<MyApp>).context).toBe(app);

      expect(dir !.cdr).toBe(app !.cdr);
      expect(dir !.cdr).toBe(dirSameInstance !.cdr);
    });

    it('should inject host component ChangeDetectorRef into directives in embedded views', () => {

      class MyApp {
        showing = true;

        constructor(public cdr: ChangeDetectorRef) {}

        static ngComponentDef = defineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: () => new MyApp(injectChangeDetectorRef()),
          /**
           * % if (showing) {
           *   <div dir dirSameInstance #dir="dir"> {{ dir.value }} </div>
           * % }
           */
          template: function(ctx: MyApp, cm: boolean) {
            if (cm) {
              container(0);
            }
            containerRefreshStart(0);
            {
              if (ctx.showing) {
                if (embeddedViewStart(0)) {
                  elementStart(0, 'div', ['dir', '', 'dirSame', ''], ['dir', 'dir']);
                  { text(2); }
                  elementEnd();
                }
                const tmp = load(1) as any;
                textBinding(2, bind(tmp.value));
              }
              embeddedViewEnd();
            }
            containerRefreshEnd();
          },
          directives: directives
        });
      }

      const app = renderComponent(MyApp);
      expect(toHtml(app)).toEqual('<div dir="" dirsame="">ViewRef</div>');
      expect((app !.cdr as ViewRef<MyApp>).context).toBe(app);

      expect(dir !.cdr).toBe(app.cdr);
      expect(dir !.cdr).toBe(dirSameInstance !.cdr);
    });

    it('should inject host component ChangeDetectorRef into directives on containers', () => {
      class MyApp {
        showing = true;

        constructor(public cdr: ChangeDetectorRef) {}

        static ngComponentDef = defineComponent({
          type: MyApp,
          selectors: [['my-app']],
          factory: () => new MyApp(injectChangeDetectorRef()),
          /** <div *myIf="showing" dir dirSameInstance #dir="dir"> {{ dir.value }} </div> */
          template: function(ctx: MyApp, cm: boolean) {
            if (cm) {
              container(0, C1, undefined, ['myIf', 'showing']);
            }
            containerRefreshStart(0);
            containerRefreshEnd();

            function C1(ctx1: any, cm1: boolean) {
              if (cm1) {
                elementStart(0, 'div', ['dir', '', 'dirSame', ''], ['dir', 'dir']);
                { text(2); }
                elementEnd();
              }
              const tmp = load(1) as any;
              textBinding(2, bind(tmp.value));
            }
          },
          directives: directives
        });
      }

      const app = renderComponent(MyApp);
      expect(toHtml(app)).toEqual('<div dir="" dirsame="">ViewRef</div>');
      expect((app !.cdr as ViewRef<MyApp>).context).toBe(app);

      expect(dir !.cdr).toBe(app.cdr);
      expect(dir !.cdr).toBe(dirSameInstance !.cdr);
    });

    it('should injectAttribute', () => {
      let exist: string|undefined = 'wrong';
      let nonExist: string|undefined = 'wrong';

      const MyApp = createComponent('my-app', function(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['exist', 'existValue', 'other', 'ignore']);
          exist = injectAttribute('exist');
          nonExist = injectAttribute('nonExist');
        }
      });

      const app = renderComponent(MyApp);
      expect(exist).toEqual('existValue');
      expect(nonExist).toEqual(undefined);
    });

  });

  describe('inject', () => {
    describe('bloom filter', () => {
      let di: LInjector;
      beforeEach(() => {
        di = {} as any;
        di.bf0 = 0;
        di.bf1 = 0;
        di.bf2 = 0;
        di.bf3 = 0;
        di.bf4 = 0;
        di.bf5 = 0;
        di.bf6 = 0;
        di.bf7 = 0;
        di.bf3 = 0;
        di.cbf0 = 0;
        di.cbf1 = 0;
        di.cbf2 = 0;
        di.cbf3 = 0;
        di.cbf4 = 0;
        di.cbf5 = 0;
        di.cbf6 = 0;
        di.cbf7 = 0;
      });

      function bloomState() {
        return [di.bf7, di.bf6, di.bf5, di.bf4, di.bf3, di.bf2, di.bf1, di.bf0];
      }

      it('should add values', () => {
        bloomAdd(di, { __NG_ELEMENT_ID__: 0 } as any);
        expect(bloomState()).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
        bloomAdd(di, { __NG_ELEMENT_ID__: 32 + 1 } as any);
        expect(bloomState()).toEqual([0, 0, 0, 0, 0, 0, 2, 1]);
        bloomAdd(di, { __NG_ELEMENT_ID__: 64 + 2 } as any);
        expect(bloomState()).toEqual([0, 0, 0, 0, 0, 4, 2, 1]);
        bloomAdd(di, { __NG_ELEMENT_ID__: 96 + 3 } as any);
        expect(bloomState()).toEqual([0, 0, 0, 0, 8, 4, 2, 1]);
        bloomAdd(di, { __NG_ELEMENT_ID__: 128 + 4 } as any);
        expect(bloomState()).toEqual([0, 0, 0, 16, 8, 4, 2, 1]);
        bloomAdd(di, { __NG_ELEMENT_ID__: 160 + 5 } as any);
        expect(bloomState()).toEqual([0, 0, 32, 16, 8, 4, 2, 1]);
        bloomAdd(di, { __NG_ELEMENT_ID__: 192 + 6 } as any);
        expect(bloomState()).toEqual([0, 64, 32, 16, 8, 4, 2, 1]);
        bloomAdd(di, { __NG_ELEMENT_ID__: 224 + 7 } as any);
        expect(bloomState()).toEqual([128, 64, 32, 16, 8, 4, 2, 1]);
      });

      it('should query values', () => {
        bloomAdd(di, { __NG_ELEMENT_ID__: 0 } as any);
        bloomAdd(di, { __NG_ELEMENT_ID__: 32 } as any);
        bloomAdd(di, { __NG_ELEMENT_ID__: 64 } as any);
        bloomAdd(di, { __NG_ELEMENT_ID__: 96 } as any);
        bloomAdd(di, { __NG_ELEMENT_ID__: 127 } as any);
        bloomAdd(di, { __NG_ELEMENT_ID__: 161 } as any);
        bloomAdd(di, { __NG_ELEMENT_ID__: 188 } as any);
        bloomAdd(di, { __NG_ELEMENT_ID__: 223 } as any);
        bloomAdd(di, { __NG_ELEMENT_ID__: 255 } as any);

        expect(bloomFindPossibleInjector(di, 0)).toEqual(di);
        expect(bloomFindPossibleInjector(di, 1)).toEqual(null);
        expect(bloomFindPossibleInjector(di, 32)).toEqual(di);
        expect(bloomFindPossibleInjector(di, 64)).toEqual(di);
        expect(bloomFindPossibleInjector(di, 96)).toEqual(di);
        expect(bloomFindPossibleInjector(di, 127)).toEqual(di);
        expect(bloomFindPossibleInjector(di, 161)).toEqual(di);
        expect(bloomFindPossibleInjector(di, 188)).toEqual(di);
        expect(bloomFindPossibleInjector(di, 223)).toEqual(di);
        expect(bloomFindPossibleInjector(di, 255)).toEqual(di);
      });
    });

    describe('flags', () => {
      it('should return defaultValue not found', () => {
        class MyApp {
          constructor(public value: string) {}

          static ngComponentDef = defineComponent({
            type: MyApp,
            selectors: [['my-app']],
            factory: () => new MyApp(
                         directiveInject(String as any, InjectFlags.Default, 'DefaultValue')),
            template: () => null
          });
        }
        const myApp = renderComponent(MyApp);
        expect(myApp.value).toEqual('DefaultValue');
      });
    });

    it('should inject from parent view', () => {
      const ParentDirective = createDirective('parentDir');

      class ChildDirective {
        value: string;
        constructor(public parent: any) { this.value = (parent.constructor as any).name; }
        static ngDirectiveDef = defineDirective({
          type: ChildDirective,
          selectors: [['', 'childDir', '']],
          factory: () => new ChildDirective(directiveInject(ParentDirective)),
          features: [PublicFeature],
          exportAs: 'childDir'
        });
      }

      class Child2Directive {
        value: boolean;
        constructor(parent: any, child: ChildDirective) { this.value = parent === child.parent; }
        static ngDirectiveDef = defineDirective({
          selectors: [['', 'child2Dir', '']],
          type: Child2Directive,
          factory: () => new Child2Directive(
                       directiveInject(ParentDirective), directiveInject(ChildDirective)),
          exportAs: 'child2Dir'
        });
      }

      /**
       * <div parentDir>
       *    <span childDir child2Dir #child1="childDir" #child2="child2Dir">
       *      {{ child1.value }} - {{ child2.value }}
       *    </span>
       * </div>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['parentDir', '']);
          { container(1); }
          elementEnd();
        }
        containerRefreshStart(1);
        {
          if (embeddedViewStart(0)) {
            elementStart(
                0, 'span', ['childDir', '', 'child2Dir', ''],
                ['child1', 'childDir', 'child2', 'child2Dir']);
            { text(3); }
            elementEnd();
          }
          const tmp1 = load(1) as any;
          const tmp2 = load(2) as any;
          textBinding(3, interpolation2('', tmp1.value, '-', tmp2.value, ''));
          embeddedViewEnd();
        }
        containerRefreshEnd();
      }

      const defs = [ChildDirective, Child2Directive, ParentDirective];
      expect(renderToHtml(Template, {}, defs))
          .toEqual('<div parentdir=""><span child2dir="" childdir="">Directive-true</span></div>');
    });

    it('should inject from module Injector', () => {

                                             });
  });

  describe('getOrCreateNodeInjector', () => {
    it('should handle initial undefined state', () => {
      const contentView =
          createLView(-1, null !, createTView(null, null), null, null, LViewFlags.CheckAlways);
      const oldView = enterView(contentView, null !);
      try {
        const parent = createLNode(0, LNodeType.Element, null, null);

        // Simulate the situation where the previous parent is not initialized.
        // This happens on first bootstrap because we don't init existing values
        // so that we have smaller HelloWorld.
        (parent as{parent: any}).parent = undefined;

        const injector = getOrCreateNodeInjector();
        expect(injector).not.toBe(null);
      } finally {
        leaveView(oldView);
      }
    });
  });

});
