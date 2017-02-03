
The autocomplete is a normal text input enhanced by a panel of suggested options. You can read more about 
autocompletes in the [Material Design spec](https://material.io/guidelines/components/text-fields.html#text-fields-auto-complete-text-field).

### Simple autocomplete

Start by adding a regular `mdInput` to the page. Let's assume you're using the `formControl` directive from the 
`@angular/forms` module to track the value of the input.

*my-comp.html*
```html
<md-input-container>
   <input type="text" mdInput [formControl]="myControl">
</md-input-container>
```

Next, create the autocomplete panel and the options displayed inside it. Each option should be defined by an 
`md-option` tag. Set each option's value property to whatever you'd like the value of the text input to be 
upon that option's selection.
 
*my-comp.html*
```html
<md-autocomplete>
   <md-option *ngFor="let option of options" [value]="option">
      {{ option }}
   </md-option>
</md-autocomplete>
```

Now we'll need to link the text input to its panel. We can do this by exporting the autocomplete panel instance into a 
local template variable (here we called it "auto"), and binding that variable to the input's `mdAutocomplete` property.

*my-comp.html*
```html
<md-input-container>
   <input type="text" mdInput [formControl]="myControl" [mdAutocomplete]="auto">
</md-input-container>

<md-autocomplete #auto="mdAutocomplete">
   <md-option *ngFor="let option of options" [value]="option">
      {{ option }}
   </md-option>
</md-autocomplete>
```

### Adding a custom filter

At this point, the autocomplete panel should be toggleable on focus and options should be selectable. But if we want 
our options to filter when we type, we need to add a custom filter. 

You can filter the options in any way you want based on the text input. Here we will do a simple string test on the 
input value to see if it matches the option value. We already have access to the built-in `valueChanges` observable on 
the `FormControl`, so we can simply map the text input's values to the suggested options by passing them through this 
filter. The resulting observable (`filteredOptions`) can be added to the template in place of the `options` property 
using the `async` pipe.

Below we are also priming our value change stream with `null` so that the options are filtered by that value on init 
(before there are any value changes).

*my-comp.ts*
```ts
class MyComp {
   myControl = new FormControl();
   options = [
    'One',
    'Two',
    'Three'
   ];
   filteredOptions: Observable<string[]>;

   ngOnInit() {
      this.filteredOptions = this.myControl.valueChanges
         .startWith(null)
         .map(val => val ? this.filter(val) : this.options.slice());
   }
   
   filter(val: string): string[] {
      return this.options.filter(option => new RegExp(val, 'gi').test(option)); 
   }
}
```

*my-comp.html*
```html
<md-input-container>
   <input type="text" mdInput [formControl]="myControl" [mdAutocomplete]="auto">
</md-input-container>

<md-autocomplete #auto="mdAutocomplete">
   <md-option *ngFor="let option of filteredOptions | async" [value]="option">
      {{ option }}
   </md-option>
</md-autocomplete>
```

### Setting separate control and display values

If you want the option's control value (what is saved in the form) to be different than the option's display value 
(what is displayed in the actual text field), you'll need to set the `displayWith` property on your autocomplete 
element. A common use case for this might be if you want to save your data as an object, but display just one of 
the option's string properties.

To make this work, create a function on your component class that maps the control value to the desired display value. 
Then bind it to the autocomplete's `displayWith` property. 

```html
<md-input-container>
   <input type="text" mdInput [formControl]="myControl" [mdAutocomplete]="auto">
</md-input-container>

<md-autocomplete #auto="mdAutocomplete" [displayWith]="displayFn">
   <md-option *ngFor="let option of filteredOptions | async" [value]="option">
      {{ option }}
   </md-option>
</md-autocomplete>
```

*my-comp.ts*
```ts
class MyComp {
   myControl = new FormControl();
   options = [
     new User('Mary'),
     new User('Shelley'),
     new User('Igor')
   ];
   filteredOptions: Observable<User[]>;

   ngOnInit() { 
      this.filteredOptions = this.myControl.valueChanges
         .startWith(null)
         .map(user => user && typeof user === 'object' ? user.name : user)
         .map(name => name ? this.filter(name) : this.options.slice());
   }
   
   filter(name: string): User[] {
      return this.options.filter(option => new RegExp(name, 'gi').test(option)); 
   }
   
   displayFn(user: User): string {
      return user ? user.name : user;
   }
}
```


#### Keyboard interaction:
- <kbd>DOWN_ARROW</kbd>: Next option becomes active.
- <kbd>UP_ARROW</kbd>: Previous option becomes active.
- <kbd>ENTER</kbd>: Select currently active item.
