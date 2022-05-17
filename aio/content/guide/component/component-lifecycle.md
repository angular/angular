# Understand the lifecycle of a component

The lifecycle of an Angular component starts when the Angular instantiates the component class and ends, when Angular destroys the instance of the component.

An instance of a Angular component has the following lifecycle.

1.  Angular instantiates the component class.
    1.  Angular renders the view of the component.
    1.  Angular renders the views of the associated child components.
1.  Angular uses change detection to checks when data-bound properties change
    1. Angular updates the view of the component.
    1. Angular updates the instance of the component.
1.  Angular destroys the instance of the component.
1.  Angular removes the associated rendered template from the DOM.

Directives have a similar lifecycle.
Angular creates, updates, and destroys instances of directives in the course of running a class.

## Use lifecycle hook method

Use a [lifecycle hook][AioGuideGlossaryLifecycleHook] method to access a specific stage in the lifecycle of a component.

To learn more about accessing a [lifecycle hook][AioGuideGlossaryLifecycleHook] method, see [Use lifecycle hook methods][AioGuideComponentUsageLifecycleHooks].

<!-- links -->

[AioGuideComponentUsageLifecycleHooks]: guide/component/component-usage-lifecycle-hooks "Use lifecycle hook methods | Angular"

[AioGuideGlossaryLifecycleHook]: guide/glossary#lifecycle-hook "lifecycle hook - Glossary | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
