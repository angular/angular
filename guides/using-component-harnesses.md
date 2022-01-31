# Using Angular Material's component harnesses in your tests

The Angular CDK provides code for creating component test harnesses. A component harness is
a class that lets a test interact with a component via a supported API. Each harness's API
interacts with a component the same way a user would. By using the harness API, a test insulates
itself against updates to the internals of a component, such as changing its DOM structure. The
idea for component harnesses comes from the
[PageObject](https://martinfowler.com/bliki/PageObject.html) pattern commonly used for integration
testing.

Angular Material offers test harnesses for many of its components. The Angular team strongly
encourages developers to use these harnesses for testing to avoid creating brittle tests that rely
on a component's internals.

<!-- TODO(mmalerba): add list of components that are ready -->

This guide discusses the advantages of using component test harnesses and shows how to use them.

## Benefits of component test harnesses

There are two primary benefits to using the Angular Material component harnesses in your tests:
 
1. Harnesses make tests easier to read and understand with straightforward APIs.
2. Harnesses make tests more robust and less likely to break when updating Angular Material.

The following sections will illustrate these benefits in more detail.

## Which kinds of tests can use harnesses?

The Angular CDK's component harnesses are designed to work in multiple different test environments.
Support currently includes Angular's Testbed environment in Karma unit tests and Selenium WebDriver
end-to-end (e2e) tests. You can also support additional environments by creating custom extensions
of the CDK's `HarnessEnvironment` and `TestElement` classes.

## Getting started

The foundation for all test harnesses lives in `@angular/cdk/testing`. Start by importing either
`TestbedHarnessEnvironment` or `SeleniumWebDriverHarnessEnvironment` based on whether you're writing a
unit test or an e2e test. From the `HarnessEnvironment`, you can get a `HarnessLoader` instance,
which you will use to load Angular Material component harnesses. For example, if we're writing unit
tests for a `UserProfile` component, the code might look like this:

```ts
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';

let loader: HarnessLoader;

describe('my-component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [MyModule], declarations: [UserProfile]})
        .compileComponents();
    fixture = TestBed.createComponent(UserProfile);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });
}
```

This code creates a fixture for `UserProfile` and then creates a `HarnessLoader` for that fixture.
The `HarnessLoader` can then locate Angular Material components inside `UserProfile` and create
harnesses for them. Note that `HarnessLoader` and `TestbedHarnessEnvironment` are loaded from
different paths. 

- `@angular/cdk/testing` contains symbols that are shared regardless of the environment your tests
  are in. 
- `@angular/cdk/testing/testbed` contains symbols that are used only in Karma tests.
- `@angular/cdk/testing/selenium-webdriver` (not shown above) contains symbols that are used only in
  Selenium WebDriver tests.

## Loading an Angular Material harness

The `HarnessLoader` provides two methods that can be used to load harnesses, `getHarness` and
`getAllHarnesses`. The `getHarness` method gets a harness for the first instance
of the matching component, while `getAllHarnesses` gets a list of harnesses, one
for each instance of the corresponding component. For example, suppose `UserProfile` contains three
`MatButton` instances. We could load harnesses for them as follows:

```ts
import {MatButtonHarness} from '@angular/material/button/testing';

...

it('should work', async () => {
  const buttons = await loader.getAllHarnesses(MatButtonHarness); // length: 3
  const firstButton = await loader.getHarness(MatButtonHarness); // === buttons[0]
});
```

Notice the example code uses `async` and `await` syntax. All component harness APIs are
asynchronous and return `Promise` objects. Because of this, the Angular team recommends using the
[ES2017 `async`/`await` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
with your tests.

The example above retrieves all button harnesses and uses an array index to get the harness for a
specific button. However, if the number or order of buttons changes, this test will break. You can
write a less brittle test by instead asking for only a subset of harnesses inside `UserProfile`.  

You can load harnesses for a sub-section of the DOM within `UserProfile` with the `getChildLoader`
method on `HarnessLoader`. For example, say that we know `UserProfile` has a div,
`<div class="footer">`, and we want the button inside that specific `<div>`. We can accomplish this
with the following code:

```ts
it('should work', async () => {
  const footerLoader = await loader.getChildLoader('.footer');
  const footerButton = await footerLoader.getHarness(MatButtonHarness);
});
```

You can also use the static `with` method implemented on all Angular Material component harnesses.
This method creates a `HarnessPredicate`, an object that filters loaded harnesses based on the
provided constraints. The particular constraint options vary depending on the harness class, but all
harnesses support at least:
 
- `selector` - CSS selector that the component must match (in addition to its host selector, such
  as `[mat-button]`)
- `ancestor` - CSS selector for a some ancestor element above the component in the DOM
 
In addition to these standard options, `MatButtonHarness` also supports
 
- `text` - String text or regular expressions that matches the text content of the button 
 
Using this method we could locate buttons as follows in our test:
 
```ts
it('should work', async () => {
  // Harness for mat-button whose id is 'more-info'.
  const info = await loader.getHarness(MatButtonHarness.with({selector: '#more-info'}));
  // Harness for mat-button whose text is 'Cancel'.
  const cancel = await loader.getHarness(MatButtonHarness.with({text: 'Cancel'}));
  // Harness for mat-button with class 'confirm' and whose text is either 'Ok' or 'Okay'.
  const okButton = await loader.getHarness(
      MatButtonHarness.with({selector: '.confirm', text: /^(Ok|Okay)$/}));
});
```

## Using a harness to interact with an Angular Material component

The Angular Material component harnesses generally expose methods to either perform actions that a
real user could perform or to inspect component state that a real user might perceive. For
example, `MatButtonHarness` has methods to click, focus, and blur the `mat-button`, as well as
methods to get the text of the button and its disabled state. Because `MatButton` is a very simple
component, these harness methods might not seem very different from working directly with the DOM.
However, more complex harnesses like `MatSelectHarness` have methods like `open` and `isOpen` which
capture more knowledge about the component's internals.

A test using the `MatButtonHarness` to interact with a `mat-button` might look like the following:

```ts
it('should mark confirmed when ok button clicked', async () => {
  const okButton = await loader.getHarness(MatButtonHarness.with({selector: '.confirm'});
  expect(fixture.componentInstance.confirmed).toBe(false);
  expect(await okButton.isDisabled()).toBe(false);
  await okButton.click();
  expect(fixture.componentInstance.confirmed).toBe(true);
});
```

Note that the code above does not call `fixture.detectChanges()`, something you commonly see in
unit tests. The CDK's component harnesses automatically invoke change detection after performing
actions and before reading state. The harness also automatically waits for the fixture to be stable,
which will cause the test to wait for `setTimeout`, `Promise`, etc.

## Comparison with and without component harnesses

Consider an `<issue-report-selector>` component that you want to test. It allows a user to
choose an issue type and display the necessary form create report for that issue type. You need a 
test to verify that when the user chooses an issue type the proper report displays. First consider
what the test might look like without using component harnesses:

```ts
describe('issue-report-selector', () => {
  let fixture: ComponentFixture<IssueReportSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueReportSelectorModule],
      declarations: [IssueReportSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(IssueReportSelector);
    fixture.detectChanges();
  });

  it('should switch to bug report template', async () => {
    expect(fixture.debugElement.query('bug-report-form')).toBeNull();
    const selectTrigger = fixture.debugElement.query(By.css('.mat-select-trigger'));
    selectTrigger.triggerEventHandler('click', {});
    fixture.detectChanges();
    await fixture.whenStable();
    const options = document.querySelectorAll('.mat-select-panel mat-option');
    options[1].click(); // Click the second option, "Bug".
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.debugElement.query('bug-report-form')).not.toBeNull();
  });
});
```

The same test, using the Angular Material component harnesses might look like the following:

```ts
describe('issue-report-selector', () => {
  let fixture: ComponentFixture<IssueReportSelector>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueReportSelectorModule],
      declarations: [IssueReportSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(IssueReportSelector);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should switch to bug report template', async () => {
    expect(fixture.debugElement.query('bug-report-form')).toBeNull();
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    const bugOption = await select.getOption({text: 'Bug'});
    await bugOption.click();
    expect(fixture.debugElement.query('bug-report-form')).not.toBeNull();
  });
});
```

### Tests that are easier to read and understand

The code above shows that adopting the harnesses in tests can make them easier to understand.
Specifically in this example, it makes the "open the mat-select" logic more obvious. An unfamiliar
reader may not know what clicking on `.mat-select-trigger` does, but `await select.open()` is
self-explanatory.

The harnesses also make clear which option should be selected. Without the harness, you need a comment that
explains what `options[1]` means. With `MatSelectHarness`, however, the filter API makes the code
self-documenting.

Finally, the repeated calls to `detectChanges` and `whenStable()` can obfuscate the underlying
intent of the test. By using the harness APIs, you eliminate these calls, making the test more
concise.

### Tests that are more robust

Notice that the test without harnesses directly uses CSS selectors to query elements within
`<mat-select>`, such as `.mat-select-trigger`. If the internal DOM of `<mat-select>` changes, these
queries may stop working. While the Angular team tries to minimize this type of change, some
features and bug fixes ultimately require restructuring the DOM. By using the Angular Material
harnesses, you avoid depending on internal DOM structure directly. 

In addition to DOM structure, component asynchronicity often offers a challenge when updating
components. If a component changes between synchronous and asynchronous, downstream unit tests may
break due to expectations around timing. Tests then require the addition or removal of some
arcane combination of `whenStable`, `flushMicroTasks`, `tick`, or `detectChanges`. Component
harnesses, however, avoid this problem by normalizing the asynchronicity of all component behaviors 
with all asynchronous APIs. When a test uses these harnesses, changes to asynchronicity become
far more manageable.

Both DOM structure and asynchronicity are _implementation details_ of Angular Material's components.
When tests depend on the implementation details, they become a common source of failures due to
library changes. Angular CDK's test harnesses makes component library updates easier for both
application authors and the Angular team, as the Angular team only has to update the harness once
for everyone.
