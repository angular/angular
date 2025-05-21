# Angular Signal Forms

## What is a form

A form is a UI element that allows a user to provide structured information to your application. It consists of various fields used to gather specific data, often enforcing constraints to ensure data integrity.

In Angular Signal Forms, this concept is modeled by breaking it down into four distinct parts:

1.  **Data Model:** The structure and holds the current values of the data being collected by the form.
2.  **Field State:** The metadata associated with each field, representing its state (e.g. `valid`, `touched`, `dirty`).
3.  **Field Logic:** The business logic governing the form's behavior, such as validation and conditionally shown fields.
4.  **UI Controls:** The actual HTML elements (e.g. `<input>`, `<select>`, custom components) that present the form fields to the user and allow interaction.

## Creating the data model and binding it to a field structure

A key principle of Angular Signal Forms is that it **does not maintain its own internal data**. Instead, **you, the developer, own the data model**. The data model is represented as a `WritableSignal` which the library uses directly as the source of truth for the values of its fields.

To create a root `Field` instance representing your form, pass your model to the `form()` factory function:

```typescript
// Define the data structure.
interface User {
  name: string;
  username: string;
}

// Create a model containing the initial form data.
const userModel = signal<User>({name: '', username: ''});

// Create the form, linking it to the model.
const userForm = form(userModel);
```

This establishes the model as the source of truth for the UI values, meaning:

- Any updates made to the `userModel` will update the field's value (as it reads from the same signal).
- Any changes the user makes via the `userForm` **directly modify** the model.

## Accessing the field state

Calling `form()` on your data model gives you a `Field` object which contains the field state for each field. Via this object, you can access the value, validation status, and other metadata for any field in the field structure.

### Navigating the field tree

To access a field's state, you first navigate to the field you're interested in. The `Field` object is structured as a tree wrapped around your data. The `Field` tree mirrors the structure of the data, allowing you to access a sub-field for part of the data by accessing the corresponding property on the `Field`, the same way you would navigate through the data itself.

Consider this example:

```typescript
interface LineItem {
  description: string;
  quantity: number;
}

interface Order {
  orderId: string;
  items: LineItem[];
}

// Create the model.
const orderModel = signal<Order>({
  orderId: 'ORD-123',
  items: [
    { description: 'Ergonomic Mouse', quantity: 1 },
    { description: 'Mechanical Keyboard', quantity: 1 }
  ]
});

// Create a `Field` for the order.
const orderForm: Field<Order> = form(orderModel);

// Navigate the field structure to access sub-fields.
const itemsField: Field<LineItem[]> = orderForm.items;
const firstItemField: Field<LineItem> = orderForm.items[0];
const firstItemQuantityField: Field<number> = orderForm.items[0].quantity;
```

As you can see, navigating the `orderForm` structure (`orderForm.items[0].quantity`) directly corresponds to how you would access the data in the `orderModel` (`orderModel().items[0].quantity`). Each step in this navigation gives you a more specific `Field` instance, typed according to the part of the data model it represents (e.g., `Field<LineItem[]>`, `Field<LineItem>`, `Field<number>`).

However, these navigated `Field` objects only represent the _structure_ and _grouping_ of the fields. To access the state for a specific field, you use the special `$state` property to get the `FieldState` for that location in the `Field` structure.

### Getting the `FieldState` for a node

Every `Field` instance, whether it's the root field or a sub-field obtained through navigation, has a `$state` property. Accessing `$state` provides you with the underlying `FieldState` instance for that specific node in the field tree.

The `FieldState` gives you access to the reactive state of that part of the field structure, including:

- **`value`**: A `WritableSignal` representing the current value of the field.
- **`valid`**: A `Signal` indicating whether the field _and its descendants_ are currently valid.
- **`errors`**: A `Signal` containing the list of `FormError` associated with the field. (A `FormError` is any object of type `{kind: string, message?: string}`).
- **`disabled`**: A `Signal` indicating whether the field _or any of its parents_ are disabled.
- **`touched`**: A `Signal` indicating whether the user has interacted with the field _or any of its descendants_.

Here's how you can use `$state` in the previous example:

```typescript
// Update the quantity for the first item. (This updates `orderModel` as well!)
firstItemQuantityField.$state.value.set(2);

// Get the value of the first item.
firstItemField.$state.value();  // {description: 'Ergonomic Mouse', quantity: 2}

// Check whether the order is disabled.
orderForm.$state.disabled();  // false

// Check if there are any errors on the items list.
itemsField.$state.errors();   // [];
```

## Adding field logic

As previously shown, `FieldState` instances expose reactive state signals like `valid`, `errors`, and `disabled`. This state isn't set directly; instead, it's _derived_ from the **field logic** you define.

Another key principle of Angular Signal Forms is that all field logic, such as validation rules or conditions for disabling fields, is defined **declaratively using TypeScript**. This means you specify the rules and conditions that determine a field's state upfront, when the field structure is defined. You don't imperatively command a field to change state later (e.g. there is no imperative `.disable()` method on the field state). Instead, you define _when_ `someField` should be disabled based on other signals or static conditions.

The mechanism for defining this declarative logic is the `Schema`. Think of a `Schema` as a **blueprint** containing the rules (validators, disabled conditions, etc.) for a `Field` that manages a specific data type. A `Schema<T>` is simply a function that accepts a `FieldPath<T>` and defines logic for it.

### Creating and applying a schema

You define a `Schema` as a function that is generic over the data type it applies to. For example:

- A schema function of type `Schema<string>` defines rules for a `Field<string>`.
- A schema function of type `Schema<User>` defines rules for a `Field<User>`.

This ensures that your logic rules align with the structure of your field and your data model.

Inside the schema function, you'll define the specific validation rules, disabled conditions, and other logic for the field structure. _How_ to define these rules will be covered shortly.

Once you have defined a schema, you associate it with your `Field` structure by passing it as the second argument to the `form()` function:

```typescript
// Define the data type for the form.
interface ConfirmedPassword {
  password: string;
  confirm: string;
}

// Create the data model.
const passwordModel = signal<ConfirmedPassword>({password: '', confirm: ''});

// Define a schema for this data type.
const passwordSchema: Schema<ConfirmedPassword> = (path: FieldPath<ConfirmedPassword>) => {
  // Logic rules (like validators) will be defined inside this function.
  // How to do this will be covered in the following sections.
};

// Create the field structure, adding the logic from the schema.
const passwordForm = form(passwordModel, passwordSchema);

// Now, passwordForm's state (e.g. passwordForm.$state.errors)
// will be determined by the rules defined in passwordSchema.
```

In this example, `passwordSchema` is defined but doesn't contain any specific rules yet. The key takeaway here is the structure: you define a typed schema and then link it to your `form()` instance alongside your data model signal.

### Defining logic rules within a schema

The schema is where you bind logic to specific fields in the field structure. The schema function receives a single argument, a `FieldPath<T>`, where `T` is the data type of the schema (e.g., `FieldPath<ConfirmedPassword>` in the example above).

The `FieldPath` acts as your tool for navigating the structure of your data model within the schema definition. It allows you to precisely target _where_ specific logic rules should apply. Navigating the `FieldPath` mirrors how you access properties on your data object or `Field` object.

You use these navigated paths as the first argument to the built-in logic binding functions to specify which part of the field structure the logic applies to. For example:

```typescript
const passwordSchema: Schema<ConfirmedPassword> = (path: FieldPath<ConfirmedPassword>) => {
  // Adds validation logic to require a value for `password`.
  required(path.password);
  // Adds validation logic to require a value for `confirm`.
  required(path.confirm);
};
```

#### Logic binding functions

Angular Signal Forms provides several functions designed to be called **within the schema function** to bind logic rules to parts of your field structure. These functions all take a `FieldPath` as the first argument to indicate which field the logic applies to.

The currently supported logic binding functions are:

- **`validate`**: Adds a validation rule that may add a `FormError` to the field.
- **`required`**: Adds a validation rule that adds a `FormError` of `kind: required` to the field if a value is not provided.
- **`error`**: Adds a validation rule that may add a `FormError` of `kind: 'custom'` to the field.
- **`disabled`**: Defines a condition for which the field should be disabled.
- **`hidden`**: Defines a condition for which the field should be considered hidden (useful for conditional UI rendering).
- **`metadata`**: Attaches arbitrary static metadata to a field.

_Consult the JSDoc for the exact usage of each of these logic functions._

#### Static definition, reactive execution

It's crucial to understand that the **schema function itself runs only once** when the form is created. Its purpose is to **statically define the structure of your field logic** and set up reactive computations.

Therefore, you _should not_ place dynamic conditional logic (like `if` statements or `for` loops that conditionally call binding functions) directly within the schema function's top level. Instead, the reactive nature comes from the logic functions themselves, which often take reactive functions as arguments. The goal here is to _declare_ the rules using the provided binding functions, not to execute imperative logic during schema definition time.

This is demonstrated in the following example:

```typescript
const passwordSchema: Schema<ConfirmedPassword> = (path: FieldPath<ConfirmedPassword>) => {
    // Define a reactive validation rule to check the password length.
    validate(path.password, ({value}: FieldContext<string>) => {
      // Return a FormError if the password is not long enough.
      if (value().length < 5) {
        return {kind: 'too-short', message: 'Password is too short'};
      }
      // Otherwise return null to indicate no error.
      return null;
    });
};

const passwordForm = form(signal({password: '', confirm: ''}), passwordSchema);

// Password is currently invalid.
passwordForm.password.$state.valid(); // false
passwordForm.password.$state.errors(); // [{kind: 'too-short', message: 'Password is too short'}]

// Update to a valid password.
passwordForm.password.$state.value.set('password');

// Password is now valid.
passwordForm.password.$state.valid(); // true
passwordForm.password.$state.errors(); // [];
```

The logic function passed as the second argument to `validate` in the example above receives a `FieldContext` which contains a `Signal` of the current field value. By reading this signal it sets up a reactive binding that defines the field's errors in terms of its value.

#### Defining cross-field logic

Often, the logic for one part of your field structure depends on the state or value of _another_ part. Common examples of this include:

- Ensuring a "confirm password" field matches the "password" field.
- Disabling a "shipping address" section if a "use billing address" checkbox is checked.
- Making a field required only if another field has a specific value.

There are two primary approaches to implement this type of logic in Angular Signal Forms:

##### Approach #1: Define the logic on a common parent path

In some cases you may want to associate the logic with a common parent node in your data structure, you can define the logic on the `FieldPath` corresponding to that parent object. The `FieldContext`'s `value` signal will then give you the entire parent object's value, allowing you to compare its child properties.

Looking at the previous `ConfirmedPassword` example, password matching logic can be implemented by adding validation to the root `path`:

```typescript
const passwordSchema: Schema<ConfirmedPassword> = (path: FieldPath<ConfirmedPassword>) => {
    // Add validation at the root level that considers both the
    // `password` and `confirm` values.
    validate(path, ({value}: FieldContext<ConfirmedPassword>) => {
      // Compare the password and confirm values, return an error if they don't match.
      const {password, confirm} = value();
      if (password !== confirm) {
        return {kind: 'non-matching', message: 'Password and confirm must match'};
      }
      // Otherwise return null to indicate no error.
      return null;
    });
};

const passwordForm = form(signal({password: 'first', confirm: 'second'}), passwordSchema);
```

An important thing to notice with this approach, is that the `non-matching` error is associated with the _root field_, not specifically with the `password` or `confirm` fields themselves. This might be suitable for displaying a general error message, but less ideal if you want to highlight the specific field the user needs to change.

```typescript
passwordForm.$state.errors(); // [{kind: 'non-matching', message: 'Password and confirm must match'}]
passwordForm.password.$state.errors(); // []
passwordForm.confirm.$state.errors(); // []
```

##### Approach #2: Use helper functions to access other fields' state or values

If you need to access other fields' values but don't want to move the logic to a common parent node, you can define the logic on the desired field. The `FieldContext` provides helper functions to access the state or value of _other_ fields:

- **`valueOf(otherPath: FieldPath<U>): U`**: Directly retrieves the current value of the field at `otherPath`.
- **`fieldOf(otherPath: FieldPath<U>): Field<U>`**: Retrieves the `Field` instance for the field at `otherPath`. You can then access its `$state` (e.g., `fieldOf(otherPath).$state.value()`).
- **`stateOf(otherPath: FieldPath<U>): FieldState<U>`**: Retrieves the `FieldState` instance for the field at `otherPath` (e.g., `stateOf(otherPath).value()`).

For simply getting another field's value, `valueOf` is the most direct.

Here's the same password matching validation, but associating the error with the `confirm` field instead, using `valueOf`:

```typescript
const passwordSchema: Schema<ConfirmedPassword> = (path: FieldPath<ConfirmedPassword>) => {
    // Add validation on the `confirm` field that considers both the
    // `password` and `confirm` values.
    validate(path.confirm, ({value, valueOf}: FieldContext<string>) => {
      // Get the value of `path.password`.
      const password = valueOf(path.password);
      // Compare the password and confirm values, return an error if they don't match.
      if (password !== value()) {
        return {kind: 'non-matching', message: 'Password and confirm must match'};
      }
      // Otherwise return null to indicate no error.
      return null;
    });
};

const passwordForm = form(signal({password: 'first', confirm: 'second'}), passwordSchema);

passwordForm.$state.errors(); // []
passwordForm.password.$state.errors(); // []
passwordForm.confirm.$state.errors(); // [{kind: 'non-matching', message: 'Password and confirm must match'}]
```

Note that because `valueOf(path.password)` reads a signal internally (as does `value()` for the current field), this establishes a reactive dependency on the value of `password` as well as the value of `confirm`, ensuring that the validation is recomputed if either one changes.

### Composing logic from multiple schemas

As your field structures become more complex, or when you have common data structures used across multiple forms (like addresses, dates, or reusable components), you'll often want to reuse validation and logic rules without duplication. Angular Signal Forms enables this through **schema composition**.

This is accomplished by using the `apply` function, which binds the logic from a child schema to a path in the parent schema. The `apply` function takes two arguments:

1.  **`path`**: A `FieldPath` within the parent schema where you want to apply the logic from the child schema.
2.  **`childSchema`**: The child `Schema` to add logic from. The data type of the `childSchema` (e.g., `Schema<Address>`) must match the data type of the `path` (e.g., `FieldPath<Address>`).

When you call `apply`, the logic rules defined within `childSchema` are effectively merged into the current schema at the specified `path`.

```typescript
interface SimpleDate {
  year: number;
  month: number;
  date: number;
}

interface Trip {
  destination: string;
  start: SimpleDate;
  end: SimpleDate;
}

// Define a schema to validate dates.
const dateSchema: Schema<SimpleDate> = (datePath: FieldPath<SimpleDate>) => {
  error(datePath.month, ({value}) => value() < 1 || value() > 12, 'Invalid month');
  error(datePath.date, ({value}) => value() < 1 || value() > 31, 'Invalid date');
};

// Define a schema for the trip that includes validation for its dates.
const tripSchema: Schema<Trip> = (tripPath: FieldPath<Trip>) => {
  // Define trip-specific logic.
  required(tripPath.destination);

  // Add in standard date logic for start and end date.
  apply(tripPath.start, dateSchema);
  apply(tripPath.end, dateSchema);
};

const defaultDate: SimpleDate = {year: 0, month: 0, date: 0};

const tripModel = signal<Trip>({
  destination: '',
  start: defaultDate,
  end: defaultDate,
});

const tripForm = form(tripModel, tripSchema);
```

Because the logic is _merged_ rather than _overwritten_, the parent schema can set up additional logic for the path with the applied schema if necessary.

```typescript
const tripSchema: Schema<Trip> = (tripPath: FieldPath<Trip>) => {
  // Trip-specific date logic, will be merged with standard date logic below.
  error(tripPath.start, ({value}) => compareToNow(value()) < 0, 'Trip must start in future');

  // Add in standard date logic for start and end date.
  apply(tripPath.start, dateSchema);
  apply(tripPath.end, dateSchema);

  // More trip-specific date logic, will be merged with standard date logic above.
  error(tripPath.end, ({value, valueOf}: FieldContext<SimpleDate>) => {
    const startValue = valueOf(tripPath.start);
    return compareTo(value(), startValue) < 0;
  }, 'Trip must end after it starts');
};
```

#### Applying schema logic to an array

Field structures sometimes contain arrays of items, such as line items in an order, tags, or multiple addresses. The challenge with arrays is that their length is dynamic – you don't know ahead of time how many elements there will be, and elements can be added or removed. This makes it impossible to statically bind logic to a specific index like `itemsPath[0]` within the schema definition, as that element might not exist.

Instead of targeting a single element, use the `applyEach` function which applies a given schema to **every element** currently present in the array, and ensures that the logic is also applied to any elements added later.

The `applyEach` function takes two arguments:

1.  **`arrayPath`**: A `FieldPath` for an array in the parent schema whose elements you want to apply logic to.
2.  **`elementSchema`**: A `Schema` defining the logic for a single element of the array. The data type of the `elementSchema` (e.g., `Schema<User>`) must match the data type of a single element of the `arrayPath` (e.g., `FieldPath<User[]>`).

When you call `applyEach`, the logic rules defined within `elementSchema` are automatically applied to every corresponding `Field` node representing an element within the target array field.

```typescript
interface User {
  username: string;
  name: string;
}

const userSchema: Schema<User> = (userPath: FieldPath<User>) => {
  disabled(userPath.username, () => true, 'Username cannot be changed');
};

const usersModel = signal<User[]>([]);

const usersForm = form(usersModel, (usersPath: FieldPath<User[]>) => {
  applyEach(usersPath, userSchema);
});

usersModel.set([{username: 'newuser', name: 'John Doe'}]);

usersForm[0].$state.disabled(); // true
```

#### Conditionally applying schema logic

We've established that the schema function runs only once to define the static structure of the logic. You cannot use dynamic `if` statements _within_ the schema function itself to conditionally call logic binding functions like `validate` or `disabled`.

However, field structures often require logic that should only be active under certain conditions. For example, validation rules for billing details might only apply if the user hasn't selected "Same as shipping address".

Schema composition provides a reactive solution for this using the `applyWhen` function. This function allows you to apply the logic from a child schema to a specific path, but only when a reactive condition evaluates to `true`. The `applyWhen` function takes three arguments:

1.  **`path`**: A `FieldPath` within the parent schema where the conditional logic should be applied.
2.  **`condition`**: A function that receives the `FieldContext<T>` for the `path` and must return a `boolean` indicating whether the child schema's logic is currently active.
3.  **`schema`**: The child `Schema` whose logic should be applied _when_ the `condition` is `true`. The data type `T` of this schema (`Schema<T>`) must match the data type of the `path` (`FieldPath<T>`).

The following example shows using `applyWhen` to conditionally apply validation based on a user's subscription tier:

```typescript
interface Account {
  premiumTier: boolean;
  quality: 'SD'|'HD'|'4K';
  friendsAndFamily: string[];
}

const basicAccountSchema: Schema<Account> = (accountPath: FieldPath<Account>) => {
  error(accountPath.quality,
        ({value}) => value() === '4K', '4K not supported for basic accounts');
  error(accountPath.friendsAndFamily,
        ({value}) => value().length > 1, 'Basic account allows 1 friends & family user');
};

const accountSchema: Schema<Account> = (accountPath: FieldPath<Account>) => {
  // Apply the basic account logic only if the user is not premium.
  applyWhen(accountPath, ({value}) => !value().premiumTier, basicAccountSchema);
};

const accountForm = form(signal({
  premiumTier: true,
  quality: '4K',
  friendsAndFamily: []
}), accountSchema);

accountForm.quality.$state.valid(); // true

accountForm.premiumTier.$state.value.set(false);

accountForm.quality.$state.valid(); // false
```

##### Conditionally applying logic with a narrowed type

Sometimes, you need to apply logic only when a field's value matches a specific _type_, especially when dealing with union types or optional fields (`T | null | undefined`). For instance, you might have a schema for `Address` data, but you only want to apply it to a `shippingAddress: Address | null` field _when_ the value is not `null`.

Angular Signal Forms provides `applyWhenValue` for this scenario. It works similarly to `applyWhen`, but its condition is a **type guard function** that operates directly on the field's _value_. The arguments to `applyWhenValue` are:

1.  **`path`**: A `FieldPath<T>` within the parent schema where the conditional logic should be applied.
2.  **`condition`**: A **type guard function** (`(value: T) => value is NarrowedType`) that receives the current _value_ `T` from the `path`. It should return `true` if the value matches the desired narrowed type.
3.  **`schema`**: The child `Schema` whose logic should be applied _when_ the `condition` type guard returns `true`. The data type of this schema (`Schema<NarrowedType>`) must match the **narrowed type** specified in the type guard's return signature.

Let's revisit the `Trip` example, making the dates optional (`null`) initially:

```typescript
interface SimpleDate {
  year: number;
  month: number;
  date: number;
}

interface Trip {
  destination: string;
  start: SimpleDate|null;
  end: SimpleDate|null;
}

// Define a schema to validate dates.
const dateSchema: Schema<SimpleDate> = (datePath: FieldPath<SimpleDate>) => {
  error(datePath.month, ({value}) => value() < 1 || value() > 12, 'Invalid month');
  error(datePath.date, ({value}) => value() < 1 || value() > 31, 'Invalid date');
};

// Define a schema for the trip that includes validation for its dates.
const tripSchema: Schema<Trip> = (tripPath: FieldPath<Trip>) => {
  // Define trip-specific logic.
  required(tripPath.destination);

  // Add in standard date logic for start and end date when they are not null.
  applyWhenValue(tripPath.start, (value): value is SimpleDate => value !== null, dateSchema);
  applyWhenValue(tripPath.end, (value): value is SimpleDate => value !== null, dateSchema);
};

const tripModel = signal<Trip>({
  destination: '',
  start: null,
  end: null,
});

const tripForm = form(tripModel, tripSchema);
```

## Submitting a form

Once the user has filled out the form, the typical next step is to submit the data, often involving client-side processing or sending it to a server. During this submission process, it's common to provide user feedback on the status (pending, success, failure).

Angular Signal Forms provides a `submit()` helper function to manage this workflow. It orchestrates the asynchronous submission action and updates the form's status accordingly. The `submit` function takes two arguments:

1.  **`field`**: The `Field` instance to submit. This can be the root field or any sub-field node.
2.  **`action`**: An asynchronous function that performs the submission action. It receives the `field` being submitted as an argument and returns a `Promise`.
  - The returned `Promise` resolves with `void` (or `undefined`, or `[]`) if the action completes successfully without server-side validation errors.
  - It resolves with an array of `ServerError` if the submission fails due to server-side validation or other issues that need to be reported back onto the form fields. The `ServerError` structure is detailed in the next section.

All `FieldState` objects have a `submittedStatus` signal that indicates their current submit state. The status can be `'unsubmitted'`, `'submitting'`, or `'submitted'`. There is no status to indicate that the submit errored because errors are reported through the `errors()` state the same way as client validation errors. (This is discussed more in the next section). `FieldState` objects also have a `resetSubmittedStatus()` method which sets the `submittedStatus` back to `'unsubmitted'`.

When a `Field` is submitted it updates the `submittedStatus` of the field _and_ all of its descendants in the field tree. Likewise when a field's status is reset via `resetSubmittedStatus()` it resets the status of the field _and_ all of its descendants.

```typescript
// Create the field structure.
const userForm = form(signal({username: '', name: ''}));
let resolve: () => void;

userForm.$state.submittedStatus(); // 'unsubmitted'

// Start a submit action.
const submitFinished = submit(userForm, () => new Promise<void>(r => resolve = r));

userForm.$state.submittedStatus(); // 'submitting'

// Simulate the submit finishing.
resolve();
await submitFinished;

userForm.$state.submittedStatus(); // 'submitted'

// Reset to unsubmitted.
userForm.$state.resetSubmittedStatus();

userForm.$state.submittedStatus(); // 'unsubmitted'
```

### Adding server errors to the form

Client-side validation defined in your `Schema` catches many errors, but some validation can only occur on the server (e.g., checking if a username is already taken, complex business rule validation).

When the `action` function provided to `submit()` detects such server-side errors, it should communicate them back by resolving its `Promise` with an array of `ServerError` objects (`Promise<ServerError[]>`).

A `ServerError` object links a `FormError` to a specific field within the submitted field structure. A `ServerError` is any object with the following properties:

- `error: FormError`: The validation error to add to the form.
- `field: Field<any>`: A reference to the specific `Field` node where this error should be displayed.

The `submit()` function takes this array of `ServerError` objects and automatically adds the specified `error` to the `errors` state of the corresponding `field`.

Its up to the developer to decide which field makes most sense to associate the error with. For a non-unique username error, associating the error with the `username` field makes sense. For a general server issue (e.g. "Internal error"), you might associate it with the field root instead.

```typescript
const userForm = form(signal({username: '', name: ''}));

const myClient = /* ... create server client */;

await submit(userForm, async (field) => { // `field` is the same as userForm here
  const error = await myClient.addUser(field.$state.value());
  if (error.code === myClient.Errors.NON_UNIQUE_USERNAME) {
    return [{
      error: {kind: 'non-unique-username', message: 'That username is already taken'},
      field: field.username
    }];
  }
});

userForm.$state.submittedStatus(); // 'submitted'
userForm.username.$state.errors(); // [{kind: 'non-unique-username', message: 'That username is already taken'}]
```

## Binding form fields to UI elements

So far, we've defined the data model, the field structure with the reactive state for each field, and the declarative logic. The final piece is connecting this logical field representation to the actual UI elements (like `<input>`, `<select>`, custom components) that the user interacts with in the template.

Angular Signal Forms provides the `FieldDirective` directive (`[field]`) to seamlessly bridge this gap. The `[field]` directive is how you link a specific `Field` node from your component's class to a compatible form control element in your HTML template.

You apply the directive to a form control element and bind it to the corresponding `Field` instance representing that field.

```typescript
interface User {
  username: string;
  name: string;
  age: number;
}

@Component({
  selector: 'user-form',
  imports: [FieldDirective],
  template: `
  <form>
    <label>Username: <input [field]="userForm.username" /></label>
    <label>Name: <input [field]="userForm.name" /></label>
    <label>Age: <input type="number" [field]="userForm.age" /></label>
  </form>
  `
})
class UserFormComponent {
  const userModel = signal({username: '', name: '', age: 0})
  readonly userForm: Field<User> = form<User>(userModel, (userPath: FieldPath<User>) => {
    disabled(userPath.username, () => true, 'Username cannot be changed');
    required(userPath.name);
    error(userPath.age, ({value}) => value() < 18, 'Must be 18 or older');
  });
}
```

### Automatic State Synchronization

The `[field]` directive handles the two-way synchronization between the `Field` node's state and the UI control, including:

- **Value Synchronization:**
  - Reads the field's current value (`fieldNode.$state.value()`) and sets the initial value of the UI control.
  - Listens for changes from the UI control (e.g., `input` event) and updates the field's value signal (`fieldNode.$state.value.set(...)`), which in turn updates your underlying data model signal.
- **Disabled State:**
  - Reads the field's disabled status (`fieldNode.$state.disabled()`) and sets the `disabled` attribute/property on the UI control accordingly.
- **Touched State:**
  - Listens for interaction events (typically `blur`) on the UI control and updates the field's touched status (`fieldNode.$state.touched` becomes `true` when the control is blurred for the first time).
- **(Other States):** Depending on the control type and library features, other states like validity attributes (`aria-invalid`) might also be synchronized.

This automatic synchronization significantly reduces the boilerplate code needed to connect your field logic to your template.

### Control compatibility

The `[field]` directive works out-of-the-box with standard HTML form elements like `<input>`, `<select>`, and `<textarea>`.

It can also integrate with custom form components (including those from libraries like Angular Material - e.g., `<mat-select>`, `<mat-radio>`) provided they correctly implement Angular's `ControlValueAccessor` interface. This is the standard mechanism in Angular for components to participate in forms.

<!-- TODO: add a more in-depth section on how to integrate your own custom UI controls -->
