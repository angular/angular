/* tslint:disable */
// Simulate a simple test
// Reader should look to the testing chapter for the real thing

import { Component } from '@angular/core';

import { Hero  } from './heroes/hero';
import { HeroService } from './heroes/hero.service';
import { HeroListComponent } from './heroes/hero-list.component';

@Component({
  selector: 'app-tests',
  template: `
    <h2>Tests</h2>
    <p id="tests">Tests {{results.pass}}: {{results.message}}</p>
  `
})
export class TestComponent {
  results = runTests();
}

/////////////////////////////////////
function runTests() {

  // #docregion spec
  const expectedHeroes = [{name: 'A'}, {name: 'B'}]
  const mockService = <HeroService> {getHeroes: () => expectedHeroes }

  it('should have heroes when HeroListComponent created', () => {
    // 목 객체를 생성자에 전달하면 Angular 인젝터가 알아서 처리합니다.
    const component = new HeroListComponent(mockService);
    expect(component.heroes.length).toEqual(expectedHeroes.length);
  });
  // #enddocregion spec

  return testResults;
}

//////////////////////////////////
// Fake Jasmine infrastructure
var testName: string;
var testResults: {pass: string; message: string};

function expect(actual: any) {
  return {
    toEqual: function(expected: any){
      testResults = actual === expected ?
        {pass: 'passed', message: testName} :
        {pass: 'failed', message: `${testName}; expected ${actual} to equal ${expected}.`};
    }
  };
}

function it(label: string, test: () => void) {
  testName = label;
  test();
}
