Connect user input to screen reactions by using ripples to both indicate the point of touch, and to
confirm that touch input was received. For touch or mouse, this occurs at the point of contact.

The `matRipple` attribute directive defines an area in which a ripple animates on user interaction.

```html
<div matRipple [matRippleColor]="myColor">
  <ng-content></ng-content>
</div>
```

By default, a ripple is activated when the host element of the `matRipple` directive receives
mouse or touch events. Upon being pressed, a ripple will begin fading in from the point of contact,
radiating to cover the host element. Each ripple will fade out only upon release of the mouse or touch.

Ripples can also be triggered programmatically by getting a reference to the MatRipple directive
and calling its `launch` method.


### Ripple trigger

By default ripples will fade in on interaction with the directive's host element.
In some situations, developers may want to show ripples on interaction with *some other* element,
but still want to have the ripples placed in another location. This can be done by specifying
the `matRippleTrigger` option that expects a reference to an `HTMLElement`.

```html
<div>
  <div matRipple [matRippleTrigger]="trigger" class="my-ripple-container">
    <!-- This is the ripple container, but not the trigger element for ripples. -->
  </div>

  <div #trigger></div>
</div>
```

### Manual ripples

Ripples can be shown programmatically by getting a reference to the `MatRipple` directive.

```ts
class MyComponent {

  /** Reference to the directive instance of the ripple. */
  @ViewChild(MatRipple) ripple: MatRipple;

  /** Shows a centered and persistent ripple. */
  launchRipple() {
    const rippleRef = this.ripple.launch({
      persistent: true,
      centered: true
    });

    // Fade out the ripple later.
    rippleRef.fadeOut();
  }
}
```

In the example above, no specific coordinates have been passed, because the `centered`
ripple option has been set to `true` and the coordinates would not matter.

Ripples that are being dispatched programmatically can be launched with the `persistent` option.
This means that the ripples will not fade out automatically, and need to be faded out using
the `RippleRef` (*useful for focus indicators*).

In case, developers want to launch ripples at specific coordinates within the element, the
`launch()` method also accepts `x` and `y` coordinates as parameters. Those coordinates
are relative to the ripple container element.

```ts
const rippleRef = this.ripple.launch(10, 10, {persistent: true});
```

### Global options

Developers are able to specify options for all ripples inside of their application.

The speed of the ripples can be adjusted and the ripples can be disabled globally as well.

Global ripple options can be specified by setting the `MAT_RIPPLE_GLOBAL_OPTIONS` provider.

```ts
const globalRippleConfig: RippleGlobalOptions = {
  disabled: true,
  animation: {
    enterDuration: 300,
    exitDuration: 0
  }
};

@NgModule({
  providers: [
    {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig}
  ]
})
```

All available global options can be seen in the `RippleGlobalOptions` interface.

### Disabling animation

The animation of ripples can be disabled by using the `animation` global option. If the
`enterDuration` and `exitDuration` is being set to `0`, ripples will just appear without any
animation.

This is specifically useful in combination with the `disabled` global option, because globally
disabling ripples won't affect the focus indicator ripples. If someone still wants to disable
those ripples for performance reasons, the duration can be set to `0`, to remove the ripple feel.

```ts
const globalRippleConfig: RippleGlobalOptions = {
  disabled: true,
  animation: {
    enterDuration: 0,
    exitDuration: 0
  }
};
```

**Note**: Ripples will also have no animation if the `NoopAnimationsModule` is being used. This
also means that the durations in the `animation` configuration won't be taken into account.

### Animation behavior

There are two different animation behaviors for the fade-out of ripples shown in the Material
Design specifications.

By default, all ripples will start fading out if the mouse or touch is released and the enter
animation completed. The second possible behavior, which is also shown in the specifications, is
that ripples start to fade out immediately on mouse or touch release.

In some scenarios, developers might prefer that behavior over the default and would like to have
the same for Angular Material. This behavior can be activated by specifying the
`terminateOnPointerUp` global ripple option.

```ts
const globalRippleConfig: RippleGlobalOptions = {
  terminateOnPointerUp: true
};
```

### Updating global options at runtime

To change global ripple options at runtime, just inject the `MAT_RIPPLE_GLOBAL_OPTIONS`
provider and update the desired options.

There are various ways of injecting the global options. In order to make it easier to
inject and update options at runtime, it's recommended to create a service that implements
the `RippleGlobalOptions` interface.

```ts
@Injectable({providedIn: 'root'})
export class AppGlobalRippleOptions implements RippleGlobalOptions {
  /** Whether ripples should be disabled globally. */
  disabled: boolean = false;
}
```

```ts
@NgModule({
  providers: [
    {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useExisting: AppGlobalRippleOptions},
  ]
})
export class MyModule {...}
```

Now that the global ripple options are set to a service we can inject, the service can be
used update any global ripple option at runtime.

```ts
@Component(...)
export class MyComponent {
  constructor(private _appRippleOptions: AppGlobalRippleOptions) {}

  disableRipples() {
    this._appRippleOptions.disabled = true;
  }
}
```
