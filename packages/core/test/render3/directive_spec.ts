/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';

import {AttributeMarker, defineDirective} from '../../src/render3/index';
import {bind, elementEnd, elementProperty, elementStart, listener, loadDirective} from '../../src/render3/instructions';

import {TemplateFixture} from './render_util';

describe('directive', () => {

  describe('host', () => {

    it('should support host bindings in directives', () => {
      let directiveInstance: Directive|undefined;

      class Directive {
        klass = 'foo';
        static ngDirectiveDef = defineDirective({
          type: Directive,
          selectors: [['', 'dir', '']],
          factory: () => directiveInstance = new Directive,
          hostBindings: (directiveIndex: number, elementIndex: number) => {
            elementProperty(
                elementIndex, 'className', bind(loadDirective<Directive>(directiveIndex).klass));
          }
        });
      }

      function Template() {
        elementStart(0, 'span', [AttributeMarker.SELECT_ONLY, 'dir']);
        elementEnd();
      }

      const fixture = new TemplateFixture(Template, () => {}, [Directive]);
      expect(fixture.html).toEqual('<span class="foo"></span>');

      directiveInstance !.klass = 'bar';
      fixture.update();
      expect(fixture.html).toEqual('<span class="bar"></span>');
    });

  });

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

        testValue: boolean;
        other: boolean;

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
        elementStart(0, 'span', ['class', 'fade', AttributeMarker.SELECT_ONLY, 'test', 'other']);
        elementEnd();
      }

      function updateTemplate() { elementProperty(0, 'test', bind(false)); }

      const fixture = new TemplateFixture(createTemplate, updateTemplate, [Directive]);

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

           prop1: boolean;
           prop2: boolean;
           testValue: boolean;


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
          * <span [prop1]="true" [test]="false" [prop2]="true"></span>
          */
         function createTemplate() {
           // putting name (test) in the "usual" value position
           elementStart(
               0, 'span', ['class', 'fade', AttributeMarker.SELECT_ONLY, 'prop1', 'test', 'prop2']);
           elementEnd();
         }

         function updateTemplate() {
           elementProperty(0, 'prop1', bind(true));
           elementProperty(0, 'test', bind(false));
           elementProperty(0, 'prop2', bind(true));
         }

         const fixture = new TemplateFixture(createTemplate, updateTemplate, [Directive]);

         // the "test" attribute should not be reflected in the DOM as it is here only for directive
         // matching purposes
         expect(fixture.html).toEqual('<span class="fade"></span>');
         expect(directiveInstance !.testValue).toBe(false);
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
        elementStart(0, 'span', [AttributeMarker.SELECT_ONLY, 'out']);
        { listener('out', () => {}); }
        elementEnd();
      }

      const fixture = new TemplateFixture(createTemplate, () => {}, [Directive]);

      // "out" should not be part of reflected attributes
      expect(fixture.html).toEqual('<span></span>');
      expect(directiveInstance !).not.toBeUndefined();
    });

  });
});
