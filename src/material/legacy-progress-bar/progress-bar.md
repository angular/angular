`<mat-progress-bar>` is a horizontal progress-bar for indicating progress and activity.

### Progress mode
The progress-bar supports four modes: determinate, indeterminate, buffer and query.

#### Determinate
Operations where the percentage of the operation complete is known should use the 
determinate indicator.

<!-- example(progress-bar-determinate) -->

This is the default mode and the progress is represented by the `value` property.

#### Indeterminate
Operations where the user is asked to wait while something finishes and it’s 
not necessary to indicate how long it will take should use the indeterminate indicator.

<!-- example(progress-bar-indeterminate) -->

In this mode the `value` property is ignored.

#### Buffer
Use the `buffer` mode of the progress-bar to indicate some activity or loading from the server.

<!-- example(progress-bar-buffer) -->

In "buffer" mode, `value` determines the progress of the primary bar while the `bufferValue` is 
used to show the additional buffering progress.

#### Query
Use the `query` mode of the progress-bar to indicate pre-loading before the actual loading starts.


<!-- example(progress-bar-query) -->

In "query" mode, the progress-bar renders as an inverted "indeterminate" bar. Once the response 
progress is available, the `mode` should be changed to determinate to convey the progress. In
this mode the `value` property is ignored.

### Theming
The color of a progress-bar can be changed by using the `color` property. By default, progress-bars
use the theme's primary color. This can be changed to `'accent'` or `'warn'`.  

### Accessibility

`MatProgressBar` implements the ARIA `role="progressbar"` pattern. By default, the progress bar
sets `aria-valuemin` to `0` and `aria-valuemax` to `100`. Avoid changing these values, as this may
cause incompatibility with some assistive technology.

Always provide an accessible label via `aria-label` or `aria-labelledby` for each progress bar.
