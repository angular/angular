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

export function main() {
  describe('Message', () => {
    describe("id", () => {
      it("should return a different id for messages with and without the meaning", () => {
        let m1 = new Message("content", "meaning", null);
        let m2 = new Message("content", null, null);
        expect(id(m1)).toEqual(id(m1));
        expect(id(m1)).not.toEqual(id(m2));
      });
    });
  });
}
