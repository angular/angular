# md-progress-bar

`md-progress-bar` is a component for indicating progress and activity, matching the spec of 
[Material Design Progress & Activity](https://www.google.com/design/spec/components/progress-activity.html).

### Progress Modes

There are four modes:
 1. Determinate - `<md-progress-bar mode="determinate">`
    * Indicates how long an operation will take when the percentage complete is detectable. 
 2. Indeterminate - `<md-progress-bar mode="indeterminate">`
    * Indicates the user must wait while something finishes when it’s not necessary or possible to indicate how long it will take.
 3. Buffer - `<md-progress-bar mode="buffer">`
    * Indicates how long an operation will take when the percentage complete is detectable, also provides a value of the preloading for the operation.
 4. Query - `<md-progress-bar mode="query">`
    * Indicates the user must wait while something finishes when it is not yet possible to indicate how long it will take, but will be possible.  Once possible, the progress mode should be moved to buffer or determinate.
      

Example:

 ```html
<md-progress-bar mode="determinate" value="myValue"></md-progress-bar>
<md-progress-bar mode="indeterminate"></md-progress-bar>
<md-progress-bar mode="buffer" value="myValue" bufferValue="myBufferValue"></md-progress-bar>
<md-progress-bar mode="query"></md-progress-bar>
 ```

### Theming

All progress indicators can be themed to match your "primary" palette, your "accent" palette, or your "warn" palette using the appropriate class.

Example:

 ```html
<md-progress-bar mode="indeterminate" color="primary"></md-progress-bar>
<md-progress-bar mode="indeterminate" color="accent"></md-progress-bar>
<md-progress-bar mode="indeterminate" color="warn"></md-progress-bar>
 ```

### Accessibility

 * ARIA attributes are applied to the indicator defining the valuemin, valuemax and valuenow attributes.


### API Summary

Properties:

| Name            | Type                                                     | Description |
| ---             | ---                                                      | --- |
| `color`         | `"primary" | "accent" | "warn"`                          | The color palette of the progress indicator |
| `mode`          | `"determinate" | "indeterminate" | "buffer" | "query"`   | The mode of the progress indicator |
| `value`         | number                                                   | The current progress percentage for determinate indicators |
| `bufferValue`   | number                                                   | The current progress percentage for buffer secondary indicators |
