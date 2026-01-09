# Component testing scenarios

This guide explores common component testing use cases.

## Component binding

In the example application, the `Banner` component presents static title text in the HTML template.

After a few changes, the `Banner` component presents a dynamic title by binding to the component's `title` property like this.

```angular-ts {header="banner.ts"}
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-banner',
  template: '<h1>{{ title() }}</h1>',
  styles: ['h1 { color: green; font-size: 350%}'],
})
export class Banner {
  title = signal('Test Tour of Heroes');
}
```

As minimal as this is, you decide to add a test to confirm that component actually displays the right content where you think it should.

### Query for the `<h1>`

You'll write a sequence of tests that inspect the value of the `<h1>` element that wraps the _title_ property interpolation binding.

You update the `beforeEach` to find that element with a standard HTML `querySelector` and assign it to the `h1` variable.

```ts {header: "banner.component.spec.ts"}
let component: Banner;
let fixture: ComponentFixture<Banner>;
let h1: HTMLElement;

beforeEach(() => {
  fixture = TestBed.createComponent(Banner);
  component = fixture.componentInstance; // Banner test instance
  h1 = fixture.nativeElement.querySelector('h1');
});
```

### `createComponent()` does not bind data

For your first test you'd like to see that the screen displays the default `title`.
Your instinct is to write a test that immediately inspects the `<h1>` like this:

```ts
it('should display original title', () => {
  expect(h1.textContent).toContain(component.title());
});
```

_That test fails_ with the message:

```shell {hideCopy}
expected '' to contain 'Test Tour of Heroes'.
```

Binding happens when Angular performs **change detection**.

In production, change detection kicks in automatically when Angular creates a component or the user enters a keystroke, for example.

The `TestBed.createComponent` does not trigger change detection synchronously; a fact confirmed in the revised test:

```ts
it('no title in the DOM after createComponent()', () => {
  expect(h1.textContent).toEqual('');
});
```

### `whenStable()`

You can tell the `TestBed` to wait for change detection to run with `await fixture.whenStable()`.
Only then does the `<h1>` have the expected title.

```ts
it('should display original title', async () => {
  await fixture.whenStable();
  expect(h1.textContent).toContain(component.title());
});
```

Delayed change detection is intentional and useful.
It gives the tester an opportunity to inspect and change the state of the component _before Angular initiates data binding and calls [lifecycle hooks](guide/components/lifecycle)_.

Here's another test that changes the component's `title` property _before_ calling `fixture.whenStable()`.

```ts
it('should display a different test title', async () => {
  component.title.set('Test Title');
  await fixture.whenStable();
  expect(h1.textContent).toContain('Test Title');
});
```

### Binding signals to inputs

To reflect changes to inputs and listen to outputs you can dynamically bind signals to inputs and functions to outputs.

```ts
import {inputBinding, outputBinding} from '@angular/core';

const fixture = TestBed.createComponent(ValueDisplay, {
  bindings: [
    inputBinding('value', value),
    outputBinding('valueChange', () =>  (/* ... */) ),
  ],
});
```

### Change an input value with `dispatchEvent()`

To simulate user input, find the input element and set its `value` property.

But there is an essential, intermediate step.

Angular doesn't know that you set the input element's `value` property.
It won't read that property until you raise the element's `input` event by calling `dispatchEvent()`.

The following example of a component using the `TitleCasePipe` demonstrates the proper sequence.

```ts
it('should convert hero name to Title Case', async () => {
  const hostElement = fixture.nativeElement;
  const nameInput: HTMLInputElement = hostElement.querySelector('input')!;
  const nameDisplay: HTMLElement = hostElement.querySelector('span')!;

  // simulate user entering a new name into the input box
  nameInput.value = 'quick BROWN  fOx';

  // Dispatch a DOM event so that Angular learns of input value change.
  nameInput.dispatchEvent(new Event('input'));

  // Wait for Angular to update the display binding through the title pipe
  await fixture.whenStable();

  expect(nameDisplay.textContent).toBe('Quick Brown  Fox');
});
```

## Component with a dependency

Components often have service dependencies.

The `Welcome` component displays a welcome message to the logged-in user.
It knows who the user is based on a property of the injected `UserAuthentication`:

```angular-ts
import {Component, inject, OnInit, signal} from '@angular/core';
import {UserAuthentication} from '../model/user.authentication';

@Component({
  selector: 'app-welcome',
  template: '<h3 class="welcome"><i>{{ welcome() }}</i></h3>',
})
export class Welcome {
  private userAuth = inject(UserAuthentication);
  welcome = signal(
    this.userAuth.isLoggedIn() ? `Welcome, ${this.userAuth.user().name}` : 'Please log in.',
  );
}
```

The `Welcome` component has decision logic that interacts with the service, logic that makes this component worth testing.

### Provide service test doubles

A _component-under-test_ doesn't have to be provided with real services.

Injecting the real `UserAuthentication` could be difficult.
The real service might ask the user for login credentials and attempt to reach an authentication server.
These behaviors can be hard to intercept. Be aware that using test doubles makes the test behave differently from production so use them sparingly.

### Get injected services

The tests need access to the `UserAuthentication` injected into the `Welcome` component.

Angular has a hierarchical injection system.
There can be injectors at multiple levels, from the root injector created by the `TestBed` down through the component tree.

The safest way to get the injected service, the way that **_always works_**,
is to **get it from the injector of the _component-under-test_**.
The component injector is a property of the fixture's `DebugElement`.

```ts
// UserAuthentication actually injected into the component
userAuth = fixture.debugElement.injector.get(UserAuthentication);
```

HELPFUL: This is _usually_ not necessary. Services are often provided in the root or the TestBed overrides and can be retrieved more easily with `TestBed.inject()` (see below).

### `TestBed.inject()`

This is easier to remember and less verbose than retrieving a service using the fixture's `DebugElement`.

In this test suite, the _only_ provider of `UserAuthentication` is the root testing module, so it is safe to call `TestBed.inject()` as follows:

```ts
userAuth = TestBed.inject(UserAuthentication);
```

HELPFUL: For a use case in which `TestBed.inject()` does not work, see the [_Override component providers_](#override-component-providers) section that explains when and why you must get the service from the component's injector instead.

### Final setup and tests

Here's the complete `beforeEach()`, using `TestBed.inject()`:

```ts
let fixture: ComponentFixture<Welcome>;
let comp: Welcome;
let userAuth: UserAuthentication; // the TestBed injected service
let el: HTMLElement; // the DOM element with the welcome message

beforeEach(() => {
  fixture = TestBed.createComponent(Welcome);
  comp = fixture.componentInstance;

  // UserAuthentication from the root injector
  userAuth = TestBed.inject(UserAuthentication);

  //  get the "welcome" element by CSS selector (e.g., by class name)
  el = fixture.nativeElement.querySelector('.welcome');
});
```

And here are some tests:

```ts
it('should welcome the user', async () => {
  await fixture.whenStable();
  const content = el.textContent;

  expect(content, '"Welcome ..."').toContain('Welcome');
  expect(content, 'expected name').toContain('Test User');
});

it('should welcome "Bubba"', async () => {
  userAuth.user.set({name: 'Bubba'}); // welcome message hasn't been shown yet
  await fixture.whenStable();

  expect(el.textContent).toContain('Bubba');
});

it('should request login if not logged in', async () => {
  userAuth.isLoggedIn.set(false); // welcome message hasn't been shown yet
  await fixture.whenStable();
  const content = el.textContent;

  expect(content, 'not welcomed').not.toContain('Welcome');
  expect(content, '"log in"').toMatch(/log in/i);
});
```

The first is a sanity test; it confirms that the `UserAuthentication` is called and working.

HELPFUL: The 2nd argument of `expect` \(for example, `'expected name'`\) is an optional failure label.
If the expectation fails, Vitest appends this label to the expectation failure message.
In a spec with multiple expectations, it can help clarify what went wrong and which expectation failed.

The remaining tests confirm the logic of the component when the service returns different values.
The second test validates the effect of changing the user name.
The third test checks that the component displays the proper message when there is no logged-in user.

## Component with async service

In this sample, the `About` component template hosts a `Twain` component.
The `Twain` component displays Mark Twain quotes.

```angular-html
<p class="twain">
  <i>{{ quote | async }}</i>
</p>
<button type="button" (click)="getQuote()">Next quote</button>
@if (errorMessage()) {
  <p class="error">{{ errorMessage() }}</p>
}
```

HELPFUL: The value of the component's `quote` property passes through an `AsyncPipe`.
That means the property returns either a `Promise` or an `Observable`.

In this example, the `TwainQuotes.getQuote()` method tells you that the `quote` property returns an `Observable`.

```ts
getQuote() {
  this.errorMessage.set('');
  this.quote = this.twainQuotes.getQuote().pipe(
    startWith('...'),
    catchError((err: any) => {
      this.errorMessage.set(err.message || err.toString());
      return of('...'); // reset message to placeholder
    }),
  );
}
```

The `Twain` component gets quotes from an injected `TwainQuotes`.
The component starts the returned `Observable` with a placeholder value \(`'...'`\), before the service can return its first quote.

The `catchError` intercepts service errors, prepares an error message, and returns the placeholder value on the success channel.

These are all features you'll want to test.

### Testing by mocking http requests with the `HttpTestingController`.

When testing a component, only the service's public API should matter.
In general, tests themselves should not make calls to remote servers.
They should emulate such calls.

In the case your async service relies on the `HttpClient` to load remote data, it is recommended to return mock responses at the HTTP level with the `HttpTestingController`.

For more details on mocking the `HttpBackend`, refer to the [dedicated guide](guide/http/testing).

### Testing by providing a stubbed implementation of a service.

When mocking async request at the http level isn't possible, an alternative is to leverage spies.

The setup in this `app/twain/twain-quotes.spec.ts` shows one way to do that:

```ts {header: "twain.spec.ts"}
class TwainQuotesStub implements TwainQuotes {
  private testQuote = 'Test Quote';

  getQuote() {
    return of(this.testQuote);
  }

  // ... Implement everything to conform to the API
}

beforeEach(async () => {
  TestBed.configureTestingModule({
    providers: [{provide: TwainQuotes, useClass: TwainQuotesStub}],
  });

  fixture = TestBed.createComponent(Twain);
  component = fixture.componentInstance;
  await fixture.whenStable();
  quoteEl = fixture.nativeElement.querySelector('.twain');
});
```

Focus on the how the stub implementation replaces the original one.

```ts
TestBed.configureTestingModule({
  providers: [{provide: TwainQuotes, useClass: TwainQuotesStub}],
});
```

The stub is designed in such a way that any component or service that injects it will receive the stubbed implementation.
It means that any call to `getQuote` receives an observable with a test quote.

Unlike the real `getQuote()` method, this spy bypasses the server and returns a synchronous observable whose value is available immediately.

### Async test with a Vitest fake timers

To mock async functions like `setTimeout` or `Promise`s, you can leverage Vitest fake timers to controle whenever the fire.

```ts
it('should display error when TwainQuotes service fails', async () => {
  class TwainQuotesStub implements TwainQuotes {
    getQuote() {
      return defer(() => {
        return new Promise<string>((_, reject) => {
          setTimeout(() => reject('TwainService test failure'));
        });
      });
    }

    // ... Implement everything to conform to the API
  }

  TestBed.configureTestingModule({
    providers: [{provide: TwainQuotes, useClass: TwainQuotesStub}],
  });

  vi.useFakeTimers(); // setting up the fake timers
  const fixture = TestBed.createComponent(TwainComponent);

  // rendering isn't async, we need to flush
  await vi.runAllTimersAsync();

  await expect(fixture.nativeElement.querySelector('.error')!.textContent).toMatch(/test failure/);
  expect(fixture.nativeElement.querySelector('.twain')!.textContent).toBe('...');

  vi.useRealTimers(); // resets to regular async execution
});
```

### More async tests

With the stubbe service returning async observables, most of your tests will have to be async as well.

Here's a test that demonstrates the data flow you'd expect in the real world.

```ts
it('should show quote after getQuote', async () => {
  class MockTwainQuotes implements TwainQuotes {
    private subject = new Subject<string>();

    getQuote() {
      return this.subject.asObservable();
    }

    emit(val: string) {
      this.subject.next(val);
    }
  }

  it('should show quote after getQuote (success)', async () => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [{provide: TwainQuotes, useClass: MockTwainQuotes}],
    });

    const fixture = TestBed.createComponent(TwainComponent);
    const twainQuotes = TestBed.inject(TwainQuotes) as MockTwainQuotes;
    await vi.runAllTimersAsync(); // render before the quote is recieved

    const quoteEl = fixture.nativeElement.querySelector('.twain');
    expect(quoteEl.textContent).toBe('...');

    twainQuotes.emit('Twain Quote'); // emits the quote
    await vi.runAllTimersAsync(); // render with the quote received

    expect(quoteEl.textContent).toBe('Twain Quote');
    expect(fixture.nativeElement.querySelector('.error')).toBeNull();

    vi.useRealTimers();
  });
});
```

Notice that the quote element displays the placeholder value \(`'...'`\) on first rendering.
The first quote hasn't arrived yet.

Then you can assert that the quote element displays the expected text.

### Async tests with `zone.js` and `fakeAsync`

The `fakeAsync` helper function is another mock clock that relies on patching asynchronous APIs with `zone.js`. It was commonly used in `zone.js` based applications for testing. The use of `fakeAsync` is no longer recommended.

TIP: Prefer using native async testing strategies or other fake timers (also called mock clocks) like those from Vitest or Jasmine.

IMPORTANT: `fakeAsync` cannot be used with the Vitest test runner as no `zone.js` patch is applied for this runner.

## Component with inputs and outputs

A component with inputs and outputs typically appears inside the view template of a host component.
The host uses a property binding to set the input property and an event binding to listen to events raised by the output property.

The testing goal is to verify that such bindings work as expected.
The tests should set input values and listen for output events.

The `DashboardHero` component is a tiny example of a component in this role.
It displays an individual hero provided by the `Dashboard` component.
Clicking that hero tells the `Dashboard` component that the user has selected the hero.

The `DashboardHero` component is embedded in the `Dashboard` component template like this:

```angular-html
@for (hero of heroes; track hero) {
  <dashboard-hero class="col-1-4" [hero]="hero" (selected)="gotoDetail($event)"/>
}
```

The `DashboardHero` component appears in an `@for` block, which sets each component's `hero` input property to the looping value and listens for the component's `selected` event.

Here's the component's full definition:

```angular-ts
@Component({
  selector: 'dashboard-hero',
  imports: [UpperCasePipe],
  template: `
    <button type="button" (click)="click()" class="hero">
      {{ hero().name | uppercase }}
    </button>
  `,
})
export class DashboardHero {
  readonly hero = input.required<Hero>();
  readonly selected = output<Hero>();

  click() {
    this.selected.emit(this.hero());
  }
}
```

While testing a component this simple has little intrinsic value, it's worth knowing how.
Use one of these approaches:

- Test it as used by the `Dashboard` component
- Test it as a standalone component
- Test it as used by a substitute for the `Dashboard` component

The immediate goal is to test the `DashboardHero` component, not the `Dashboard` component, so, try the second and third options.

### Test the `DashboardHero` component standalone

Here's the meat of the spec file setup.

```ts
let fixture: ComponentFixture<DashboardHero>;
let comp: DashboardHero;
let heroDe: DebugElement;
let heroEl: HTMLElement;
let expectedHero: Hero;

beforeEach(async () => {
  fixture = TestBed.createComponent(DashboardHero);
  comp = fixture.componentInstance;

  // find the hero's DebugElement and element
  heroDe = fixture.debugElement.query(By.css('.hero'));
  heroEl = heroDe.nativeElement;

  // mock the hero supplied by the parent component
  expectedHero = {id: 42, name: 'Test Name'};

  // simulate the parent setting the input property with that hero
  fixture.componentRef.setInput('hero', expectedHero);

  // wait for initial data binding
  await fixture.whenStable();
});
```

Notice how the setup code assigns a test hero \(`expectedHero`\) to the component's `hero` property, emulating the way the `Dashboard` would set it using the property binding in its repeater.

The following test verifies that the hero name is propagated to the template using a binding.

```ts
it('should display hero name in uppercase', () => {
  const expectedPipedName = expectedHero.name.toUpperCase();
  expect(heroEl.textContent).toContain(expectedPipedName);
});
```

Because the template passes the hero name through the Angular `UpperCasePipe`, the test must match the element value with the upper-cased name.

### Clicking

Clicking the hero should raise a `selected` event that the host component \(`Dashboard` presumably\) can hear:

```ts
it('should raise selected event when clicked (triggerEventHandler)', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  heroDe.triggerEventHandler('click');
  expect(selectedHero).toBe(expectedHero);
});
```

The component's `selected` property returns an `EventEmitter`, which looks like an RxJS synchronous `Observable` to consumers.
The test subscribes to it _explicitly_ just as the host component does _implicitly_.

If the component behaves as expected, clicking the hero's element should tell the component's `selected` property to emit the `hero` object.

The test detects that event through its subscription to `selected`.

### `triggerEventHandler`

The `heroDe` in the previous test is a `DebugElement` that represents the hero `<div>`.

It has Angular properties and methods that abstract interaction with the native element.
This test calls the `DebugElement.triggerEventHandler` with the "click" event name.
The "click" event binding responds by calling `DashboardHero.click()`.

The Angular `DebugElement.triggerEventHandler` can raise _any data-bound event_ by its _event name_.
The second parameter is the event object passed to the handler.

The test triggered a "click" event.

```ts
heroDe.triggerEventHandler('click');
```

In this case, the test correctly assumes that the runtime event handler, the component's `click()` method, doesn't care about the event object.

HELPFUL: Other handlers are less forgiving.
For example, the `RouterLink` directive expects an object with a `button` property that identifies which mouse button, if any, was pressed during the click.
The `RouterLink` directive throws an error if the event object is missing.

### Click the element

The following test alternative calls the native element's own `click()` method, which is perfectly fine for _this component_.

```ts
it('should raise selected event when clicked (element.click)', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  heroEl.click();
  expect(selectedHero).toBe(expectedHero);
});
```

### `click()` helper

Clicking a button, an anchor, or an arbitrary HTML element is a common test task.

Make that consistent and straightforward by encapsulating the _click-triggering_ process in a helper such as the following `click()` function:

```ts
/** Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler */
export const ButtonClickEvents = {
  left: {button: 0},
  right: {button: 2},
};

/** Simulate element click. Defaults to mouse left-button click event. */
export function click(
  el: DebugElement | HTMLElement,
  eventObj: any = ButtonClickEvents.left,
): void {
  if (el instanceof HTMLElement) {
    el.click();
  } else {
    el.triggerEventHandler('click', eventObj);
  }
}
```

The first parameter is the _element-to-click_.
If you want, pass a custom event object as the second parameter.
The default is a partial [left-button mouse event object](https://developer.mozilla.org/docs/Web/API/MouseEvent/button) accepted by many handlers including the `RouterLink` directive.

IMPORTANT: The `click()` helper function is **not** one of the Angular testing utilities.
It's a function defined in _this guide's sample code_.
All of the sample tests use it.
If you like it, add it to your own collection of helpers.

Here's the previous test, rewritten using the click helper.

```ts
it('should raise selected event when clicked (click helper with DebugElement)', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  click(heroDe); // click helper with DebugElement

  expect(selectedHero).toBe(expectedHero);
});
```

## Component inside a test host

The previous tests played the role of the host `Dashboard` component themselves.
But does the `DashboardHero` component work correctly when properly data-bound to a host component?

```angular-ts
@Component({
  imports: [DashboardHero],
  template: ` <dashboard-hero [hero]="hero" (selected)="onSelected($event)" />`,
})
class TestHost {
  hero: Hero = {id: 42, name: 'Test Name'};
  selectedHero: Hero | undefined;

  onSelected(hero: Hero) {
    this.selectedHero = hero;
  }
}
```

The test host sets the component's `hero` input property with its test hero.
It binds the component's `selected` event with its `onSelected` handler, which records the emitted hero in its `selectedHero` property.

Later, the tests will be able to check `selectedHero` to verify that the `DashboardHero.selected` event emitted the expected hero.

The setup for the `test-host` tests is similar to the setup for the stand-alone tests:

```ts
beforeEach(async () => {
  // create TestHost instead of DashboardHero
  fixture = TestBed.createComponent(TestHost);
  testHost = fixture.componentInstance;
  heroEl = fixture.nativeElement.querySelector('.hero');

  await fixture.whenStable();
});
```

This testing module configuration shows two important differences:

- It _creates_ the `TestHost` component instead of the `DashboardHero`
- The `TestHost` component sets the `DashboardHero.hero` with a binding

The `createComponent` returns a `fixture` that holds an instance of `TestHost` instead of an instance of `DashboardHero`.

Creating the `TestHost` has the side effect of creating a `DashboardHero` because the latter appears within the template of the former.
The query for the hero element \(`heroEl`\) still finds it in the test DOM, albeit at greater depth in the element tree than before.

The tests themselves are almost identical to the stand-alone version:

```ts
it('should display hero name', () => {
  const expectedPipedName = testHost.hero.name.toUpperCase();
  expect(heroEl.textContent).toContain(expectedPipedName);
});

it('should raise selected event when clicked', () => {
  click(heroEl);
  // selected hero should be the same data bound hero
  expect(testHost.selectedHero).toBe(testHost.hero);
});
```

Only the selected event test differs.
It confirms that the selected `DashboardHero` hero really does find its way up through the event binding to the host component.

## Routing component

A _routing component_ is a component that tells the `Router` to navigate to another component.
The `Dashboard` component is a _routing component_ because the user can navigate to the `HeroDetail` component by clicking on one of the _hero buttons_ on the dashboard.

Angular provides test helpers to reduce boilerplate and more effectively test code which depends on `HttpClient`. The `provideRouter` function can be used directly in the test module as well.

```ts
beforeEach(async () => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{path: '**', component: Dashboard}]),
      provideHttpClientTesting(),
      HeroService,
    ],
  });
  harness = await RouterTestingHarness.create();
  comp = await harness.navigateByUrl('/', Dashboard);
  TestBed.inject(HttpTestingController).expectOne('api/heroes').flush(getTestHeroes());
});
```

The following test clicks the displayed hero and confirms that we navigate to the expected URL.

```ts
it('should tell navigate when hero clicked', async () => {
  // get first <dashboard-hero> DebugElement
  const heroDe = harness.routeDebugElement!.query(By.css('dashboard-hero'));
  heroDe.triggerEventHandler('selected', comp.heroes[0]);

  // expecting to navigate to id of the component's first hero
  const id = comp.heroes[0].id;
  expect(TestBed.inject(Router).url, 'should nav to HeroDetail for first hero').toEqual(
    `/heroes/${id}`,
  );
});
```

## Routed components

A _routed component_ is the destination of a `Router` navigation.
It can be trickier to test, especially when the route to the component _includes parameters_.
The `HeroDetail` is a _routed component_ that is the destination of such a route.

When a user clicks a _Dashboard_ hero, the `Dashboard` tells the `Router` to navigate to `heroes/:id`.
The `:id` is a route parameter whose value is the `id` of the hero to edit.

The `Router` matches that URL to a route to the `HeroDetail`.
It creates an `ActivatedRoute` object with the routing information and injects it into a new instance of the `HeroDetail`.

Here are the services injected into `HeroDetail`:

```ts
private heroDetailService = inject(HeroDetailService);
private route = inject(ActivatedRoute);
private router = inject(Router);
```

The `HeroDetail` component needs the `id` parameter so it can fetch the corresponding hero using the `HeroDetailService`.
The component has to get the `id` from the `ActivatedRoute.paramMap` property which is an `Observable`.

It can't just reference the `id` property of the `ActivatedRoute.paramMap`.
The component has to _subscribe_ to the `ActivatedRoute.paramMap` observable and be prepared for the `id` to change during its lifetime.

```ts
constructor() {
  // get hero when `id` param changes
  this.route.paramMap
    .pipe(takeUntilDestroyed())
    .subscribe((pmap) => this.getHero(pmap.get('id')));
}
```

Tests can explore how the `HeroDetail` responds to different `id` parameter values by navigating to different routes.

## Nested component tests

Component templates often have nested components, whose templates might contain more components.

The component tree can be very deep and sometimes the nested components play no role in testing the component at the top of the tree.

The `App` component, for example, displays a navigation bar with anchors and their `RouterLink` directives.

```angular-html
<app-banner />
<app-welcome />

<nav>
  <a routerLink="/dashboard">Dashboard</a>
  <a routerLink="/heroes">Heroes</a>
  <a routerLink="/about">About</a>
</nav>

<router-outlet />
```

To validate the links but not the navigation, you don't need the `Router` to navigate and you don't need the `<router-outlet>` to mark where the `Router` inserts _routed components_.

The `Banner` and `Welcome` components \(indicated by `<app-banner>` and `<app-welcome>`\) are also irrelevant.

Yet any test that creates the `App` component in the DOM also creates instances of these three components and, if you let that happen, you'll have to configure the `TestBed` to create them.

If you neglect to declare them, the Angular compiler won't recognize the `<app-banner>`, `<app-welcome>`, and `<router-outlet>` tags in the `App` template and will throw an error.

If you declare the real components, you'll also have to declare _their_ nested components and provide for _all_ services injected in _any_ component in the tree.

This section describes two techniques for minimizing the setup.
Use them, alone or in combination, to stay focused on testing the primary component.

### Stubbing unneeded components

In the first technique, you create and declare stub versions of the components and directive that play little or no role in the tests.

```ts
@Component({selector: 'app-banner', template: ''})
class BannerStub {}

@Component({selector: 'router-outlet', template: ''})
class RouterOutletStub {}

@Component({selector: 'app-welcome', template: ''})
class WelcomeStub {}
```

The stub selectors match the selectors for the corresponding real components.
But their templates and classes are empty.

Then declare them by overriding the `imports` of your component using `TestBed.overrideComponent`.

```ts
let comp: App;
let fixture: ComponentFixture<App>;

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), UserAuthentication],
  }).overrideComponent(App, {
    set: {
      imports: [RouterLink, BannerStub, RouterOutletStub, WelcomeStub],
    },
  });

  fixture = TestBed.createComponent(App);
  comp = fixture.componentInstance;
});
```

HELPFUL: The `set` key in this example replaces all the exisiting imports on your component, make sure to imports all dependencies, not only the stubs. Alternatively you can use the `remove`/`add` keys to selectively remove and add imports.

### `NO_ERRORS_SCHEMA`

In the second approach, add `NO_ERRORS_SCHEMA` to the metadata overrides of your component.

```ts
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), UserAuthentication],
  }).overrideComponent(App, {
    set: {
      imports: [], // resets all imports
      schemas: [NO_ERRORS_SCHEMA],
    },
  });
});
```

The `NO_ERRORS_SCHEMA` tells the Angular compiler to ignore unrecognized elements and attributes.

The compiler recognizes the `<app-root>` element and the `routerLink` attribute because you declared a corresponding `App` component and `RouterLink` in the `TestBed` configuration.

But the compiler won't throw an error when it encounters `<app-banner>`, `<app-welcome>`, or `<router-outlet>`.
It simply renders them as empty tags and the browser ignores them.

You no longer need the stub components.

### Use both techniques together

These are techniques for _Shallow Component Testing_, so-named because they reduce the visual surface of the component to just those elements in the component's template that matter for tests.

The `NO_ERRORS_SCHEMA` approach is the easier of the two but don't overuse it.

The `NO_ERRORS_SCHEMA` also prevents the compiler from telling you about the missing components and attributes that you omitted inadvertently or misspelled.
You could waste hours chasing phantom bugs that the compiler would have caught in an instant.

The _stub component_ approach has another advantage.
While the stubs in _this_ example were empty, you could give them stripped-down templates and classes if your tests need to interact with them in some way.

In practice you will combine the two techniques in the same setup, as seen in this example.

```ts
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), UserAuthentication],
  }).overrideComponent(App, {
    remove: {imports: [RouterOutlet, Welcome]},
    set: {schemas: [NO_ERRORS_SCHEMA]},
  });
});
```

The Angular compiler creates the `BannerStub` for the `<app-banner>` element and applies the `RouterLink` to the anchors with the `routerLink` attribute, but it ignores the `<app-welcome>` and `<router-outlet>` tags.

### `By.directive` and injected directives

A little more setup triggers the initial data binding and gets references to the navigation links:

```ts
beforeEach(async () => {
  await fixture.whenStable();

  // find DebugElements with an attached RouterLinkStubDirective
  linkDes = fixture.debugElement.queryAll(By.directive(RouterLink));

  // get attached link directive instances
  // using each DebugElement's injector
  routerLinks = linkDes.map((de) => de.injector.get(RouterLink));
});
```

Three points of special interest:

- Locate the anchor elements with an attached directive using `By.directive`
- The query returns `DebugElement` wrappers around the matching elements
- Each `DebugElement` exposes a dependency injector with the specific instance of the directive attached to that element

The `App` component links to validate are as follows:

```angular-html
<nav>
  <a routerLink="/dashboard">Dashboard</a>
  <a routerLink="/heroes">Heroes</a>
  <a routerLink="/about">About</a>
</nav>
```

Here are some tests that confirm those links are wired to the `routerLink` directives as expected:

```ts
it('can get RouterLinks from template', () => {
  expect(routerLinks.length, 'should have 3 routerLinks').toBe(3);
  expect(routerLinks[0].href).toBe('/dashboard');
  expect(routerLinks[1].href).toBe('/heroes');
  expect(routerLinks[2].href).toBe('/about');
});

it('can click Heroes link in template', async () => {
  const heroesLinkDe = linkDes[1]; // heroes link DebugElement

  TestBed.inject(Router).resetConfig([{path: '**', children: []}]);
  heroesLinkDe.triggerEventHandler('click', {button: 0});

  await fixture.whenStable();

  expect(TestBed.inject(Router).url).toBe('/heroes');
});
```

## Use a `page` object

The `HeroDetail` component is a simple view with a title, two hero fields, and two buttons.

But there's plenty of template complexity even in this simple form.

```angular-html
@if (hero) {
  <div>
    <h2>
      <span>{{ hero.name | titlecase }}</span> Details
    </h2>
    <div><span>id: </span>{{ hero.id }}</div>
    <div>
      <label for="name">name: </label>
      <input id="name" [(ngModel)]="hero.name" placeholder="name" />
    </div>
    <button type="button" (click)="save()">Save</button>
    <button type="button" (click)="cancel()">Cancel</button>
  </div>
}
```

Tests that exercise the component need …

- To wait until a hero arrives before elements appear in the DOM
- A reference to the title text
- A reference to the name input box to inspect and set it
- References to the two buttons so they can click them

Even a small form such as this one can produce a mess of tortured conditional setup and CSS element selection.

Tame the complexity with a `Page` class that handles access to component properties and encapsulates the logic that sets them.

Here is such a `Page` class for the `hero-detail.component.spec.ts`

```ts
class Page {
  // getter properties wait to query the DOM until called.
  get buttons() {
    return this.queryAll<HTMLButtonElement>('button');
  }
  get saveBtn() {
    return this.buttons[0];
  }
  get cancelBtn() {
    return this.buttons[1];
  }
  get nameDisplay() {
    return this.query<HTMLElement>('span');
  }
  get nameInput() {
    return this.query<HTMLInputElement>('input');
  }

  //// query helpers ////
  private query<T>(selector: string): T {
    return harness.routeNativeElement!.querySelector(selector)! as T;
  }

  private queryAll<T>(selector: string): T[] {
    return harness.routeNativeElement!.querySelectorAll(selector) as any as T[];
  }
}
```

Now the important hooks for component manipulation and inspection are neatly organized and accessible from an instance of `Page`.

A `createComponent` method creates a `page` object and fills in the blanks once the `hero` arrives.

```ts
async function createComponent(id: number) {
  harness = await RouterTestingHarness.create();
  component = await harness.navigateByUrl(`/heroes/${id}`, HeroDetail);
  page = new Page();

  const request = TestBed.inject(HttpTestingController).expectOne(`api/heroes/?id=${id}`);
  const hero = getTestHeroes().find((h) => h.id === Number(id));
  request.flush(hero ? [hero] : []);
  await harness.fixture.whenStable();
}
```

Here are a few more `HeroDetail` component tests to reinforce the point.

```ts
it("should display that hero's name", () => {
  expect(page.nameDisplay.textContent).toBe(expectedHero.name);
});

it('should navigate when click cancel', () => {
  click(page.cancelBtn);
  expect(TestBed.inject(Router).url).toEqual(`/heroes/${expectedHero.id}`);
});

it('should save when click save but not navigate immediately', () => {
  click(page.saveBtn);
  expect(TestBed.inject(HttpTestingController).expectOne({method: 'PUT', url: 'api/heroes'}));
  expect(TestBed.inject(Router).url).toEqual('/heroes/41');
});

it('should navigate when click save and save resolves', async () => {
  click(page.saveBtn);
  await harness.fixture.whenStable();
  expect(TestBed.inject(Router).url).toEqual('/heroes/41');
});

it('should convert hero name to Title Case', async () => {
  // get the name's input and display elements from the DOM
  const hostElement: HTMLElement = harness.routeNativeElement!;
  const nameInput: HTMLInputElement = hostElement.querySelector('input')!;
  const nameDisplay: HTMLElement = hostElement.querySelector('span')!;

  // simulate user entering a new name into the input box
  nameInput.value = 'quick BROWN  fOx';

  // Dispatch a DOM event so that Angular learns of input value change.
  nameInput.dispatchEvent(new Event('input'));

  // Wait for Angular to update the display binding through the title pipe
  await harness.fixture.whenStable();

  expect(nameDisplay.textContent).toBe('Quick Brown  Fox');
});
```

## Override component providers

The `HeroDetail` provides its own `HeroDetailService`.

```ts
@Component({
  /* ... */
  providers: [HeroDetailService],
})
export class HeroDetail {
  private heroDetailService = inject(HeroDetailService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
}
```

It's not possible to stub the component's `HeroDetailService` in the `providers` of the `TestBed.configureTestingModule`.
Those are providers for the _testing module_, not the component.
They prepare the dependency injector at the _fixture level_.

Angular creates the component with its _own_ injector, which is a _child_ of the fixture injector.
It registers the component's providers \(the `HeroDetailService` in this case\) with the child injector.

A test cannot get to child injector services from the fixture injector.
And `TestBed.configureTestingModule` can't configure them either.

Angular has created new instances of the real `HeroDetailService` all along!

HELPFUL: These tests could fail or timeout if the `HeroDetailService` made its own XHR calls to a remote server.
There might not be a remote server to call.

Fortunately, the `HeroDetailService` delegates responsibility for remote data access to an injected `HeroService`.

```ts
@Injectable({providedIn: 'root'})
export class HeroDetailService {
  private heroService = inject(HeroService);
}
```

The previous test configuration replaces the real `HeroService` with a `TestHeroService` that intercepts server requests and fakes their responses.

What if you aren't so lucky.
What if faking the `HeroService` is hard?
What if `HeroDetailService` makes its own server requests?

The `TestBed.overrideComponent` method can replace the component's `providers` with easy-to-manage _test doubles_ as seen in the following setup variation:

```ts
beforeEach(async () => {
  await TestBed.configureTestingModule({
    providers: [
      provideRouter([
        {path: 'heroes', component: HeroList},
        {path: 'heroes/:id', component: HeroDetail},
      ]),
      // HeroDetailService at this level is IRRELEVANT!
      {provide: HeroDetailService, useValue: {}},
    ],
  }).overrideComponent(HeroDetail, {
    set: {providers: [{provide: HeroDetailService, useClass: HeroDetailServiceSpy}]},
  });
});
```

Notice that `TestBed.configureTestingModule` no longer provides a fake `HeroService` because it's [not needed](#provide-a-spy-stub-herodetailservicespy).

### The `overrideComponent` method

Focus on the `overrideComponent` method.

```ts
.overrideComponent(HeroDetail, {
  set: {providers: [{provide: HeroDetailService, useClass: HeroDetailServiceSpy}]},
});
```

It takes two arguments: the component type to override \(`HeroDetail`\) and an override metadata object.
The [override metadata object](/guide/testing/utility-apis#testbed-class-summary) is a generic defined as follows:

```ts
type MetadataOverride<T> = {
  add?: Partial<T>;
  remove?: Partial<T>;
  set?: Partial<T>;
};
```

A metadata override object can either add-and-remove elements in metadata properties or completely reset those properties.
This example resets the component's `providers` metadata.

The type parameter, `T`, is the kind of metadata you'd pass to the `@Component` decorator:

```ts
selector?: string;
template?: string;
templateUrl?: string;
providers?: any[];
…
```

### Provide a _spy stub_ (`HeroDetailServiceSpy`)

This example completely replaces the component's `providers` array with a new array containing a `HeroDetailServiceSpy`.

The `HeroDetailServiceSpy` is a stubbed version of the real `HeroDetailService` that fakes all necessary features of that service.
It neither injects nor delegates to the lower level `HeroService` so there's no need to provide a test double for that.

The related `HeroDetail` component tests will assert that methods of the `HeroDetailService` were called by spying on the service methods.
Accordingly, the stub implements its methods as spies:

```ts
import {vi} from 'vitest';

class HeroDetailServiceSpy {
  testHero: Hero = {...testHero};

  /* emit cloned test hero */
  getHero = vi.fn(() => asyncData({...this.testHero}));

  /* emit clone of test hero, with changes merged in */
  saveHero = vi.fn((hero: Hero) => asyncData(Object.assign(this.testHero, hero)));
}
```

### The override tests

Now the tests can control the component's hero directly by manipulating the spy-stub's `testHero` and confirm that service methods were called.

```ts
let hdsSpy: HeroDetailServiceSpy;

beforeEach(async () => {
  harness = await RouterTestingHarness.create();
  component = await harness.navigateByUrl(`/heroes/${testHero.id}`, HeroDetail);
  page = new Page();
  // get the component's injected HeroDetailServiceSpy
  hdsSpy = harness.routeDebugElement!.injector.get(HeroDetailService) as any;

  harness.detectChanges();
});

it('should have called `getHero`', () => {
  expect(hdsSpy.getHero, 'getHero called once').toHaveBeenCalledTimes(1);
});

it("should display stub hero's name", () => {
  expect(page.nameDisplay.textContent).toBe(hdsSpy.testHero.name);
});

it('should save stub hero change', async () => {
  const origName = hdsSpy.testHero.name;
  const newName = 'New Name';

  page.nameInput.value = newName;

  page.nameInput.dispatchEvent(new Event('input')); // tell Angular

  expect(component.hero.name, 'component hero has new name').toBe(newName);
  expect(hdsSpy.testHero.name, 'service hero unchanged before save').toBe(origName);

  click(page.saveBtn);
  expect(hdsSpy.saveHero, 'saveHero called once').toHaveBeenCalledTimes(1);

  await harness.fixture.whenStable();
  expect(hdsSpy.testHero.name, 'service hero has new name after save').toBe(newName);
  expect(TestBed.inject(Router).url).toEqual('/heroes');
});
```

### More overrides

The `TestBed.overrideComponent` method can be called multiple times for the same or different components.
The `TestBed` offers similar `overrideDirective`, `overrideModule`, and `overridePipe` methods for digging into and replacing parts of these other classes.

Explore the options and combinations on your own.
