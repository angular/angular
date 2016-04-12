import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit
} from 'angular2/testing_internal';

export function main() {
  describe('Shim', () => {

    it('should provide correct function.name ', () => {
      var functionWithoutName = function(_) {};
      function foo(_){};

      expect((<any>functionWithoutName).name).toEqual('');
      expect((<any>foo).name).toEqual('foo');
    });

  });
}
