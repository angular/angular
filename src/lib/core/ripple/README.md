# md-ripple

`md-ripple` defines an area in which a ripple animates, usually in response to user action. It is used as an attribute directive, for example `<div md-ripple [mdRippleColor]="rippleColor">...</div>`.

By default, a ripple is activated when the host element of the `md-ripple` directive receives mouse or touch events. On a mousedown or touch start, the ripple background fades in. When the click event completes, a circular foreground ripple fades in and expands from the event location to cover the host element bounds.

Ripples can also be triggered programmatically by getting a reference to the MdRipple directive and calling its `start` and `end` methods.


### Upcoming work

Ripples will be added to the `md-button`, `md-radio-button`, `md-checkbox`, and `md-nav-list` components.

### API Summary

Properties:

| Name | Type | Description |
| --- | --- | --- |
| `mdRippleTrigger` | Element | The DOM element that triggers the ripple when clicked. Defaults to the parent of the `md-ripple`.
| `mdRippleColor` | string | Custom color for foreground ripples
| `mdRippleCentered` | boolean | If true, the ripple animation originates from the center of the `md-ripple` bounds rather than from the location of the click event.
| `mdRippleRadius` | number | Optional fixed radius of foreground ripples when fully expanded. Mainly used in conjunction with `unbounded` attribute. If not set, ripples will expand from their origin to the most distant corner of the component's bounding rectangle.
| `mdRippleUnbounded` | boolean | If true, foreground ripples will be visible outside the component's bounds.
| `mdRippleDisabled` | boolean | If true, click events on the trigger element will not activate ripples. The `start` and `end` methods can still be called to programmatically create ripples.
