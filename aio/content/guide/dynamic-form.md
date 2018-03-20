# Dynamic Forms

{@a top}

Building handcrafted forms can be costly and time-consuming,
especially if you need a great number of them, they're similar to each other, and they change frequently
to meet rapidly changing business and regulatory requirements.

It may be more economical to create the forms dynamically, based on
metadata that describes the business object model.

This cookbook shows you how to use `formGroup` to dynamically
render a simple form with different control types and validation.
It's a primitive start.
It might evolve to support a much richer variety of questions, more graceful rendering, and superior user experience.
All such greatness has humble beginnings.

The example in this cookbook is a dynamic form to build an
online application experience for heroes seeking employment.
The agency is constantly tinkering with the application process.
You can create the forms on the fly *without changing the application code*.
{@a toc}

See the <live-example name="dynamic-form"></live-example>.

{@a bootstrap}

## Bootstrap

Start by creating an `NgModule` called `AppModule`.

This cookbook uses [reactive forms](guide/reactive-forms).

Reactive forms belongs to a different `NgModule` called `ReactiveFormsModule`,
so in order to access any reactive forms directives, you have to import
`ReactiveFormsModule` from the `@angular/forms` library.

Bootstrap the `AppModule` in `main.ts`.


<code-tabs>

  <code-pane title="app.module.ts" path="dynamic-form/src/app/app.module.ts">

  </code-pane>

  <code-pane title="main.ts" path="dynamic-form/src/main.ts">

  </code-pane>

</code-tabs>


{@a object-model}

## Question model

The next step is to define an object model that can describe all scenarios needed by the form functionality.
The hero application process involves a form with a lot of questions.
The _question_ is the most fundamental object in the model.

The following `QuestionBase` is a fundamental question class.


<code-example path="dynamic-form/src/app/question-base.ts" title="src/app/question-base.ts">

</code-example>



From this base you can derive two new classes in `TextboxQuestion` and `DropdownQuestion`
that represent textbox and dropdown questions.
The idea is that the form will be bound to specific question types and render the
appropriate controls dynamically.

`TextboxQuestion` supports multiple HTML5 types such as text, email, and url
via the `type` property.


<code-example path="dynamic-form/src/app/question-textbox.ts" title="src/app/question-textbox.ts" linenums="false">

</code-example>



`DropdownQuestion` presents a list of choices in a select box.


<code-example path="dynamic-form/src/app/question-dropdown.ts" title="src/app/question-dropdown.ts" linenums="false">

</code-example>



Next is `QuestionControlService`, a simple service for transforming the questions to a `FormGroup`.
In a nutshell, the form group consumes the metadata from the question model and
allows you to specify default values and validation rules.


<code-example path="dynamic-form/src/app/question-control.service.ts" title="src/app/question-control.service.ts" linenums="false">

</code-example>

{@a form-component}

## Question form components
Now that you have defined the complete model you are ready
to create components to represent the dynamic form.


`DynamicFormComponent` is the entry point and the main container for the form.

<code-tabs>

  <code-pane title="dynamic-form.component.html" path="dynamic-form/src/app/dynamic-form.component.html">

  </code-pane>

  <code-pane title="dynamic-form.component.ts" path="dynamic-form/src/app/dynamic-form.component.ts">

  </code-pane>

</code-tabs>



It presents a list of questions, each bound to a `<app-question>` component element.
The `<app-question>` tag matches the `DynamicFormQuestionComponent`,
the component responsible for rendering the details of each _individual_
question based on values in the data-bound question object.


<code-tabs>

  <code-pane title="dynamic-form-question.component.html" path="dynamic-form/src/app/dynamic-form-question.component.html">

  </code-pane>

  <code-pane title="dynamic-form-question.component.ts" path="dynamic-form/src/app/dynamic-form-question.component.ts">

  </code-pane>

</code-tabs>



Notice this component can present any type of question in your model.
You only have two types of questions at this point but you can imagine many more.
The `ngSwitch` determines which type of question to display.

In both components  you're relying on Angular's **formGroup** to connect the template HTML to the
underlying control objects, populated from the question model with display and validation rules.

`formControlName` and `formGroup` are directives defined in
`ReactiveFormsModule`. The templates can access these directives
directly since you imported `ReactiveFormsModule` from `AppModule`.
{@a questionnaire-data}

## Questionnaire data

`DynamicFormComponent` expects the list of questions in the form of an array bound to `@Input() questions`.

 The set of questions you've defined for the job application is returned from the `QuestionService`.
 In a real app you'd retrieve these questions from storage.

 The key point is that you control the hero job application questions
 entirely through the objects returned from `QuestionService`.
 Questionnaire maintenance is a simple matter of adding, updating,
 and removing objects from the `questions` array.


<code-example path="dynamic-form/src/app/question.service.ts" title="src/app/question.service.ts">

</code-example>



Finally, display an instance of the form in the `AppComponent` shell.


<code-example path="dynamic-form/src/app/app.component.ts" title="app.component.ts">

</code-example>

{@a dynamic-template}

## Dynamic Template
Although in this example you're modelling a job application for heroes, there are
no references to any specific hero question
outside the objects returned by `QuestionService`.

This is very important since it allows you to repurpose the components for any type of survey
as long as it's compatible with the *question* object model.
The key is the dynamic data binding of metadata used to render the form
without making any hardcoded assumptions about specific questions.
In addition to control metadata, you are also adding validation dynamically.

The *Save* button is disabled until the form is in a valid state.
When the form is valid, you can click *Save* and the app renders the current form values as JSON.
This proves that any user input is bound back to the data model.
Saving and retrieving the data is an exercise for another time.


The final form looks like this:

<figure>
  <img src="generated/images/guide/dynamic-form/dynamic-form.png" alt="Dynamic-Form">
</figure>



[Back to top](guide/dynamic-form#top)
