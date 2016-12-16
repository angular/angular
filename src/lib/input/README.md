**NOTE: The <code>md-input</code> element is deprecated. <code>md-input-container</code> should be
used instead.**

# md-input-container

Inputs are the basic input component of Material 2. The spec can be found
[here](https://www.google.com/design/spec/components/text-fields.html). `md-input-container` acts as
a wrapper for native `input` and `textarea` elements. The native element wrapped by the
`md-input-container` must be marked with the `md-input` directive.

Simple `input` example:
```html
<md-input-container>
  <input md-input>
</md-input-container>
```

Simple `textarea` example:
```html
<md-input-container>
  <textarea md-input></textarea>
</md-input-container>
```

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

You can set the `floatingPlaceholder` attribute of `md-input-container` to `false` to hide the
indicative text instead when text is present in the input.

You can specify a placeholder for the input in one of two ways; either using the `placeholder`
attribute on the `input` or `textarea`, or using an `md-placeholder` element in the
`md-input-container`. Using both will raise an error.

### Prefix and Suffix

You can include HTML before, and after the input tag, as prefix or suffix. It will be underlined as
per the Material specification, and clicking it will focus the input.

To add a prefix, use the `md-prefix` attribute on the element. Similarly, to add a suffix, use the
`md-suffix` attribute. For example, in a template:

```html
<md-input-container align="end">
  <input md-input placeholder="amount">
  <span md-prefix>$&nbsp;</span>
  <span md-suffix>.00</span>
</md-input-container>
```

<img src="https://material.angularjs.org/material2_assets/input/prefix-suffix.png">

### Hint Labels

Hint labels are the labels that show below the underline. You can have up to two hint labels; one on
the `start` of the line (left in an LTR language, right in RTL), and one on the `end`.

You specify a hint label in one of two ways; either using the `hintLabel` attribute of
`md-input-container`, or using an `md-hint` element inside the `md-input-container`, which takes an
`align` attribute containing the side. The attribute version is assumed to be at the `start`.
Specifying a side twice will result in an exception during initialization.

For example, a simple character counter can be made like the following:
```html
<md-input-container>
  <input md-input
         placeholder="Character count (100 max)"
         maxlength="100"
         value="Hello world. How are you?"
         #characterCountHintExample>
  <md-hint align="end">{{characterCountHintExample.value.length}} / 100</md-hint>
</md-input-container>
```

<img src="https://material.angularjs.org/material2_assets/input/character-count.png">

### Divider Color

The divider (line under the `input` content) color can be changed by using the `dividerColor`
attribute of `md-input-container`. A value of `primary` is the default and will correspond to your
theme primary color. Alternatively, you can specify `accent` or `warn`.

```html
<md-input-container>
  <input md-input placeholder="Default color" value="example">
</md-input-container>
<md-input-container dividerColor="accent">
  <input md-input placeholder="Accent color" value="example">
</md-input-container>
<md-input-container dividerColor="warn">
  <input md-input placeholder="Warn color" value="example">
</md-input-container>
```

_please note that this image has been doctored to show each `input` as if it were focused:_
<img src="https://material.angularjs.org/material2_assets/input/divider-colors.png">

### Full Forms

You can make a full form using inputs, and they will support autofill natively.

```html
<form>
  <md-input-container style="width: 100%">
    <input md-input placeholder="Company (disabled)" disabled value="Google">
  </md-input-container>

  <table style="width: 100%" cellspacing="0"><tr>
    <td><md-input-container style="width: 100%">
      <input md-input placeholder="First name">
    </md-input-container></td>
    <td><md-input-container style="width: 100%">
      <input md-input placeholder="Long Last Name That Will Be Truncated">
    </md-input-container></td>
  </tr></table>
  
  <p>
    <md-input-container width="100%">
      <textarea md-input placeholder="Address" value="1600 Amphitheatre Pkway"></textarea>
    </md-input-container>
    <md-input-container width="100%">
      <textarea md-input placeholder="Address 2"></textarea>
    </md-input-container>
  </p>
  
  <table style="width: 100%" cellspacing="0"><tr>
    <td><md-input-container width="100%">
      <input md-input placeholder="City">
    </md-input-container></td>
    <td><md-input-container width="100%">
      <input md-input placeholder="State">
    </md-input-container></td>
    <td><md-input-container width="100%">
      <input md-input #postalCode maxlength="5" placeholder="Postal Code" value="94043">
      <md-hint align="end">{{postalCode.value.length}} / 5</md-hint>
    </md-input-container></td>
  </tr></table>
</form>
```

<img src="https://material.angularjs.org/material2_assets/input/full-form.png">

## API Summary

### Inputs

| Name | Type | Description |
| --- | --- | --- |
| `align` | `"start" | "end"` | The alignment of the `input` or `textarea`. Default = `"start"`. |
| `dividerColor` | `"primary" | "accent" | "warn"` | The color of the placeholder and underline. Default = `"primary"`. |
| `floatingPlaceholder` | boolean | Whether the placeholder should float above the input after text is entered. Default = `true`. |
| `hintLabel` | string | The hint text to show on the start end of the `md-input-container`. |
