The datepicker allows users to enter a date either through text input, or by choosing a date from
the calendar. It is made up of several components and directives that work together:

<!-- TODO: INSERT OVERVIEW EXAMPLE HERE -->

### Current state
Currently the datepicker is in the beginning stages and supports basic date selection functionality.
There are many more features that will be added in future iterations, including:
 * Support for datetimes (e.g. May 2, 2017 at 12:30pm) and month + year only (e.g. May 2017)
 * Support for selecting and displaying date ranges
 * Support for custom time zones
 * Infinite scrolling through calendar months
 * Built in support for [Moment.js](https://momentjs.com/) dates

### Connecting a datepicker to an input
A datepicker is composed of a text input and a calendar pop-up, connected via the `mdDatepicker`
property on the text input.

```html
<input [mdDatepicker]="myDatepicker">
<md-datepicker #myDatepicker></md-datepicker>
```

An optional datepicker toggle button is available. A toggle can be added to the example above:

```html
<input [mdDatepicker]="myDatepicker">
<button [mdDatepickerToggle]="myDatepicker"></button>
<md-datepicker #myDatepicker></md-datepicker>
```

This works exactly the same with an input that is part of an `<md-input-container>` and the toggle
can easily be used as a prefix or suffix on the material input:

```html
<md-input-container>
  <input mdInput [mdDatepicker]="myDatepicker">
  <button mdSuffix [mdDatepickerToggle]="myDatepicker"></button>
</md-input-container>
<md-datepicker #myDatepicker></md-datepicker>
```

### Setting the calendar starting view
By default the calendar will open in month view, this can be changed by setting the `startView`
property of `md-datepicker` to `"year"`. In year view the user will see all months of the year and
then proceed to month view after choosing a month.

The month or year that the calendar opens to is determined by first checking if any date is
currently selected, if so it will open to the month or year containing that date. Otherwise it will
open to the month or year containing today's date. This behavior can be overridden by using the
`startAt` property of `md-datepicker`. In this case the calendar will open to the month or year
containing the `startAt` date. 

```ts
startDate = new Date(1990, 0, 1);
```

```html
...
<md-datepicker startView="year" [startAt]="startDate"></md-datepicker>
```

### Date validation
There are three properties that add date validation to the datepicker input. The first two are the
`min` and `max` properties. In addition to enforcing validation on the input, these properties will
disable all dates on the calendar popup before or after the respective values and prevent the user
from advancing the calendar past the `month` or `year` (depending on current view) containing the
`min` or `max` date.
 
The second way to add date validation is using the `mdDatepickerFilter` property of the datepicker
input. This property accepts a function of `<D> => boolean` (where `<D>` is the date type used by
the datepicker, see section on
[choosing a date implementation](#choosing-a-date-implementation-and-date-format-settings)).
A result of `true` indicates that the date is valid and a result of `false` indicates that it is
not. Again this will also disable the dates on the calendar that are invalid. However, one important
difference between using `mdDatepickerFilter` vs using `min` or `max` is that filtering out all
dates before or after a certain point, will not prevent the user from advancing the calendar past
that point.

```ts
myFilter = (d: Date) => d.getFullYear() > 2005 
minDate = new Date(2000, 0, 1);
maxDate = new Date(2020, 11, 31);
```

```html
<input [mdDatepicker]="d" [mdDatepickerFilter]="myFilter" [min]="minDate" [max]="maxDate" ngModel>
<md-datepicker #d></md-datepicker>
```

In this example the user can back past 2005, but all of the dates before then will be unselectable.
They will not be able to go further back in the calendar than 2000. If they manually type in a date
that is before the min, after the max, or filtered out, the input will have validation errors.

Each validation property has a different error that can be checked:
 * A value that violates the `min` property will have a `mdDatepickerMin` error.
 * A value that violates the `max` property will have a `mdDatepickerMax` error.
 * A value that violates the `mdDatepickerFilter` property will have a `mdDatepickerFilter` error.

### Touch UI mode
The datepicker normally opens as a popup under the input. However this is not ideal for touch
devices that don't have as much screen real estate and need bigger click targets. For this reason
`md-datepicker` has a `touchUi` property that can be set to `true` in order to enable a more touch
friendly UI where the calendar opens in a large dialog.

### Manually opening and closing the calendar
The calendar popup can be programmatically controlled using the `open` and `close` methods on the
`md-datepicker`. It also has an `opened` property that reflects the status of the popup.

```ts
@Component({...})
export class MyComponent implements AfterViewInit {
  @ViewChild(MdDatepicker) dp: MdDatepicker<Date>;
  
  ngAfterViewInit() {
    dp.open();
  }
}
```

### Choosing a date implementation and date format settings
The datepicker was built to be date implementation agnostic. This means that it can be made to work
with a variety of different date implementations. However it also means that developers need to make
sure to provide the appropriate pieces for the datepicker to work with their chosen implementation.
The easiest way to ensure this is just to import one of the pre-made modules (currently
`MdNativeDateModule` is the only implementation that ships with material, but there are plans to add
a module for Moment.js support):
 * `MdNativeDateModule` - support for native JavaScript Date object
 
These modules include providers for `DateAdapter` and `MD_DATE_FORMATS`

```ts
@NgModule({
  imports: [MdDatepickerModule, MdNativeDateModule],
})
export class MyApp {}
```

Because `DateAdapter` is a generic class, `MdDatepicker` and `MdDatepickerInput` also need to be
made generic. When working with these classes (for example as a `ViewChild`) you should include the
appropriate generic type that corresponds to the `DateAdapter` implementation you are using. For
example:

```ts
@Component({...})
export class MyComponent {
  @ViewChild(MdDatepicker) datepicker: MdDatepicker<Date>;
}
```

#### Customizing the date implementation
The datepicker does all of its interaction with date objects via the `DateAdapter`. Making the
datepicker work with a different date implementation is as easy as extending `DateAdapter`, and
using your subclass as the provider. You will also want to make sure that the `MD_DATE_FORMATS`
provided in your app are formats that can be understood by your date implementation.

```ts
@NgModule({
  imports: [MdDatepickerModule],
  providers: [
    {provide: DateAdapter, useClass: MyDateAdapter},
    {provide: MD_DATE_FORMATS, useValue: MY_DATE_FORMATS},
  ],
})
export class MyApp {}
```

#### Customizing the parse and display formats
The `MD_DATE_FORMATS` object is just a collection of formats that the datepicker uses when parsing
and displaying dates. These formats are passed through to the `DateAdapter` so you will want to make
sure that the format objects you're using are compatible with the `DateAdapter` used in your app.
This example shows how to use the native `Date` implementation from material, but with custom
formats.

```ts
@NgModule({
  imports: [MdDatepickerModule],
  providers: [
    {provide: DateAdapter, useClass: NativeDateAdapter},
    {provide: MD_DATE_FORMATS, useValue: MY_NATIVE_DATE_FORMATS},
  ],
})
export class MyApp {}
```

### Localizing labels and messages
The various text strings used by the datepicker are provided through `MdDatepickerIntl`.
Localization of these messages can be done by providing a subclass with translated values in your
application root module.

```ts
@NgModule({
  imports: [MdDatepickerModule, MdNativeDateModule],
  providers: [
    {provide: MdDatepickerIntl, useClass: MyIntl},
  ],
})
export class MyApp {}
```
