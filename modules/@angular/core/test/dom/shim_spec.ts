import {
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit
} from '@angular/core/testing/testing_internal';

export function main() {
  describe('Shim', () => {

    it('should provide correct function.name ', () => {
      var functionWithoutName = identity(() => function(_) {});
      function foo(_){};

      expect((<any>functionWithoutName).name).toBeFalsy();
      expect((<any>foo).name).toEqual('foo');
    });

  });
}

function identity(a) {
  return a;
}
