/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as html from '../../src/ml_parser/ast';
import {HtmlParser} from '../../src/ml_parser/html_parser';
import {expandNodes, ExpansionResult} from '../../src/ml_parser/icu_ast_expander';
import {ParseError} from '../../src/parse_util';

import {humanizeNodes} from './ast_spec_utils';

{
  describe('Expander', () => {
    function expand(template: string): ExpansionResult {
      const htmlParser = new HtmlParser();
      const res = htmlParser.parse(template, 'url', {tokenizeExpansionForms: true});
      return expandNodes(res.rootNodes);
    }

    it('should handle the plural expansion form', () => {
      const res = expand(`{messages.length, plural,=0 {zero<b>bold</b>}}`);

      expect(humanizeNodes(res.nodes)).toEqual([
        [html.Element, 'ng-container', 0],
        [html.Attribute, '[ngPlural]', 'messages.length'],
        [html.Element, 'ng-template', 1],
        [html.Attribute, 'ngPluralCase', '=0'],
        [html.Text, 'zero', 2, ['zero']],
        [html.Element, 'b', 2],
        [html.Text, 'bold', 3, ['bold']],
      ]);
    });

    it('should handle nested expansion forms', () => {
      const res = expand(`{messages.length, plural, =0 { {p.gender, select, male {m}} }}`);

      expect(humanizeNodes(res.nodes)).toEqual([
        [html.Element, 'ng-container', 0],
        [html.Attribute, '[ngPlural]', 'messages.length'],
        [html.Element, 'ng-template', 1],
        [html.Attribute, 'ngPluralCase', '=0'],
        [html.Element, 'ng-container', 2],
        [html.Attribute, '[ngSwitch]', 'p.gender'],
        [html.Element, 'ng-template', 3],
        [html.Attribute, 'ngSwitchCase', 'male'],
        [html.Text, 'm', 4, ['m']],
        [html.Text, ' ', 2, [' ']],
      ]);
    });

    it('should correctly set source code positions', () => {
      const nodes = expand(`{messages.length, plural,=0 {<b>bold</b>}}`).nodes;

      const container: html.Element = <html.Element>nodes[0];
      expect(container.sourceSpan.start.col).toEqual(0);
      expect(container.sourceSpan.end.col).toEqual(42);
      expect(container.startSourceSpan.start.col).toEqual(0);
      expect(container.startSourceSpan.end.col).toEqual(42);
      expect(container.endSourceSpan!.start.col).toEqual(0);
      expect(container.endSourceSpan!.end.col).toEqual(42);

      const switchExp = container.attrs[0];
      expect(switchExp.sourceSpan.start.col).toEqual(1);
      expect(switchExp.sourceSpan.end.col).toEqual(16);

      const template: html.Element = <html.Element>container.children[0];
      expect(template.sourceSpan.start.col).toEqual(25);
      expect(template.sourceSpan.end.col).toEqual(41);

      const switchCheck = template.attrs[0];
      expect(switchCheck.sourceSpan.start.col).toEqual(25);
      expect(switchCheck.sourceSpan.end.col).toEqual(28);

      const b: html.Element = <html.Element>template.children[0];
      expect(b.sourceSpan.start.col).toEqual(29);
      expect(b.endSourceSpan!.end.col).toEqual(40);
    });

    it('should handle other special forms', () => {
      const res = expand(`{person.gender, select, male {m} other {default}}`);

      expect(humanizeNodes(res.nodes)).toEqual([
        [html.Element, 'ng-container', 0],
        [html.Attribute, '[ngSwitch]', 'person.gender'],
        [html.Element, 'ng-template', 1],
        [html.Attribute, 'ngSwitchCase', 'male'],
        [html.Text, 'm', 2, ['m']],
        [html.Element, 'ng-template', 1],
        [html.Attribute, 'ngSwitchDefault', ''],
        [html.Text, 'default', 2, ['default']],
      ]);
    });

    it('should parse an expansion form as a tag single child', () => {
      const res = expand(`<div><span>{a, b, =4 {c}}</span></div>`);

      expect(humanizeNodes(res.nodes)).toEqual([
        [html.Element, 'div', 0],
        [html.Element, 'span', 1],
        [html.Element, 'ng-container', 2],
        [html.Attribute, '[ngSwitch]', 'a'],
        [html.Element, 'ng-template', 3],
        [html.Attribute, 'ngSwitchCase', '=4'],
        [html.Text, 'c', 4, ['c']],
      ]);
    });

    describe('errors', () => {
      it('should error on unknown plural cases', () => {
        expect(humanizeErrors(expand('{n, plural, unknown {-}}').errors)).toEqual([
          `Plural cases should be "=<number>" or one of zero, one, two, few, many, other`,
        ]);
      });
    });
  });
}

function humanizeErrors(errors: ParseError[]): string[] {
  return errors.map(error => error.msg);
}
