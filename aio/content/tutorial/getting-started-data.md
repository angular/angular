# Getting Started - Data
Once an Angular app has its general component structure, the next most important thing is the use and management of data.

## Fetching JSON Data from APIs with HttpClient

Angular includes an easy way to fetch and render data from JSON-based APIs.

To try this out, we'll create a new file called `products.json` in our assets folder. 

// @TODO
STEPHEN NOTE: What if we just offer a hardcoded backend?!

```typescript
{ products: [
  ...
]}
```

To fetch this data in our application, we will install the HttpClientModule in our application's App Module by importing it into the file and adding it to the `imports` key. 

At the top add
```
import { HttpClientModule } from '@angular/common/http';
```

And then in our imports section.
```
imports: [
  BrowserModule,
  HttpClientModule,
  ...
]
```

This now has provided the HttpClient service to our application so we can use it to make HTTP Requests.


## Collecting user input with Angular Forms
Forms in Angular take the standard capabilities of the HTML based forms and add an orchestration layer to help with creating custom form controls, and to supply great validation experiences. There are two parts to an Angular Form, the visualization of the form that lives in the template, and the objects that live in our component to store and manage form.

For this example we'll use [reactive forms](/guide/reactive-forms). To get started, we'll need to add the `ReactiveFormsModule` to our App Module.

```
import { ReactiveFormsModule } from '@angular/forms';
```

```
imports: [
  BrowserModule,
  FormsModule,
  ...
]
```

Our form lives in both our component's TypeScript and its template. Let's create a new checkout-form comonent. In the component we'll add the objects needed to store the checkout form in the constructor of our component. We'll also create a method to handle user submission of a valid form.

```
checkout: FormGroup;
constructor(private fb: FormBuilder) {
  this.checkout = fb.group({
    name: ['', Validators.required],
    address: [''],
  })
}

submit(checkoutData) {
  // Do something with the checkout data here
}
``

Now to show users this form, we have to add the HTML to our template.

```
 <form [formGroup]="checkout" (submit)="submit(checkout.value)" >
  <input formControlName="name" placeholder="name">
  <input formControlName="address" placeholder="address">
  <button type="submit">Purchase</button>
 </form>
```



## Streams of Data
Data coming back from servers in Angular applications most frequently take the form of a stream. Streams are useful because they make it easy to transform the data that is coming back, and to make modifications to the way we request data.

The three most common tasks users will do with a stream of data are to transform the data, combine multiple streams, and to perform an action for each of the pieces of data in a stream. Streams are created and managed using [RxJS](https://rxjs-dev.firebaseapp.com/) in Angular.

Any operation you would like to define on a stream is defined with the use of `.pipe([operations])`. This will return a new stream, and the operations defined on the stream will only execute when one of your components or services is using the data.

### Transforming Data
If we wanted to take a stream of events, and create a new stream of event statuses, we should use the `map` operator.

```
stream.pipe(
  map(...),
)
```

An example of this would be if your API returns an object:

```
{
  status: 'success',
  results_count: 42,
  items: [
    {...},
    {...},
    ...
  ]
}
```

If you wanted only the `items` from the results, you could use the map operator to define a new stream that only contains the `items` property.

```
stream.pipe(
  map(result => result.items),
)
```

### Combining Multiple Streams
It's very common to need to combine multiple streams. This is needed to have multiple HTTP requests, or to combine information from the Router with an HTTP request.

```
router.paramsMap.pipe(
  switchMap(params => http.get(`/items/${params.get(id)`)),
)
```

This switchMap operator will take the parameters of my current route and use it to create a new stream with data for that route. Any time the user's route changes, the stream will automatically make an additional HTTP request.


## Tasks
* Update our product page to use our data via HTTP instead of using the hard coded values
* Create a simple checkout form that allows the user to purchase a selected product

## Finish!
Our shopping cart is now accessing data from the internet and allows users to checkout.

As our application grows, we should starting thinking about the  [architecture](/tutorial/getting-started-architecture) of our application.