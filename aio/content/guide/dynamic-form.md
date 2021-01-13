# Building dynamic forms

Many forms, such as questionaires, can be very similar to one another in format and intent.
To make it faster and easier to generate different versions of such a form,
you can create a *dynamic form template* based on metadata that describes the business object model.
You can then use the template to generate new forms automatically, according to changes in the data model.

The technique is particularly useful when you have a type of form whose content must
change frequently to meet rapidly changing business and regulatory requirements.
A typical use case is a questionaire. You might need to get input from users in different contexts.
The format and style of the forms a user sees should remain constant, while the actual questions you need to ask vary with the context.

In this tutorial you will build a dynamic form that presents a basic questionaire.
You will build an online application for heroes seeking employment.
The agency is constantly tinkering with the application process, but by using the dynamic form
you can create the new forms on the fly without changing the application code.

The tutorial walks you through the following steps.

1. Enable reactive forms for a project.
2. Establish a data model to represent form controls.
3. Populate the model with sample data.
4. Develop a component to create form controls dynamically.

The form you create uses input validation and styling to improve the user experience.
It has a Submit button that is only enabled when all user input is valid, and flags invalid input with color coding and error messages.

The basic version can evolve to support a richer variety of questions, more graceful rendering, and superior user experience.

<div class="alert is-helpful">

See the <live-example name="dynamic-form"></live-example>.

</div>

## Prerequisites

Before doing this tutorial, you should have a basic understanding to the following.

* [TypeScript](https://www.typescriptlang.org/ "The TypeScript language") and HTML5 programming.

* Fundamental concepts of [Angular app design](guide/architecture "Introduction to Angular app-design concepts").

* Basic knowledge of [reactive forms](guide/reactive-forms "Reactive forms guide").

## Enable reactive forms for your project

Dynamic forms are based on reactive forms. To give the application access reactive forms directives, the [root module](guide/bootstrapping "Learn about bootstrapping an app from the root module.") imports `ReactiveFormsModule` from the `@angular/forms` library.

The following code from the example shows the setup in the root module.

<code-tabs>

  <code-pane header="app.module.ts" path="dynamic-form/src/app/app.module.ts">

  </code-pane>

  <code-pane header="main.ts" path="dynamic-form/src/main.ts">

  </code-pane>

</code-tabs>

{@a object-model}

## Create a form object model

A dynamic form requires an object model that can describe all scenarios needed by the form functionality.
The example hero-application form is a set of questions&mdash;that is, each control in the form must ask a question and accept an answer.

The data model for this type of form must represent a question.
The example includes the `DynamicFormQuestionComponent`, which defines a  question as the fundamental object in the model.

The following `QuestionBase` is a base class for a set of controls that can represent the question and its answer in the form.

<code-example path="dynamic-form/src/app/question-base.ts" header="src/app/question-base.ts">

</code-example>

### Define control classes

From this base, the example derives two new classes, `TextboxQuestion` and `DropdownQuestion`,
that represent different control types.
When you create the form template in the next step, you will instantiate these specific question types in order to render the appropriate controls dynamically.

* The `TextboxQuestion` control type presents a question and allows users to enter input.

   <code-example path="dynamic-form/src/app/question-textbox.ts" header="src/app/question-textbox.ts"></code-example>

   The `TextboxQuestion` control type will be represented in a form template using an `<input>` element.
   The `type` attribute of the element will be defined based on the `type` field specified in the `options` argument (for example `text`, `email`, `url`).

* The `DropdownQuestion` control presents a list of choices in a select box.

   <code-example path="dynamic-form/src/app/question-dropdown.ts" header="src/app/question-dropdown.ts"></code-example>

### Compose form groups

A dynamic form uses a service to create grouped sets of input controls, based on the form model.
The following `QuestionControlService` collects a set of `FormGroup` instances that consume the metadata from the question model. You can specify default values and validation rules.

<code-example path="dynamic-form/src/app/question-control.service.ts" header="src/app/question-control.service.ts"></code-example>

{@a form-component}

## Compose dynamic form contents

The dynamic form itself will be represented by a container component, which you will add in a later step.
Each question is represented in the form component's template by an `<app-question>` tag, which matches an instance of `DynamicFormQuestionComponent`.

The `DynamicFormQuestionComponent` is responsible for rendering the details of an individual question based on values in the data-bound question object.
The form relies on a [`[formGroup]` directive](api/forms/FormGroupDirective "API reference") to connect the template HTML to the underlying control objects.
The `DynamicFormQuestionComponent` creates form groups and populates them with controls defined in the question model, specifying display and validation rules.

<code-tabs>

  <code-pane header="dynamic-form-question.component.html" path="dynamic-form/src/app/dynamic-form-question.component.html">

  </code-pane>

  <code-pane header="dynamic-form-question.component.ts" path="dynamic-form/src/app/dynamic-form-question.component.ts">

  </code-pane>

</code-tabs>

The goal of the `DynamicFormQuestionComponent` is to present question types defined in your model.
You only have two types of questions at this point but you can imagine many more.
The `ngSwitch` statement in the template determines which type of question to display.
The switch uses directives with the [`formControlName`](api/forms/FormControlName "FormControlName directive API reference") and [`formGroup`](api/forms/FormGroupDirective "FormGroupDirective API reference") selectors. Both directives are defined in `ReactiveFormsModule`.

{@a questionnaire-data}

### Supply data

Another service is needed to supply a specific set of questions from which to build an individual form.
For this exercise you will create the `QuestionService` to supply this array of questions from the hard-coded sample data.
In a real-world app, the service might fetch data from a backend system.
The key point, however, is that you control the hero job-application questions entirely through the objects returned from `QuestionService`.
To maintain the questionnaire as requirements change, you only need to add, update, and remove objects from the `questions` array.


The `QuestionService` supplies a set of questions in the form of an array bound to `@Input()` questions.

<code-example path="dynamic-form/src/app/question.service.ts" header="src/app/question.service.ts">

</code-example>


{@a dynamic-template}

## Create a dynamic form template

The `DynamicFormComponent` component is the entry point and the main container for the form, which is represented using the `<app-dynamic-form>` in a template.

The `DynamicFormComponent` component presents a list of questions by binding each one to an `<app-question>` element that matches the `DynamicFormQuestionComponent`.

<code-tabs>

  <code-pane header="dynamic-form.component.html" path="dynamic-form/src/app/dynamic-form.component.html">

  </code-pane>

  <code-pane header="dynamic-form.component.ts" path="dynamic-form/src/app/dynamic-form.component.ts">

  </code-pane>

</code-tabs>

### Display the form

To display an instance of the dynamic form, the `AppComponent` shell template passes the `questions` array returned by the `QuestionService` to the form container component, `<app-dynamic-form>`.

<code-example path="dynamic-form/src/app/app.component.ts" header="app.component.ts">

</code-example>

The example provides a model for a job application for heroes, but there are
no references to any specific hero question other than the objects returned by `QuestionService`.
This separation of model and data allows you to repurpose the components for any type of survey
as long as it's compatible with the *question* object model.

### Ensuring valid data

The form template uses dynamic data binding of metadata to render the form
without making any hardcoded assumptions about specific questions.
It adds both control metadata and validation criteria dynamically.

To ensure valid input, the *Save* button is disabled until the form is in a valid state.
When the form is valid, you can click *Save* and the app renders the current form values as JSON.

The following figure shows the final form.

<div class="lightbox">
  <img src="generated/images/guide/dynamic-form/dynamic-form.png" alt="Dynamic-Form">
</div>

## Next steps

* **Different types of forms and control collection**

   This tutorial shows how to build a a questionaire, which is just one kind of dynamic form.
   The example uses `FormGroup` to collect a set of controls.
   For an example of a different type of dynamic form, see the section [Creating dynamic forms](guide/reactive-forms#creating-dynamic-forms "Create dynamic forms with arrays") in the Reactive Forms guide.
   That example also shows how to use `FormArray` instead of `FormGroup` to collect a set of controls.

* **Validating user input**

   The section [Validating form input](guide/reactive-forms#validating-form-input "Basic input validation") introduces the basics of how input validation works in reactive forms.

   The [Form validation guide](guide/form-validation "Form validation guide") covers the topic in more depth.
