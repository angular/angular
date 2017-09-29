### BreakpointsModule

When including the CDK's `LayoutModule`, components can inject `BreakpointsObserver` to request
the matching state of a CSS Media Query.

A set of breakpoints is provided based on the Material Design
[breakpoint system](https://material.io/guidelines/layout/responsive-ui.html#responsive-ui-breakpoints).

#### Example
```ts
@Component({ ... })
export class MyWidget {
  isHandset: Observable<BreakpointState>;

  constructor(bm: BreakpointObserver) {
    bm.observe(Handset).subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.makeEverythingFitOnSmallScreen();
      } else {
        this.expandEverythingToFillTheScreen();
      }
    });
  }
}
```

