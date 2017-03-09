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

### Setting a static placeholder

It's possible to turn off the placeholder's floating animation using the `floatPlaceholder` property. It accepts one of three string options:
- `'auto'`: This is the default floating placeholder animation. It will float up when a selection is made.
- `'never'`: This makes the placeholder static. Rather than floating, it will disappear once a selection is made.
- `'always'`: This makes the placeholder permanently float above the input. It will not animate up or down.
    
```html
<md-select placeholder="State" [(ngModel)]="myState" floatPlaceholder="never">
   <md-option *ngFor="let state of states" [value]="state.code">{{ state.name }}</md-option>
</md-select>
``` 

#### Keyboard interaction:
- <kbd>DOWN_ARROW</kbd>: Focus next option
- <kbd>UP_ARROW</kbd>: Focus previous option
- <kbd>ENTER</kbd> or <kbd>SPACE</kbd>: Select focused item
