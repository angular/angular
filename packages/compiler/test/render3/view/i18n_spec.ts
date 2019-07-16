/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST} from '../../../src/expression_parser/ast';
import {Lexer} from '../../../src/expression_parser/lexer';
import {Parser} from '../../../src/expression_parser/parser';
import * as i18n from '../../../src/i18n/i18n_ast';
import * as o from '../../../src/output/output_ast';
import * as t from '../../../src/render3/r3_ast';
import {I18nContext} from '../../../src/render3/view/i18n/context';
import {getSerializedI18nContent} from '../../../src/render3/view/i18n/serializer';
import {I18nMeta, formatI18nPlaceholderName, parseI18nMeta} from '../../../src/render3/view/i18n/util';

import {parseR3 as parse} from './util';

const expressionParser = new Parser(new Lexer());
const i18nOf = (element: t.Node & {i18n?: i18n.AST}) => element.i18n !;

describe('I18nContext', () => {
  it('should support i18n content collection', () => {
    const ref = o.variable('ref');
    const ast = new i18n.Message([], {}, {}, '', '', '');
    const ctx = new I18nContext(5, ref, 0, null, ast);

    // basic checks
    expect(ctx.isRoot).toBe(true);
    expect(ctx.isResolved).toBe(true);
    expect(ctx.id).toBe(0);
    expect(ctx.ref).toBe(ref);
    expect(ctx.index).toBe(5);
    expect(ctx.templateIndex).toBe(null);

    const tree = parse('<div i18n>A {{ valueA }} <div> B </div><p *ngIf="visible"> C </p></div>');
    const [boundText, element, template] = (tree.nodes[0] as t.Element).children;

    // data collection checks
    expect(ctx.placeholders.size).toBe(0);
    ctx.appendBoundText(i18nOf(boundText));       // interpolation
    ctx.appendElement(i18nOf(element), 1);        // open tag
    ctx.appendElement(i18nOf(element), 1, true);  // close tag
    ctx.appendTemplate(i18nOf(template), 2);      // open + close tags
    expect(ctx.placeholders.size).toBe(5);

    // binding collection checks
    expect(ctx.bindings.size).toBe(0);
    ctx.appendBinding(expressionParser.parseInterpolation('{{ valueA }}', '', 0) as AST);
    ctx.appendBinding(expressionParser.parseInterpolation('{{ valueB }}', '', 0) as AST);
    expect(ctx.bindings.size).toBe(2);
  });

  it('should support nested contexts', () => {
    const template = `
      <div i18n>
        A {{ valueA }}
        <div>A</div>
        <b *ngIf="visible">
          B {{ valueB }}
          <div>B</div>
          C {{ valueC }}
        </b>
      </div>
    `;
    const tree = parse(template);
    const root = tree.nodes[0] as t.Element;
    const [boundTextA, elementA, templateA] = root.children;
    const elementB = (templateA as t.Template).children[0] as t.Element;
    const [boundTextB, elementC, boundTextC] = (elementB as t.Element).children;

    // simulate I18nContext for a given template
    const ctx = new I18nContext(1, o.variable('ctx'), 0, null, root.i18n !);

    // set data for root ctx
    ctx.appendBoundText(i18nOf(boundTextA));
    ctx.appendBinding(expressionParser.parseInterpolation('{{ valueA }}', '', 0) as AST);
    ctx.appendElement(i18nOf(elementA), 0);
    ctx.appendTemplate(i18nOf(templateA), 1);
    ctx.appendElement(i18nOf(elementA), 0, true);
    expect(ctx.bindings.size).toBe(1);
    expect(ctx.placeholders.size).toBe(5);
    expect(ctx.isResolved).toBe(false);

    // create child context
    const childCtx = ctx.forkChildContext(2, 1, (templateA as t.Template).i18n !);
    expect(childCtx.bindings.size).toBe(0);
    expect(childCtx.isRoot).toBe(false);

    // set data for child context
    childCtx.appendElement(i18nOf(elementB), 0);
    childCtx.appendBoundText(i18nOf(boundTextB));
    childCtx.appendBinding(expressionParser.parseInterpolation('{{ valueB }}', '', 0) as AST);
    childCtx.appendElement(i18nOf(elementC), 1);
    childCtx.appendElement(i18nOf(elementC), 1, true);
    childCtx.appendBoundText(i18nOf(boundTextC));
    childCtx.appendBinding(expressionParser.parseInterpolation('{{ valueC }}', '', 0) as AST);
    childCtx.appendElement(i18nOf(elementB), 0, true);

    expect(childCtx.bindings.size).toBe(2);
    expect(childCtx.placeholders.size).toBe(6);

    // ctx bindings and placeholders are not shared,
    // so root bindings and placeholders do not change
    expect(ctx.bindings.size).toBe(1);
    expect(ctx.placeholders.size).toBe(5);

    // reconcile
    ctx.reconcileChildContext(childCtx);

    // verify placeholders
    const expected = new Map([
      ['INTERPOLATION', '�0�'], ['START_TAG_DIV', '�#0�|�#1:1�'],
      ['START_BOLD_TEXT', '�*1:1��#0:1�'], ['CLOSE_BOLD_TEXT', '�/#0:1��/*1:1�'],
      ['CLOSE_TAG_DIV', '�/#0�|�/#1:1�'], ['INTERPOLATION_1', '�0:1�'],
      ['INTERPOLATION_2', '�1:1�']
    ]);
    const phs = ctx.getSerializedPlaceholders();
    expected.forEach((value, key) => { expect(phs.get(key) !.join('|')).toEqual(value); });

    // placeholders are added into the root ctx
    expect(phs.size).toBe(expected.size);

    // root context is considered resolved now
    expect(ctx.isResolved).toBe(true);

    // bindings are not merged into root ctx
    expect(ctx.bindings.size).toBe(1);
  });

  it('should support templates based on <ng-template>', () => {
    const template = `
      <ng-template i18n>
        Level A
        <ng-template>
          Level B
          <ng-template>
            Level C
          </ng-template>
        </ng-template>
      </ng-template>
    `;
    const tree = parse(template);
    const root = tree.nodes[0] as t.Template;

    const [textA, templateA] = root.children;
    const [textB, templateB] = (templateA as t.Template).children;
    const [textC] = (templateB as t.Template).children;

    // simulate I18nContext for a given template
    const ctxLevelA = new I18nContext(0, o.variable('ctx'), 0, null, root.i18n !);

    // create Level A context
    ctxLevelA.appendTemplate(i18nOf(templateA), 1);
    expect(ctxLevelA.placeholders.size).toBe(2);
    expect(ctxLevelA.isResolved).toBe(false);

    // create Level B context
    const ctxLevelB = ctxLevelA.forkChildContext(0, 1, (templateA as t.Template).i18n !);
    ctxLevelB.appendTemplate(i18nOf(templateB), 1);
    expect(ctxLevelB.isRoot).toBe(false);

    // create Level 2 context
    const ctxLevelC = ctxLevelB.forkChildContext(0, 1, (templateB as t.Template).i18n !);
    expect(ctxLevelC.isRoot).toBe(false);

    // reconcile
    ctxLevelB.reconcileChildContext(ctxLevelC);
    ctxLevelA.reconcileChildContext(ctxLevelB);

    // verify placeholders
    const expected = new Map(
        [['START_TAG_NG-TEMPLATE', '�*1:1�|�*1:2�'], ['CLOSE_TAG_NG-TEMPLATE', '�/*1:2�|�/*1:1�']]);
    const phs = ctxLevelA.getSerializedPlaceholders();
    expected.forEach((value, key) => { expect(phs.get(key) !.join('|')).toEqual(value); });

    // placeholders are added into the root ctx
    expect(phs.size).toBe(expected.size);

    // root context is considered resolved now
    expect(ctxLevelA.isResolved).toBe(true);
  });
});

describe('Utils', () => {
  it('formatI18nPlaceholderName', () => {
    const cases = [
      // input, output
      ['', ''], ['ICU', 'icu'], ['ICU_1', 'icu_1'], ['ICU_1000', 'icu_1000'],
      ['START_TAG_NG-CONTAINER', 'startTagNgContainer'],
      ['START_TAG_NG-CONTAINER_1', 'startTagNgContainer_1'], ['CLOSE_TAG_ITALIC', 'closeTagItalic'],
      ['CLOSE_TAG_BOLD_1', 'closeTagBold_1']
    ];
    cases.forEach(
        ([input, output]) => { expect(formatI18nPlaceholderName(input)).toEqual(output); });
  });

  it('parseI18nMeta', () => {
    const meta = (id?: string, meaning?: string, description?: string) =>
        ({id, meaning, description});
    const cases = [
      ['', meta()],
      ['desc', meta('', '', 'desc')],
      ['desc@@id', meta('id', '', 'desc')],
      ['meaning|desc', meta('', 'meaning', 'desc')],
      ['meaning|desc@@id', meta('id', 'meaning', 'desc')],
      ['@@id', meta('id', '', '')],
    ];
    cases.forEach(([input, output]) => {
      expect(parseI18nMeta(input as string)).toEqual(output as I18nMeta, input);
    });
  });
});

describe('Serializer', () => {
  const serialize = (input: string): string => {
    const tree = parse(`<div i18n>${input}</div>`);
    const root = tree.nodes[0] as t.Element;
    return getSerializedI18nContent(root.i18n as i18n.Message);
  };
  it('should produce output for i18n content', () => {
    const cases = [
      // plain text
      ['Some text', 'Some text'],

      // text with interpolation
      [
        'Some text {{ valueA }} and {{ valueB + valueC }}',
        'Some text {$interpolation} and {$interpolation_1}'
      ],

      // content with HTML tags
      [
        'A <span>B<div>C</div></span> D',
        'A {$startTagSpan}B{$startTagDiv}C{$closeTagDiv}{$closeTagSpan} D'
      ],

      // simple ICU
      ['{age, plural, 10 {ten} other {other}}', '{VAR_PLURAL, plural, 10 {ten} other {other}}'],

      // nested ICUs
      [
        '{age, plural, 10 {ten {size, select, 1 {one} 2 {two} other {2+}}} other {other}}',
        '{VAR_PLURAL, plural, 10 {ten {VAR_SELECT, select, 1 {one} 2 {two} other {2+}}} other {other}}'
      ],

      // ICU with nested HTML
      [
        '{age, plural, 10 {<b>ten</b>} other {<div class="A">other</div>}}',
        '{VAR_PLURAL, plural, 10 {{START_BOLD_TEXT}ten{CLOSE_BOLD_TEXT}} other {{START_TAG_DIV}other{CLOSE_TAG_DIV}}}'
      ]
    ];

    cases.forEach(([input, output]) => { expect(serialize(input)).toEqual(output); });
  });
});
