# md-input-container

Inputs are the basic input component of Material 2. The spec can be found
[here](https://www.google.com/design/spec/components/text-fields.html). `md-input-container` acts as
a wrapper for native `input` and `textarea` elements that is used to add material design styles and
behavior. The native element wrapped by the `md-input-container` must be marked with the `md-input`
directive.

<!-- example(input-overview) -->

## Usage

### `input` and `textarea` attributes

All of the attributes that can be used with normal `input` and `textarea` elements can be used on
elements within the `md-input-container` as well. This includes angular specific ones such as
`ngModel` and `formControl`.

The only limitations are that the `type` attribute can only be one of the values supported by
`md-input-container` and the native element cannot specify a `placeholder` attribute if the
`md-input-container` also contains a `md-placeholder` element. 

#### Supported `input` types

The following [input types](http://www.w3schools.com/TAGs/att_input_type.asp) can be used with
`md-input-container`:
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

The `floatingPlaceholder` attribute of `md-input-container` can be set to `false` to hide the
indicative text instead when text is present in the input.

A placeholder for the input can be specified in one of two ways: either using the `placeholder`
attribute on the `input` or `textarea`, or using an `md-placeholder` element in the
`md-input-container`. Using both will raise an error.

### Prefix and Suffix

HTML can be included before, and after the input tag, as prefix or suffix. It will be underlined as
per the Material specification, and clicking it will focus the input.

Adding the `md-prefix` attribute to an element inside the `md-input-container` will designate it as
the prefix. Similarly, adding `md-suffix` will designate it as the suffix.

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
