# Host

This document explains the concept of _host_ in angular application.

# What is a _host_ element?

A _host_ is the element where the _component_ or _directive_ is attached to.
At most one _component_ and zero or more _directives_ can share the same _host_ element.

```typescript
// assume `my-component` is existing component and `[dir-a]` and `[dir-b]` are existing directives
@Component({
  template: `<my-component dir-a dir-b>...</my-component>`
})
class MyApp {}
```

In the above example the element `my-component` is a host element, because it has a _component_ and two _directives_ attached to it.
The important thing to understand is that the `my-component` element is owned by `MyApp` not by `MyComponent`.
Ownership describes who is responsible for creating and destroying the element.
(It is the responsibility of `MyApp` (not `MyComponent`) to create `my-component` element; `MyComponent` simply assumes that existing _host_ element exist and attaches itself to it.)

## Why can't component create its own host?

Host components exist for several reasons:
- It is the way WebComponents work and Angular's mental model was modeled on WebComponents.
- Host elements allow for composition of _component_ and _directives_ on a single element.
- Host element is needed for selectors.
  (Parent component declares a _host_ element and existing components and directives match the host element and attach to it.)
- Host element is the context where host bindings and host listeners are executed on.

## Explicit vs Implicit Host Elements

Given:
```typescript
@Component({
  selector: 'child',
  template: `child`
})
class Child {}

@Component({
  selector: 'parent',
  template: `<child></child>`
})
class Parent {}
```

Notice that the `Parent` component view implicitly creates the `<child>` element regardless if the `Child` has been declared. 
For example `<child>` could be a custom element in which case the browser would render it's content instead of Angular.
In most cases the _host_ element for a component is just an element in the parent component's view. 
Therefore in most cases the _host_ element is created implicitly as part of the parent component rendering.
However there comes a point where the parent component has no more parents.
In this case the _host_ element needs to be created explicitly. 
In addition to the _host_ element it is also is necessary to create a change detection view for the _host_ element so that any `@HostBinding` and `@HostListeners` can be correctly registered and change detected. 
For this reason Angular needs to create a _host_ view which contains the element, and any associated component and directives.
The _host_ view is attached to the _host_ element provides the change detection context for the `@HostBinding` and `@HostListeners`.
It can also provide change detection from the _host_ element attributes to the inputs of the component and or directives.

Summary:
- Implicit _host_ is created as part of parent component's view.
- Explicit _host_ needs to be created manually for the top-most component (which has no parent and is being inserted programmatically).

# Overview of APIs to work with _host_ element and attaching _components_

To better understand _host_ we are providing several examples of usage. 
These examples assume that following components and directives have been declared.

```typescript
@Component({
  selector: 'my-component',
  template: `MyComponent View`
})
class MyComponent {
  @HostBinding('title')
  title = 'MyDirectiveTitle';
}

@Component({
  selector: 'my-app',
  template: `MyApp View`
})
class MyApp {}

@Directive({})
class MyDirective {}
```

## Creating components and directives

This example shows how components can be instantiated.
It does not attach the component DOM trees or the change detection propagation.
(That is shown in the next example).

``` typescript
// Component is not responsible for creating its own host element. For this reason we have
// to create the host element manually using standard DOM api.
let myAppHostElement = document.createElement('my-app');

// We can now create a component and attach it to the host element.
let myApp: MyApp = createComponent(MyApp, myAppHostElement);
```

Same operation can be repeated for the second component as well as the directive. 
Notice there is no rule that the host element name (`<div>`) must match the selector of the component (`<my-component>`).
Selectors are only used when assembling the components automatically from other templates.

```typescript
let myComponentHostElement: DivElement = document.createElement('div');
let myComponent: MyComponent = createComponent(MyComponent, myComponentHostElement);
let myDirective: MyDirective = createDirective(MyDirective, myComponentHostElement);
```

At this point we have created two components (and a directive). 
There are no relationships between them.
They are independent in DOM and in change detection relationship.
First we attach their DOM trees, and than we attach their change detection trees.

```typescript
// We join the DOM trees together using standard DOM APIs.
myAppHostElement.append(myComponentHostElement);

// We now need to bridge the change detection between parent MyApp and
// child MyComponent. It is important that we bridge the change detection
// to the _host_ element not the component view itself. This is the
// reason for the `getHostElement` call which returns `myComponentHostElement`.
attachChangeDetection(myApp, getHostElement(myComponent));
```
IMPORTANT: If we would do `attachChangeDetection(myApp, myComponent)` instead (notice the lack of `getHostElement` call) we would not get desired effect.
Specifically the change detection would propagate from the `MyApp` view to the `MyComponent` view skipping the `MyComponent` _host_.
This would mean that `MyComponent`'s `@HostBinding('title') title = 'MyDirectiveTitle'` would never execute.
(Same for any `@HostListener`s.)

alternatively we can detach the change detection tree.
```typescript
detachChangeDetection(myApp, getHostElement(myComponent));
```

# Change Detection

Change detection describes the act of dirty checking the components and reflecting its state to the component's view. 
Each view (component's template) has a change detector attach to it which can detect changes in the component and reflect those changes to the DOM.
For convenience the change detectors are attached in a tree which reflects the logical tree of components in the DOM.
The implication is that triggering the change detection on the root component will in turn trigger the change detection on the child components as well.
The following API shows how the change detectors can be attach/detached, change detected and marked dirty.

## `attachChangeDetection` / `detachChangeDetection` / `setChangeDetectionMode`

Change detection is broken down to views.
The changed detection on the views can be attached or detached in any order.
Usually the change detection views are implicitly linked in the logical order in which they were declared in the component's template.
This API is only needed if one wishes to rearrange the order or when creating components implicitly.

```typescript
/**
 * Attach the child view to a specific location in the change detection tree.
 * 
 * For all parameters:
 *  - If component than the view associated with that component.
 *  - If element that the view associated with that Element. (Usually host view).
 * 
 * @param parent Where the change detector should be attached so that it is a child of the parent.
 * @param child The child change detector to attach.
 * @param before Optional location of existing change detector to attach to. If not specified attache as last change detector.
 */
function attachChangeDetection(
    parent:ComponentOrElement, 
    child:ComponentOrElement, 
    before?:ComponentOrElement
  ): void;

/**
 * Detach the view from the change detection tree.
 * 
 * For all parameters:
 *  - If component than the view associated with that component.
 *  - If element that the view associated with that Element. (Usually host view).
 * 
 * NOTE: if you want to remove the change detection only temporarily consider using 
 *       `setChangeDetectionMode(ref, ChangeDetectionMode.Disabled.)`
 * 
 * @param componentOrElement Which change detector to permanently remove.
 */
function detachChangeDetection(componentOrElement:ComponentOrElement): void;

const enum ChangeDetectionMode {
  /**
   * A change detection triggered at parent component view will not cross this boundary.
   * 
   * The component is effectively cut of from the parent change detection events. 
   * Change detection can still occur if called explicitly using `detectChanges` or `markDirty`.
   */
  Disabled = 0,


  /**
   * Propagate parent change detection events to the child view only if the originator 
   * of the change detection explicitly called for it.
   * 
   * This is in contrast to `Auto` mode which triggers automatically by Zone.js.
   */
  Explicit = 1,

/**
   * Automatically propagate all parent change detection events to the child view.
   * 
   * This is in contrast to `Explicit` mode which is triggered programmatically (not 
   * implicitly by Zone.js).
   */
  Auto = 2,
}

/**
 * Set the condition under which the parent change detection event should propagate to the child change detector.
 * 
 * @param componentOrElement Which change detector to set propagation mode on.
 * @param changeDetectionMode `ChangeDetectionMode` to assign.
 */
function setChangeDetectionMode(
    componentOrElement:ComponentOrElement, 
    changeDetectionMode: ChangeDetectionMode
  ): void;
```


## `detectChanges`

### `assertNoChanges`

## `markDirty`
