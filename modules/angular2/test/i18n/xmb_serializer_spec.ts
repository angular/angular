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
import {serialize} from 'angular2/src/i18n/xmb_serializer';

export function main() {
  describe('Xmb Serialization', () => {
    it("should return an empty message bundle for an empty list of messages",
       () => { expect(serialize([])).toEqual("<message-bundle></message-bundle>"); });

    it("should serialize messages without desc", () => {
      let m = new Message("content", "meaning", null);
      let expected = `<message-bundle><msg id='${id(m)}'>content</msg></message-bundle>`;
      expect(serialize([m])).toEqual(expected);
    });

    it("should serialize messages with desc", () => {
      let m = new Message("content", "meaning", "description");
      let expected =
          `<message-bundle><msg id='${id(m)}' desc='description'>content</msg></message-bundle>`;
      expect(serialize([m])).toEqual(expected);
    });
  });
}
