/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AttributeMarker} from '@angular/compiler/src/core';
import {setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('compiler compliance: template', () => {
  const angularFiles = setup({
    compileAngular: false,
    compileFakeCore: true,
    compileAnimations: false,
  });

  it('should correctly bind to context in nested template', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`
                  <ul *ngFor="let outer of items">
                    <li *ngFor="let middle of outer.items">
                      <div *ngFor="let inner of items"
                           (click)="onClick(outer, middle, inner)"
                           [title]="format(outer, middle, inner, component)"
                           >
                        {{format(outer, middle, inner, component)}}
                      </div>
                    </li>
                  </ul>\`
              })
              export class MyComponent {
                component = this;
                format(outer: any, middle: any, inner: any) { }
                onClick(outer: any, middle: any, inner: any) { }
              }

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    // The template should look like this (where IDENT is a wild card for an identifier):
    const template = `
      const $c0$ = ["ngFor", "", ${AttributeMarker.SelectOnly}, "ngForOf"];
      const $e0_attrs$ = [${AttributeMarker.SelectOnly}, "title", "click"];
      function MyComponent_ul_li_div_Template_1(rf, ctx) {

        if (rf & 1) {
          const $s$ = $i0$.ɵgetCurrentView();
          $i0$.ɵelementStart(0, "div", $e0_attrs$);
          $i0$.ɵlistener("click", function MyComponent_ul_li_div_Template_1_div_click_listener($event){
            $i0$.ɵrestoreView($s$);
            const $inner$ = ctx.$implicit;
            const $middle$ = $i0$.ɵnextContext().$implicit;
            const $outer$ = $i0$.ɵnextContext().$implicit;
            const $myComp$ = $i0$.ɵnextContext();
            return $myComp$.onClick($outer$, $middle$, $inner$);
          });
          $i0$.ɵtext(1);
          $i0$.ɵelementEnd();
        }

        if (rf & 2) {
          const $inner1$ = ctx.$implicit;
          const $middle1$ = $i0$.ɵnextContext().$implicit;
          const $outer1$ = $i0$.ɵnextContext().$implicit;
          const $myComp1$ = $i0$.ɵnextContext();
          $i0$.ɵelementProperty(0, "title", $i0$.ɵbind($myComp1$.format($outer1$, $middle1$, $inner1$, $myComp1$.component)));
          $i0$.ɵtextBinding(1, $i0$.ɵinterpolation1(" ", $myComp1$.format($outer1$, $middle1$, $inner1$, $myComp1$.component), " "));
        }
      }

      function MyComponent_ul_li_Template_1(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵelementStart(0, "li");
          $i0$.ɵtemplate(1, MyComponent_ul_li_div_Template_1, 2, 2, "div", _c0);
          $i0$.ɵelementEnd();
        }
        if (rf & 2) {
          const $myComp2$ = $i0$.ɵnextContext(2);
          $i0$.ɵelementProperty(1, "ngForOf", $i0$.ɵbind($myComp2$.items));
        }
      }

      function MyComponent_ul_Template_0(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵelementStart(0, "ul");
          $i0$.ɵtemplate(1, MyComponent_ul_li_Template_1, 2, 1, "li", _c0);
          $i0$.ɵelementEnd();
        }
        if (rf & 2) {
          const $outer2$ = ctx.$implicit;
          $i0$.ɵelementProperty(1, "ngForOf", $i0$.ɵbind($outer2$.items));
        }
      }
      // ...
      template:function MyComponent_Template(rf, ctx){
        if (rf & 1) {
          $i0$.ɵtemplate(0, MyComponent_ul_Template_0, 2, 1, "ul", _c0);
        }
        if (rf & 2) {
          $i0$.ɵelementProperty(0, "ngForOf", $i0$.ɵbind(ctx.items));
        }
      }`;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should support ngFor context variables', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`
                    <span *ngFor="let item of items; index as i">
                      {{ i }} - {{ item }}
                    </span>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    const template = `
      const $c0$ = ["ngFor", "", ${AttributeMarker.SelectOnly}, "ngForOf"];

      function MyComponent_span_Template_0(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵelementStart(0, "span");
          $i0$.ɵtext(1);
          $i0$.ɵelementEnd();
        }
        if (rf & 2) {
          const $item$ = ctx.$implicit;
          const $i$ = ctx.index;
          $i0$.ɵtextBinding(1, $i0$.ɵinterpolation2(" ", $i$, " - ", $item$, " "));
        }
      }
      // ...
      template:function MyComponent_Template(rf, ctx){
        if (rf & 1) {
          $i0$.ɵtemplate(0, MyComponent_span_Template_0, 2, 2, "span", _c0);
        }
        if (rf & 2) {
          $i0$.ɵelementProperty(0, "ngForOf", $i0$.ɵbind(ctx.items));
        }
      }`;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should support ngFor context variables in parent views', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`
                  <div *ngFor="let item of items; index as i">
                      <span *ngIf="showing">
                        {{ i }} - {{ item }}
                      </span>
                  </div>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    const template = `
      const $c0$ = ["ngFor", "", ${AttributeMarker.SelectOnly}, "ngForOf"];
      const $c1$ = [${AttributeMarker.SelectOnly}, "ngIf"];

      function MyComponent_div_span_Template_1(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵelementStart(0, "span");
          $i0$.ɵtext(1);
          $i0$.ɵelementEnd();
        }
        if (rf & 2) {
          const $div$ = $i0$.ɵnextContext();
          const $i$ = $div$.index;
          const $item$ = $div$.$implicit;
          $i0$.ɵtextBinding(1, $i0$.ɵinterpolation2(" ", $i$, " - ", $item$, " "));
        }
      }

      function MyComponent_div_Template_0(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵelementStart(0, "div");
          $i0$.ɵtemplate(1, MyComponent_div_span_Template_1, 2, 2, "span", $c1$);
          $i0$.ɵelementEnd();
        }
        if (rf & 2) {
          const $app$ = $i0$.ɵnextContext();
          $i0$.ɵelementProperty(1, "ngIf", $i0$.ɵbind($app$.showing));
        }
      }

      // ...
      template:function MyComponent_Template(rf, ctx){
        if (rf & 1) {
          $i0$.ɵtemplate(0, MyComponent_div_Template_0, 2, 1, "div", $c0$);
        }
        if (rf & 2) {
          $i0$.ɵelementProperty(0, "ngForOf", $i0$.ɵbind(ctx.items));
        }
      }`;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should correctly skip contexts as needed', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`
                  <div *ngFor="let outer of items">
                    <div *ngFor="let middle of outer.items">
                      <div *ngFor="let inner of middle.items">
                        {{ middle.value }} - {{ name }}
                      </div>
                    </div>
                  </div>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    // The template should look like this (where IDENT is a wild card for an identifier):
    const template = `
      const $c0$ = ["ngFor", "", ${AttributeMarker.SelectOnly}, "ngForOf"];
      function MyComponent_div_div_div_Template_1(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵelementStart(0, "div");
          $i0$.ɵtext(1);
          $i0$.ɵelementEnd();
        }
        if (rf & 2) {
          const $middle$ = $i0$.ɵnextContext().$implicit;
          const $myComp$ = $i0$.ɵnextContext(2);
          $i0$.ɵtextBinding(1, $i0$.ɵinterpolation2(" ", $middle$.value, " - ", $myComp$.name, " "));
        }
      }

      function MyComponent_div_div_Template_1(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵelementStart(0, "div");
          $i0$.ɵtemplate(1, MyComponent_div_div_div_Template_1, 2, 2, "div", _c0);
          $i0$.ɵelementEnd();
        }
        if (rf & 2) {
          const $middle$ = ctx.$implicit;
          $i0$.ɵelementProperty(1, "ngForOf", $i0$.ɵbind($middle$.items));
        }
      }

      function MyComponent_div_Template_0(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵelementStart(0, "div");
          $i0$.ɵtemplate(1, MyComponent_div_div_Template_1, 2, 1, "div", _c0);
          $i0$.ɵelementEnd();
        }
        if (rf & 2) {
          const $outer$ = ctx.$implicit;
          $i0$.ɵelementProperty(1, "ngForOf", $i0$.ɵbind($outer$.items));
        }
      }
      // ...
      template:function MyComponent_Template(rf, ctx){
        if (rf & 1) {
          $i0$.ɵtemplate(0, MyComponent_div_Template_0, 2, 1, "div", _c0);
        }
        if (rf & 2) {
          $i0$.ɵelementProperty(0, "ngForOf", $i0$.ɵbind(ctx.items));
        }
      }`;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should support <ng-template>', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`
                  <ng-template [boundAttr]="b" attr="l">
                    some-content
                  </ng-template>\`
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    const template = `
      const $c0$ = ["attr", "l", ${AttributeMarker.SelectOnly}, "boundAttr"];

      function MyComponent_ng_template_Template_0(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵtext(0, " some-content ");
        }
      }

      // ...

      template: function MyComponent_Template(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵtemplate(0, MyComponent_ng_template_Template_0, 1, 0, "ng-template", $c0$);
        }
        if (rf & 2) {
          $i0$.ɵelementProperty(0, "boundAttr", $i0$.ɵbind(ctx.b));
        }
      }`;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should support local refs on <ng-template>', () => {

    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: '<ng-template #foo>some-content</ng-template>';
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    const template = `
      const $t0_refs$ = ["foo", ""];

      function MyComponent_ng_template_Template_0(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵtext(0, "some-content");
        }
      }

      // ...

      template: function MyComponent_Template(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵtemplate(0, MyComponent_ng_template_Template_0, 1, 0, "ng-template", null, $t0_refs$, $i0$.ɵtemplateRefExtractor);
        }
      }`;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should support directive outputs on <ng-template>', () => {

    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: '<ng-template (outDirective)="$event.doSth()"></ng-template>';
              })
              export class MyComponent {}

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    const template = `
      const $t0_attrs$ = [${AttributeMarker.SelectOnly}, "outDirective"];

      function MyComponent_ng_template_Template_0(rf, ctx) { }

      // ...

      template: function MyComponent_Template(rf, ctx) {
        if (rf & 1) {
          $i0$.ɵtemplate(0, MyComponent_ng_template_Template_0, 0, 0, "ng-template", $t0_attrs$);
          $i0$.ɵlistener("outDirective", function MyComponent_Template_ng_template_outDirective_listener($event) { return $event.doSth(); });
        }
      }`;

    const result = compile(files, angularFiles);

    expectEmit(result.source, template, 'Incorrect template');

  });
});
