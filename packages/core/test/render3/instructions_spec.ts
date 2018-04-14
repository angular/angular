/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOfContext} from '@angular/common';

import {RenderFlags, directiveInject} from '../../src/render3';
import {defineComponent} from '../../src/render3/definition';
import {bind, container, elementAttribute, elementClass, elementEnd, elementProperty, elementStart, elementStyle, elementStyleNamed, interpolation1, renderTemplate, text, textBinding} from '../../src/render3/instructions';
import {LElementNode, LNode} from '../../src/render3/interfaces/node';
import {RElement, domRendererFactory3} from '../../src/render3/interfaces/renderer';
import {bypassSanitizationTrustStyle, bypassSanitizationTrustUrl, sanitizeStyle, sanitizeUrl} from '../../src/sanitization/sanitization';

import {NgForOf} from './common_with_def';
import {ComponentFixture, TemplateFixture} from './render_util';

describe('instructions', () => {
  function createDiv() {
    elementStart(0, 'div');
    elementEnd();
  }

  describe('elementAttribute', () => {
    it('should use sanitizer function', () => {
      const t = new TemplateFixture(createDiv);

      t.update(() => elementAttribute(0, 'title', 'javascript:true', sanitizeUrl));
      expect(t.html).toEqual('<div title="unsafe:javascript:true"></div>');

      t.update(
          () => elementAttribute(
              0, 'title', bypassSanitizationTrustUrl('javascript:true'), sanitizeUrl));
      expect(t.html).toEqual('<div title="javascript:true"></div>');
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 1,
        tNode: 1,
        tView: 1,
        rendererCreateElement: 1,
        rendererSetAttribute: 2
      });
    });
  });

  describe('elementProperty', () => {
    it('should use sanitizer function when available', () => {
      const t = new TemplateFixture(createDiv);

      t.update(() => elementProperty(0, 'title', 'javascript:true', sanitizeUrl));
      expect(t.html).toEqual('<div title="unsafe:javascript:true"></div>');

      t.update(
          () => elementProperty(
              0, 'title', bypassSanitizationTrustUrl('javascript:false'), sanitizeUrl));
      expect(t.html).toEqual('<div title="javascript:false"></div>');
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 1,
        tNode: 1,
        tView: 1,
        rendererCreateElement: 1,
      });
    });

    it('should not stringify non string values', () => {
      const t = new TemplateFixture(createDiv);

      t.update(() => elementProperty(0, 'hidden', false));
      // The hidden property would be true if `false` was stringified into `"false"`.
      expect((t.hostNode.native as HTMLElement).querySelector('div') !.hidden).toEqual(false);
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 1,
        tNode: 1,
        tView: 1,
        rendererCreateElement: 1,
        rendererSetProperty: 1
      });
    });
  });

  describe('elementStyleNamed', () => {
    it('should use sanitizer function', () => {
      const t = new TemplateFixture(createDiv);
      t.update(
          () => elementStyleNamed(0, 'background-image', 'url("http://server")', sanitizeStyle));
      // nothing is set because sanitizer suppresses it.
      expect(t.html).toEqual('<div></div>');

      t.update(
          () => elementStyleNamed(
              0, 'background-image', bypassSanitizationTrustStyle('url("http://server")'),
              sanitizeStyle));
      expect((t.hostElement.firstChild as HTMLElement).style.getPropertyValue('background-image'))
          .toEqual('url("http://server")');
    });
  });

  describe('elementStyle', () => {
    function createDivWithStyle() {
      elementStart(0, 'div', ['style', 'height: 10px']);
      elementEnd();
    }
    const fixture = new TemplateFixture(createDivWithStyle);

    it('should add style', () => {
      fixture.update(() => elementStyle(0, {'background-color': 'red'}));
      expect(fixture.html).toEqual('<div style="height: 10px; background-color: red;"></div>');
    });
  });

  describe('elementClass', () => {
    const fixture = new TemplateFixture(createDiv);

    it('should add class', () => {
      fixture.update(() => elementClass(0, 'multiple classes'));
      expect(fixture.html).toEqual('<div class="multiple classes"></div>');
    });
  });

  describe('performance counters', () => {
    it('should create tViews only once for each nested level', () => {
      const _c0 = ['ngFor', '', 'ngForOf', ''];
      /**
       * <ul *ngFor="let row of rows">
       *   <li *ngFor="let col of row.cols">{{col}}</li>
       * </ul>
       */
      class NestedLoops {
        rows = [['a', 'b'], ['A', 'B'], ['a', 'b'], ['A', 'B']];

        static ngComponentDef = defineComponent({
          type: NestedLoops,
          selectors: [['todo-app']],
          factory: function ToDoAppComponent_Factory() { return new NestedLoops(); },
          template: function ToDoAppComponent_Template(rf: RenderFlags, ctx: NestedLoops) {
            if (rf & 1) {
              container(0, ToDoAppComponent_NgForOf_Template_0, null, _c0);
            }
            if (rf & 2) {
              elementProperty(0, 'ngForOf', bind(ctx.rows));
            }
            function ToDoAppComponent_NgForOf_Template_0(
                rf: RenderFlags, ctx0: NgForOfContext<any>) {
              if (rf & 1) {
                elementStart(0, 'ul');
                container(1, ToDoAppComponent_NgForOf_NgForOf_Template_1, null, _c0);
                elementEnd();
              }
              if (rf & 2) {
                const row_r2 = ctx0.$implicit;
                elementProperty(1, 'ngForOf', bind(row_r2));
              }
              function ToDoAppComponent_NgForOf_NgForOf_Template_1(
                  rf: RenderFlags, ctx1: NgForOfContext<any>) {
                if (rf & 1) {
                  elementStart(0, 'li');
                  text(1);
                  elementEnd();
                }
                if (rf & 2) {
                  const col_r3 = ctx1.$implicit;
                  textBinding(1, interpolation1('', col_r3, ''));
                }
              }
            }
          },
          directives: [NgForOf]
        });
      }
      const fixture = new ComponentFixture(NestedLoops);
      expect(ngDevMode).toHaveProperties({
        // Expect: host view + component + *ngForRow + *ngForCol
        tView: 7,  // should be: 4,
      });

    });
  });
});
