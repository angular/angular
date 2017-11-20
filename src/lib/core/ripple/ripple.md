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
    const rippleRef = this.ripple.launch(0, 0, {
      persistent: true,
      centered: true
    });
    
    // Fade out the ripple later.
    rippleRef.fadeOut();
  }
}
```

In the example above, the `x` and `y` parameters will be ignored, because the `centered`
ripple option has been set to `true`.

Ripples that are being dispatched programmatically can be launched with the `persistent` option.
This means that the ripples will not fade out automatically, and need to be faded out using
the `RippleRef` (*useful for focus indicators*).

### Global options

Developers are able to specify options for all ripples inside of their application.

The speed of the ripples can be adjusted and the ripples can be disabled globally as well.

Global ripple options can be specified by setting the `MAT_RIPPLE_GLOBAL_OPTIONS` provider.

```ts
const globalRippleConfig: RippleGlobalOptions = {
  disabled: true,
  baseSpeedFactor: 1.5 // Ripples will animate 50% faster than before.
}

@NgModule({
  providers: [
    {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig} 
  ]
})
```

All available global options can be seen in the `RippleGlobalOptions` interface.
