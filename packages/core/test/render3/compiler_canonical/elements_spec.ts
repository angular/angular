/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, HostBinding, HostListener, Injectable, Input, NgModule, OnDestroy, Optional, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {ComponentDef} from '../../../src/render3/interfaces/definition';
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
        template: function(rf: $RenderFlags$, ctx: $MyComponent$) {
          if (rf & 1) {
            $r3$.ɵE(0, 'div', $e0_attrs$);
            $r3$.ɵT(1, 'Hello ');
            $r3$.ɵE(2, 'b');
            $r3$.ɵT(3, 'World');
            $r3$.ɵe();
            $r3$.ɵT(4, '!');
            $r3$.ɵe();
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
        template: function LocalRefComp_Template(rf: $RenderFlags$, ctx: $LocalRefComp$) {
          let $tmp$: any;
          let $tmp_2$: any;
          if (rf & 1) {
            $r3$.ɵE(0, 'div', $e0_attrs$, $e0_locals$);
            $r3$.ɵe();
            $r3$.ɵT(3);
          }
          if (rf & 2) {
            $tmp$ = $r3$.ɵld(1);
            $tmp_2$ = $r3$.ɵld(2);
            $r3$.ɵt(3, $r3$.ɵi2(' ', $tmp$.value, ' - ', $tmp_2$.tagName, ''));
          }
        }
      });
      // /NORMATIVE
    }

    // NON-NORMATIVE
    (LocalRefComp.ngComponentDef as ComponentDef<any>).directiveDefs = () => [Dir.ngDirectiveDef];
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
        template: function ListenerComp_Template(rf: $RenderFlags$, ctx: $ListenerComp$) {
          if (rf & 1) {
            $r3$.ɵE(0, 'button');
            $r3$.ɵL('click', function ListenerComp_click_Handler() { return ctx.onClick(); });
            $r3$.ɵL('keypress', function ListenerComp_keypress_Handler($event: $any$) {
              ctx.onPress($event);
              return ctx.onPress2($event);
            });
            $r3$.ɵT(1, 'Click');
            $r3$.ɵe();
          }
        }
      });
      // /NORMATIVE
    }

    const listenerComp = renderComponent(ListenerComp);
    expect(toHtml(listenerComp)).toEqual('<button>Click</button>');
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
          template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
            if (rf & 1) {
              $r3$.ɵE(0, 'div');
              $r3$.ɵe();
            }
            if (rf & 2) {
              $r3$.ɵp(0, 'id', $r3$.ɵb(ctx.someProperty));
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
          template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
            if (rf & 1) {
              $r3$.ɵE(0, 'div');
              $r3$.ɵe();
            }
            if (rf & 2) {
              $r3$.ɵa(0, 'title', $r3$.ɵb(ctx.someAttribute));
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
      type $MyComponent$ = MyComponent;

      @Component({selector: 'my-component', template: `<div [class.foo]="someFlag"></div>`})
      class MyComponent {
        someFlag: boolean = false;
        // NORMATIVE
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors: [['my-component']],
          factory: function MyComponent_Factory() { return new MyComponent(); },
          template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
            if (rf & 1) {
              $r3$.ɵE(0, 'div');
              $r3$.ɵe();
            }
            if (rf & 2) {
              $r3$.ɵkn(0, 'foo', $r3$.ɵb(ctx.someFlag));
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
          template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
            if (rf & 1) {
              $r3$.ɵE(0, 'div');
              $r3$.ɵe();
            }
            if (rf & 2) {
              $r3$.ɵsn(0, 'color', $r3$.ɵb(ctx.someColor));
              $r3$.ɵsn(0, 'width', $r3$.ɵb(ctx.someWidth), 'px');
            }
          }
        });
        // /NORMATIVE
      }

      const comp = renderComponent(MyComponent);
      if (browserDetection.isIE) {
        expect(toHtml(comp)).toEqual('<div style="width: 50px; color: red;"></div>');
      } else {
        expect(toHtml(comp)).toEqual('<div style="color: red; width: 50px;"></div>');
      }

      comp.someColor = 'blue';
      comp.someWidth = 100;
      $r3$.ɵdetectChanges(comp);
      if (browserDetection.isIE) {
        expect(toHtml(comp)).toEqual('<div style="width: 100px; color: blue;"></div>');
      } else {
        expect(toHtml(comp)).toEqual('<div style="color: blue; width: 100px;"></div>');
      }
    });

    it('should bind to many and keep order', () => {
      type $MyComponent$ = MyComponent;

      // NORMATIVE
      const $e0_attrs$ = ['style', 'color: red;'];
      // /NORMATIVE

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
          template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
            if (rf & 1) {
              $r3$.ɵE(0, 'div', $e0_attrs$);
              $r3$.ɵe();
            }
            if (rf & 2) {
              $r3$.ɵp(0, 'id', $r3$.ɵb(ctx.someString + 1));
              $r3$.ɵkn(0, 'foo', $r3$.ɵb(ctx.someString == 'initial'));
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
          template: function StyleComponent_Template(rf: $RenderFlags$, ctx: $StyleComponent$) {
            if (rf & 1) {
              $r3$.ɵE(0, 'div');
              $r3$.ɵe();
            }
            if (rf & 2) {
              $r3$.ɵk(0, $r3$.ɵb(ctx.classExp));
              $r3$.ɵs(0, $r3$.ɵb(ctx.styleExp));
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
