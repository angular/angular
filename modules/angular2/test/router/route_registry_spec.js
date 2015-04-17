import {
  AsyncTestCompleter,
  describe,
  it, iit,
  ddescribe, expect,
  inject, beforeEach,
  SpyObject} from 'angular2/test_lib';

import {RouteRegistry} from 'angular2/src/router/route_registry';

export function main() {
  describe('RouteRegistry', () => {
    var registry;
    var handler = {};
    var handler2 = {};

    beforeEach(() => {
      registry = new RouteRegistry();
    });

    it('should match the full URL', () => {
      registry.config('/', '/', handler);
      registry.config('/', '/test', handler2);

      var instruction = registry.recognize('/test');

      expect(instruction.getChildInstruction('default').component).toBe(handler2);
    });

    it('should match the full URL recursively', () => {
      registry.config('/', '/first', handler);
      registry.config(handler, '/second', handler2);

      var instruction = registry.recognize('/first/second');

      expect(instruction.getChildInstruction('default').component).toBe(handler);
      expect(instruction.getChildInstruction('default').getChildInstruction('default').component).toBe(handler2);
    });

  });
}
