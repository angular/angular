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

import {Message, id} from 'angular2/src/i18n/message';
import {serializeXmb} from 'angular2/src/i18n/xmb_serializer';

export function main() {
  describe('Xmb Serialization', () => {
    it("should return an empty message bundle for an empty list of messages",
       () => { expect(serializeXmb([])).toEqual("<message-bundle></message-bundle>"); });

    it("should serializeXmb messages without desc", () => {
      let m = new Message("content", "meaning", null);
      let expected = `<message-bundle><msg id='${id(m)}'>content</msg></message-bundle>`;
      expect(serializeXmb([m])).toEqual(expected);
    });

    it("should serializeXmb messages with desc", () => {
      let m = new Message("content", "meaning", "description");
      let expected =
          `<message-bundle><msg id='${id(m)}' desc='description'>content</msg></message-bundle>`;
      expect(serializeXmb([m])).toEqual(expected);
    });
  });
}
