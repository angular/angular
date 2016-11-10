# mdInput / mdTextarea

Inputs are the basic input component of Material 2. The spec can be found [here](https://www.google.com/design/spec/components/text-fields.html).



## Notes
* The `<md-input>` / `<md-textarea>` component fully support two-way binding of `ngModel`, as if it was a normal `<input>` and `<textarea>`.



## Type

At the time of writing this README, the `[type]` attribute is copied to the actual `<input>` element in the `<md-input>`.

The valid `type` attribute values are any supported by your browser, with the exception of `file`, `checkbox` and `radio`. File inputs aren't supported for now, while check boxes and radio buttons have their own components.


## Placeholder

A placeholder is an indicative text displayed in the input zone when the input does not contain text. When text is present, the indicative text will float above this input zone.

You can set the `floatingPlaceholder` attribute to `false` to hide the indicative text instead when text is present in the input.

You can specify a placeholder for the input in one of two ways; either using the `placeholder` attribute, or using an `<md-placeholder>` directive in the `<md-input>`. Using both will raise an error.


## Prefix and Suffix

You can include HTML before, and after the input tag, as prefix or suffix. It will be underlined as per the Material specification, and clicking it will focus the input.

To add a prefix, use the `md-prefix` attribute on the element. Similarly, to add a suffix, use the `md-suffix` attribute. For example, in a template:

#### Example

```html
<md-input placeholder="amount" align="end">
  <span md-prefix>$&nbsp;</span>
  <span md-suffix>.00</span>
</md-input>
```

Will result in this:

<img src="https://material.angularjs.org/material2_assets/input/prefix-suffix.png">



## Hint Labels

Hint labels are the labels that shows the underline. You can have up to two hint labels; one on the `start` of the line (left in an LTR language, right in RTL), or one on the `end`.

You specify a hint-label in one of two ways; either using the `hintLabel` attribute, or using an `<md-hint>` directive in the `<md-input>`, which takes an `align` attribute containing the side. The attribute version is assumed to be at the `start`.

Specifying a side twice will result in an exception during initialization.

#### Example

A simple character counter can be made like the following:

```html
<md-input placeholder="Character count (100 max)" maxlength="100" class="demo-full-width"
          value="Hello world. How are you?"
          #characterCountHintExample>
  <md-hint align="end">{{characterCountHintExample.characterCount}} / 100</md-hint>
</md-input>
```

<img src="https://material.angularjs.org/material2_assets/input/character-count.png">



## Divider Color

The divider (line under the `<md-input>` content) color can be changed by using the `dividerColor` attribute. A value of `primary` is the default and will correspond to your theme primary color. Alternatively, you can specify `accent` or `warn`.

#### Example

^((please note that this example has been doctored to show the colors; they would normally show only on focus)^)

<img src="https://material.angularjs.org/material2_assets/input/divider-colors.png">



## Labelling

You can label the `<md-input>` as you would a regular `<input>`.

## Focus

You can put the focus on an input component using the `focus()` method.

### Example

```html
<md-input #nameInput placeholder="name"></md-input>
```

```ts
export class MyComponent implements AfterViewInit {
  @ViewChild('nameInput') nameInput: MdInput;

  ngAfterViewInit() {
    this.nameInput.focus();
  }
}
```

## Textareas

```html
<md-textarea placeholder="Textarea with autosize"></md-textarea>
```

### Example

## Full Forms

You can make a full form using inputs, and it will support autofill natively.

#### Example

```html
<md-card class="demo-card demo-basic">
  <md-toolbar color="primary">Basic</md-toolbar>
  <md-card-content>
    <form>
      <md-input class="demo-full-width" placeholder="Company (disabled)" disabled value="Google">
      </md-input>

      <table style="width: 100%" cellspacing="0"><tr>
        <td><md-input placeholder="First name" style="width: 100%"></md-input></td>
        <td><md-input placeholder="Long Last Name That Will Be Truncated" style="width: 100%"></md-input></td>
      </tr></table>
      <p>
        <md-textarea class="demo-full-width" placeholder="Address" value="1600 Amphitheatre Pkway"></md-textarea>
        <md-textarea class="demo-full-width" placeholder="Address 2"></md-textarea>
      </p>
      <table style="width: 100%" cellspacing="0"><tr>
        <td><md-input class="demo-full-width" placeholder="City"></md-input></td>
        <td><md-input class="demo-full-width" placeholder="State"></md-input></td>
        <td><md-input #postalCode class="demo-full-width" maxlength="5"
                      placeholder="Postal Code"
                      value="94043">
          <md-hint align="end">{{postalCode.characterCount}} / 5</md-hint>
        </md-input></td>
      </tr></table>
    </form>
  </md-card-content>
</md-card>
```

Will result in this:

<img src="https://material.angularjs.org/material2_assets/input/full-form.png">
