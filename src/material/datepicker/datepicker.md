The datepicker allows users to enter a date either through text input, or by choosing a date from
the calendar. It is made up of several components, directives and [the date implementation module](#choosing-a-date-implementation-and-date-format-settings) that work together.

<!-- example(datepicker-overview) -->

### Connecting a datepicker to an input

A datepicker is composed of a text input and a calendar pop-up, connected via the `matDatepicker`
property on the text input.

There is also an optional datepicker toggle button that gives the user an easy way to open the datepicker pop-up.

<!-- example({"example":"datepicker-overview",
              "file":"datepicker-overview-example.html",
              "region":"toggle"}) -->

This works exactly the same with an input that is part of an `<mat-form-field>` and the toggle
can easily be used as a prefix or suffix on the Material input:

<!-- example({"example":"datepicker-overview",
              "file":"datepicker-overview-example.html"}) -->

If you want to customize the icon that is rendered inside the `mat-datepicker-toggle`, you can do so
by using the `matDatepickerToggleIcon` directive:

<!-- example(datepicker-custom-icon) -->

### Date range selection

If you want your users to select a range of dates, instead of a single date, you can use the
`mat-date-range-input` and `mat-date-range-picker` components. They work in tandem, similarly to the
`mat-datepicker` and the basic datepicker input.

The `mat-date-range-input` component requires two `input` elements for the start and end dates,
respectively:

```html
<mat-date-range-input>
  <input matStartDate placeholder="Start date">
  <input matEndDate placeholder="End date">
</mat-date-range-input>
```

The `mat-date-range-picker` component acts as the pop-up panel for selecting dates. This works in
the same way as `mat-datepicker`, but allows the user to select multiple times:

```html
<mat-date-range-picker #picker></mat-date-range-picker>
```

Connect the range picker and range input using the `rangePicker` property:

```html
<mat-date-range-input [rangePicker]="picker">
  <input matStartDate placeholder="Start date">
  <input matEndDate placeholder="End date">
</mat-date-range-input>

<mat-date-range-picker #picker></mat-date-range-picker>
```

<!-- example(date-range-picker-overview) -->

### Date range input forms integration

The `mat-date-range-input` component can be used together with the `FormGroup` directive from
`@angular/forms` to group the start and end values together and to validate them as a group.

<!-- example(date-range-picker-forms) -->

### Setting the calendar starting view

The `startView` property of `<mat-datepicker>` can be used to set the view that will show up when
the calendar first opens. It can be set to `month`, `year`, or `multi-year`; by default it will open
to month view.

The month, year, or range of years that the calendar opens to is determined by first checking if any
date is currently selected, if so it will open to the month or year containing that date. Otherwise
it will open to the month or year containing today's date. This behavior can be overridden by using
the `startAt` property of `<mat-datepicker>`. In this case the calendar will open to the month or
year containing the `startAt` date.

<!-- example(datepicker-start-view) -->

#### Watching the views for changes on selected years and months

When a year or a month is selected in `multi-year` and `year` views respectively, the `yearSelected`
and `monthSelected` outputs emit a normalized date representing the chosen year or month. By
"normalized" we mean that the dates representing years will have their month set to January and
their day set to the 1st. Dates representing months will have their day set to the 1st of the
month. For example, if `<mat-datepicker>` is configured to work with javascript native Date
objects, the `yearSelected` will emit `new Date(2017, 0, 1)` if the user selects 2017 in
`multi-year` view. Similarly, `monthSelected` will emit `new Date(2017, 1, 1)` if the user
selects **February** in `year` view and the current date value of the connected `<input>` was
set to something like `new Date(2017, MM, dd)` when the calendar was opened (the month and day are
irrelevant in this case).

Notice that the emitted value does not affect the current value in the connected `<input>`, which
is only bound to the selection made in the `month` view. So if the end user closes the calendar
after choosing a year in `multi-view` mode (by pressing the `ESC` key, for example), the selected
year, emitted by `yearSelected` output, will not cause any change in the value of the date in the
associated `<input>`.

The following example uses `yearSelected` and `monthSelected` outputs to emulate a month and year
picker (if you're not familiar with the usage of `MomentDateAdapter` and `MAT_DATE_FORMATS`
you can [read more about them](#choosing-a-date-implementation-and-date-format-settings) below in
this document to fully understand the example).

<!-- example(datepicker-views-selection) -->

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

### Changing the datepicker colors

The datepicker popup will automatically inherit the color palette (`primary`, `accent`, or `warn`)
from the `mat-form-field` it is attached to. If you would like to specify a different palette for
the popup you can do so by setting the `color` property on `mat-datepicker`.

<!-- example(datepicker-color) -->

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

### Confirmation action buttons

By default, clicking on a date in the calendar will select it and close the calendar popup. In some
cases this may not be desirable, because the user doesn't have a quick way of going back if they've
changed their mind. If you want your users to be able to cancel their selection and to have to
explicitly accept the value that they've selected, you can add a `<mat-datepicker-actions>` element
inside `<mat-datepicker>` with a "Cancel" and an "Apply" button marked with the
`matDatepickerCancel` and `matDatepickerApply` attributes respectively. Doing so will cause the
datepicker to only assign the value to the data model if the user presses "Apply", whereas pressing
"Cancel" will close popup without changing the value.

<!-- example({"example":"datepicker-actions",
              "file":"datepicker-actions-example.html",
              "region":"datepicker-actions"}) -->

The actions element is also supported for `<mat-date-range-picker>` where that it is called
`<mat-date-range-picker-actions>` and the buttons are called `matDateRangePickerCancel` and
`matDateRangePickerApply` respectively.

<!-- example({"example":"datepicker-actions",
              "file":"datepicker-actions-example.html",
              "region":"date-range-picker-actions"}) -->

<!-- example(datepicker-actions) -->

### Comparison ranges

If your users need to compare the date range that they're currently selecting with another range,
you can provide the comparison range start and end dates to the `mat-date-range-input` using the
`comparisonStart` and `comparisonEnd` bindings. The comparison range will be rendered statically
within the calendar, but it will change colors to indicate which dates overlap with the user's
selected range.

<!-- example(date-range-picker-comparison) -->

Note that comparison and overlap colors aren't derived from the current theme, due
to limitations in the Material Design theming system. They can be customized using the
`datepicker-date-range-colors` mixin.

```scss
@use '@angular/material' as mat;

@include mat.datepicker-date-range-colors(
  hotpink, teal, yellow, purple);
```

### Customizing the date selection logic

The `mat-date-range-picker` supports custom behaviors for range previews and selection. To customize
this, you first create a class that implements `MatDateRangeSelectionStrategy`, and then provide
the class via the `MAT_DATE_RANGE_SELECTION_STRATEGY` injection token. The following example
uses the range selection strategy to create a custom range picker that limits the user to five-day
ranges.

<!-- example(date-range-picker-selection-strategy) -->

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

### Using `mat-calendar` inline

If you want to allow the user to select a date from a calendar that is inlined on the page rather
than contained in a popup, you can use `<mat-calendar>` directly. The calendar's height is
determined automatically based on the width and the number of dates that need to be shown for a
month. If you want to make the calendar larger or smaller, adjust the width rather than the height.

<!-- example(datepicker-inline-calendar) -->

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

**Note:** if you're using the `MatDateFnsModule`, you have to provide the data object for your
locale to `MAT_DATE_LOCALE` instead of the locale code, in addition to providing a configuration
compatible with `date-fns` to `MAT_DATE_FORMATS`. Locale data for `date-fns` can be imported
from `date-fns/locale`.

<!-- example(datepicker-locale) -->

#### Choosing a date implementation and date format settings

The datepicker was built to be date implementation agnostic. This means that it can be made to work
with a variety of different date implementations. However it also means that developers need to make
sure to provide the appropriate pieces for the datepicker to work with their chosen implementation.

The easiest way to ensure this is to import one of the provided date modules:

`MatNativeDateModule`

<table>
  <tbody>
    <tr>
      <th align="left" scope="row">Date type</th>
      <td><code>Date</code></td>
    </tr>
    <tr>
      <th align="left" scope="row">Supported locales</th>
      <td>en-US</td>
    </tr>
    <tr>
      <th align="left" scope="row">Dependencies</th>
      <td>None</td>
    </tr>
    <tr>
      <th align="left" scope="row">Import from</th>
      <td><code>@angular/material/core</code></td>
    </tr>
  </tbody>
</table>

`MatDateFnsModule` (installed via `@angular/material-date-fns-adapter`)

<table>
  <tbody>
    <tr>
      <th align="left" scope="row">Date type</th>
      <td><code>Date</code></td>
    </tr>
    <tr>
      <th align="left" scope="row">Supported locales</th>
      <td><a href="https://github.com/date-fns/date-fns/tree/master/src/locale/">See project for details</a></td>
    </tr>
    <tr>
      <th align="left" scope="row">Dependencies</th>
      <td><a href="https://date-fns.org/">date-fns</a></td>
    </tr>
    <tr>
      <th align="left" scope="row">Import from</th>
      <td><code>@angular/material-date-fns-adapter</code></td>
    </tr>
  </tbody>
</table>

`MatLuxonDateModule` (installed via `@angular/material-luxon-adapter`)

<table>
  <tbody>
    <tr>
      <th align="left" scope="row">Date type</th>
      <td><code>DateTime</code></td>
    </tr>
    <tr>
      <th align="left" scope="row">Supported locales</th>
      <td><a href="https://moment.github.io/luxon/">See project for details</a></td>
    </tr>
    <tr>
      <th align="left" scope="row">Dependencies</th>
      <td><a href="https://moment.github.io/luxon/">Luxon</a></td>
    </tr>
    <tr>
      <th align="left" scope="row">Import from</th>
      <td><code>@angular/material-luxon-adapter</code></td>
    </tr>
  </tbody>
</table>

`MatMomentDateModule` (installed via `@angular/material-moment-adapter`)

<table>
  <tbody>
    <tr>
      <th align="left" scope="row">Date type</th>
      <td><code>Moment</code></td>
    </tr>
    <tr>
      <th align="left" scope="row">Supported locales</th>
      <td><a href="https://github.com/moment/moment/tree/develop/src/locale">See project for details</a></td>
    </tr>
    <tr>
      <th align="left" scope="row">Dependencies</th>
      <td><a href="https://momentjs.com/">Moment.js</a></td>
    </tr>
    <tr>
      <th align="left" scope="row">Import from</th>
      <td><code>@angular/material-moment-adapter</code></td>
    </tr>
  </tbody>
</table>

*Please note: `MatNativeDateModule` is based off the functionality available in JavaScript's
native [`Date` object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date).
Thus it is not suitable for many locales. One of the biggest shortcomings of the native `Date`
object is the inability to set the parse format. We strongly recommend using an adapter based on
a more robust formatting and parsing library. You can use the `MomentDateAdapter`
or a custom `DateAdapter` that works with the library of your choice.*

These modules include providers for `DateAdapter` and `MAT_DATE_FORMATS`.

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

By default the `MomentDateAdapter` creates dates in your time zone specific locale. You can change the default behaviour to parse dates as UTC by providing the `MAT_MOMENT_DATE_ADAPTER_OPTIONS` and setting it to `useUtc: true`.

```ts
@NgModule({
  imports: [MatDatepickerModule, MatMomentDateModule],
  providers: [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}}
  ]
})
```

By default the `MomentDateAdapter` will parse dates in a
[forgiving way](https://momentjs.com/guides/#/parsing/forgiving-mode/). This may result in dates
being parsed incorrectly. You can change the default behaviour to
[parse dates strictly](https://momentjs.com/guides/#/parsing/strict-mode/) by providing
the `MAT_MOMENT_DATE_ADAPTER_OPTIONS` and setting it to `strict: true`.

```ts
@NgModule({
  imports: [MatDatepickerModule, MatMomentDateModule],
  providers: [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {strict: true}}
  ]
})
```

It is also possible to create your own `DateAdapter` that works with any date format your app
requires. This is accomplished by subclassing `DateAdapter` and providing your subclass as the
`DateAdapter` implementation. You will also want to make sure that the `MAT_DATE_FORMATS` provided
in your app are formats that can be understood by your date implementation. See
[_Customizing the parse and display formats_](#customizing-the-parse-and-display-formats)for more
information about `MAT_DATE_FORMATS`.

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

The `MAT_DATE_FORMATS` object is a collection of formats that the datepicker uses when parsing
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

##### MomentDateModule formats

To use custom formats with the `MomentDateModule` you can pick from the parse formats documented
[here](https://momentjs.com/docs/#/parsing/string-format/) and the display formats documented
[here](https://momentjs.com/docs/#/displaying/format/).

It is also possible to support multiple parse formats. For example:

```ts
@NgModule({
  imports: [MatDatepickerModule, MomentDateModule],
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: ['l', 'LL'],
        },
        display: {
          dateInput: 'L',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ],
})
export class MyApp {}
```

#### Customizing the calendar header

The header section of the calendar (the part containing the view switcher and previous and next
buttons) can be replaced with a custom component if desired. This is accomplished using the
`calendarHeaderComponent` property of `<mat-datepicker>`. It takes a component class and constructs
an instance of the component to use as the header.

In order to interact with the calendar in your custom header component, you can inject the parent
`MatCalendar` in the constructor. To make sure your header stays in sync with the calendar,
subscribe to the `stateChanges` observable of the calendar and mark your header component for change
detection.

<!-- example(datepicker-custom-header) -->

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

#### Highlighting specific dates
If you want to apply one or more CSS classes to some dates in the calendar (e.g. to highlight a
holiday), you can do so with the `dateClass` input. It accepts a function which will be called
with each of the dates in the calendar and will apply any classes that are returned. The return
value can be anything that is accepted by `ngClass`.

<!-- example(datepicker-date-class) -->

### Accessibility

The `MatDatepicker` pop-up uses the `role="dialog"` interaction pattern. This dialog then contains
multiple controls, the most prominent being the calendar itself. This calendar implements the
`role="grid"` interaction pattern.

Always enable [_confirmation action buttons_](#confirmation-action-buttons). This allows assistive
technology users to explicitly confirm their selection before committing a value.

The `MatDatepickerInput` and `MatDatepickerToggle` directives both apply the `aria-haspopup`
attribute to the native input and button elements, respectively.

`MatDatepickerIntl` includes strings that are used for `aria-label` attributes. Always provide
the datepicker text input a meaningful label via `<mat-label>`, `aria-label`, `aria-labelledby` or
`MatDatepickerIntl`.

`MatDatepickerInput` adds <kbd>>Alt</kbd> + <kbd>Down Arrow</kbd> as a keyboard short to open the
datepicker pop-up. However, ChromeOS intercepts this key combination at the OS level such that the
browser only receives a `PageDown` key event. Because of this behavior, you should always include an
additional means of opening the pop-up, such as `MatDatepickerToggle`.

#### Keyboard interaction

The datepicker supports the following keyboard shortcuts:

| Keyboard Shortcut                      | Action                     |
|----------------------------------------|----------------------------|
| <kbd>Alt</kbd> + <kbd>Down Arrow</kbd> | Open the calendar pop-up   |
| <kbd>Escape</kbd>                      | Close the calendar pop-up  |


In month view:

| Shortcut                              | Action                                   |
|---------------------------------------|------------------------------------------|
| <kbd>Left Arrow</kbd>                 | Go to previous day                       |
| <kbd>Right Arrow</kbd>                | Go to next day                           |
| <kbd>Up Arrow</kbd>                   | Go to same day in the previous week      |
| <kbd>Down Arrow</kbd>                 | Go to same day in the next week          |
| <kbd>Home</kbd>                       | Go to the first day of the month         |
| <kbd>End</kbd>                        | Go to the last day of the month          |
| <kbd>Page up</kbd>                    | Go to the same day in the previous month |
| <kbd>Alt</kbd> + <kbd>Page up</kbd>   | Go to the same day in the previous year  |
| <kbd>Page Down</kbd>                  | Go to the same day in the next month     |
| <kbd>Alt</kbd> + <kbd>Page Down</kbd> | Go to the same day in the next year      |
| <kbd>Enter</kbd>                      | Select current date                      |


In year view:

| Shortcut                              | Action                                    |
|---------------------------------------|-------------------------------------------|
| <kbd>Left Arrow</kbd>                 | Go to previous month                      |
| <kbd>Right Arrow</kbd>                | Go to next month                          |
| <kbd>Up Arrow</kbd>                   | Go up a row (back 4 months)               |
| <kbd>Down Arrow</kbd>                 | Go down a row (forward 4 months)          |
| <kbd>Home</kbd>                       | Go to the first month of the year         |
| <kbd>End</kbd>                        | Go to the last month of the year          |
| <kbd>Page Up</kbd>                    | Go to the same month in the previous year |
| <kbd>Alt</kbd> + <kbd>Page up</kbd>   | Go to the same month 10 years back        |
| <kbd>Page Down</kbd>                  | Go to the same month in the next year     |
| <kbd>Alt</kbd> + <kbd>Page Down</kbd> | Go to the same month 10 years forward     |
| <kbd>Enter</kbd>                      | Select current month                      |

In multi-year view:

| Shortcut                              | Action                                    |
|---------------------------------------|-------------------------------------------|
| <kbd>Left Arrow</kbd>                 | Go to previous year                       |
| <kbd>Right Arrow</kbd>                | Go to next year                           |
| <kbd>Up Arrow</kbd>                   | Go up a row (back 4 years)                |
| <kbd>Down Arrow</kbd>                 | Go down a row (forward 4 years)           |
| <kbd>Home</kbd>                       | Go to the first year in the current range |
| <kbd>End</kbd>                        | Go to the last year in the current range  |
| <kbd>Page up</kbd>                    | Go back 24 years                          |
| <kbd>Alt</kbd> + <kbd>Page up</kbd>   | Go back 240 years                         |
| <kbd>Page Down</kbd>                  | Go forward 24 years                       |
| <kbd>Alt</kbd> + <kbd>Page Down</kbd> | Go forward 240 years                      |
| <kbd>Enter</kbd>                      | Select current year                       |

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
