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

import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {MessageExtractor, removeDuplicates} from 'angular2/src/i18n/message_extractor';
import {Message} from 'angular2/src/i18n/message';
import {Parser} from 'angular2/src/core/change_detection/parser/parser';
import {Lexer} from 'angular2/src/core/change_detection/parser/lexer';

export function main() {
  describe('MessageExtractor', () => {
    let extractor: MessageExtractor;

    beforeEach(() => {
      let htmlParser = new HtmlParser();
      var parser = new Parser(new Lexer());
      extractor = new MessageExtractor(htmlParser, parser);
    });

    it('should extract from elements with the i18n attr', () => {
      let res = extractor.extract("<div i18n='meaning|desc'>message</div>", "someurl");
      expect(res.messages).toEqual([new Message("message", 'meaning', 'desc')]);
    });

    it('should extract from elements with the i18n attr without a desc', () => {
      let res = extractor.extract("<div i18n='meaning'>message</div>", "someurl");
      expect(res.messages).toEqual([new Message("message", 'meaning', null)]);
    });

    it('should extract from elements with the i18n attr without a meaning', () => {
      let res = extractor.extract("<div i18n>message</div>", "someurl");
      expect(res.messages).toEqual([new Message("message", null, null)]);
    });

    it('should extract from attributes', () => {
      let res = extractor.extract(`
        <div
          title1='message1' i18n-title1='meaning1|desc1'
          title2='message2' i18n-title2='meaning2|desc2'>
        </div>
      `,
                                  "someurl");

      expect(res.messages)
          .toEqual([
            new Message("message1", "meaning1", "desc1"),
            new Message("message2", "meaning2", "desc2")
          ]);
    });

    it('should error on i18n attributes without matching "real" attributes', () => {
      let res = extractor.extract(`
        <div
          title1='message1' i18n-title1='meaning1|desc1' i18n-title2='meaning2|desc2'>
        </div>
      `,
                                  "someurl");

      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].msg).toEqual("Missing attribute 'title2'.");
    });

    it('should extract from partitions', () => {
      let res = extractor.extract(`
         <!-- i18n: meaning1|desc1 -->message1<!-- /i18n -->
         <!-- i18n: meaning2|desc2 -->message2<!-- /i18n -->`,
                                  "someUrl");

      expect(res.messages)
          .toEqual([
            new Message("message1", "meaning1", "desc1"),
            new Message("message2", "meaning2", "desc2")
          ]);
    });

    it('should ignore other comments', () => {
      let res = extractor.extract(`
         <!-- i18n: meaning1|desc1 --><!-- other -->message1<!-- /i18n -->`,
                                  "someUrl");

      expect(res.messages).toEqual([new Message("message1", "meaning1", "desc1")]);
    });

    it('should error when cannot find a matching desc', () => {
      let res = extractor.extract(`
         <!-- i18n: meaning1|desc1 -->message1`,
                                  "someUrl");

      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].msg).toEqual("Missing closing 'i18n' comment.");
    });

    it('should replace interpolation with placeholders (text nodes)', () => {
      let res = extractor.extract("<div i18n>Hi {{one}} and {{two}}</div>", "someurl");
      expect(res.messages).toEqual([new Message("Hi {{I0}} and {{I1}}", null, null)]);
    });

    it('should replace interpolation with placeholders (attributes)', () => {
      let res =
          extractor.extract("<div title='Hi {{one}} and {{two}}' i18n-title></div>", "someurl");
      expect(res.messages).toEqual([new Message("Hi {{I0}} and {{I1}}", null, null)]);
    });

    it('should ignore errors in interpolation', () => {
      let res = extractor.extract("<div i18n>Hi {{on???.s}}</div>", "someurl");
      expect(res.messages).toEqual([new Message("Hi {{on???.s}}", null, null)]);
    });

    it("should return parse errors when the template is invalid", () => {
      let res = extractor.extract("<input&#Besfs", "someurl");
      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].msg).toEqual('Unexpected character "s"');
    });

    it("should handle html content", () => {
      let res = extractor.extract('<div i18n><div attr="value">message</div></div>', "someurl");
      expect(res.messages).toEqual([new Message('<div attr="value">message</div>', null, null)]);
    });

    it("should extract from nested elements", () => {
      let res = extractor.extract(
          '<div title="message1" i18n-title="meaning1|desc1"><div i18n="meaning2|desc2">message2</div></div>',
          "someurl");
      expect(res.messages)
          .toEqual([
            new Message("message2", "meaning2", "desc2"),
            new Message("message1", "meaning1", "desc1")
          ]);
    });

    it("should extract messages from attributes in i18n blocks", () => {
      let res = extractor.extract(
          '<div i18n><div attr="value" i18n-attr="meaning|desc">message</div></div>', "someurl");
      expect(res.messages)
          .toEqual([
            new Message('<div attr="value">message</div>', null, null),
            new Message('value', "meaning", "desc")
          ]);
    });

    it("should remove duplicate messages", () => {
      let res = extractor.extract(`
         <!-- i18n: meaning|desc1 -->message<!-- /i18n -->
         <!-- i18n: meaning|desc2 -->message<!-- /i18n -->`,
                                  "someUrl");

      expect(removeDuplicates(res.messages))
          .toEqual([
            new Message("message", "meaning", "desc1"),
          ]);
    });
  });
}
