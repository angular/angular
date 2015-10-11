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

import {PipeProvider} from 'angular2/src/core/pipes/pipe_provider';
import {Pipe} from 'angular2/src/core/metadata';

class MyPipe {}

export function main() {
  describe("PipeProvider", () => {
    it('should create a provider out of a type', () => {
      var provider = PipeProvider.createFromType(MyPipe, new Pipe({name: 'my-pipe'}));
      expect(provider.name).toEqual('my-pipe');
      expect(provider.key.token).toEqual(MyPipe);
    });
  });
}
