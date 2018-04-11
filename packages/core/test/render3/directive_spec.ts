/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineDirective} from '../../src/render3/index';
import {bind, elementEnd, elementProperty, elementStart, loadDirective} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {renderToHtml} from './render_util';

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

      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'span', ['dir', '']);
          elementEnd();
        }
      }

      const defs = [Directive];
      expect(renderToHtml(Template, {}, defs)).toEqual('<span class="foo" dir=""></span>');
      directiveInstance !.klass = 'bar';
      expect(renderToHtml(Template, {}, defs)).toEqual('<span class="bar" dir=""></span>');
    });

  });
});
