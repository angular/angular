import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit
} from 'angular2/testing_internal';

import {I18nHtmlParser} from 'angular2/src/i18n/i18n_html_parser';
import {Message, id} from 'angular2/src/i18n/message';
import {Parser} from 'angular2/src/compiler/expression_parser/parser';
import {Lexer} from 'angular2/src/compiler/expression_parser/lexer';

import {StringMapWrapper} from 'angular2/src/facade/collection';
import {HtmlParser, HtmlParseTreeResult} from 'angular2/src/compiler/html_parser';
import {
  HtmlAst,
  HtmlAstVisitor,
  HtmlElementAst,
  HtmlAttrAst,
  HtmlTextAst,
  HtmlCommentAst,
  htmlVisitAll
} from 'angular2/src/compiler/html_ast';
import {serializeXmb, deserializeXmb} from 'angular2/src/i18n/xmb_serializer';
import {ParseError, ParseLocation} from 'angular2/src/compiler/parse_util';
import {humanizeDom} from '../../test/compiler/html_ast_spec_utils';

export function main() {
  describe('I18nHtmlParser', () => {
    function parse(template: string, messages: {[key: string]: string}): HtmlParseTreeResult {
      var parser = new Parser(new Lexer());
      let htmlParser = new HtmlParser();

      let msgs = '';
      StringMapWrapper.forEach(messages, (v, k) => msgs += `<msg id="${k}">${v}</msg>`);
      let res = deserializeXmb(`<message-bundle>${msgs}</message-bundle>`, 'someUrl');

      return new I18nHtmlParser(htmlParser, parser, res.content, res.messages)
          .parse(template, "someurl", true);
    }

    it("should delegate to the provided parser when no i18n", () => {
      expect(humanizeDom(parse('<div>a</div>', {})))
          .toEqual([[HtmlElementAst, 'div', 0], [HtmlTextAst, 'a', 1]]);
    });

    it("should replace attributes", () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message("some message", "meaning", null))] = "another message";

      expect(humanizeDom(parse("<div value='some message' i18n-value='meaning|comment'></div>",
                               translations)))
          .toEqual([[HtmlElementAst, 'div', 0], [HtmlAttrAst, 'value', 'another message']]);
    });

    it("should replace elements with the i18n attr", () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message("message", "meaning", null))] = "another message";

      expect(humanizeDom(parse("<div i18n='meaning|desc'>message</div>", translations)))
          .toEqual([[HtmlElementAst, 'div', 0], [HtmlTextAst, 'another message', 1]]);
    });

    it("should handle interpolation", () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message('<ph name="0"/> and <ph name="1"/>', null, null))] =
          '<ph name="1"/> or <ph name="0"/>';

      expect(humanizeDom(parse("<div value='{{a}} and {{b}}' i18n-value></div>", translations)))
          .toEqual([[HtmlElementAst, 'div', 0], [HtmlAttrAst, 'value', '{{b}} or {{a}}']]);
    });

    it('should handle interpolation with custom placeholder names', () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message('<ph name="FIRST"/> and <ph name="SECOND"/>', null, null))] =
          '<ph name="SECOND"/> or <ph name="FIRST"/>';

      expect(
          humanizeDom(parse(
              `<div value='{{a //i18n(ph="FIRST")}} and {{b //i18n(ph="SECOND")}}' i18n-value></div>`,
              translations)))
          .toEqual([
            [HtmlElementAst, 'div', 0],
            [HtmlAttrAst, 'value', '{{b //i18n(ph="SECOND")}} or {{a //i18n(ph="FIRST")}}']
          ]);
    });

    it('should handle interpolation with duplicate placeholder names', () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message('<ph name="FIRST"/> and <ph name="FIRST_1"/>', null, null))] =
          '<ph name="FIRST_1"/> or <ph name="FIRST"/>';

      expect(
          humanizeDom(parse(
              `<div value='{{a //i18n(ph="FIRST")}} and {{b //i18n(ph="FIRST")}}' i18n-value></div>`,
              translations)))
          .toEqual([
            [HtmlElementAst, 'div', 0],
            [HtmlAttrAst, 'value', '{{b //i18n(ph="FIRST")}} or {{a //i18n(ph="FIRST")}}']
          ]);
    });

    it("should handle nested html", () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message('<ph name="e0">a</ph><ph name="e2">b</ph>', null, null))] =
          '<ph name="e2">B</ph><ph name="e0">A</ph>';

      expect(humanizeDom(parse('<div i18n><a>a</a><b>b</b></div>', translations)))
          .toEqual([
            [HtmlElementAst, 'div', 0],
            [HtmlElementAst, 'b', 1],
            [HtmlTextAst, 'B', 2],
            [HtmlElementAst, 'a', 1],
            [HtmlTextAst, 'A', 2],
          ]);
    });

    it("should support interpolation", () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message(
          '<ph name="e0">a</ph><ph name="e2"><ph name="t3">b<ph name="0"/></ph></ph>', null,
          null))] = '<ph name="e2"><ph name="t3"><ph name="0"/>B</ph></ph><ph name="e0">A</ph>';
      expect(humanizeDom(parse('<div i18n><a>a</a><b>b{{i}}</b></div>', translations)))
          .toEqual([
            [HtmlElementAst, 'div', 0],
            [HtmlElementAst, 'b', 1],
            [HtmlTextAst, '{{i}}B', 2],
            [HtmlElementAst, 'a', 1],
            [HtmlTextAst, 'A', 2],
          ]);
    });

    it("should i18n attributes of placeholder elements", () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message('<ph name="e0">a</ph>', null, null))] = '<ph name="e0">A</ph>';
      translations[id(new Message('b', null, null))] = 'B';

      expect(humanizeDom(parse('<div i18n><a value="b" i18n-value>a</a></div>', translations)))
          .toEqual([
            [HtmlElementAst, 'div', 0],
            [HtmlElementAst, 'a', 1],
            [HtmlAttrAst, 'value', "B"],
            [HtmlTextAst, 'A', 2],
          ]);
    });

    it("should preserve non-i18n attributes", () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message('message', null, null))] = 'another message';

      expect(humanizeDom(parse('<div i18n value="b">message</div>', translations)))
          .toEqual([
            [HtmlElementAst, 'div', 0],
            [HtmlAttrAst, 'value', "b"],
            [HtmlTextAst, 'another message', 1]
          ]);
    });

    it('should extract from partitions', () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message('message1', 'meaning1', null))] = 'another message1';
      translations[id(new Message('message2', 'meaning2', null))] = 'another message2';

      let res = parse(`<!-- i18n: meaning1|desc1 -->message1<!-- /i18n --><!-- i18n: meaning2|desc2 -->message2<!-- /i18n -->`, translations);

      expect(humanizeDom(res))
          .toEqual([
            [HtmlTextAst, 'another message1', 0],
            [HtmlTextAst, 'another message2', 0],
          ]);
    });

    it("should preserve original positions", () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message('<ph name="e0">a</ph><ph name="e2">b</ph>', null, null))] =
          '<ph name="e2">B</ph><ph name="e0">A</ph>';

      let res =
          (<any>parse('<div i18n><a>a</a><b>b</b></div>', translations).rootNodes[0]).children;

      expect(res[0].sourceSpan.start.offset).toEqual(18);
      expect(res[1].sourceSpan.start.offset).toEqual(10);
    });

    it("should handle the plural expansion form", () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message('zero<ph name="e1">bold</ph>', "plural_0", null))] =
          'ZERO<ph name="e1">BOLD</ph>';

      let res = parse(`{messages.length, plural,=0 {zero<b>bold</b>}}`, translations);

      expect(humanizeDom(res))
          .toEqual([
            [HtmlElementAst, 'ul', 0],
            [HtmlAttrAst, '[ngPlural]', 'messages.length'],
            [HtmlElementAst, 'template', 1],
            [HtmlAttrAst, 'ngPluralCase', '0'],
            [HtmlElementAst, 'li', 2],
            [HtmlTextAst, 'ZERO', 3],
            [HtmlElementAst, 'b', 3],
            [HtmlTextAst, 'BOLD', 4]
          ]);
    });

    it("should handle nested expansion forms", () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message('m', "gender_m", null))] = 'M';

      let res = parse(`{messages.length, plural, =0 { {p.gender, gender, =m {m}} }}`, translations);

      expect(humanizeDom(res))
          .toEqual([
            [HtmlElementAst, 'ul', 0],
            [HtmlAttrAst, '[ngPlural]', 'messages.length'],
            [HtmlElementAst, 'template', 1],
            [HtmlAttrAst, 'ngPluralCase', '0'],
            [HtmlElementAst, 'li', 2],

            [HtmlElementAst, 'ul', 3],
            [HtmlAttrAst, '[ngSwitch]', 'p.gender'],
            [HtmlElementAst, 'template', 4],
            [HtmlAttrAst, 'ngSwitchWhen', 'm'],
            [HtmlElementAst, 'li', 5],
            [HtmlTextAst, 'M', 6],

            [HtmlTextAst, ' ', 3]
          ]);
    });

    it("should correctly set source code positions", () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message('<ph name="e0">bold</ph>', "plural_0", null))] =
          '<ph name="e0">BOLD</ph>';

      let nodes = parse(`{messages.length, plural,=0 {<b>bold</b>}}`, translations).rootNodes;

      let ul: HtmlElementAst = <HtmlElementAst>nodes[0];

      expect(ul.sourceSpan.start.col).toEqual(0);
      expect(ul.sourceSpan.end.col).toEqual(42);

      expect(ul.startSourceSpan.start.col).toEqual(0);
      expect(ul.startSourceSpan.end.col).toEqual(42);

      expect(ul.endSourceSpan.start.col).toEqual(0);
      expect(ul.endSourceSpan.end.col).toEqual(42);

      let switchExp = ul.attrs[0];
      expect(switchExp.sourceSpan.start.col).toEqual(1);
      expect(switchExp.sourceSpan.end.col).toEqual(16);

      let template: HtmlElementAst = <HtmlElementAst>ul.children[0];
      expect(template.sourceSpan.start.col).toEqual(26);
      expect(template.sourceSpan.end.col).toEqual(41);

      let switchCheck = template.attrs[0];
      expect(switchCheck.sourceSpan.start.col).toEqual(26);
      expect(switchCheck.sourceSpan.end.col).toEqual(28);

      let li: HtmlElementAst = <HtmlElementAst>template.children[0];
      expect(li.sourceSpan.start.col).toEqual(26);
      expect(li.sourceSpan.end.col).toEqual(41);

      let b: HtmlElementAst = <HtmlElementAst>li.children[0];
      expect(b.sourceSpan.start.col).toEqual(29);
      expect(b.sourceSpan.end.col).toEqual(32);
    });

    it("should handle other special forms", () => {
      let translations: {[key: string]: string} = {};
      translations[id(new Message('m', "gender_male", null))] = 'M';

      let res = parse(`{person.gender, gender,=male {m}}`, translations);

      expect(humanizeDom(res))
          .toEqual([
            [HtmlElementAst, 'ul', 0],
            [HtmlAttrAst, '[ngSwitch]', 'person.gender'],
            [HtmlElementAst, 'template', 1],
            [HtmlAttrAst, 'ngSwitchWhen', 'male'],
            [HtmlElementAst, 'li', 2],
            [HtmlTextAst, 'M', 3],
          ]);
    });

    describe("errors", () => {
      it("should error when giving an invalid template", () => {
        expect(humanizeErrors(parse("<a>a</b>", {}).errors))
            .toEqual(['Unexpected closing tag "b"']);
      });

      it("should error when no matching message (attr)", () => {
        let mid = id(new Message("some message", null, null));
        expect(humanizeErrors(parse("<div value='some message' i18n-value></div>", {}).errors))
            .toEqual([`Cannot find message for id '${mid}', content 'some message'.`]);
      });

      it("should error when no matching message (text)", () => {
        let mid = id(new Message("some message", null, null));
        expect(humanizeErrors(parse("<div i18n>some message</div>", {}).errors))
            .toEqual([`Cannot find message for id '${mid}', content 'some message'.`]);
      });

      it("should error when a non-placeholder element appears in translation", () => {
        let translations: {[key: string]: string} = {};
        translations[id(new Message("some message", null, null))] = "<a>a</a>";

        expect(humanizeErrors(parse("<div i18n>some message</div>", translations).errors))
            .toEqual([`Unexpected tag "a". Only "ph" tags are allowed.`]);
      });

      it("should error when a placeholder element does not have the name attribute", () => {
        let translations: {[key: string]: string} = {};
        translations[id(new Message("some message", null, null))] = "<ph>a</ph>";

        expect(humanizeErrors(parse("<div i18n>some message</div>", translations).errors))
            .toEqual([`Missing "name" attribute.`]);
      });

      it("should error when the translation refers to an invalid expression", () => {
        let translations: {[key: string]: string} = {};
        translations[id(new Message('hi <ph name="0"/>', null, null))] = 'hi <ph name="99"/>';

        expect(
            humanizeErrors(parse("<div value='hi {{a}}' i18n-value></div>", translations).errors))
            .toEqual(["Invalid interpolation name '99'"]);
      });

    });
  });
}

function humanizeErrors(errors: ParseError[]): string[] {
  return errors.map(error => error.msg);
}
