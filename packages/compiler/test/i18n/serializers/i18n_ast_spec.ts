/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as i18n from '../../../src/i18n/i18n_ast';

import {serializeNodes} from '../../../src/i18n/digest';
import {_extractMessages} from '../i18n_parser_spec';

describe('i18n AST', () => {
  describe('CloneVisitor', () => {
    it('should clone an AST', () => {
      const messages = _extractMessages(
        '<div i18n="m|d">b{count, plural, =0 {{sex, select, male {m}}}}a</div>',
      );
      const nodes = messages[0].nodes;
      const text = serializeNodes(nodes).join('');
      expect(text).toEqual(
        'b<ph icu name="ICU">{count, plural, =0 {[{sex, select, male {[m]}}]}}</ph>a',
      );
      const visitor = new i18n.CloneVisitor();
      const cloneNodes = nodes.map((n) => n.visit(visitor));
      expect(serializeNodes(nodes)).toEqual(serializeNodes(cloneNodes));
      nodes.forEach((n: i18n.Node, i: number) => {
        expect(n).toEqual(cloneNodes[i]);
        expect(n).not.toBe(cloneNodes[i]);
      });
    });
  });

  describe('RecurseVisitor', () => {
    it('should visit all nodes', () => {
      const visitor = new RecurseVisitor();
      const container = new i18n.Container(
        [
          new i18n.Text('', null!),
          new i18n.Placeholder('', '', null!),
          new i18n.IcuPlaceholder(null!, '', null!),
        ],
        null!,
      );
      const tag = new i18n.TagPlaceholder('', {}, '', '', [container], false, null!, null, null);
      const icu = new i18n.Icu('', '', {tag}, null!);

      icu.visit(visitor);
      expect(visitor.textCount).toEqual(1);
      expect(visitor.phCount).toEqual(1);
      expect(visitor.icuPhCount).toEqual(1);
    });
  });
});

class RecurseVisitor extends i18n.RecurseVisitor {
  textCount = 0;
  phCount = 0;
  icuPhCount = 0;

  override visitText(text: i18n.Text, context?: any): any {
    this.textCount++;
  }

  override visitPlaceholder(ph: i18n.Placeholder, context?: any): any {
    this.phCount++;
  }

  override visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    this.icuPhCount++;
  }
}
