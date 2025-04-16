# Signal Form Tutorial
contacts:
[@kirjs](https://moma.corp.google.com/person/kirjs)
[@mmalerba](https://moma.corp.google.com/person/mmalerba)
[@arick](https://moma.corp.google.com/person/arick)

       
## 🚧🚧 This design is still work in progress
> This tutorial assumes you are familiar with Angular and have an Angular app running. You could create a new one using [boq angular](http://go/boq-angular-new)
 
The following things are not yet supported:

* Asynchronous validation
* Tracking items in arrays and moving items across arrays
* Recursive logic
* Validation on touch
* Advanced metadata use cases (custom/user-defined/access in validators)
* Dirty/Pristine state
* Dynamic objects/tuples
* Interop with Reactive/Template forms
* Interop with custom schema libraries
* Resetting the form
* Typed errors


##  The feedback form
We're going to build a feedback form with the following fields:

```
* text     [name] required
* text     [email] required, must have @
* password [password] required
* password [confirmationPassword] required, must match password
* rating   [rating] 1-5, custom component
* text     [feedback] disabled if rating is 5, otherwise required
* checkbox [recommendToFriends]
* array    [friends] only displayed/validated when recommendToFriends is true
   * text  [name] required
   * text  [email] required, must have @
```   

## Initial setup
We assume that you have an Angular app already.
You can see [the final app here](http://google3/experimental/users/kirjs/forms/app/feedback/)

### Defining data model
First let's create an interface for our form:

```typescript
// feedback.ts
interface Friend {
  name: string;
  email: string;
}

interface Feedback {
  name: string;
  email: string;
  password: string;
  confirmationPassword: string;

  rating: number;
  feedback: string;

  recommendToFriends: boolean;
  friends: Friend[];
}
```

### Creating a new Feedback Component

```typescript
// feedback.ts
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-feedback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `<h1>Feedback</h1>
   <!-- Template goes here -->`
})
export class FeedbackComponent {
    // Our form will go here
}
```

> Wire up the component to your app, and run it.

### Creating a signal with data
Signal forms don't own data; they use a user-provided signal as the source of truth.

So first, we need to create a signal with initial values:

```typescript
// feedback.ts
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({/*...*/})
export class FeedbackComponent {
  readonly data = signal<Feedback>({
    name: '',
    rating: 1,
    email: '',
    password: '',
    confirmationPassword: '',
    feedback: '',
    recommendToFriends: false,
    recommendationText: '',
    friends: [],
  }); 
}
```
## Creating a simple form

### Creating a form instance
A simple form just takes a signal with the data and produces matching field structure.

```typescript
// feedback.ts
import {
  form,  
} from 'google3/experimental/angularsignalforms';

@Component({/*...*/})
export class FeedbackComponent {
  readonly data = signal<Feedback>({/*...*/}); 
  // Yay, we can start using the form now!
  readonly form = form(this.data);
}
```

### Binding form field to an input

Now in the template we can use new [field] directive.

```typescript
// feedback.ts
import {
  form,  
  FieldDirective,
} from 'google3/experimental/angularsignalforms';

@Component({/*...*/
  imports: [
    FieldDirective,
    // We'll also need those
    MatFormFieldModule,
    MatInputModule,
  ]
})
```

We will use a Material Input here, but the same would work with a standard input as well.

```html
<!-- Add this inside the template of FeedbackComponent -->
<mat-form-field>
    <mat-label>Name</mat-label>
    <input [field]="form.name" matInput>
</mat-form-field>
```

### Verifying it works

Now we can print the value of the `data` signal and validate that it changes when we change the name input.

```html
<!-- Add this to the template, and ensure JsonPipe is imported -->
<pre>
 {{ data() | json}}
</pre>
```

## Adding Validation
Now let's make it interesting and add some validation rules.

### Making name required:
You can pass validation rules as a second argument to the `form` function.

```typescript
// feedback.ts
/* ... */
export class FeedbackComponent { 
  /* ... */
  readonly form = form(this.data, (path) => {
    // Path is a special entity mirroring the structure of the form, 
    // with no acess to fields state or value.
    // We can use it to specify which fields to validate.
  });
}
```

Now let's use the built-in `required` validator.

```typescript
// feedback.ts
import {
  form,
  FieldDirective,
  // Import the required validator
  required,
} from 'google3/experimental/angularsignalforms';
/* ... */
export class FeedbackComponent {
  readonly data = signal<Feedback>({/*...*/});
  readonly form = form(this.data, (path) => {
    // Now it's required!
    required(path.name);
  });
}
```

> Note: Currently, `required` is the only built-in validator.

### Displaying validation errors

Each form field has a special `$state` property containing its value and other state information in signal form.

```typescript
// Example accessors:
form.name.$state.value(); // Value signal
form.name.$state.valid(); // Boolean signal indicating validity
form.name.$state.errors(); // Signal holding an array of validation errors
// 💰 💰 💰 
```

We can use these in the template:

```html
<mat-form-field>
    <mat-label>Name</mat-label>
    <input [field]="form.name" matInput>
    @if (!form.name.$state.valid()) {
      <mat-error>{{ form.name.$state.errors() | json }}</mat-error>
      <!-- Output might look like: [{ "kind": "required" }] after the input is touched and left empty. -->
    }
</mat-form-field>
```

### Error structure

Each error has a `kind` property and an optional `message`.

```typescript
export interface FormError {
  kind: string;
  message?: string;
}
```

### Displaying an actual error
Throughout the tutorial, we're going to just output the error kind, but for this specific one, we'll display a nice translatable message.

```html
<mat-form-field>
    <mat-label>Name</mat-label>
    <input [field]="form.name" matInput>
    @if (!form.name.$state.valid()) {
      <mat-error>
        @if (form.name.$state.errors()[0]?.kind === 'required') {
          <ng-container i18n="Error message">
          This field is required
          </ng-container>
        } 
      </mat-error>
    }
</mat-form-field>
```

### Handling email
#### Making email required

```typescript
// feedback.ts
/* ... */
export class FeedbackComponent {
  /* ... */
  readonly form = form(this.data, (path) => {
    required(path.name);
    // Email is required
    required(path.email);
  });
}
```

#### Creating a custom email validator
To create a custom validator, we'll import the `validate` function.

```typescript
// feedback.ts
import {
  form,
  FieldDirective,
  required,
  // Import validate
  validate,
} from 'google3/experimental/angularsignalforms';
```

Similar to `required`, it takes a path, but also a validator function:

```typescript
// feedback.ts
/* ... */
export class FeedbackComponent {
  /* ... */
  readonly form = form(this.data, (path) => {
    required(path.name);
    required(path.email);

    validate(path.email, ({value}) => {
      // Value is a signal.
      return value().includes('@') ?
        // Yay, no more nulls! 
        undefined :
        {kind: 'emailFormat'};
    })
  });
}
```

> This email check is intentionally very permissive to focus on the validation mechanism.

#### Adding email field

```html
<mat-form-field appearance="outline">
  <mat-label>Email</mat-label>
  <input [field]="form.email" matInput>
  @if (!form.email.$state.valid()) {
    <!--  You can display it in any way you want -->
    <mat-error>{{ form.email.$state.errors()[0].kind }}</mat-error>
  }
</mat-form-field>
```

### Password and confirmation password
#### Validating passwords

First, let's make the passwords required:

```typescript
// feedback.ts
/* ... */
export class FeedbackComponent {
  /* ... */
  readonly form = form(this.data, (path) => {
    /* ... */
    required(path.password);
    required(path.confirmationPassword);
  });
}
```

Now let's write a custom validator to ensure that the password and confirmation password match.

To do this, we will use the special `resolve` function provided to the validator. `resolve` takes a path segment and returns the corresponding form field instance.

> `resolve` can be used for cross-field validation.

```typescript
// feedback.ts
/* ... */
export class FeedbackComponent {
  /* ... */
  readonly form = form(this.data, (path) => {
    /* ... */
    required(path.password);
    required(path.confirmationPassword);

    validate(path.confirmationPassword, ({value, resolve}) => {
      return value() === resolve(path.password).$state.value()
        ? undefined
        : {kind: 'confirmationPassword'};
    });
  });
}
```
#### Displaying password in the template

```html
<!-- Add these fields to the template -->
<mat-form-field appearance="outline">
  <mat-label>Password</mat-label>
  <input [field]="form.password" matInput type="password">
  @if (!form.password.$state.valid()) {
    <mat-error>{{ form.password.$state.errors()[0]?.kind }}</mat-error>
  }
</mat-form-field>

<mat-form-field appearance="outline">
  <mat-label>Confirm Password</mat-label>
  <input [field]="form.confirmationPassword" matInput type="password">
  @if (!form.confirmationPassword.$state.valid()) {
    <mat-error>{{ form.confirmationPassword.$state.errors()[0]?.kind }}: {{ form.confirmationPassword.$state.errors()[0]?.message ?? 'Invalid' }}</mat-error>
  }
</mat-form-field>
```

### Moving out the confirmation password validator
Let's also take a look, what would it take to the confirmation validator outside of the form.

To do this we'd create a constructor function, which would take a path with the password field.

```typescript
export function confirmationPasswordValidator(
  path: FieldPath<{password: string}>,
): Validator<string> {
  return ({value, resolve}) => {
    return value() === resolve(path.password).$state.value()
      ? undefined
      : {kind: 'confirmationPassword'};
  };
}
```

Now we can add it by passing relevant part of the path.
```typescript
// feedback.ts
/* ... */
export class FeedbackComponent {
  /* ... */
  readonly form = form(this.data, (path) => {
    /* ... */
    validate(path.confirmationPassword, confirmationPasswordValidator(path));
  });
}
 
```

## Break time
Ok, let's take a short break ☕🍪☕ before we dive into creating custom components.

## Custom components
Sometimes standard inputs aren't enough, so we can also use the `[field]` directive with custom components. To do this, we need to create a component that implements the `FormUiControl<T>` interface.

In our case, we'll create a `RatingComponent` which will display stars like this: `⭐⭐☆☆☆`

```typescript
// rating.component.ts
import {  
  FormUiControl,
  FormError
} from 'google3/experimental/angularsignalforms';
import {input, model} from '@angular/core';

export class RatingComponent implements FormUiControl<number> {  
  // If you change the value it gets updated in the form.
  readonly value = model<number>(0);

  // We could take all field props, such as value/errors/touched.
  readonly errors = input<readonly FormError[]>();
}
```

### Displaying the stars
This is unrelated to Forms.
you can see full implementation [here](http://google3/experimental/users/kirjs/forms/app/feedback/rating.ts)

### Using rating in the Feedback component template

After importing Rating component, you can use it like this:

```html
<div>
    <label>Rating</label>
    <custom-rating [field]="form.rating"/>
</div>
```

## Feedback text which is disabled if the rating is ⭐⭐⭐⭐⭐
We want the feedback text field to be required, but only enabled if the rating is less than 5 stars.

### Adding disabled rule
We use the `disabled` rule for this.

```typescript
// feedback.ts
import {
  /* ... */
  disabled,
} from 'google3/experimental/angularsignalforms';

/* ... */
export class FeedbackComponent {
  /* ... */
  readonly form = form(this.data, (path) => {
    /* ... */
    disabled(path.feedback, ({resolve}) => {
      return resolve(path.rating).$state.value() > 4;
    });

    // When a field is disabled, validation doesn't run
    // So it's safe to make it required.
    required(path.feedback);
  });
}
```

### Displaying the feedback in the template

This is pretty straightforward. The `[field]` directive handles passing the disabled state to standard inputs automatically.
> Note that the disabled state logic is defined in the form setup, not directly in the template binding.

```html
<mat-form-field appearance="outline">
  <mat-label>Feedback</mat-label>
  <input [field]="form.feedback" matInput>
  @if (!form.feedback.$state.valid()) {
    <mat-error>
      {{ form.feedback.$state.errors()[0].kind }}
    </mat-error>
  }
</mat-form-field>
```

## Arrays and reusing parts of form (schemas)
The user should be able to provide name and email information for multiple friends if they choose to recommend the service.

We'll create a separate `FriendComponent` and define a reusable schema for the friend data structure.

### Friend interface
Most of the work in this section will happen in a new `friend.ts`.

First, let's ensure the `Friend` interface is defined:

```typescript
// friend.ts
export interface Friend {
  name: string;
  email: string;
}
```

### Create friend schema
Now we need to specify `friend` part of the form. For this we will use a special type called Schema.

This code should look familiar: Both fields are required, and the email has its own validator.

```typescript
// friend.ts
import {
  Field,
  Schema,
  required,
  FieldDirective,
  validate,
} from 'google3/experimental/angularsignalforms';

export const friendSchema: Schema<Friend> = (friend) => {
  required(friend.name);
  required(friend.email);
  validate(friend.email, ({value}) => {      
    return value().includes('@') ?        
       undefined : 
       { kind: 'emailFormat' };
  })  
};
```

But, uh oh, the email validation code is duplicated from our main form. Let's extract it.

### Reusing email validator
We'll create a separate file for reusable validators.

```typescript
// validator.ts
import {
  Validator
} from 'google3/experimental/angularsignalforms';

export const emailValidator: Validator<string> = 
  ({value}) => {
     return !value().includes('@') ? undefined : {kind: 'email'};
  };
```
Now we can use it in the schema (don't forget to use in feedback component as well).

```typescript
// friend.ts
import {
  Field,
  Schema,
  required,
  FieldDirective,
  validate,
} from 'google3/experimental/angularsignalforms';
import {emailValidator} from './validators';

// Schema is not used in this file.
export const friendSchema: Schema<Friend> = (friend) => {
  required(friend.name);
  required(friend.email);
  validate(friend.email, emailValidator)  
};
```

### Creating Friend Component
This component will display the form fields for a single friend and used in array.

```typescript
// friend.ts
import {
  Field,
  Schema,
  required,
  FieldDirective,
  validate,
} from 'google3/experimental/angularsignalforms';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-friend',
  imports: [/* ... */],  
})
class FriendComponent { 
  // We'll take the field as an input
  friend = input.required<Field<Friend>>();
}

```

### Displaying name and email in Friend's template

```html
<!-- friend.component.html -->
@let friend = this.friend();
<div>
  <mat-form-field>
    <mat-label>Name</mat-label>
    <input [field]="friend.name" matInput>
    @if(!friend.name.$state.valid()){
      <mat-error>{{ friend.name.$state.errors()[0].kind}}</mat-error>
    }
  </mat-form-field>
</div>
<div>
  <mat-form-field>
    <mat-label>Email</mat-label>
    <input [field]="friend.email" matInput>
    @if(!friend.email.$state.valid()){
      <mat-error>{{ friend.email.$state.errors()[0].kind}}</mat-error>
    }
  </mat-form-field>
</div>
```
### Applying the friend schema to Array elements
We can use the `applyEach` rule within our main form definition to apply the `friendSchema` to each element of the `friends` array.

```typescript
// feedback.ts
import {
  /* ... */  
  applyEach,
} from 'google3/experimental/angularsignalforms';

import { friendSchema } from './friend';

/* ... */
export class FeedbackComponent {
  /* ... */
  readonly form = form(this.data, (path) => {
    /* ... */
    applyEach(path.friends, friendSchema);
  });
}
```

### Displaying friend list in the template
First, we need to import `FriendComponent` into `FeedbackComponent`:

```typescript
// feedback.ts
import {FriendComponent} from './friend';

@Component({
    /* ... */
  imports: [
      /* ... */
      FriendComponent
  ], 
})
export class FeedbackComponent {/* ... */}
```

Now, let's add the UI elements to the `FeedbackComponent` template. First, the `recommendToFriends` checkbox:

```html  
<!-- feedback.component.html -->
<label>
    <mat-checkbox [field]="form.recommendToFriends">
        Recommend to friends
    </mat-checkbox>
</label>
```
Then, we'll display the list of friends, but only when the checkbox is checked.

```html  
<!-- feedback.component.html -->
@if (form.recommendToFriends.$state.value()) {
    @for (friend of form.friends; track friend) {      
        <app-friend [friend]="friend"></app-friend>
    }    
}
    </fieldset>
```

### Hiding 
The current setup works, but there's a small issue.
If we create a friend with an error, and then hide it, the validation would still run, and the form would be marked as invalid.

We can solve it by using `hidden` with a predicate to disabled the validation.

```typescript
// feedback.ts
import {
  /* ... */  
  applyEach,
} from 'google3/experimental/angularsignalforms';

import { friendSchema } from './friend';

/* ... */
export class FeedbackComponent {
  /* ... */
  readonly form = form(this.data, (path) => {
    /* ... */
    applyEach(path.friends, friendSchema);
    // Doesn't actually hide anything in the UI.
    hidden(path.friends, ({resolve}) => {
      return resolve(path.recommendToFriends).$state.value() === false  ;
    });
  });
}
```
>  it's important to note, that hidden doesn't actually hide fields in the template, just disables validation. 

### Conditionally enabling/disabling validation with applyWhen
Sometimes we want to apply multiple rules based only if certain condition is true.

For this we can use `applyWhen`.

Let's look at an unrelated example, where we want to apply different rules depending on whether a pet is a cat or a dog.

```typescript
// unrelated-form.ts
form(this.pet, (pet) => {
  // Applies for all pets
  required(pet.cute);
  
  // Rules that only apply for dogs.
  applyWhen(
    path,
    ({value}) => value().type === 'dog',
    (pathWhenTrue) => {
      // Only required for dogs, but can be entered for cats
      requred(pathWhenTrue.walksPerDay);
      // Doesn't apply for dogs
      hidden(pathWhenTrue.purringIntensity);
    }
  );

  applyWhen(
    path,
    ({value}) => value().type === 'cat',
    (pathWhenTrue) => {
      // Those rules only apply for cats. 
      requred(pathWhenTrue.a);
      validate(pathWhenTrue.b, /* validation rules */);
      applyEach(pathWhenTrue, /* array rules */);
      applyWhen(/* we can even have nested apply whens. */);
    }
  );

});
```

In our case, we could use applyWhen instead of hidden (although it might be an overkill for just one rule)

It's also important to not use closured path, but use the one provided by the function:
```typescript
// feedback.ts
/* ... */
export class FeedbackComponent {
  /* ... */
  readonly form = form(this.data, (path) => {
    applyWhen(
      path,
      ({value}) => value().recommendToFriends,
      (pathWhenTrue) => {
        applyEach(pathWhenTrue.friends, friendSchema);
        // 🚨 👮 🚓  You have to use nested path
        // This produces a Runtime error:
        applyEach(path /*has to be pathWhenTrue*/.friends, friendSchema);
        // ✅ This works
        applyEach(pathWhenTrue.friends, friendSchema);
      }
    );
  });
}
```

> `pathWhenTrue` could also just be called path, it's a stylistic chose.

Now, `friendSchema` validation rules will only apply when `recommendToFriends` is true.

### Adding items to the array
Let's allow the user to add a new friend to the list.

```typescript
// feedback.ts
export class FeedbackComponent {
  /* ... */  
  addFriend() {
    // value is a writable signal.
    this.form.friends.$state.value.update(
        (f) => [...f, {name: '', email: ''}]
    );
  }
}    
  
```
Now, add the button to the template inside the `@if` block:

```html
<!-- feedback.component.html -->
@if (form.recommendToFriends.$state.value()) {
  @for (friend of form.friends; track friend) {
    <app-friend [friend]="friend"></app-friend>
  }
  <!-- This is the new button  -->
  <button mat-button (click)="addFriend()">
      Add Friend
  </button>
}
```

## Submitting the form
To handle form submission, use the `submit` function, passing it your form instance and an async submission handler.

```typescript
// feedback.ts
import {
  /* ... */
  submit,
} from 'google3/experimental/angularsignalforms';

/* ... */
export class FeedbackComponent {
  /* ... */
  submit() {
    submit(this.form, async () => {
      /* Do your async stuff here */
    });
  }
}
```
### Handling submission errors
You can return a list of server errors and map them to appropriate field here as well.

```typescript 
// feedback.ts
/* ... */
export class FeedbackComponent {
  /* ... */
  submit() {
    submit(this.form, async () => {
      return Promise.resolve([
        {
          field: this.form.name,
          error: {kind: 'notUnique'},
        },
      ]);
    });
  }
}

```
## The end
This marks the end of the tutorial. Let's take a look at the complete form definition consolidating all the rules we've added:

```typescript
// feedback.ts
/* ... */
export class FeedbackComponent {
  /* ... */
  readonly form = form(this.data, (path) => {
    required(path.name);

    disabled(path.feedback, ({resolve}) => {
      return resolve(path.rating).$state.value() > 4;
    });
    required(path.feedback);

    validate(path.confirmationPassword, ({value, resolve}) => {
      return value() === resolve(path.password).$state.value()
        ? undefined
        : {kind: 'confirmationPassword'};
    })

    applyWhen(
      path,
      (f) => f.value().recommendToFriends,
      (path) => {
        applyEach(path.friends, friendSchema);
      },
    );
  });
}
```
