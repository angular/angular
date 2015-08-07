import {
  ddescribe,
  xdescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach
} from 'angular2/test_lib';

import {PipeBinding} from 'angular2/src/core/pipes/pipe_binding';
import {Pipe} from 'angular2/src/core/annotations_impl/annotations';

class MyPipe {}

export function main() {
  describe("PipeBinding", () => {
    it('should create a binding out of a type', () => {
      var binding = PipeBinding.createFromType(MyPipe, new Pipe({name: 'my-pipe'}));
      expect(binding.name).toEqual('my-pipe');
      expect(binding.factory()).toBeAnInstanceOf(MyPipe);
      expect(binding.dependencies.length).toEqual(0);
    });
  });
}
