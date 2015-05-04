import {
  AsyncTestCompleter,
  describe,
  it, iit,
  ddescribe, expect,
  inject, beforeEach,
  SpyObject} from 'angular2/test_lib';

import {RouteRegistry} from 'angular2/src/router/route_registry';
import {RouteConfig} from 'angular2/src/router/route_config_impl';

export function main() {
  describe('RouteRegistry', () => {
    var registry,
        rootHostComponent = new Object();

    beforeEach(() => {
      registry = new RouteRegistry();
    });

    it('should match the full URL', () => {
      registry.config(rootHostComponent, {'path': '/', 'component': DummyCompA});
      registry.config(rootHostComponent, {'path': '/test', 'component': DummyCompB});

      var instruction = registry.recognize('/test', rootHostComponent);

      expect(instruction.getChildInstruction('default').component).toBe(DummyCompB);
    });

    it('should match the full URL recursively', () => {
      registry.config(rootHostComponent, {'path': '/first', 'component': DummyParentComp});

      var instruction = registry.recognize('/first/second', rootHostComponent);

      var parentInstruction = instruction.getChildInstruction('default');
      var childInstruction = parentInstruction.getChildInstruction('default');

      expect(parentInstruction.component).toBe(DummyParentComp);
      expect(childInstruction.component).toBe(DummyCompB);
    });

  });
}

@RouteConfig([
  {'path': '/second', 'component': DummyCompB }
])
class DummyParentComp {}

class DummyCompA {}
class DummyCompB {}
