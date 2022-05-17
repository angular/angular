# Send data to a parent component

The `@Output()` decorator function in a child component or directive signifies that the property is able to send a value to the parent component.

<div class="lightbox">

<img alt="Output diagram of the data flow going from child to parent" src="generated/images/guide/inputs-outputs/output.svg" />

</div>

The `@Output()` decorator function marks a property in a child component as a connection for data to travel from the child component to the parent component.

The child component uses the property in the `@Output()` decorator function to raise an event in order to notify the parent of the change.
To raise an event, use the `EventEmitter` class with the `@Output()` decorator function.
The `EventEmitter` class in `@angular/core` emits custom events.

## Prerequisites

Before you send data to a parent component in an Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreate].

## Configure the child component to send data

To use the `@Input()` decorator function in a child component class, complete the following actions.

1.  To import the `Output` decorator and the `EventEmitter` class in the child component, add the following code.

    <code-example format="typescript" header="Add imports to child component" language="typescript">

    import { Output, EventEmitter } from '&commat;angular/core';

    </code-example>

1.  In the component class, decorate a property with the `@Output()` decorator.
    In the following code example, the `new{nameOfChildProperty}Event` property is a `@Output()` decorator function.
    It has the `EventEmitter` type, which means it is an event.

    <code-example format="typescript" header="Add @Output decorator function to child component" language="typescript">

    export class {NameOfChildComponent}OutputComponent {
      &commat;Output() new{nameOfChildProperty}Event = new EventEmitter&lt;string&gt;();
    }

    </code-example>

    The following table describes the different parts of the preceding declaration.

    | Parts                           | Details |
    |:---                             |:---     |
    | `@Output()`                     | A decorator function. Marks the property as a way for data to go from the child to the parent.                                                                     |
    | `new{nameOfChildProperty}Event` | The name of the property. The `new` and `Event` terms were used to indicate that the property emits a new event.                                                   |
    | `new EventEmitter<string>()`    | Angular creates an new instance that is specified by the class. <br /> `EventEmitter<string>` specifies the type for the property is an event that emits a string. |

    To learn more about `EventEmitter`, see [`EventEmitter`][AioApiCoreEventemitter].

1.  To create an `addNew{nameOfChildProperty}()` method in the same component class, add the following code.

    <code-example format="typescript" header="Add method to child component" language="typescript">

    export class {NameOfChildComponent}OutputComponent {
      &commat;Output() new{nameOfChildProperty}Event = new EventEmitter&lt;string&gt;();

      addNew{nameOfChildProperty}(value: string) {
        this.new{nameOfChildProperty}Event.emit(value);
      }
    }

    </code-example>

    The `addNew{nameOfChildProperty}()` method uses the `new{nameOfChildProperty}Event` `@Output()` decorator function to raise an event.
    It uses the value that the user types into the `input` element.

## Configure the template of the child component to send data

<code-example format="html" header="Add template to child component" language="html">

&lt;label for="{nameOfChildProperty}-input"&gt;
  Add an {nameOfChildProperty}:
&lt;/label&gt;
&lt;input type="text"
          id="{nameOfChildProperty}-input"
          #new{nameOfChildProperty}&gt;
&lt;button type="button"
           (click)="addNew{nameOfChildProperty}(new{nameOfChildProperty}.value)"&gt;
  Add to list of the parent
&lt;/button&gt;

</code-example>

The template of the child has two controls.

<code-tabs>
    <code-pane format="html" header="input element" language="html"> &lt;input &hellip; id="{nameOfChildProperty}-input" #new{nameOfChildProperty}&gt;&NewLine;  &bsol;&lowbar;&lowbar;&lowbar;/                                    &bsol;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;/&NewLine;   &verbar;                                        &verbar;&NewLine;   User text input                          template reference&NewLine;                                            variable </code-pane>
    <code-pane format="html" header="button element" language="html"> &lt;button &hellip; (click)="addNew{nameOfChildProperty}(new{nameOfChildProperty}.value)"&gt;&NewLine;  &bsol;&lowbar;&lowbar;&lowbar;&lowbar;/                                        &bsol;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;/ &bsol;&lowbar;&lowbar;&lowbar;/&NewLine;   &verbar;                                             &verbar;                        &verbar;&NewLine;   User button input                             template reference       property&NewLine;                                                 variable </code-pane>
</code-tabs>

| Controls                                                                                                             | Details |
|:---                                                                                                                  |:---     |
| `input` element with a `#new{nameOfChildProperty}` [template reference variable][AioGuideTemplateReferenceVariables] | The location where the user types a name                                                                         |
| `value` property of the `#new{nameOfChildProperty}` variable                                                         | Stores the content the user types into the `input` element                                                       |
| `button` element has a `click` [event binding][AioGuideEventBinding]                                                 | The `(click)` event property is bound to the `addNew{nameOfChildProperty}()` method in the child component class |
| `addNew{nameOfChildProperty}()` method                                                                               | Uses the value of the `#new{nameOfChildProperty}` property \(`#new{nameOfChildProperty}.value`\) as an argument  |

## Configure the parent component to receive data

In the following code example, the `{NameOfParentComponent}Component` component has a list of `{pluralNameOfParentProperty}` in an array and a method to add more instances to the array.

<code-example format="typescript" header="Add array and method to parent component" language="typescript">

export class {NameOfParentComponent}Component {
  {pluralNameOfParentProperty} = [
    '{nameOfParentProperty}1',
    '{nameOfParentProperty}2',
    '{nameOfParentProperty}3',
    '{nameOfParentProperty}4'
  ];

  add{nameOfParentProperty}(new{nameOfChildProperty}: string) {
    this.{pluralNameOfParentProperty}.push(new{nameOfChildProperty});
  }
}

</code-example>

Use the `add{nameOfParentProperty}()` method to take a string argument and add the string to the `{pluralNameOfParentProperty}` array.

## Configure the template of the parent component to receive data

1.  In the template of the parent component, bind the method of the parent component to the event of the child component.
1.  Use the CSS selector of the child component in the template of the parent component.

    <code-example format="html" header="Add template to parent component" language="html">

    &lt;{name-of-child-css-selector} (new{nameOfChildProperty}Event)="add{nameOfChildProperty}(new{nameOfChildProperty}(&dollar;event)"&lt;
    &lt;/{name-of-child-css-selector}&gt;

    </code-example>

    The user enters text in view created from the `input` element in the template the child component.
    The event binding connects the `new{nameOfChildProperty}Event` event property in the CSS selector of the child component to the `add{nameOfChildProperty}()` method in the parent component.
    The `$event` contains the data that the user enters in the UI.

    <code-example format="html" header="Event binding diagram of the new{nameOfChildProperty}Event event from child component to the add{nameOfChildProperty}() method from parent component on the right of an equal sign. The $event contains the data that the user enters in the UI." hideCopy language="html">

    (new{nameOfChildProperty}Event)="add{nameOfChildProperty}(&dollar;event)"
     &bsol;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;/   &bsol;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;/
      &verbar;                               &verbar;
      event property from              method from
      child component                  parent component

    </code-example>

    <div class="alert is-helpful">

    Use `*ngFor` to dynamically display the list and see the `@Output()` decorator function work.

    1.  Add the following code snippet to the template of the parent component.

        <code-example format="html" header="Add template to parent component" language="html">

        &lt;ul&gt;
          &lt;li &ast;ngFor="let {nameOfChildProperty} of {pluralNameOfChildProperty}"&gt;
            {{{nameOfChildProperty}}}
          &lt;/li&gt;
        &lt;/ul&gt;

        </code-example>

        The `*ngFor` iterates over the individual instances in the `{pluralNameOfChildProperty}` array.

    1.  When a user enters a value and selects the button in the UI, Angular completes the following actions.

        1.  The CSS selector of the child component emits the `new{nameOfChildProperty}Event` event property of the child component.
        1.  The `new{nameOfChildProperty}Event` event property runs the `add{nameOfChildProperty}()` method of the parent component.
        1.  The `add{nameOfChildProperty}()` method pushes the value to the `{pluralNameOfChildProperty}` array.
        1.  The template of the parent component displays the new item in the list.

    </div>

<!-- links -->

[AioApiCoreEventemitter]: api/core/EventEmitter "EventEmitter | Core - API | Angular"

[AioGuideComponentCreate]: guide/component/component-create "Create an Angular component | Angular"

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuideEventBinding]: guide/event-binding "Event binding | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"
[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

[AioGuideTemplateReferenceVariables]: guide/template-reference-variables "Template variables | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
