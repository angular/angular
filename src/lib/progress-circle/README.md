# md-progress-circle

`md-progress-circle` is a component for indicating progress and activity, matching the spec of 
[Material Design Progress & Activity](https://www.google.com/design/spec/components/progress-activity.html).

### Progress Modes

There are two modes:
 1. Determinate - `<md-progress-circle mode="determinate">`
    * Indicates how long an operation will take when the percentage complete is detectable. 
 2. Indeterminate - `<md-progress-circle mode="indeterminate">` or `<md-spinner>`
    * Indicates the user must wait while something finishes when it’s not necessary or possible to indicate how long it
      will take.

Example:

 ```html
<md-progress-circle mode="determinate" value="myValue"></md-progress-circle>
<md-progress-circle mode="indeterminate"></md-progress-circle>
<md-spinner></md-spinner>
 ```

### Theming

All progress indicators can be themed to match your "primary" palette, your "accent" palette, or your "warn" palette using the appropriate class.

Example:

 ```html
<md-progress-circle mode="indeterminate" color="primary"></md-progress-circle>
<md-progress-circle mode="indeterminate" color="accent"></md-progress-circle>
<md-progress-circle mode="indeterminate" color="warn"></md-progress-circle>
 ```

### Accessibility

 * ARIA attributes are applied to the indicator defining the valuemin, valuemax and valuenow attributes.

### Upcoming work

 * Adding ARIA attribute for progressbar "for".

### API Summary

Properties:

| Name      | Type                              | Description |
| ---       | ---                               | --- |
| `color`   | `"primary"|"accent"|"warn"`       | The color palette of the progress indicator |
| `mode`    | `"determinate"|"indeterminate"`   | The mode of the progress indicator |
| `value`   | number                            | The current progress percentage for determinate indicators |
