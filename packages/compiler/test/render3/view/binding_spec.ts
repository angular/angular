/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as e from '../../../src/expression_parser/ast';
import * as a from '../../../src/render3/r3_ast';
import {DirectiveMeta} from '../../../src/render3/view/t2_api';
import {R3TargetBinder} from '../../../src/render3/view/t2_binder';
import {parseTemplate} from '../../../src/render3/view/template';
import {CssSelector, SelectorMatcher} from '../../../src/selector';

import {findExpression} from './util';

function makeSelectorMatcher(): SelectorMatcher<DirectiveMeta> {
  const matcher = new SelectorMatcher<DirectiveMeta>();
  matcher.addSelectables(CssSelector.parse('[ngFor][ngForOf]'), {
    name: 'NgFor',
    exportAs: null,
    inputs: {'ngForOf': 'ngForOf'},
    outputs: {},
    isComponent: false,
  });
  return matcher;
}

describe('t2 binding', () => {
  it('should bind a simple template', () => {
    const template =
        parseTemplate('<div *ngFor="let item of items">{{item.name}}</div>', '', {}, '');
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta>());
    const res = binder.bind({template: template.nodes});

    const itemBinding = (findExpression(template.nodes, '{{item.name}}') !as e.Interpolation)
                            .expressions[0] as e.PropertyRead;
    const item = itemBinding.receiver;
    const itemTarget = res.getExpressionTarget(item);
    if (!(itemTarget instanceof a.Variable)) {
      return fail('Expected item to point to a Variable');
    }
    expect(itemTarget.value).toBe('$implicit');
    const itemTemplate = res.getTemplateOfSymbol(itemTarget);
    expect(itemTemplate).not.toBeNull();
    expect(res.getNestingLevel(itemTemplate !)).toBe(1);
  });

  it('should match directives when binding a simple template', () => {
    const template =
        parseTemplate('<div *ngFor="let item of items">{{item.name}}</div>', '', {}, '');
    const binder = new R3TargetBinder(makeSelectorMatcher());
    const res = binder.bind({template: template.nodes});
    const tmpl = template.nodes[0] as a.Template;
    const directives = res.getDirectivesOfNode(tmpl) !;
    expect(directives).not.toBeNull();
    expect(directives.length).toBe(1);
    expect(directives[0].name).toBe('NgFor');
  });
});