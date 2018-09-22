/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Input, SimpleChanges, TemplateRef, ViewContainerRef, inject} from '../../../src/core';
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
        return new ForOfDirective(
            $r3$.ɵdirectiveInject(ViewContainerRef as any),
            $r3$.ɵdirectiveInject(TemplateRef as any));
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

    function MyComponent_ForOfDirective_Template_1(rf: $RenderFlags$, ctx1: $any$) {
      if (rf & 1) {
        $r3$.ɵelementStart(0, 'li');
        $r3$.ɵtext(1);
        $r3$.ɵelementEnd();
      }
      if (rf & 2) {
        const $l0_item$ = ctx1.$implicit;
        $r3$.ɵtextBinding(1, $r3$.ɵinterpolation1('', $l0_item$.name, ''));
      }
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
        consts: 2,
        vars: 1,
        template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'ul');
            $r3$.ɵtemplate(1, MyComponent_ForOfDirective_Template_1, 2, 1, '', ['forOf', '']);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(1, 'forOf', $r3$.ɵbind(ctx.items));
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

    function MyComponent_ForOfDirective_Template_1(rf: $RenderFlags$, ctx1: $any$) {
      if (rf & 1) {
        $r3$.ɵelementStart(0, 'li');
        $r3$.ɵelementStart(1, 'div');
        $r3$.ɵtext(2);
        $r3$.ɵelementEnd();
        $r3$.ɵelementStart(3, 'ul');
        $r3$.ɵtemplate(
            4, MyComponent_ForOfDirective_ForOfDirective_Template_3, 2, 1, '', ['forOf', '']);
        $r3$.ɵelementEnd();
        $r3$.ɵelementEnd();
      }
      if (rf & 2) {
        const $l0_item$ = ctx1.$implicit;
        $r3$.ɵelementProperty(4, 'forOf', $r3$.ɵbind($l0_item$.infos));
        $r3$.ɵtextBinding(2, $r3$.ɵinterpolation1('', $l0_item$.name, ''));
      }
    }

    function MyComponent_ForOfDirective_ForOfDirective_Template_3(rf: $number$, ctx2: $any$) {
      if (rf & 1) {
        $r3$.ɵelementStart(0, 'li');
        $r3$.ɵtext(1);
        $r3$.ɵelementEnd();
      }
      if (rf & 2) {
        const $l0_info$ = ctx2.$implicit;
        const $l0_item$ = $r3$.ɵnextContext();
        $r3$.ɵtextBinding(
            1, $r3$.ɵinterpolation2(' ', $l0_item$.name, ': ', $l0_info$.description, ' '));
      }
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
        consts: 2,
        vars: 1,
        template: function MyComponent_Template(rf: $RenderFlags$, ctx: $MyComponent$) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, 'ul');
            $r3$.ɵtemplate(1, MyComponent_ForOfDirective_Template_1, 5, 2, '', ['forOf', '']);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(1, 'forOf', $r3$.ɵbind(ctx.items));
          }
        }
      });
      // /NORMATIVE
    }
  });
});
