`<md-input-container>` is a wrapper for native `input` and `textarea` elements. This container 
applies Material Design styles and behavior while still allowing direct access to the underlying
native element.

The native element wrapped by the `md-input-container` must be marked with the `mdInput` directive.

<!-- example(input-overview) -->

### `input` and `textarea` attributes

All of the attributes that can be used with normal `input` and `textarea` elements can be used on
elements inside `md-input-container` as well. This includes Angular directives such as
`ngModel` and `formControl`.

The only limitations are that the `type` attribute can only be one of the values supported by
`md-input-container` and the native element cannot specify a `placeholder` attribute if the
`md-input-container` also contains a `md-placeholder` element. 

### Supported `input` types

The following [input types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) can
be used with `md-input-container`:
* date
* datetime-local
* email
* month
* number
* password
* search
* tel
* text
* time
* url
* week

### Placeholder

A placeholder is an indicative text displayed in the input zone when the input does not contain
text. When text is present, the indicative text will float above this input zone.

The `floatPlaceholder` attribute of `md-input-container` can be set to `never` to hide the
indicative text instead when text is present in the input.

When setting `floatPlaceholder` to `always` the floating label will always show above the input.

A placeholder for the input can be specified in one of two ways: either using the `placeholder`
attribute on the `input` or `textarea`, or using an `md-placeholder` element in the
`md-input-container`. Using both will raise an error.

### Prefix and Suffix

HTML can be included before, and after the input tag, as prefix or suffix. It will be underlined as
per the Material specification, and clicking it will focus the input.

Adding the `mdPrefix` attribute to an element inside the `md-input-container` will designate it as
the prefix. Similarly, adding `mdSuffix` will designate it as the suffix.

### Hint Labels

Hint labels are the labels that show below the underline. An `md-input-container` can have up to two
hint labels; one on the `start` of the line (left in an LTR language, right in RTL), and one on the
`end`.

Hint labels are specified in one of two ways: either using the `hintLabel` attribute of
`md-input-container`, or using an `md-hint` element inside the `md-input-container`, which takes an
`align` attribute containing the side. The attribute version is assumed to be at the `start`.
Specifying a side twice will result in an exception during initialization.

### Divider Color

The divider (line under the `input` content) color can be changed by using the `dividerColor`
attribute of `md-input-container`. A value of `primary` is the default and will correspond to the
theme primary color. Alternatively, `accent` or `warn` can be specified to use the theme's accent or
warn color.
