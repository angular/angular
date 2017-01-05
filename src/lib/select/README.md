# md-select

`<md-select>` is a form control for selecting a value from a set of options, similar to the native
`<select>` element. You can read more about selects in the 
[Material Design spec](https://material.google.com/components/menus.html).

### Not yet implemented

- Multi-select support
- Option groups
- Select headers

## Usage

### Simple select

In your template, create an `md-select` element. For each option you'd like in your select, add an 
`md-option` tag. The value property of each option dictates the value that will be set in the select's 
form control when that option is selected. What is between the `md-option` tags is what will be 
visibly displayed in the list. Note that you can disable items by adding the `disabled` boolean 
attribute or binding to it.

*my-comp.html*
```html
<md-select placeholder="State">
   <md-option *ngFor="let state of states" [value]="state.code">{{ state.name }}</md-option>
</md-select>
```

Output:

<img src="https://material.angularjs.org/material2_assets/select/basic-select-closed.png">
<img src="https://material.angularjs.org/material2_assets/select/basic-select-open.png">

### Getting and setting the select value

The select component is set up as a custom value accessor, so you can manipulate the select's value using 
any of the form directives from the core `FormsModule` or `ReactiveFormsModule`: `ngModel`, `formControl`, etc.

*my-comp.html*
```html
<md-select placeholder="State" [(ngModel)]="myState">
   <md-option *ngFor="let state of states" [value]="state.code">{{ state.name }}</md-option>
</md-select>
```

*my-comp.ts*
```ts
class MyComp {
  myState = 'AZ';
  states = [{code: 'AL', name: 'Alabama'}...];
}
```

Output:

<img src="https://material.angularjs.org/material2_assets/select/value-select-closed.png">
<img src="https://material.angularjs.org/material2_assets/select/value-select-open.png">

### Accessibility

The select adds role="listbox" to the main select element and role="option" to each option. It also adds the "aria-owns", "aria-disabled",
"aria-label", "aria-required", and "aria-invalid" attributes as appropriate to the select.

#### Keyboard events:
- <kbd>DOWN_ARROW</kbd>: Focus next option
- <kbd>UP_ARROW</kbd>: Focus previous option
- <kbd>ENTER</kbd> or <kbd>SPACE</kbd>: Select focused item
