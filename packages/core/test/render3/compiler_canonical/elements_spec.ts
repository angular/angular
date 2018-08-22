/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {AttributeMarker} from '../../../src/render3';
import {ComponentDefInternal, InitialStylingFlags} from '../../../src/render3/interfaces/definition';
import {ComponentFixture, renderComponent, toHtml} from '../render_util';


/// See: `normative.md`
describe('elements', () => {
  // Saving type as $any$, etc to simplify testing for compiler, as types aren't saved
  type $any$ = any;
  type $RenderFlags$ = $r3$.ɵRenderFlags;

  it('should translate DOM structure', () => {
    type $MyComponent$ = MyComponent;

    // Important: keep arrays outside of function to not create new instances.
    const $e0_attrs$ = ['class', 'my-app', 'title', 'Hello'];

    @Component({
      selector: 'my-component',
      template: `<div class="my-app" title="Hello">Hello <b>World</b>!</div>`
    })
    class MyComponent {
      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyComponent,
        selectors: [['my-component']],
        factory: () => new MyComponent(),
        consts: 5,
        vars: 0,
        template: function(rf: $RenderFlags$, ctx: $MyComponent$) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'div', $e0_attrs$);
            $r3$.ɵtext(1, 'Hello ');
            $r3$.ɵelementStart(2, 'b');
            $r3$.ɵtext(3, 'World');
            $r3$.ɵelementEnd();
            $r3$.ɵtext(4, '!');
            $r3$.ɵelementEnd();
          }
        }
      });
      // /NORMATIVE
    }

    expect(toHtml(renderComponent(MyComponent)))
        .toEqual('<div class="my-app" title="Hello">Hello <b>World</b>!</div>');
  });

  it('should support local refs', () => {
    type $LocalRefComp$ = LocalRefComp;

    class Dir {
      value = 'one';

      static ngDirectiveDef = $r3$.ɵdefineDirective({
        type: Dir,
        selectors: [['', 'dir', '']],
        factory: function DirA_Factory() { return new Dir(); },
        exportAs: 'dir'
      });
    }

    // NORMATIVE
    const $e0_attrs$ = ['dir', ''];
    const $e0_locals$ = ['dir', 'dir', 'foo', ''];
    // /NORMATIVE

    @Component({
      selector: 'local-ref-comp',
      template: `
        <div dir #dir="dir" #foo></div>
        {{ dir.value }} - {{ foo.tagName }}
      `
    })
    class LocalRefComp {
      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: LocalRefComp,
        selectors: [['local-ref-comp']],
        factory: function LocalRefComp_Factory() { return new LocalRefComp(); },
        consts: 4,
        vars: 2,
        template: function LocalRefComp_Template(rf: $RenderFlags$, ctx: $LocalRefComp$) {
          if (rf & 1) {
            $r3$.ɵelement(0, 'div', $e0_attrs$, $e0_locals$);
            $r3$.ɵtext(3);
          }
          if (rf & 2) {
            const $tmp$ = $r3$.ɵreference(1) as any;
            const $tmp_2$ = $r3$.ɵreference(2) as any;
            $r3$.ɵtextBinding(
                3, $r3$.ɵinterpolation2(' ', $tmp$.value, ' - ', $tmp_2$.tagName, ''));
          }
        }
      });
      // /NORMATIVE
    }

    // NON-NORMATIVE
    (LocalRefComp.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
        () => [Dir.ngDirectiveDef];
    // /NON-NORMATIVE

    const fixture = new ComponentFixture(LocalRefComp);
    expect(fixture.html).toEqual(`<div dir=""></div> one - DIV`);
  });

  it('should support listeners', () => {
    type $ListenerComp$ = ListenerComp;

    @Component({
      selector: 'listener-comp',
      template:
          `<button (click)="onClick()" (keypress)="onPress($event); onPress2($event)">Click</button>`
    })
    class ListenerComp {
      onClick() {}
      onPress(e: Event) {}
      onPress2(e: Event) {}

      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: ListenerComp,
        selectors: [['listener-comp']],
        factory: function ListenerComp_Factory() { return new ListenerComp(); },
        consts: 2,
        vars: 0,
        template: function ListenerComp_Template(rf: $RenderFlags$, ctx: $ListenerComp$) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'button');
            $r3$.ɵlistener(
                'click', function ListenerComp_click_Handler() { return ctx.onClick(); });
            $r3$.ɵlistener('keypress', function ListenerComp_keypress_Handler($event: $any$) {
              ctx.onPress($event);
              return ctx.onPress2($event);
            });
            $r3$.ɵtext(1, 'Click');
            $r3$.ɵelementEnd();
          }
        }
      });
      // /NORMATIVE
    }

    const listenerComp = renderComponent(ListenerComp);
    expect(toHtml(listenerComp)).toEqual('<button>Click</button>');
  });

  it('should support namespaced attributes', () => {
    type $MyComponent$ = MyComponent;

    // Important: keep arrays outside of function to not create new instances.
    const $e0_attrs$ = [
      // class="my-app"
      'class',
      'my-app',
      // foo:bar="baz"
      AttributeMarker.NamespaceURI,
      'http://someuri/foo',
      'foo:bar',
      'baz',
      // title="Hello"
      'title',
      'Hello',
      // foo:qux="quacks"
      AttributeMarker.NamespaceURI,
      'http://someuri/foo',
      'foo:qux',
      'quacks',
    ];

    @Component({
      selector: 'my-component',
      template:
          `<div xmlns:foo="http://someuri/foo" class="my-app" foo:bar="baz" title="Hello" foo:qux="quacks">Hello <b>World</b>!</div>`
    })
    class MyComponent {
      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyComponent,
        selectors: [['my-component']],
        factory: () => new MyComponent(),
        consts: 5,
        vars: 0,
        template: function(rf: $RenderFlags$, ctx: $MyComponent$) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'div', $e0_attrs$);
            $r3$.ɵtext(1, 'Hello ');
            $r3$.ɵelementStart(2, 'b');
            $r3$.ɵtext(3, 'World');
            $r3$.ɵelementEnd();
            $r3$.ɵtext(4, '!');
            $r3$.ɵelementEnd();
          }
        }
      });
      // /NORMATIVE
    }

    expect(toHtml(renderComponent(MyComponent)))
        .toEqual(
            '<div class="my-app" foo:bar="baz" foo:qux="quacks" title="Hello">Hello <b>World</b>!</div>');
  });

  describe('bindings', () => {
    it('should bind to property', () => {
      type $MyComponent$ = MyComponent;

      @Component({selector: 'my-component', template: `<div [id]="someProperty"></div>`})
      class MyComponent {
        someProperty: string = 'initial';
        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [['my-component']],
          factory: function MyComponent_Factory() { return new MyComponent(); },
          consts: 1,
          vars: 1,
          template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
            if (rf & 1) {
              $r3$.ɵelement(0, 'div');
            }
            if (rf & 2) {
              $r3$.ɵelementProperty(0, 'id', $r3$.ɵbind(ctx.someProperty));
            }
          }
        });
        // /NORMATIVE
      }

      const comp = renderComponent(MyComponent);
      expect(toHtml(comp)).toEqual('<div id="initial"></div>');

      comp.someProperty = 'changed';
      $r3$.ɵdetectChanges(comp);
      expect(toHtml(comp)).toEqual('<div id="changed"></div>');
    });

    it('should bind to attribute', () => {
      type $MyComponent$ = MyComponent;

      @Component({selector: 'my-component', template: `<div [attr.title]="someAttribute"></div>`})
      class MyComponent {
        someAttribute: string = 'initial';
        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [['my-component']],
          factory: function MyComponent_Factory() { return new MyComponent(); },
          consts: 1,
          vars: 1,
          template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
            if (rf & 1) {
              $r3$.ɵelement(0, 'div');
            }
            if (rf & 2) {
              $r3$.ɵelementAttribute(0, 'title', $r3$.ɵbind(ctx.someAttribute));
            }
          }
        });
        // /NORMATIVE
      }

      const comp = renderComponent(MyComponent);
      expect(toHtml(comp)).toEqual('<div title="initial"></div>');

      comp.someAttribute = 'changed';
      $r3$.ɵdetectChanges(comp);
      expect(toHtml(comp)).toEqual('<div title="changed"></div>');
    });

    it('should bind to a specific class', () => {
      const c1: (string | InitialStylingFlags | boolean)[] = ['foo'];
      type $MyComponent$ = MyComponent;

      @Component({selector: 'my-component', template: `<div [class.foo]="someFlag"></div>`})
      class MyComponent {
        someFlag: boolean = false;
        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [['my-component']],
          factory: function MyComponent_Factory() { return new MyComponent(); },
          consts: 1,
          vars: 0,
          template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, 'div');
              $r3$.ɵelementStyling(c1);
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵelementClassProp(0, 0, ctx.someFlag);
              $r3$.ɵelementStylingApply(0);
            }
          }
        });
        // /NORMATIVE
      }

      const comp = renderComponent(MyComponent);
      expect(toHtml(comp)).toEqual('<div></div>');

      comp.someFlag = true;
      $r3$.ɵdetectChanges(comp);
      expect(toHtml(comp)).toEqual('<div class="foo"></div>');
    });

    it('should bind to a specific style', () => {
      type $MyComponent$ = MyComponent;

      const c0 = ['color', 'width'];
      @Component({
        selector: 'my-component',
        template: `<div [style.color]="someColor" [style.width.px]="someWidth"></div>`
      })
      class MyComponent {
        someColor: string = 'red';
        someWidth: number = 50;
        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [['my-component']],
          factory: function MyComponent_Factory() { return new MyComponent(); },
          consts: 1,
          vars: 0,
          template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, 'div');
              $r3$.ɵelementStyling(null, c0);
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵelementStylingProp(0, 0, ctx.someColor);
              $r3$.ɵelementStylingProp(0, 1, ctx.someWidth, 'px');
              $r3$.ɵelementStylingApply(0);
            }
          }
        });
        // /NORMATIVE
      }

      const comp = renderComponent(MyComponent);
      expect(toHtml(comp)).toEqual('<div style="color: red; width: 50px;"></div>');

      comp.someColor = 'blue';
      comp.someWidth = 100;
      $r3$.ɵdetectChanges(comp);
      expect(toHtml(comp)).toEqual('<div style="color: blue; width: 100px;"></div>');
    });

    it('should bind to many and keep order', () => {
      type $MyComponent$ = MyComponent;

      const c0 = ['foo'];
      const c1 = ['color', InitialStylingFlags.VALUES_MODE, 'color', 'red'];

      @Component({
        selector: 'my-component',
        template:
            `<div [id]="someString+1" [class.foo]="someString=='initial'" [attr.style]="'color: red;'"></div>`
      })
      class MyComponent {
        someString: string = 'initial';
        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [['my-component']],
          factory: function MyComponent_Factory() { return new MyComponent(); },
          consts: 1,
          vars: 1,
          template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, 'div');
              $r3$.ɵelementStyling(c0, c1);
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵelementProperty(0, 'id', $r3$.ɵbind(ctx.someString + 1));
              $r3$.ɵelementClassProp(0, 0, ctx.someString == 'initial');
              $r3$.ɵelementStylingApply(0);
            }
          }
        });
        // /NORMATIVE
      }

      const comp = renderComponent(MyComponent);
      expect(toHtml(comp)).toEqual('<div class="foo" id="initial1" style="color: red;"></div>');

      comp.someString = 'changed';
      $r3$.ɵdetectChanges(comp);
      expect(toHtml(comp)).toEqual('<div class="" id="changed1" style="color: red;"></div>');
    });

    it('should bind [class] and [style] to the element', () => {
      type $StyleComponent$ = StyleComponent;

      @Component(
          {selector: 'style-comp', template: `<div [class]="classExp" [style]="styleExp"></div>`})
      class StyleComponent {
        classExp: string[]|string = 'some-name';
        styleExp: {[name: string]: string} = {'background-color': 'red'};

        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: StyleComponent,
          selectors: [['style-comp']],
          factory: function StyleComponent_Factory() { return new StyleComponent(); },
          consts: 1,
          vars: 0,
          template: function StyleComponent_Template(rf: $RenderFlags$, ctx: $StyleComponent$) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, 'div');
              $r3$.ɵelementStyling();
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵelementStylingMap(0, ctx.classExp, ctx.styleExp);
              $r3$.ɵelementStylingApply(0);
            }
          }
        });
        // /NORMATIVE
      }

      const styleFixture = new ComponentFixture(StyleComponent);
      expect(styleFixture.html)
          .toEqual(`<div class="some-name" style="background-color: red;"></div>`);
    });
  });
});
