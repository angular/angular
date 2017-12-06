The `layout` package provides utilities to build responsive UIs that react to screen-size changes. 

### BreakpointObserver

`BreakpointObserver` is a utility for evaluating media queries and reacting to their changing.

#### Evaluate against the current viewport
The `isMatched` method is used to evaluate one or more media queries against the current viewport
size.
```ts
const isSmallScreen = breakpointObserver.isMatched('(max-width: 599px)');
```

#### React to changes to the viewport
The `observe` method is used to get an observable stream that will emit whenever one of the given
media queries would have a different result.
```ts
const layoutChanges = breakpointObserver.observe([
  '(orientation: portrait)',
  '(orientation: landscape)',
]);

layoutChanges.subscribe(result => {
  updateMyLayoutForOrientationChange();
});
```

#### Default breakpoints
A set of default media queries are available corresponding to breakpoints for different device
types.

```ts
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({...})
class MyComponent {
  constructor(breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      if (result.matches) {
        this.activateHandsetLayout();
      }
    });
  }
}
```

The built-in breakpoints based on [Google's Material Design
specification](https://material.io/guidelines/layout/responsive-ui.html#responsive-ui-breakpoints).
The available values are:
* Handset
* Tablet
* Web
* HandsetPortrait
* TabletPortrait
* WebPortrait
* HandsetLandscape
* TabletLandscape
* WebLandscape


### MediaMatcher
`MediaMatcher` is a lower-level utility that wraps the native `matchMedia`. This service normalizes
browser differences and serves as a convenient API that can be replaced with a fake in unit tests.
The `matchMedia` method can be used to get a native
[`MediaQueryList`](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList).

```ts
@Component({...})
class MyComponent {
  constructor(mediaMatcher: MediaMatcher) {
    const mediaQueryList = mediaMatcher.matchMedia('(min-width: 1px)');
  }
}
```
