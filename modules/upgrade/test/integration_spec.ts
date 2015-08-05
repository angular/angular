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
  xit,
} from 'angular2/test_lib';


export function main() {
  describe('upgrade integration',
           () => { it('should run', () => { expect(angular.version.major).toBe(1); }); });
}
