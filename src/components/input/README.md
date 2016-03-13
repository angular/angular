# mdInput

Inputs are the basic input component of Material 2. The spec can be found [here](https://www.google.com/design/spec/components/text-fields.html).

### Screenshots



## Type

At the time of writing this README, the `[type]` attribute is copied to the actual `<input>` element in the `<md-input>`.

The valid `type` attribute values are any supported by your browser, with the exception of `file`, `checkbox` and `radio`. File inputs aren't supported for now, while check boxes and radio buttons have their own components.

## Prefix and Suffix

You can include HTML before, and after the input tag, as prefix or suffix. It will be underlined as per the Material specification, and clicking it will focus the input.

To add a prefix, use the `md-prefix` attribute on the element. Similarly, to add a suffix, use the `md-suffix` attribute. For example, in a template:

```html
<md-input type="number" placeholder="amount">
  <span md-prefix>$</span>
  <span md-suffix>.00</span>
</md-input>
```

Will result in this:

!!!! INSERT SCREENSHOT HERE.


## Hint Labels

Hint labels are the labels that shows the underline. You can have up to two hint labels; one on the `start` of the line (left in an LTR language, right in RTL), or one on the `end`.

You specify a hint-label in one of two ways; either using the `hintLabel` attribute, or using an `<md-hint>` directive in the `<md-input>`, which takes an `align` attribute containing the side. The attribute version is assumed to be at the `start`.

Specifying a side twice will result in an exception during initialization.

## Divider Color

