Implements a set of directives and providers to communicate with native DOM elements when building forms 
to capture user input. 

Use this API to register directives, build form and data models, and provide validation to your forms. Validators can
be synchronous or asynchronous depending on your use case. You can also extend the built-in functionality
provided by forms in Angular by using the interfaces and tokens to create custom validators and input elements.

Angular forms allow you to:

* Capture the current value and validation status of a form.
* Track and listen for changes to the form's data model.
* Validate the correctness of user input.
* Create custom validators and input elements.

You can build forms in one of two ways:

* *Reactive forms* use existing instances of a `FormControl` or `FormGroup` to build a form model. This form
model is synced with form input elements through directives to track and communicate changes back to the form model. Changes
to the value and status of the controls are provided as observables.
* *Template-driven forms* rely on directives such as `NgModel` and `NgModelGroup` create the form model for you,
so any changes to the form are communicated through the template.


@see Find out more in the [Forms Overview](guide/forms-overview).
