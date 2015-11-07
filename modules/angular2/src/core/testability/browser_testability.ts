import {
  TestabilityRegistry,
  Testability,
  GetTestability,
  setTestabilityGetter
} from 'angular2/src/core/testability/testability';
import {global} from 'angular2/src/facade/lang';

class PublicTestability {
  /** @internal */
  _testability: Testability;

  constructor(testability: Testability) { this._testability = testability; }

  isStable(): boolean { return this._testability.isStable(); }

  whenStable(callback: Function) { this._testability.whenStable(callback); }

  findBindings(using: any, provider: string, exactMatch: boolean): any[] {
    return this.findProviders(using, provider, exactMatch);
  }

  findProviders(using: any, provider: string, exactMatch: boolean): any[] {
    return this._testability.findBindings(using, provider, exactMatch);
  }
}

export class BrowserGetTestability implements GetTestability {
  static init() { setTestabilityGetter(new BrowserGetTestability()); }

  addToWindow(registry: TestabilityRegistry): void {
    global.getAngularTestability = function(elem: Element,
                                            findInAncestors: boolean = true): PublicTestability {
      var testability = registry.findTestabilityInTree(elem, findInAncestors);

      if (testability == null) {
        throw new Error('Could not find testability for element.');
      }
      return new PublicTestability(testability);
    };
    global.getAllAngularTestabilities = function(): PublicTestability[] {
      var testabilities = registry.getAllTestabilities();
      return testabilities.map((testability) => { return new PublicTestability(testability); });
    };
  }
}
