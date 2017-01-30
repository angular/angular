`<md-progress-bar>` is a horizontal progress-bar for indicating progress and activity.

<!-- example(progress-bar-overview) -->


### Progress mode
The progress-bar supports four modes.

| Mode          | Description                                                                      |
|---------------|----------------------------------------------------------------------------------|
| determinate   | Standard progress bar, fills from 0% to 100%                                     |
| indeterminate | Indicates that something is happening without conveying a discrete progress      |
| buffer        | Dual-progress mode, typically showing both video download and playback progress  |
| query         | Dual-stage mode, typically showing sending a request and downloading a response  |

The default mode is "determinate". In this mode, the progress is set via the `value` property, 
which can be a whole number between 0 and 100.

In "buffer" mode, `value` determines the progress of the primary bar while the `bufferValue` is 
used to show the additional buffering progress.

In "query" mode, the progress-bar renders as an inverted "indeterminate" bar. Once the response 
progress is available, the `mode` should be changed to determinate to convey the progress.  

In both "indeterminate" and "query" modes, the `value` property is ignored.


### Theming
The color of a progress-bar can be changed by using the `color` property. By default, progress-bars
use the theme's primary color. This can be changed to `'accent'` or `'warn'`.  
