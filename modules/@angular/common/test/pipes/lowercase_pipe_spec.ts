import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach
} from '@angular/core/testing/testing_internal';

import {LowerCasePipe} from '@angular/common';

export function main() {
  describe("LowerCasePipe", () => {
    var upper: any /** TODO #9100 */;
    var lower: any /** TODO #9100 */;
    var pipe: any /** TODO #9100 */;

    beforeEach(() => {
      lower = 'something';
      upper = 'SOMETHING';
      pipe = new LowerCasePipe();
    });

    describe("transform", () => {
      it("should return lowercase", () => {
        var val = pipe.transform(upper);
        expect(val).toEqual(lower);
      });

      it("should lowercase when there is a new value", () => {
        var val = pipe.transform(upper);
        expect(val).toEqual(lower);
        var val2 = pipe.transform('WAT');
        expect(val2).toEqual('wat');
      });

      it("should not support other objects",
         () => { expect(() => pipe.transform(new Object())).toThrowError(); });
    });

  });
}
