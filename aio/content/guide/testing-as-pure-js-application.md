## Unit Testing Angular App As Pure JS Application

Unit testing is the low level testing. It's goal is to tests units. Unit means any simple part of application.
It can be module as unit / component as unit or method as unit.

In JavaScript unit-testing mostly means testing of methods. In this context the goal of this testing is to cover <b>only tested methods functionality</b>.

To simplify the tests and make them more stable and predictable they should be independent.

Independence in JavaScript mostly compatible to Functional Programming e.g pure functions.
Each pure function should return the same result with the same passed arguments and does not have any side effects (e.g. closures)
```javascript
 const pureFunction = (arg) => arg;

 const notPureFunction = () => arg;
```

In the test we need to follow the same principe to simplify it.

1. each tested method should be wrapped to the individual scope with initialization on the root level to perform it before each tests
```javascript
 describe('#testedMethodScope', () => {
  beforeEach(() => {/*initialization*/}); 
 });
```

2. Each case should be performed with not dirty state
```javascript
// invalid 
 let value = true;
 it('value should be truthy', () => {
  value = false;
  expect(value).toBeFalse();
 });

 it('value should be truthy', () => {
  expect(value).toBeTruthy();
 });
```

 ```javascript
 // valid 
 let value;

 beforeEach(() => {
   value = true
 });

 it('value should be truthy', () => {
   value = false;
   expect(value).toBeFalse();
 });
 
 it('value should be truthy', () => {
   expect(value).toBeTruthy();
 });
 ```

3. Each test should not test another methods in the tested method
```typescript
 const testedMethod = (params: any, dependencyWithHandler: any) => dependencyWithHandler.handler(params);
 
 // invalid
 expect(testedMethod(realParams, realDependencyWithOwnImplementation)).toEqual(originalResult);

 // valid
 let comfortableMockedParams: any;
 let comfortablePredictableTestResult: any = '';
 let mockedDataWithDefinedMethod: any = {
  handler: () => comfortablePredictableTestResult
 };
 expect(testedMethod(comfortableMockedParams, mockedDataWithDefinedMethod)).toBe(comfortablePredictableTestResult);
```

4. Each dependency and data used in the tested method should be mocked or replaced to the spy
```typescript
 const testedMethod = (params: any, dependencyWithHandler: any) => dependencyWithHandler.handler(params);
 
 // all the values should be initialized in the main scope of the tested callback (describe(() => { /* here */})) 
 let dependency: any;
 let handler: any;
 
 // definition of "static" or constant can be performed once
 const expectedResult = 'expectedResult';
 
 // static arguments can be defined once too 
 const params = 'params';
 
 // definition of "dynamic" values should be performed before each tests to clean up test's state 
 beforeEach(() => {
   handler = jasmine.createSpy('handler').and.returnvalue(expectedResult);
   dependency = { handler };
 });

 it('should works', () => {
   expect(testedMethod(params, dependency)).toBe(expectedResult);
 });
 
 // to validate clean up of state
 it('value should be truthy', () => {
   expect(handler).not.toHaveBeenCalled();
 });
 ```

5. Each type should be simplified as possible
```typescript
 interface ComplicatedDataType {
    nestedComplicatedDataTypes: AnotherComplicatedType[];
    primitiveField: boolean;
 }

 const productionMethod1 = (params: ComplicatedDataType, dependency: any) => dependency.handler(params);
 const productionMethod2 = ({ nestedComplicatedDataTypes }: ComplicatedDataType, {handler}: any) => handler(nestedComplicatedDataTypes);
 
 // use any to avoid following complicated data structure to reduce mock/stub data size and simplify tests
 let testedMethod1: any = productionMethod1;
 let testedMethod2: any = productionMethod2;

 const params = 'any primitive field which can be unique for test';
 const nestedComplicatedDataTypes = 'nestedComplicatedDataTypes';

 const handler = jasmine.createSpy('handler');

 // pass only used data
 testedMethod1(params, { handler }); 
 expect(handler).toHaveBeenCalledWith(params);
 
 testedMethod2({nestedComplicatedDataTypes}, { handler }); 
 expect(handler).toHaveBeenCalledWith(nestedComplicatedDataTypes);
```

6. Tests should avoid any mutations
```typescript
 // invalid
 const spy = jasmine.createSpy('spy'); 

 it('should call spy', () => {
  spy();
  expect(spy).toHaveBeenCalled();
 });

 it('should not call spy', () => {
  expect(spy).not.toHaveBeenCalled(); // failed
 })
```

```typescript
 // valid
 let spy: any;

 beforeEach(() => {
  spy = jasmine.createSpy('spy');
 });

 it('should call spy', () => {
  spy();
  expect(spy).toHaveBeenCalled();
 });

 it('should not call spy', () => {
  expect(spy).not.toHaveBeenCalled(); // success
 })
```

7. Common tips
- do not forget any angular's component (e.g. services/directives etc.) are simple classes (function constructor) with specific annotations
```typescript
 import { Component, Injectable } from '@angular/core';
 
 class Service {
   public serviceMethod() {}
 }

 class JavaScriptComponent {
  constructor(private service: any) {}

  public method() {} 
 } 
 
 const service = new Service();
 const component = new JavaScriptComponent(service);
 
 const angularService = new Injectable(/*list of annotations*/)(Service);
 const angularComponent = new Component(/*list of annotations*/)(JavaScriptComponent);
 
 expect(component.method).toBe(angularComponent.method);
 expect(service.serviceMethod).toBe(angularService.serviceMethod);
```

- name dependencies and their methods as in production code to simplify their search/debug
```typescript
 // for tested instances
 let component = new CustomNameComponent(); // valid
 let cnc = new CustomNameComponent(); // invalid

 let service = new CustomNameService(); // valid
 let cns = new CustomNameService(); // invalid

 // for their dependencies and spies.
 let httpService: any; // valid
 let httpServiceSpy: any; // invalid
 let httpServiceMock: any; // invalid

 let dependencyMethod: any; // valid
 let dependencyMethodSpy: any; // invalid
```

- use named only spies and directly assigned dependencies methods for auto-completing and simpler debug
```typescript
 // spies 
 let validSpy = jasmine.createSpy('spy'); // valid
 let invalidSpy = jasmine.createSpy(); // invalid
 let DI = {
   anotherSpy: jasmine.createSpy('anotherSpy')
 }
  // DI.-> auto com-completing
```

- do not forget validate arguments to prevent regressions in their changes
```typescript
 let spy = jasmine.createSpy('spy');
 spy(param);
 expect(spy).toHaveBeenCalled(); // successful #invalid
 
 spy(param);
 expect(spy).toHaveBeenCalledWith(param); // successful #valid

 spy(anotherParam);
 expect(spy).toHaveBeenCalledWith(param); // failed #valid
```

<code-example
path="testing/src/app/hero/hero-list.component.no-testbed.spec.ts"
header="app/hero/hero-list.component.no-testbed.spec.ts (tests as pure javascript)">
</code-example>