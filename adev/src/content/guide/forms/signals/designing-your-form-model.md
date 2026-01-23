# Designing your form model

Signal Forms uses a model-driven approach, deriving the form's state and structure directly from the model you provide. Because it serves as the foundation of the entire form, it is important to start with a well-designed form model. This guide explores best practices for designing form models.

## Form model vs domain model

Forms are used to collect user input. Your application likely has a domain model used to represent this input in a way that's optimized for business logic or storage. However, this is often _different_ than how we want to model the data in our form.

The form model represents the raw user input as it appears in the UI. For instance, in a form you might ask a user to pick a date and a time slot for an appointment as separate input fields, even if your domain model represents it as a single JavaScript `Date` object.

```ts
interface AppointmentFormModel {
  name: string; // Appointment owner's name
  date: Date; // Appointment date (carries only date information, time component is unused)
  time: string; // Selected time as a string
}

interface AppointmentDomainModel {
  name: string; // Appointment owner's name
  time: Date; // Appointment time (carries both date and time information)
}
```

Forms should use a form model tailored to the input experience, rather than simply repurposing the domain model.

## Form model best practices

### Use specific types

Always define interfaces or types for your models as shown in [Using TypeScript types](/guide/forms/signals/models#using-typescript-types). Explicit types provide better IntelliSense, catch errors at compile time, and serve as documentation for what data the form contains.

### Initialize all fields

Provide initial values for every field in your model:

```ts {prefer, header: 'All fields initialized'}
const taskModel = signal({
  title: '',
  description: '',
  priority: 'medium',
  completed: false,
});
```

```ts {avoid, header: 'Partial initialization'}
const taskModel = signal({
  title: '',
  // Missing description, priority, completed
});
```

Missing initial values mean those fields won't exist in the field tree, making them inaccessible for form interactions.

### Keep models focused

Each model should represent a single form or a cohesive set of related data:

```ts {prefer, header: 'Focused on a single purpose'}
const loginModel = signal({
  email: '',
  password: '',
});
```

```ts {avoid, header: 'Mixing unrelated concerns'}
const appModel = signal({
  // Login data
  email: '',
  password: '',
  // User preferences
  theme: 'light',
  language: 'en',
  // Shopping cart
  cartItems: [],
});
```

Separate models for different concerns makes forms easier to understand and reuse. Create multiple forms if you're managing distinct sets of data.

### Consider validation requirements

Design models with validation in mind. Group fields that validate together:

```ts {prefer, header: 'Related fields grouped for comparison'}
// Password fields grouped for comparison
interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

This structure makes cross-field validation (like checking if `newPassword` matches `confirmPassword`) more natural.

### Match data types to UI controls

Properties on your form model should match the data types expected by your UI controls.

For example, consider a beverage order form with a `size` field (6, 12, or 24 pack) and a `quantity` field. The UI uses a dropdown (`<select>`) for size and a number input (`<input type="number">`) for quantity.

Although the size options look numeric, `<select>` elements work with string values, so `size` should be modeled as a string. An `<input type="number">` on the other hand, does work with numbers, so `quantity` can be modeled as a number.

```ts {prefer, header: 'Appropriate data types for the bound UI controls'}
interface BeverageOrderFormModel {
  size: string; // Bound to: <select> (option values: "6", "12", "24")
  quantity: number; // Bound to: <input type="number">
}
```

### Avoid `undefined`

A form model model must not contain `undefined` values or properties. In Signal Forms the structure of the form is derived from the structure of the model, and `undefined` signifies the _absence of a field_, rather than a field with an empty value. This means you must also avoid optional fields (e.g., `{property?: string}`), as they implicitly allow `undefined`.

To represent a property with an empty value in your form model, use a value that the UI control understands to mean "empty" (e.g. `""` for a `<input type="text">`). If you're designing a custom UI control, `null` often works as a good value to signify "empty".

```ts {prefer, header: 'Appropriate empty values'}
interface UserFormModel {
  name: string; // Bound to <input type="text">
  birthday: Date | null; // Bound to <input type="date">
}

// Initialize our form with empty values.
form(signal({name: '', birthday: null}));
```

### Avoid models with dynamic structure

A form model has a dynamic structure if it changes shape (if the properties on the object change) based on its value. This happens when the model type allows for values with different shapes, such as a union of object types that have different properties, or a union of an object and a primitive. The following sections examine a few common scenarios where models with a dynamic structure might seem appealing, but ultimately prove problematic.

#### Empty value for a complex object

We often use forms to ask users to enter brand new data, rather than edit existing data in a system. A good example of this is an account creation form. We might model that using the following form model.

```ts
interface CreateAccountFormModel {
  name: {
    first: string;
    last: string;
  };
  username: string;
}
```

When creating the form we encounter a dilemma, what should the initial value in the model be? It may be tempting to create a `form<CreateAccountFormModel | null>()` since we don't have any input from the user yet.

```ts {avoid, header: 'Using null as empty value for complex object'}
createAccountForm = form<CreateAccountFormModel | null>(signal(/* what goes here, null? */));
```

However, it is important to remember that Signal Forms is _model driven_. If our model is `null` and `null` doesn't have a `name` or `username` property, that means our form won't have those subfields either. Instead what we really want is an instance of `CreateAccountFormModel` with all of its leaf fields set to an empty value.

```ts {prefer, header: 'Same shape value with empty values for properties'}
createAccountForm = form<CreateAccountFormModel>(
  signal({
    name: {
      first: '',
      last: '',
    },
    username: '',
  }),
);
```

Using this representation, all of the subfields we need now exist, and we can bind them using the `[formField]` directive in our template.

```html
First: <input [formField]="createAccountForm.name.first" /> Last:
<input [formField]="createAccountForm.name.last" /> Username:
<input [formField]="createAccountForm.username" />
```

#### Fields that are conditionally hidden or unavailable

Forms aren't always linear. You often need to create conditional paths based on previous user input. One example of this is a form where we give the user different payment options. Let's start by imagining what the UI for such a form might look like.

```html
Name: <input type="text" />

<section>
  <h2>Payment Info</h2>
  <input type="radio" /> Credit Card @if (/* credit card selected */) {
  <section>
    Card Number <input type="text" /> Security Code <input type="text" /> Expiration
    <input type="text" />
  </section>
  }
  <input type="radio" /> Bank Account @if (/* bank account selected */) {
  <section>Account Number <input type="text" /> Routing Number <input type="text" /></section>
  }
</section>
```

The best way to handle this is to use a form model with a static structure that includes fields for _all_ potential payment methods. In our schema, we can hide or disable the fields that are not currently available.

```ts {prefer, header: 'Static structure model'}
interface BillPayFormModel {
  name: string;
  method: {
    type: string;
    card: {
      cardNumber: string;
      securityCode: string;
      expiration: string;
    };
    bank: {
      accountNumber: string;
      routingNumber: string;
    };
  };
}

const billPaySchema = schema<BillPayFormModel>((billPay) => {
  // Hide credit card details when user has selected a method other than credit card.
  hidden(billPay.method.card, ({valueOf}) => valueOf(billPay.method.type) !== 'card');
  // Hide bank account details when user has selected a method other than bank account.
  hidden(billPay.method.bank, ({valueOf}) => valueOf(billPay.method.type) !== 'bank');
});
```

Using this model, both `card` and `bank` objects are always present in the form's state. When the user switches payment methods, we only update the `type` property. The data they entered into the card fields remains safely stored in the `card` object, ready to be redisplayed if they switch back.

In contrast, a dynamic form model may initially seem like a good fit for this use case. After all, we don't need fields for account and routing number if the user selected "Credit Card". We may be tempted to model this as a discriminated union:

```ts {avoid, header: 'Dynamic structure model'}
interface BillPayFormModel {
  name: string;
  method:
    | {
        type: 'card';
        cardNumber: string;
        securityCode: string;
        expiration: string;
      }
    | {
        type: 'bank';
        accountNumber: string;
        routingNumber: string;
      };
}
```

However, consider what would happen in the following scenario:

1. User fills out their name and credit card information
2. They're about to submit, but at the last moment they notice the convenience fee.
3. They toggle to the bank account option instead, figuring they might as well avoid the fee.
4. As they're about to enter the bank account info, they have second thoughts, they wouldn't want it to wind up in a leak.
5. They toggle back to credit card option, but they notice all the info they just entered is gone!

This illustrates another problem with form models that have a dynamic structure: they can cause data loss. A model like this assumes that once a field becomes hidden, the information in it will never be needed again. It replaces the credit card information with the bank information, and has no way to get the credit card information back.

#### Exceptions

While static structure is generally preferred, there are specific scenarios where dynamic structure is necessary and supported.

##### Arrays

Arrays are the most common exception. Forms often need to collect a variable number of items, such as a list of phone numbers, attendees, or line items in an order.

```ts
interface SendEmailFormModel {
  subject: string;
  recipientEmails: string[];
}
```

In this case, the `recipientEmails` array grows and shrinks as the user interacts with the form. While the length of the array is dynamic, the structure of the individual items should be consistent (each item should have the same shape).

##### Fields that are treated atomically by the UI control

Another case where dynamic structure is acceptable is when a complex object is treated as a single, atomic value by the UI control. That is, if the control does not attempt to bind to or access any of its sub-fields individually. In this scenario, the control updates the value by replacing the entire object at once, rather than modifying its internal properties. Because the form structure is irrelevant in this scenario, it's acceptable for that structure to be dynamic.

For example, consider a user profile form that includes a `location` field. The location is selected using a complex "location picker" widget (perhaps a map or a search-ahead dropdown) that returns a coordinate object. In the case where the location is not yet selected, or the user chooses not to share their location, the picker indicates the location as `null`.

```ts {prefer, header: 'Dynamic structure is ok when field is treated as atomic'}
interface Location {
  lat: number;
  lng: number;
}

interface UserProfileFormModel {
  username: string;
  // This property has dynamic structure,
  // but that's ok because the location picker treats this field as atomic.
  location: Location | null;
}
```

In the template, we bind the `location` field directly to our custom control:

```html
Username: <input [formField]="userForm.username" /> Location:
<location-picker [formField]="userForm.location"></location-picker>
```

Here, `<location-picker>` consumes and produces the entire `Location` object (or `null`), and doesn't access `userForm.location.lat` or `userForm.location.lng`. Therefore, `location` can safely have a dynamic shape without violating the principles of model-driven forms.

## Translating between form model and domain model

Given that the form model and domain model represent the same concept differently, we need to have a way to translate between these different representations. When we want to present some existing data in the system to the user in a form, we need to transform it from the domain model representation to the form model representation. Conversely when we want to save a user's changes, we need to transform the data from the form model representation to the domain model representation.

Let's imagine that we have a domain model and a form model and we've written some functions to convert between them.

```ts
interface MyDomainModel { ... }

interface MyFormModel { ... }

// Instance of `MyFormModel` populated with empty input (e.g. `''` for string inputs, etc.)
const EMPTY_MY_FORM_MODEL: MyFormModel = { ... };

function domainModelToFormModel(domainModel: MyDomainModel): MyFormModel { ... }

function formModelToDomainModel(formModel: MyFormModel): MyDomainModel { ... }
```

### Domain model to form model

When we're creating a form to edit some existing domain model in the system, we'll typically receive that domain model either as an `input()` to our form component or from a backend (e.g. via a resource). In either case, `linkedSignal` provides an excellent way to apply our transform.

In the case where we receive the domain model as an `input()`, we can use `linkedSignal` to create a writable form model from the input signal.

```ts {prefer, header: 'Use linkedSignal to convert domain model to form model'}
@Component(...)
class MyForm {
  // The domain model to initialize the form with, if not given we start with an empty form.
  readonly domainModel = input<MyDomainModel>();

  private readonly formModel = linkedSignal({
    // Linked signal based on the domain model
    source: this.domainModel,
    // If domain model is defined convert it to a form model, otherwise use an empty form model.
    computation: (domainModel) => domainModel
      ? domainModelToFormModel(domainModel)
      : EMPTY_MY_FORM_MODEL
  });

  protected readonly myForm = form(this.formModel);
}
```

Similarly, when we receive the domain model from the backend via a resource, we can create a `linkedSignal` based on its value to create our `formModel`. In this scenario, the domain model may take some time to fetch, and we should disable the form until the data is loaded.

```ts {prefer, header: 'Disable or hide the form when data is unavailable'}
@Component(...)
class MyForm {
  // Fetch the domain model from the backend.
  readonly domainModelResource: ResourceRef<MyDomainModel | undefined> = httpResource(...);

  private readonly formModel = linkedSignal({
    // Linked signal based on the domain model resource
    source: this.domainModelResource.value,
    // Convert the domain model once it loads, use an empty form model while loading.
    computation: (domainModel) => domainModel
      ? domainModelToFormModel(domainModel)
      : EMPTY_MY_FORM_MODEL
  });

  protected readonly myForm = form(this.formModel, (root) => {
    // Disable the entire form when the resource is loading.
    disabled(root, () => this.domainModelResource.isLoading());
  });
}
```

The examples above show a pure derivation of the form model, directly from the domain model. However, in some cases you may wish to do a more advanced diff operation between the new domain model value and the previous domain model and form model values. This can be implemented based on the `linkedSignal` [previous state](/guide/signals/linked-signal#accounting-for-previous-state).

### Form model to domain model

When we're ready to save the user's input back to the system, we need to convert it to the domain model representation. This would typically happen when the user submits the form, or continuously as the user edits for an auto-saving form.

To save on submit, we can handle the conversion in the `submit` function.

```ts {prefer, header: 'Convert form model to domain model on submit'}
@Component(...)
class MyForm {
  private readonly myDataService = inject(MyDataService);

  protected readonly myForm = form<MyFormModel>(...);

  handleSubmit() {
    submit(this.myForm, async () => {
      await this.myDataService.update(formModelToDomainModel(this.myForm.value()));
    });
  };
}
```

Alternatively, you could also send the form model directly to the server and do the conversion from
form model to domain model on the server.

For continuous saving, update the domain model in an `effect`.

```ts {prefer, header: 'Convert form model to domain model in an effect for auto-saving'}
@Component(...)
class MyForm {
  readonly domainModel = model.required<MyDomainModel>()

  protected readonly myForm = form(...);

  constructor() {
    effect(() => {
      // When the form model changes to a valid value, update the domain model.
      if (this.myForm().valid()) {
        this.domainModel.set(formModelToDomainModel(this.myForm.value()));
      }
    });
  };
}
```

The examples above show a pure conversion from the form model to the domain model. However, it is perfectly acceptable to consider the full form state in addition to just the form model value. For example, to save bytes me might want to only send partial updates to the server based on what the user changed. In this case our conversion function could be designed to take the entire form state and return a sparse domain model based on the form's values and dirtiness.

```ts
type Sparse<T> = T extends object ? {
    [P in keyof T]?: Sparse<T[P]>;
} : T;

function formStateToPartialDomainModel(
  formState: FieldState<MyFormModel>
): Sparse<MyDomainModel> { ... }
```
