// Simulate a simple test
// Reader should look to the testing chapter for the real thing

import {Component} from '@angular/core';

import {Hero} from './heroes/hero';
import {HeroService} from './heroes/hero.service';
import {HeroListComponent} from './heroes/hero-list.component';

@Component({
  selector: 'app-tests',
  template: `
    <h2>Tests</h2>
    <p id="tests">Tests {{results.pass}}: {{results.message}}</p>
  `,
})
export class TestComponent {
  results = runTests();
}

/////////////////////////////////////
function runTests() {
  const expectedHeroes = [{name: 'A'}, {name: 'B'}];
  const mockService = {getHeroes: () => expectedHeroes} as HeroService;

  it('should have heroes when HeroListComponent created', () => {
    // Pass the mock to the constructor as the Angular injector would
    const component = new HeroListComponent(mockService);
    expect(component.heroes.length).toEqual(expectedHeroes.length);
  });

  return testResults;
}

//////////////////////////////////
// Fake Jasmine infrastructure
let testName: string;
let testResults: {pass: string; message: string};

function expect(actual: any) {
  return {
    toEqual: (expected: any) => {
      testResults =
        actual === expected
          ? {pass: 'passed', message: testName}
          : {pass: 'failed', message: `${testName}; expected ${actual} to equal ${expected}.`};
    },
  };
}

function it(label: string, test: () => void) {
  testName = label;
  test();
}
