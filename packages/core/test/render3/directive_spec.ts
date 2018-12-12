/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, TemplateRef, ViewContainerRef} from '@angular/core';

import {AttributeMarker, RenderFlags, defineComponent, defineDirective, directiveInject} from '../../src/render3/index';

import {bind, element, elementEnd, elementProperty, elementStart, listener, template, elementContainerStart, elementContainerEnd, text} from '../../src/render3/instructions';

import {ComponentFixture, TemplateFixture, createComponent} from './render_util';
import {NgIf} from './common_with_def';

describe('directive', () => {

  describe('selectors', () => {

    it('should match directives with attribute selectors on bindings', () => {
      let directiveInstance: Directive;

      class Directive {
        static ngDirectiveDef = defineDirective({
          type: Directive,
          selectors: [['', 'test', '']],
          factory: () => directiveInstance = new Directive,
          inputs: {test: 'test', other: 'other'}
        });

        // TODO(issue/24571): remove '!'.
        testValue !: boolean;
        // TODO(issue/24571): remove '!'.
        other !: boolean;

        /**
         * A setter to assert that a binding is not invoked with stringified attribute value
         */
        set test(value: any) {
          // if a binding is processed correctly we should only be invoked with a false Boolean
          // and never with the "false" string literal
          this.testValue = value;
          if (value !== false) {
            fail('Should only be called with a false Boolean value, got a non-falsy value');
          }
        }
      }

      /**
       * <span [test]="false" [other]="true"></span>
       */
      function createTemplate() {
        // using 2 bindings to show example shape of attributes array
        element(0, 'span', ['class', 'fade', AttributeMarker.SelectOnly, 'test', 'other']);
      }

      function updateTemplate() { elementProperty(0, 'test', bind(false)); }

      const fixture = new TemplateFixture(createTemplate, updateTemplate, 1, 1, [Directive]);

      // the "test" attribute should not be reflected in the DOM as it is here only for directive
      // matching purposes
      expect(fixture.html).toEqual('<span class="fade"></span>');
      expect(directiveInstance !.testValue).toBe(false);
    });

    it('should not accidentally set inputs from attributes extracted from bindings / outputs',
       () => {
         let directiveInstance: Directive;

         class Directive {
           static ngDirectiveDef = defineDirective({
             type: Directive,
             selectors: [['', 'test', '']],
             factory: () => directiveInstance = new Directive,
             inputs: {test: 'test', prop1: 'prop1', prop2: 'prop2'}
           });

           // TODO(issue/24571): remove '!'.
           prop1 !: boolean;
           // TODO(issue/24571): remove '!'.
           prop2 !: boolean;
           // TODO(issue/24571): remove '!'.
           testValue !: boolean;


           /**
            * A setter to assert that a binding is not invoked with stringified attribute value
            */
           set test(value: any) {
             // if a binding is processed correctly we should only be invoked with a false Boolean
             // and never with the "false" string literal
             this.testValue = value;
             if (value !== false) {
               fail('Should only be called with a false Boolean value, got a non-falsy value');
             }
           }
         }

         /**
          * <span class="fade" [prop1]="true" [test]="false" [prop2]="true"></span>
          */
         function createTemplate() {
           // putting name (test) in the "usual" value position
           element(
               0, 'span', ['class', 'fade', AttributeMarker.SelectOnly, 'prop1', 'test', 'prop2']);
         }

         function updateTemplate() {
           elementProperty(0, 'prop1', bind(true));
           elementProperty(0, 'test', bind(false));
           elementProperty(0, 'prop2', bind(true));
         }

         const fixture = new TemplateFixture(createTemplate, updateTemplate, 1, 3, [Directive]);

         // the "test" attribute should not be reflected in the DOM as it is here only for directive
         // matching purposes
         expect(fixture.html).toEqual('<span class="fade"></span>');
         expect(directiveInstance !.testValue).toBe(false);
       });

    it('should match directives on <ng-template>', () => {
      /**
       *   @Directive({
       *     selector: 'ng-template[directiveA]'
       *   })
       *   export class DirectiveA {
       *     constructor(public templateRef: TemplateRef<any>) {}
       *   }
       */
      let tmplRef: any;
      class DirectiveA {
        constructor(public templateRef: any) { tmplRef = templateRef; }
        static ngDirectiveDef = defineDirective({
          type: DirectiveA,
          selectors: [['ng-template', 'directiveA', '']],
          factory: () => new DirectiveA(directiveInject(TemplateRef as any))
        });
      }

      function MyComponent_ng_template_Template_0(rf: RenderFlags, ctx: any) {
        if (rf & 1) {
          text(0, 'Some content');
        }
      }
      class MyComponent {
        static ngComponentDef = defineComponent({
          type: MyComponent,
          selectors: [['my-component']],
          factory: () => new MyComponent(),
          consts: 2,
          vars: 0,
          // <ng-template directiveA>Some content</ng-template>
          template: function MyComponent_Template(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              template(
                  0, MyComponent_ng_template_Template_0, 1, 0, 'ng-template', ['directiveA', '']);
            }
          },
          directives: [DirectiveA, NgIf]
        });
      }

      new ComponentFixture(MyComponent);
      expect(tmplRef instanceof TemplateRef).toBeTruthy();
    });

    it('should match directives on <ng-container>', () => {
      /**
       *   @Directive({
       *     selector: 'ng-container[directiveA]'
       *   })
       *   export class DirectiveA {
       *     constructor(public vcRef: ViewContainerRef<any>) {}
       *   }
       */
      let vcRef: any;
      class DirectiveA {
        constructor(public viewContainerRef: any) { vcRef = viewContainerRef; }
        static ngDirectiveDef = defineDirective({
          type: DirectiveA,
          selectors: [['ng-container', 'directiveA', '']],
          factory: () => new DirectiveA(directiveInject(ViewContainerRef as any))
        });
      }

      function MyComponent_ng_container_Template_0(rf: RenderFlags, ctx: any) {
        if (rf & 1) {
          elementContainerStart(0, ['directiveA', '']);
          text(1, 'Some content');
          elementContainerEnd();
        }
      }
      class MyComponent {
        visible = true;

        static ngComponentDef = defineComponent({
          type: MyComponent,
          selectors: [['my-component']],
          factory: () => new MyComponent(),
          consts: 1,
          vars: 1,
          // <ng-container *ngIf="visible" directiveA>Some content</ng-container>
          template: function MyComponent_Template(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              template(0, MyComponent_ng_container_Template_0, 2, 0, 'ng-container', [1, 'ngIf']);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(0, 'ngIf', bind(ctx.visible));
            }
          },
          directives: [DirectiveA, NgIf]
        });
      }

      new ComponentFixture(MyComponent);
      expect(vcRef instanceof ViewContainerRef).toBeTruthy();
    });

    it('should match directives with attribute selectors on outputs', () => {
      let directiveInstance: Directive;

      class Directive {
        static ngDirectiveDef = defineDirective({
          type: Directive,
          selectors: [['', 'out', '']],
          factory: () => directiveInstance = new Directive,
          outputs: {out: 'out'}
        });

        out = new EventEmitter();
      }

      /**
       * <span (out)="someVar = true"></span>
       */
      function createTemplate() {
        elementStart(0, 'span', [AttributeMarker.SelectOnly, 'out']);
        { listener('out', () => {}); }
        elementEnd();
      }

      const fixture = new TemplateFixture(createTemplate, () => {}, 1, 0, [Directive]);

      // "out" should not be part of reflected attributes
      expect(fixture.html).toEqual('<span></span>');
      expect(directiveInstance !).not.toBeUndefined();
    });
  });

  describe('outputs', () => {

    let directiveInstance: Directive;

    class Directive {
      static ngDirectiveDef = defineDirective({
        type: Directive,
        selectors: [['', 'out', '']],
        factory: () => directiveInstance = new Directive,
        outputs: {out: 'out'}
      });

      out = new EventEmitter();
    }

    it('should allow outputs of directive on ng-template', () => {
      /**
       * <ng-template (out)="value = true"></ng-template>
       */
      const Cmpt = createComponent('Cmpt', function(rf: RenderFlags, ctx: {value: any}) {
        if (rf & RenderFlags.Create) {
          template(0, null, 0, 0, 'ng-template', [AttributeMarker.SelectOnly, 'out']);
          listener('out', () => { ctx.value = true; });
        }
      }, 1, 0, [Directive]);

      const fixture = new ComponentFixture(Cmpt);

      expect(directiveInstance !).not.toBeUndefined();
      expect(fixture.component.value).toBeFalsy();

      directiveInstance !.out.emit();
      fixture.update();
      expect(fixture.component.value).toBeTruthy();
    });

    it('should allow outputs of directive on ng-container', () => {
      /**
       * <ng-container (out)="value = true"></ng-container>
       */
      const Cmpt = createComponent('Cmpt', function(rf: RenderFlags, ctx: {value: any}) {
        if (rf & RenderFlags.Create) {
          elementContainerStart(0, [AttributeMarker.SelectOnly, 'out']);
          {
            listener('out', () => { ctx.value = true; });
          }
          elementContainerEnd();
        }
      }, 1, 0, [Directive]);

      const fixture = new ComponentFixture(Cmpt);

      expect(directiveInstance !).not.toBeUndefined();
      expect(fixture.component.value).toBeFalsy();

      directiveInstance !.out.emit();
      fixture.update();
      expect(fixture.component.value).toBeTruthy();
    });

  });
});
