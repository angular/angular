# FormArray

Sometimes you need to create complex reactive forms. Angular makes it possible by the usage of `FormArray`.

In this activity, you'll learn how to setup `FormArray` and how to use it.

<hr>

<docs-workflow>

<docs-step title="Setup the component">

In `app.component.ts`, import the `ReactiveFormsModule` from `@angular/forms` and add it to the `imports` array of the component.

```ts
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standadlone: true,
  template: `
  <form>
    <label>User : 
      <input type="text" />
    </label>
    <fieldset>
      <legend>
        Articles
      </legend>
    </fieldset>
    
    <button type="submit">Submit</button>
  </form>`,
  imports: [ReactiveFormsModule]
})
```

</docs-step>

<docs-step title="Create the `FormGroup` object with FormControls">

As already seen in the [tutorial of reactive form](tutorials/learn-angular/reactive-forms), you'll need to create a `FormGroup` object and `FormControl` controls.

Add `FormGroup` and `FormControl` to the import from `@angular/forms` so you can create a FormGroup and controls associated to it.

But here we need to add a control of type `FormArray`, to do it you must also import it from `@angular/forms`.



```ts
import {ReactiveFormsModule, FormGroup, FormControl, FormArray} from '@angular/forms';
...
export class AppComponent {
  form = new FormGroup({
    username: FormControl(''),
    articles: new FormArray([])
  });
}
```

Then attach the FormGroup to the template with the `[formGroup]`, and link the controls with `formControlName`. 
Concerning the `FormArray` it's an array, so we just need to iterate over it with `@for` flow.

```html
<form [formGroup]="form">
  <label>User :
    <input type="text" formControlName="username"/>
  </label>
  <fieldset>
    <legend>
      Articles
    </legend>
    
    @for(articleForm of articleForms.controls; track articleForm) {
      <div class="article-container" [formGroup]="articleForm">
        <label>
          Article name : 
          <input type="text" formControlName="articleName" />
        </label>
        
        <label>
          Quantity :
          <input type="number" formControlName="quantity" />
        </label>
      </div>
    }
  </fieldset>

  <button type="submit">Submit</button>
</form>
```
Take a closer look at the template, in the `@for` flow, we use a variable `articleForms`, go back in the `app.component.ts` 
and add a getter. 

```ts
...
export class AppComponent {
  ...
  get articleForms() : FormArray<FormGroup> {
    return this.form.get('articles') as FormArray;
  }
}
```

</docs-step>

<docs-step title="Add button to add new `FormGroup`">

Now you should want to add a `FormGroup` into the `FormArray`, to make this, add a button in the template with a 
`click` **event** calling a method in the`app.component.ts`.

In the template add a button.

```html 
//form uppon

<button type="button" (click)="addArticleForm()">Add form</button>
```

In `app.component.ts` add the associated method that will add a new `FormGroup` in the `FormArray`.

```ts
...
export class AppComponent {
  ...
  addArticleForm() : void {
    this.articleForms.push(new FormGroup({
      articleName: new FormControl(''),
      quantity: new FormControl(0)
    }));
  }
}
```

When clicking on the button, the function will create a new `FormGroup` and push it in the array, 
the template will refresh and display a new form.

</docs-step>

<docs-step title="Delete an entry of `FormArray`">

To delete an entry, edit the template as following : 

```html
@for(articleForm of articleForms.controls; track articleForm) {
      <div class="article-container" [formGroup]="articleForm">
        <label>
          Article name : 
          <input type="text" formControlName="articleName" />
        </label>
        
        <label>
          Quantity :
          <input type="number" formControlName="quantity" />
        </label>
        
        <button type="button" (click)="deleteForm($index)">delete</button>
      </div>
    }
```

In `app.component.ts` add the method associated with the action.

```ts
...
export class AppComponent {
  ...
  deleteForm(index: number) : void {
    this.articleForms.removeAt(index);
  }
}
```

</docs-step>

</docs-workflow>

And that's all for this tutorial, now you know how to use the `FormArray` in Angular.

Fantastic job with this activity. Keep going to learn about form validation.