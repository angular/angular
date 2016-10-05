# md-slider

`MdSlider` is a component that allows users to select from a range of values by moving the slider
thumb.
You can read more about the slider in the
[Material Design spec](https://material.google.com/components/sliders.html).

## Not Yet Implemented

* Thumb Label
* Color
* Invert
* NgModel
* Keyboard Movement
* Focus Ring
* Smaller/grey thumb at minimum value

## Usage

### Basic Usage

`md-slider` can be used on its own as a slider with a min of `0`, a max of `100`, and a step of `1`.

```html
<md-slider></md-slider>
```

### Slider with Minimum and Maximum Values

The min and max on a `md-slider` can be set to give a different range of values.
These can be set individually and do not need to both be set.

```html
<md-slider min="1" max="5"></md-slider>
```

### Disabled Slider

`md-slider` can be disabled so that the value cannot be changed and the thumb cannot be moved.

```html
<md-slider disabled></md-slider>
```

### Slider with Value

`md-slider` can have a value defined so that it starts at a specific value on the slider.

```html
<md-slider value="24"></md-slider>
```

### Slider with Step

`md-slider` can have the step defined which declares where the thumb can snap to.

```html
<md-slider step="5"></md-slider>
```

### Slider with Tick Interval

`md-slider` can have a tick interval set to a number or to `auto`.
`auto` will automatically draw tick marks on steps that are at least 30px apart and will always draw
tick marks at the beginning and end of the slider.
Setting `tick-interval` to a number will draw a tick mark at every `tick-interval` steps. An example
of this is a `tick-interval` of `3` with a `step` of `4` will draw tick marks at every `3` steps,
which is the same as every `12` values.

```html
<md-slider tick-interval="auto"></md-slider>
<md-slider tick-interval="3" step="4"></md-slider>
```

## `<md-slider>`

### Bound Properties

| Name | Type | Description |
| --- | --- | --- |
| `min` | number | Optional, the minimum number for the slider. Default = `0`. |
| `max` | number | Optional, the maximum number for the slider. Default = `100`. |
| `value` | number | Optional, the value to start the slider at. |
| `tick-interval` | `"auto" | number` | Optional, how many steps between tick marks. |
| `step` | number | Optional, declares where the thumb will snap to. Default = `1`. |
| `disabled` | boolean | Optional, whether or not the slider is disabled. Default = `false`. |
