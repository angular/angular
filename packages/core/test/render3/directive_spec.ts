/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {D, E, b, defineDirective, e, p} from '../../src/render3/index';

import {renderToHtml} from './render_util';

describe('directive', () => {

  describe('host', () => {

    it('should support host bindings in directives', () => {
      let directiveInstance: Directive|undefined;

      class Directive {
        klass = 'foo';
      }
      const DirectiveDef = defineDirective({
        type: Directive,
        factory: () => directiveInstance = new Directive,
        refresh: (directiveIndex: number, elementIndex: number) => {
          p(elementIndex, 'className', b(D<Directive>(directiveIndex).klass));
        }
      });

      function Template(ctx: any, cm: boolean) {
        if (cm) {
          E(0, 'span');
          { D(0, DirectiveDef.n(), DirectiveDef); }
          e();
        }
        DirectiveDef.r(0, 0);
      }

      expect(renderToHtml(Template, {})).toEqual('<span class="foo"></span>');
      directiveInstance !.klass = 'bar';
      expect(renderToHtml(Template, {})).toEqual('<span class="bar"></span>');
    });

  });
});
