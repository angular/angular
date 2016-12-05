# md-slider

`md-slider` is a component that allows users to select from a range of values by moving the slider
thumb. It is similar in behavior to the native `<input type="range">` element. You can read more
about the slider in the [Material Design spec](https://material.google.com/components/sliders.html).

Simple example:
```html
<md-slider></md-slider>
```

## Usage

### Changing the min, max, step, and initial value

By default the minimum value of the slider is `0`, the maximum value is `100`, and the thumb moves
in increments of `1`. These values can be changed by setting the `min`, `max`, and `step` attributes
respectively. The initial value is set to the minimum value unless otherwise specified.

```html
<md-slider min="1" max="5" step="0.5" value="1.5"></md-slider>
```

### Setting the orientation

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

### Adding a thumb label

By default the exact selected value of a slider is not visible to the user. However, this value can
be added to the thumb by adding the `thumb-label` attribute.

The [material design spec](https://material.google.com/components/sliders.html) recommends using the
`thumb-label` attribute (along with `tick-interval="1"`) only for sliders that are used to display a
discrete value (such as a 1-5 rating).

```html
<md-slider thumb-label tick-interval="1"></md-slider>
```

### Adding ticks

By default a sliders do not show tick marks along the thumb track. They can be enabled using the
`tick-interval` attribute. The value of `tick-interval` should be a number representing the number
of steps between between ticks. For example a `tick-interval` of `3` with a `step` of `4` will draw
tick marks at every `3` steps, which is the same as every `12` values.

```html
<md-slider step="4" tick-interval="3"></md-slider>
```

The `tick-interval` can also be set to `auto` which will automatically choose the number of steps
such that there is at least `30px` of space between ticks.

```html
<md-slider tick-interval="auto"></md-slider>
```
 
The slider will always show a tick at the beginning and end of the track. If the remaining space
doesn't add up perfectly the last interval will be shortened or lengthened so that the tick can be
shown at the end of the track.

The [material design spec](https://material.google.com/components/sliders.html) recommends using the
`tick-interval` attribute (set to `1` along with the `thumb-label` attribute) only for sliders that
are used to display a discrete value (such as a 1-5 rating).

### Disabling the slider

The `disabled` attribute can be used to disable the slider, preventing the user from changing the
value.

```html
<md-slider disabled value="5"></md-slider>
```

### Value binding

`md-slider` supports both 1-way binding and 2-way binding via `ngModel`. It also emits a `change`
event when the value changes due to user interaction. 

```html
<md-slider [value]="myValue" (change)="onChange()"></md-slider>
```

```html
<md-slider [(ngModel)]="myValue"></md-slider>
```

## Accessibility

The slider has the following keyboard bindings:

| Key | Action |
| --- | --- |
| Right arrow | Increment the slider value by one step. (Decrement in right-to-left-languages). |
| Up arrow | Increment the slider value by one step. |
| Left arrow | Decrement the slider value by one step. (Increment in right-to-left-languages). |
| Down arrow | Decrement the slider value by one step. |
| Page up | Increment the slider value by 10 steps. |
| Page down | Decrement the slider value by 10 steps. |
| End | Set the value to the maximum possible. |
| Home | Set the value to the minimum possible. |

## Internationalization

In right-to-left languages the horizontal slider has the minimum value on the right and the maximum
value on the left by default. The meaning of the left and right arrow keys is also swapped in
right-to-left languages.

## API Summary

### Inputs

| Name | Type | Description |
| --- | --- | --- |
| `min` | number | Optional, the minimum number for the slider. Default = `0`. |
| `max` | number | Optional, the maximum number for the slider. Default = `100`. |
| `step` | number | Optional, declares where the thumb will snap to. Default = `1`. |
| `value` | number | Optional, the value to start the slider at. |
| `tick-interval` | `"auto" | number` | Optional, how many steps between tick marks. |
| `invert` | boolean | Optional, whether to invert the axis the thumb moves along. |
| `vertical` | boolean | Optional, whether the slider should be oriented vertically. |
| `disabled` | boolean | Optional, whether or not the slider is disabled. Default = `false`. |

### Outputs

| Name | Description |
| --- | --- |
| `change` | Emitted when the value changes due to user interaction. |


## Future work & open questions

* Update focused, disabled, and `value=min` states to match spec.
* Should there be an option to not force the end tick to be shown?
