The `bidi` package provides a common system for components to get and respond to change in the
application's LTR/RTL layout direction.

### Directionality

When including the CDK's `BidiModule`, components can inject `Directionality` to get the current
text direction (RTL or LTR);

#### Example
```ts
@Component({ ... })
export class MyWidget implements OnDestroy {

  /** Whether the widget is in RTL mode or not. */
  private isRtl: boolean;

  /** Subscription to the Directionality change EventEmitter. */
  private _dirChangeSubscription = Subscription.EMPTY;

  constructor(dir: Directionality) {
    this.isRtl = dir.value === 'rtl';

    this._dirChangeSubscription = dir.change.subscribe(() => {
      this.flipDirection();
    });
  }

  ngOnDestroy() {
    this._dirChangeSubscription.unsubscribe();
  }
}
```

### The `Dir` directive
The `BidiModule` also includes a directive that matches any elements with a `dir` attribute. This
directive has the same API as Directionality and provides itself _as_ `Directionality`. By doing
this, any component that injects `Directionality` will get the closest ancestor layout direction
context.

### Interpreting the `auto` value
The CDK also supports the native `auto` value for the `dir` attribute, however there's a difference
in how it is interpreted. Some parts of the CDK, like overlays and keyboard navigation, need to know
if the element is in an RTL or LTR layout in order to work correctly. For performance reasons, we
resolve the `auto` value by looking at the browser's language (`navigator.language`) and matching
it against a set of known RTL locales. This differs from the way the browser handles it, which is
based on the text content of the element.
