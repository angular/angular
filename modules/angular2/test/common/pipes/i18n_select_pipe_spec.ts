import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach
} from 'angular2/testing_internal';

import {I18nSelectPipe} from 'angular2/common';
import {PipeResolver} from 'angular2/src/compiler/pipe_resolver';

export function main() {
  describe("I18nSelectPipe", () => {
    var pipe;
    var mapping = {'male': 'Invite him.', 'female': 'Invite her.', 'other': 'Invite them.'};

    beforeEach(() => { pipe = new I18nSelectPipe(); });

    it('should be marked as pure',
       () => { expect(new PipeResolver().resolve(I18nSelectPipe).pure).toEqual(true); });

    describe("transform", () => {
      it("should return male text if value is male", () => {
        var val = pipe.transform('male', [mapping]);
        expect(val).toEqual('Invite him.');
      });

      it("should return female text if value is female", () => {
        var val = pipe.transform('female', [mapping]);
        expect(val).toEqual('Invite her.');
      });

      it("should return other text if value is anything other than male or female", () => {
        var val = pipe.transform('Anything else', [mapping]);
        expect(val).toEqual('Invite them.');
      });

      it("should use 'other' if value is undefined", () => {
        var gender;
        var val = pipe.transform(gender, [mapping]);
        expect(val).toEqual('Invite them.');
      });

      it("should not support bad arguments",
         () => { expect(() => pipe.transform('male', ['hey'])).toThrowError(); });
    });

  });
}
