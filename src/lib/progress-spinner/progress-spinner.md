`<md-progress-spinner>` and `<md-spinner>` are a circular indicators of progress and activity.

<!-- example(progress-spinner-overview) -->

### Progress mode
The progress-spinner supports two modes, "determinate" and "indeterminate". 
The `<md-spinner>` component is an alias for `<md-progress-spinner mode="indeterminate">`.

| Mode          | Description                                                                      |
|---------------|----------------------------------------------------------------------------------|
| determinate   | Standard progress indicator, fills from 0% to 100%                               |
| indeterminate | Indicates that something is happening without conveying a discrete progress      |


The default mode is "determinate". In this mode, the progress is set via the `value` property, 
which can be a whole number between 0 and 100.

In "indeterminate" mode, the `value` property is ignored.


### Theming
The color of a progress-spinner can be changed by using the `color` property. By default, 
progress-spinners use the theme's primary color. This can be changed to `'accent'` or `'warn'`.
