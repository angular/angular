# Understand the lifecycle of a component

The lifecycle of an Angular component starts, when the Angular framework instantiates the component class, and ends, when the Angular framework destroys the instance of the component.

An instance of a Angular component has the following lifecycle.

1.  The Angular framework instantiates the component class.
    1.  The Angular framework renders the document object model \(DOM\) structure of the component.
    1.  The Angular framework renders the DOM structure of the associated child components.
1.  The Angular framework uses change detection to checks when data-bound properties change.
    1. The Angular framework updates the DOM structure of the component.
    1. The Angular framework updates the instance of the component.
1.  The Angular framework destroys the instance of the component.
1.  The Angular framework removes the associated rendered HTML template from the DOM.

<div class="alert is-helpful">

**NOTE**: <br />
A [directive][AioGuideGlossaryDirective] has a similar lifecycle.
Angular creates, updates, and destroys instances of directives in the course of running a class.

</div>

## Use an Angular lifecycle hook method

Use a [lifecycle hook][AioGuideGlossaryLifecycleHook] method to access a specific stage in the lifecycle of a component.

<!-- To learn more about the use of a [lifecycle hook][AioGuideGlossaryLifecycleHook] method, see [Use an Angular lifecycle hook method][AioGuideComponentUseLifecycleHooks]. -->

<!-- links -->

<!-- [AioGuideComponentUseLifecycleHooks]: guide/component/component-use-lifecycle-hooks "Use an Angular lifecycle hook method | Angular" -->

[AioGuideGlossaryDirective]: guide/glossary#directive "directive - Glossary | Angular"
[AioGuideGlossaryLifecycleHook]: guide/glossary#lifecycle-hook "lifecycle hook - Glossary | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-08-23
