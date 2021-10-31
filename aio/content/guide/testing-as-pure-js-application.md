## Unit Testing Angular App As Pure JS Application

### Unit Testing role

Unit testing is low-level testing. A unit can be any simple part of an application.
It can be a module as a unit, or a component as a unit, or a method as a unit.

The goal of unit testing is to throw the errors if a unit functionality is unexpectedly changed which is close to term "regression scope".
As a developers we want to be sure that our changes do not involve any regression, what's why unit tests are often one of the quality gates for projects CI.

### Unit Testing criteria

Unit testing should follow next criteria to be able to be integrated to CI and used as a regular quality gate:
- fast
- stable
- independent
- finite
- simple

All of these criteria can be achieved because in mostly cases unit tests are written by developers and can be tested like a "white box" since developers have access to the tested unit.

### Unit Testing in JavaScript

In JavaScript, unit testing mostly means testing of methods. In this context, the goal of this testing is to cover <b>only tested methods functionality</b>.

To simplify the tests and make them more stable and predictable, they should be independent.

Independence in JavaScript is mostly compatible with Functional Programming; for example, pure functions.
Each pure function should return the same result with the same passed arguments, and no side effects, such as closures.

<code-example path="testing/src/app/demo/demo.ts" region="PureFunction"></code-example>

In tests, we need to follow the same principle to simplify them and other practices to match the rest unit testing criteria.

1. Each tested method should be wrapped to the individual scope (describe). All dynamic initialization should be performed before each test start to avoid side effects.

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="TestedMethodScopeDefinition" header="app/demo/demo.pure.spec.js"></code-example>

2. Each test should be independent - performed with not dirty state.

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="IndependentTestScopeInvalid" header="app/demo/demo.pure.spec.js" class="avoid"></code-example>

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="IndependentTestScopeValid" header="app/demo/demo.pure.spec.js"></code-example>

3. Each test should test only its own functionality and does not test dependencies.
   
<code-example path="testing/src/app/demo/demo.ts" region="TestingOnlyUnitFunctionality"></code-example>

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="TestingOnlyUnitFunctionalityInvalid" header="app/demo/demo.pure.spec.js" class="avoid"></code-example>

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="TestingOnlyUnitFunctionalityValid" header="app/demo/demo.pure.spec.js"></code-example>

4. Each dependency and data used in the tested method should be mocked or replaced to the spy.

<code-example path="testing/src/app/demo/demo.ts" region="TestingOnlyUnitFunctionality"></code-example>

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="MockingDataAndDependencies" header="app/demo/demo.pure.spec.js"></code-example>

5. Each type should be simplified as much as possible.

<code-example path="testing/src/app/demo/demo.ts" region="DataSimplificationExample"></code-example>

<div class="alert is-helpful">
  Using of JavaScript instead of TypeScript provides the bonus to avoid to use casting or any generic types like `any` on a testing unit.
</div>

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="DataSimplificationExample" header="app/demo/demo.pure.spec.js"></code-example>

6. Tests should avoid any mutations.

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="AvoidMutationsInvalid" header="app/demo/demo.pure.spec.js" class="avoid"></code-example>

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="AvoidMutationsValid" header="app/demo/demo.pure.spec.js"></code-example>

7. Common tips:
- Do not forget that any Angular components (such as services, directives, etc.) are simple classes (function constructors) with specific annotations.

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="NativeJSEntriesAndAngularEntries" header="app/demo/demo.pure.spec.js"></code-example>

- Name dependencies and their methods as in production code to simplify their search or debug.

<code-example path="testing/src/app/demo/demo.ts" region="NamingForTestEntries"></code-example>

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="NamingForTestEntriesInvalid" header="app/demo/demo.pure.spec.js" class="avoid"></code-example>

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="NamingForTestEntriesValid" header="app/demo/demo.pure.spec.js"></code-example>

- Use named-only spies and directly assigned dependencies methods for auto-completing and simpler debugging.

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="NamingForTestEntriesInvalid" header="app/demo/demo.pure.spec.js" class="avoid"></code-example>

<div class="alert is-helpful">
  Using of named spies simplify debugging since it highlights which exactly named spy throws an error.
</div>

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="NamingForTestEntriesValid" header="app/demo/demo.pure.spec.js"></code-example>

- Do not forget to validate arguments to prevent regressions in their changes.

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="SpyArgumentsTesting" header="app/demo/demo.pure.spec.js"></code-example>

- Test readonly properties if they could affect your business
  
<code-example path="testing/src/app/demo/demo.ts" region="ReadonlyProperties"></code-example>

<code-example path="testing/src/app/demo/demo.pure.spec.js" region="ReadonlyProperties" header="app/demo/demo.pure.spec.js"></code-example>

### Unit Testing as a pure application example

<code-example path="testing/src/hero/hero-list.component.ts" region="ReadonlyProperties"></code-example>

<code-example path="testing/src/hero/hero-list.component.spec.js" region="ReadonlyProperties" header="hero-list.component.spec.js"></code-example>