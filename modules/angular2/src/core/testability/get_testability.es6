import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';
import {global} from 'angular2/src/facade/lang';

class PublicTestability {
  _testabililty: Testability;

  constructor(testability: Testability) {
    this._testability = testability;
  }

  whenStable(callback: Function) {
    this._testability.whenStable(callback);
  }

  findBindings(using, binding: string, exactMatch: boolean) {
    return this._testability.findBindings(using, binding, exactMatch);
  }
}

export class GetTestability {
  static addToWindow(registry: TestabilityRegistry) {
    if (!global.angular2) {
      global.angular2 = {};
    }
    global.angular2.getTestability = function(elem): PublicTestability {
      var testability = registry.findTestabilityInTree(elem);

      if (testability == null) {
        throw new Error('Could not find testability for element.');
      }
      return new PublicTestability(testability);
    };
    global.angular2.resumeBootstrap = function() {
      // Intentionally left blank. This will allow Protractor to run
      // against angular2 without turning off Angular synchronization.
    };
  }
}
