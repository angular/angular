The datepicker allows users to enter a date either through text input, or by choosing a date from
the calendar. It is made up of several components and directives that work together.

<!-- example(datepicker-overview) -->

### Connecting a datepicker to an input

A datepicker is composed of a text input and a calendar pop-up, connected via the `matDatepicker`
property on the text input.

```html
<input [matDatepicker]="myDatepicker">
<mat-datepicker #myDatepicker></mat-datepicker>
```

An optional datepicker toggle button is available. A toggle can be added to the example above:

```html
<input [matDatepicker]="myDatepicker">
<mat-datepicker-toggle [for]="myDatepicker"></mat-datepicker-toggle>
<mat-datepicker #myDatepicker></mat-datepicker>
```

This works exactly the same with an input that is part of an `<mat-form-field>` and the toggle
can easily be used as a prefix or suffix on the material input:

```html
<mat-form-field>
  <input matInput [matDatepicker]="myDatepicker">
  <mat-datepicker-toggle matSuffix [for]="myDatepicker"></mat-datepicker-toggle>
  <mat-datepicker #myDatepicker></mat-datepicker>
</mat-form-field>
```

### Setting the calendar starting view

By default the calendar will open in month view, this can be changed by setting the `startView`
property of `<mat-datepicker>` to `year`. In year view the user will see all months of the year and
then proceed to month view after choosing a month.

The month or year that the calendar opens to is determined by first checking if any date is
currently selected, if so it will open to the month or year containing that date. Otherwise it will
open to the month or year containing today's date. This behavior can be overridden by using the
`startAt` property of `<mat-datepicker>`. In this case the calendar will open to the month or year
containing the `startAt` date.

<!-- example(datepicker-start-view) -->

### Setting the selected date

The type of values that the datepicker expects depends on the type of `DateAdapter` provided in your
application. The `NativeDateAdapter`, for example, works directly with plain JavaScript `Date`
objects. When using the `MomentDateAdapter`, however, the values will all be Moment.js instances.
This use of the adapter pattern allows the datepicker component to work with any arbitrary date
representation with a custom `DateAdapter`.
See [_Choosing a date implementation_](#choosing-a-date-implementation-and-date-format-settings)
for more information.

Depending on the `DateAdapter` being used, the datepicker may automatically deserialize certain date
formats for you as well. For example, both the `NativeDateAdapter` and `MomentDateAdapter` allow
[ISO 8601](https://tools.ietf.org/html/rfc3339) strings to be passed to the datepicker and
automatically converted to the proper object type. This can be convenient when binding data directly
from your backend to the datepicker. However, the datepicker will not accept date strings formatted
in user format such as `"1/2/2017"` as this is ambiguous and will mean different things depending on
the locale of the browser running the code.

As with other types of `<input>`, the datepicker works with `@angular/forms` directives such as
`formGroup`, `formControl`, `ngModel`, etc.

<!-- example(datepicker-value) -->

### Date validation

There are three properties that add date validation to the datepicker input. The first two are the
`min` and `max` properties. In addition to enforcing validation on the input, these properties will
disable all dates on the calendar popup before or after the respective values and prevent the user
from advancing the calendar past the `month` or `year` (depending on current view) containing the
`min` or `max` date.

<!-- example(datepicker-min-max) -->

The second way to add date validation is using the `matDatepickerFilter` property of the datepicker
input. This property accepts a function of `<D> => boolean` (where `<D>` is the date type used by
the datepicker, see
[_Choosing a date implementation_](#choosing-a-date-implementation-and-date-format-settings)).
A result of `true` indicates that the date is valid and a result of `false` indicates that it is
not. Again this will also disable the dates on the calendar that are invalid. However, one important
difference between using `matDatepickerFilter` vs using `min` or `max` is that filtering out all
dates before or after a certain point, will not prevent the user from advancing the calendar past
that point.

<!-- example(datepicker-filter) -->

In this example the user can back past 2005, but all of the dates before then will be unselectable.
They will not be able to go further back in the calendar than 2000. If they manually type in a date
that is before the min, after the max, or filtered out, the input will have validation errors.

Each validation property has a different error that can be checked:
 * A value that violates the `min` property will have a `matDatepickerMin` error.
 * A value that violates the `max` property will have a `matDatepickerMax` error.
 * A value that violates the `matDatepickerFilter` property will have a `matDatepickerFilter` error.
 
### Input and change events

The input's native `(input)` and `(change)` events will only trigger due to user interaction with
the input element; they will not fire when the user selects a date from the calendar popup.
Therefore, the datepicker input also has support for `(dateInput)` and `(dateChange)` events. These
trigger when the user interacts with either the input or the popup.

The `(dateInput)` event will fire whenever the value changes due to the user typing or selecting a
date from the calendar. The `(dateChange)` event will fire whenever the user finishes typing input
(on `<input>` blur), or when the user chooses a date from the calendar.

<!-- example(datepicker-events) -->

### Disabling parts of the datepicker

As with any standard `<input>`, it is possible to disable the datepicker input by adding the
`disabled` property. By default, the `<mat-datepicker>` and `<mat-datepicker-toggle>` will inherit
their disabled state from the `<input>`, but this can be overridden by setting the `disabled`
property on the datepicker or toggle elements. This can be useful if you want to disable text input
but allow selection via the calendar or vice-versa.

<!-- example(datepicker-disabled) -->

### Touch UI mode

The datepicker normally opens as a popup under the input. However this is not ideal for touch
devices that don't have as much screen real estate and need bigger click targets. For this reason
`<mat-datepicker>` has a `touchUi` property that can be set to `true` in order to enable a more
touch friendly UI where the calendar opens in a large dialog.

<!-- example(datepicker-touch) -->

### Manually opening and closing the calendar

The calendar popup can be programmatically controlled using the `open` and `close` methods on the
`<mat-datepicker>`. It also has an `opened` property that reflects the status of the popup.

<!-- example(datepicker-api) -->

### Internationalization

Internationalization of the datepicker is configured via four aspects:
 1. The date locale.
 2. The date implementation that the datepicker accepts.
 3. The display and parse formats used by the datepicker.
 4. The message strings used in the datepicker's UI.

#### Setting the locale code

By default, the `MAT_DATE_LOCALE` injection token will use the existing `LOCALE_ID` locale code
from `@angular/core`. If you want to override it, you can provide a new value for the
`MAT_DATE_LOCALE` token:

```ts
@NgModule({
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
  ],
})
export class MyApp {}
```

It's also possible to set the locale at runtime using the `setLocale` method of the `DateAdapter`.

<!-- example(datepicker-locale) -->

#### Choosing a date implementation and date format settings

The datepicker was built to be date implementation agnostic. This means that it can be made to work
with a variety of different date implementations. However it also means that developers need to make
sure to provide the appropriate pieces for the datepicker to work with their chosen implementation.
The easiest way to ensure this is just to import one of the pre-made modules: 

|Module               |Date type|Supported locales                                                      |Dependencies                      |Import from                       |
|---------------------|---------|-----------------------------------------------------------------------|----------------------------------|----------------------------------|
|`MatNativeDateModule`|`Date`   |en-US                                                                  |None                              |`@angular/material`               |
|`MatMomentDateModule`|`Moment` |[See project](https://github.com/moment/moment/tree/develop/src/locale)|[Moment.js](https://momentjs.com/)|`@angular/material-moment-adapter`|

*Please note: `MatNativeDateModule` is based off of the functionality available in JavaScript's
native `Date` object, and is thus not suitable for many locales. One of the biggest shortcomings of
the native `Date` object is the inability to set the parse format. We highly recommend using the
`MomentDateAdapter` or a custom `DateAdapter` that works with the formatting/parsing library of your
choice.*

These modules include providers for `DateAdapter` and `MAT_DATE_FORMATS`

```ts
@NgModule({
  imports: [MatDatepickerModule, MatNativeDateModule],
})
export class MyApp {}
```

Because `DateAdapter` is a generic class, `MatDatepicker` and `MatDatepickerInput` also need to be
made generic. When working with these classes (for example as a `ViewChild`) you should include the
appropriate generic type that corresponds to the `DateAdapter` implementation you are using. For
example:

```ts
@Component({...})
export class MyComponent {
  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
}
```

<!-- example(datepicker-moment) -->

It is also possible to create your own `DateAdapter` that works with any date format your app
requires. This is accomplished by subclassing `DateAdapter` and providing your subclass as the
`DateAdapter` implementation. You will also want to make sure that the `MAT_DATE_FORMATS` provided
in your app are formats that can be understood by your date implementation. See
[_Customizing the parse and display formats_](#customizing-the-parse-and-display-formats)for more
information about `MAT_DATE_FORMATS`. <!-- TODO(mmalerba): Add a guide about this -->

```ts
@NgModule({
  imports: [MatDatepickerModule],
  providers: [
    {provide: DateAdapter, useClass: MyDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS},
  ],
})
export class MyApp {}
```

#### Customizing the parse and display formats

The `MAT_DATE_FORMATS` object is just a collection of formats that the datepicker uses when parsing
and displaying dates. These formats are passed through to the `DateAdapter` so you will want to make
sure that the format objects you're using are compatible with the `DateAdapter` used in your app.

If you want use one of the `DateAdapters` that ships with Angular Material, but use your own
`MAT_DATE_FORMATS`, you can import the `NativeDateModule` or `MomentDateModule`. These modules are
identical to the "Mat"-prefixed versions (`MatNativeDateModule` and `MatMomentDateModule`) except
they do not include the default formats. For example:

```ts
@NgModule({
  imports: [MatDatepickerModule, NativeDateModule],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_NATIVE_DATE_FORMATS},
  ],
})
export class MyApp {}
```

<!-- example(datepicker-formats) -->

#### Localizing labels and messages

The various text strings used by the datepicker are provided through `MatDatepickerIntl`.
Localization of these messages can be done by providing a subclass with translated values in your
application root module.

```ts
@NgModule({
  imports: [MatDatepickerModule, MatNativeDateModule],
  providers: [
    {provide: MatDatepickerIntl, useClass: MyIntl},
  ],
})
export class MyApp {}
```

### Accessibility

The `MatDatepickerInput` directive adds `aria-haspopup` attribute to the native input element, and it
triggers a calendar dialog with `role="dialog"`.

`MatDatepickerIntl` includes strings that are used for `aria-label`s. The datepicker input
should have a placeholder or be given a meaningful label via `aria-label`, `aria-labelledby` or
`MatDatepickerIntl`.

#### Keyboard shortcuts

The keyboard shortcuts to handle datepicker are:

| Shortcut             | Action                              |
|----------------------|-------------------------------------|
| `ALT` + `DOWN_ARROW` | Open the calendar pop-up            |
| `ESCAPE`             | Close the calendar pop-up           |


In month view:

| Shortcut             | Action                              |
|----------------------|-------------------------------------|
| `LEFT_ARROW`         | Go to previous day                  |
| `RIGHT_ARROW`        | Go to next day                      |
| `UP_ARROW`           | Go to same day in the previous week |
| `DOWN_ARROW`         | Go to same day in the next week     |
| `HOME`               | Go to the first day of the month    |
| `END`                | Go to the last day of the month     |
| `PAGE_UP`            | Go to previous month                |
| `ALT` + `PAGE_UP`    | Go to previous year                 |
| `PAGE_DOWN`          | Go to next month                    |
| `ALT` + `PAGE_DOWN`  | Go to next year                     |
| `ENTER`              | Select current date                 |


In year view:

| Shortcut             | Action                              |
|----------------------|-------------------------------------|
| `LEFT_ARROW`         | Go to previous month                |
| `RIGHT_ARROW`        | Go to next month                    |
| `UP_ARROW`           | Go to previous 6 months             |
| `DOWN_ARROW`         | Go to next 6 months                 |
| `HOME`               | Go to the first month of the year   |
| `END`                | Go to the last month of the year    |
| `PAGE_UP`            | Go to previous year                 |
| `ALT` + `PAGE_UP`    | Go to previous 10 years             |
| `PAGE_DOWN`          | Go to next year                     |
| `ALT` + `PAGE_DOWN`  | Go to next 10 years                 |
| `ENTER`              | Select current month                |

### Troubleshooting

#### Error: MatDatepicker: No provider found for DateAdapter/MAT_DATE_FORMATS

This error is thrown if you have not provided all of the injectables the datepicker needs to work.
The easiest way to resolve this is to import the `MatNativeDateModule` or `MatMomentDateModule` in
your application's root module. See 
[_Choosing a date implementation_](#choosing-a-date-implementation-and-date-format-settings)) for
more information.

#### Error: A MatDatepicker can only be associated with a single input

This error is thrown if more than one `<input>` tries to claim ownership over the same
`<mat-datepicker>` (via the `matDatepicker` attribute on the input). A datepicker can only be
associated with a single input.

#### Error: Attempted to open an MatDatepicker with no associated input.

This error occurs if your `<mat-datepicker>` is not associated with any `<input>`. To associate an
input with your datepicker, create a template reference for the datepicker and assign it to the
`matDatepicker` attribute on the input:

```html
<input [matDatepicker]="picker">
<mat-datepicker #picker></mat-datepicker>
```
