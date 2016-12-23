`<md-slider>` allows for the selection of a value from a range via mouse, touch, or keyboard, 
similar to `<input type="range">`.

<!-- example(slider-overview) -->

_Note: the sliding behavior for this component requires that HammerJS is loaded on the page._

### Selecting a value

By default the minimum value of the slider is `0`, the maximum value is `100`, and the thumb moves
in increments of `1`. These values can be changed by setting the `min`, `max`, and `step` attributes
respectively. The initial value is set to the minimum value unless otherwise specified.

```html
<md-slider min="1" max="5" step="0.5" value="1.5"></md-slider>
```

### Orientation

By default sliders are horizontal with the minimum value on the left and the maximum value on the
right. The `vertical` attribute can be added to a slider to make it vertical with the minimum value
on bottom and the maximum value on top.

```html
<md-slider vertical></md-slider>
```

An `invert` attribute is also available which can be specified to flip the axis that the thumb moves
along. An inverted horizontal slider will have the minimum value on the right and the maximum value
on the left, while an inverted vertical slider will have the minimum value on top and the  maximum
value on bottom.

```html
<md-slider invert></md-slider>
```

### Thumb label
By default, the exact selected value of a slider is not visible to the user. However, this value can
be added to the thumb by adding the `thumbLabel` attribute.

The [Material Design spec](https://material.google.com/components/sliders.html) recommends using the
`thumbLabel` attribute (along with `tickInterval="1"`) only for sliders that are used to display a
discrete value (such as a 1-5 rating).

```html
<md-slider thumbLabel tickInterval="1"></md-slider>
```

### Tick marks
By default, sliders do not show tick marks along the thumb track. This can be enabled using the
`tickInterval` attribute. The value of `tickInterval` should be a number representing the number
of steps between between ticks. For example a `tickInterval` of `3` with a `step` of `4` will draw
tick marks at every `3` steps, which is the same as every `12` values.

```html
<md-slider step="4" tickInterval="3"></md-slider>
```

The `tickInterval` can also be set to `auto` which will automatically choose the number of steps
such that there is at least `30px` of space between ticks.

```html
<md-slider tickInterval="auto"></md-slider>
```

The slider will always show a tick at the beginning and end of the track. If the remaining space
doesn't add up perfectly the last interval will be shortened or lengthened so that the tick can be
shown at the end of the track.

The [Material Design spec](https://material.google.com/components/sliders.html) recommends using the
`tickInterval` attribute (set to `1` along with the `thumbLabel` attribute) only for sliders that
are used to display a discrete value (such as a 1-5 rating).


### Keyboard interaction
The slider has the following keyboard bindings:

| Key         | Action                                                                             |
|-------------|------------------------------------------------------------------------------------|
| Right arrow | Increment the slider value by one step (decrements in RTL).                        |
| Up arrow    | Increment the slider value by one step.                                            |
| Left arrow  | Decrement the slider value by one step (increments in RTL).                        |
| Down arrow  | Decrement the slider value by one step.                                            |
| Page up     | Increment the slider value by 10 steps.                                            |
| Page down   | Decrement the slider value by 10 steps.                                            |
| End         | Set the value to the maximum possible.                                             |
| Home        | Set the value to the minimum possible.                                             |
