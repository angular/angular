`<md-select>` is a form control for selecting a value from a set of options, similar to the native
`<select>` element. You can read more about selects in the 
[Material Design spec](https://material.google.com/components/menus.html).

<!-- example(select-overview) -->

### Simple select

In your template, create an `md-select` element. For each option you'd like in your select, add an 
`md-option` tag. Note that you can disable items by adding the `disabled` boolean attribute or 
binding to it.

*my-comp.html*
```html
<md-select placeholder="State">
   <md-option *ngFor="let state of states" [value]="state.code">{{ state.name }}</md-option>
</md-select>
```

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

#### Keyboard interaction:
- <kbd>DOWN_ARROW</kbd>: Focus next option
- <kbd>UP_ARROW</kbd>: Focus previous option
- <kbd>ENTER</kbd> or <kbd>SPACE</kbd>: Select focused item
