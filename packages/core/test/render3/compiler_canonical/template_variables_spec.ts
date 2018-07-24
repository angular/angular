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
describe('template variables', () => {
  type $any$ = any;
  type $number$ = number;
  type $RenderFlags$ = $r3$.ɵRenderFlags;

  interface ForOfContext {
    $implicit: any;
    index: number;
    even: boolean;
    odd: boolean;
  }

  @Directive({selector: '[forOf]'})
  class ForOfDirective {
    // TODO(issue/24571): remove '!'.
    private previous !: any[];

    constructor(private view: ViewContainerRef, private template: TemplateRef<any>) {}

    // TODO(issue/24571): remove '!'.
    @Input() forOf !: any[];

    ngOnChanges(simpleChanges: SimpleChanges) {
      if ('forOf' in simpleChanges) {
        this.update();
      }
    }

    ngDoCheck(): void {
      const previous = this.previous;
      const current = this.forOf;
      if (!previous || previous.length != current.length ||
          previous.some((value: any, index: number) => current[index] !== previous[index])) {
        this.update();
      }
    }

    private update() {
      // TODO(chuckj): Not implemented yet
      // this.view.clear();
      if (this.forOf) {
        const current = this.forOf;
        for (let i = 0; i < current.length; i++) {
          const context = {$implicit: current[i], index: i, even: i % 2 == 0, odd: i % 2 == 1};
          // TODO(chuckj): Not implemented yet
          // this.view.createEmbeddedView(this.template, context);
        }
        this.previous = [...this.forOf];
      }
    }

    // NORMATIVE
    static ngDirectiveDef = $r3$.ɵdefineDirective({
      type: ForOfDirective,
      selectors: [['', 'forOf', '']],
      factory: function ForOfDirective_Factory() {
        return new ForOfDirective($r3$.ɵinjectViewContainerRef(), $r3$.ɵinjectTemplateRef());
      },
      // TODO(chuckj): Enable when ngForOf enabling lands.
      // features: [NgOnChangesFeature],
      inputs: {forOf: 'forOf'}
    });
    // /NORMATIVE
  }

  it('should support a let variable and reference', () => {
    type $MyComponent$ = MyComponent;

    interface Item {
      name: string;
    }

    @Component({
      selector: 'my-component',
      template: `<ul><li *for="let item of items">{{item.name}}</li></ul>`
    })
    class MyComponent {
      items = [{name: 'one'}, {name: 'two'}];

      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyComponent,
        selectors: [['my-component']],
        factory: function MyComponent_Factory() { return new MyComponent(); },
        template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
          if (rf & 1) {
            $r3$.ɵE(0, 'ul');
            $r3$.ɵC(1, MyComponent_ForOfDirective_Template_1, '', ['forOf', '']);
            $r3$.ɵe();
          }
          if (rf & 2) {
            $r3$.ɵp(1, 'forOf', $r3$.ɵb(ctx.items));
            $r3$.ɵcR(1);
            $r3$.ɵcr();
          }

          function MyComponent_ForOfDirective_Template_1(rf: $RenderFlags$, ctx1: $any$) {
            if (rf & 1) {
              $r3$.ɵE(0, 'li');
              $r3$.ɵT(1);
              $r3$.ɵe();
            }
            let $l0_item$: any;
            if (rf & 2) {
              $l0_item$ = ctx1.$implicit;
              $r3$.ɵt(1, $r3$.ɵi1('', $l0_item$.name, ''));
            }
          }
        }
      });
      // /NORMATIVE
    }

    // NON-NORMATIVE
    (MyComponent.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
        [ForOfDirective.ngDirectiveDef];
    // /NON-NORMATIVE

    // TODO(chuckj): update when the changes to enable ngForOf lands.
    expect(toHtml(renderComponent(MyComponent))).toEqual('<ul></ul>');
  });

  it('should support accessing parent template variables', () => {
    type $MyComponent$ = MyComponent;

    interface Info {
      description: string;
    }
    interface Item {
      name: string;
      infos: Info[];
    }

    @Component({
      selector: 'my-component',
      template: `
        <ul>
          <li *for="let item of items">
            <div>{{item.name}}</div>
            <ul>
              <li *for="let info of item.infos">
                {{item.name}}: {{info.description}}
              </li>
            </ul>
          </li>
        </ul>`
    })
    class MyComponent {
      items: Item[] = [
        {name: 'one', infos: [{description: '11'}, {description: '12'}]},
        {name: 'two', infos: [{description: '21'}, {description: '22'}]}
      ];

      // NORMATIVE
      static ngComponentDef = $r3$.ɵdefineComponent({
        type: MyComponent,
        selectors: [['my-component']],
        factory: function MyComponent_Factory() { return new MyComponent(); },
        template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
          if (rf & 1) {
            $r3$.ɵE(0, 'ul');
            $r3$.ɵC(1, MyComponent_ForOfDirective_Template_1, '', ['forOf', '']);
            $r3$.ɵe();
          }
          if (rf & 2) {
            $r3$.ɵp(1, 'forOf', $r3$.ɵb(ctx.items));
            $r3$.ɵcR(1);
            $r3$.ɵcr();
          }

          function MyComponent_ForOfDirective_Template_1(rf1: $RenderFlags$, ctx1: $any$) {
            if (rf & 1) {
              $r3$.ɵE(0, 'li');
              $r3$.ɵE(1, 'div');
              $r3$.ɵT(2);
              $r3$.ɵe();
              $r3$.ɵE(3, 'ul');
              $r3$.ɵC(4, MyComponent_ForOfDirective_ForOfDirective_Template_3, '', ['forOf', '']);
              $r3$.ɵe();
              $r3$.ɵe();
            }
            let $l0_item$: any;
            if (rf & 2) {
              $l0_item$ = ctx1.$implicit;
              $r3$.ɵp(4, 'forOf', $r3$.ɵb($l0_item$.infos));
              $r3$.ɵt(2, $r3$.ɵi1('', $l0_item$.name, ''));
              $r3$.ɵcR(4);
              $r3$.ɵcr();
            }

            function MyComponent_ForOfDirective_ForOfDirective_Template_3(
                rf2: $number$, ctx2: $any$) {
              if (rf & 1) {
                $r3$.ɵE(0, 'li');
                $r3$.ɵT(1);
                $r3$.ɵe();
              }
              let $l0_info$: any;
              if (rf & 2) {
                $l0_info$ = ctx2.$implicit;
                $r3$.ɵt(1, $r3$.ɵi2(' ', $l0_item$.name, ': ', $l0_info$.description, ' '));
              }
            }
          }
        }
      });
      // /NORMATIVE
    }
  });
});
