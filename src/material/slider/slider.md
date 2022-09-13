`<mat-slider>` allows for the selection of a value from a range via mouse, touch, or keyboard,
similar to `<input type="range">`.

<!-- example(slider-overview) -->

### Selecting a value

By default the minimum value of the slider is `0`, the maximum value is `100`, and the thumb moves
in increments of `1`. These values can be changed by setting the `min`, `max`, and `step` attributes
respectively. The initial value is set to the minimum value unless otherwise specified.

```html
<mat-slider min="1" max="5" step="0.5" value="1.5">
  <input matSliderThumb>
</mat-slider>
```

### Selecting a range
A `<mat-slider>` can be converted into a range slider by projecting both a `matStartThumb` and a
`matEndThumb` into it. Each of the thumbs has an independent value, but they won't be allowed to
overlap and they're still bound by the same `min` and `max` from the slider.

```html
<mat-slider>
  <input matSliderStartThumb>
  <input matSliderEndThumb>
</mat-slider>
```

<!-- example(slider-range) -->

### Thumb label
By default, the exact selected value of a slider is not visible to the user. However, this value can
be added to the thumb by adding the `discrete` attribute.

```html
<mat-slider discrete>
  <input matSliderThumb>
</mat-slider>
```

### Formatting the thumb label
By default, the value in the slider's thumb label will be the same as the model value, however this
may end up being too large to fit into the label. If you want to control the value that is being
displayed, you can do so using the `displayWith` input.

<!-- example(slider-formatting) -->

### Tick marks
By default, sliders do not show tick marks along the thumb track. This can be enabled using the
`showTickMarks` attribute.

```html
<mat-slider showTickMarks>
  <input matSliderThumb>
</mat-slider>
```


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

### Accessibility

`MatSlider` uses an internal `<input type="range">` to provide an accessible experience. The input
receives focus and it can be labelled using `aria-label` or `aria-labelledby`.
