// Simulate a simple test
// Reader should look to the testing chapter for the real thing
import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {HeroListComponent} from './heroes/hero-list.component';
let TestComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-tests',
      template: `
    <h2>Tests</h2>
    <p id="tests">Tests {{results.pass}}: {{results.message}}</p>
  `,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TestComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      TestComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    results = runTests();
  };
  return (TestComponent = _classThis);
})();
export {TestComponent};
/////////////////////////////////////
function runTests() {
  const expectedHeroes = [{name: 'A'}, {name: 'B'}];
  const mockService = {getHeroes: () => expectedHeroes};
  it('should have heroes when HeroListComponent created', () => {
    // Pass the mock to the constructor as the Angular injector would
    const component = new HeroListComponent(mockService);
    expect(component.heroes.length).toEqual(expectedHeroes.length);
  });
  return testResults;
}
//////////////////////////////////
// Fake Jasmine infrastructure
let testName;
let testResults;
function expect(actual) {
  return {
    toEqual: (expected) => {
      testResults =
        actual === expected
          ? {pass: 'passed', message: testName}
          : {pass: 'failed', message: `${testName}; expected ${actual} to equal ${expected}.`};
    },
  };
}
function it(label, test) {
  testName = label;
  test();
}
//# sourceMappingURL=test.component.js.map
