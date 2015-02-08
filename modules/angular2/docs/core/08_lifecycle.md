# Application LifeCycle

Application LifeCycle describes when different lifecycle events occure during the lifetime of the application. As the Angular application executes, it is helpuful to undersand different phases of execution and the philosophy behind each.

## Browser Event Processing

At its core an Angular application is tightly bound to the browser execution/event loop. This means that an Angular application can only do work in response to a browser event. These events can be due to user input, server response, or scheduled timers.

In order to know when the event when an even happens, the event needs to be registered inside an Angular Zone, which adds the lifecycle processing to the event. Events registered outside the Angular Zone will not be intercepted and hence will not have their bindings processed. 

One can use the Angular Zone to controll which events should have binding side effects and which should not just by controlling in which zone event registration took place.

## Angular Zone Event Processing

The event callback usually contains the work which mutates the application state, while the data-binding contains instructions how to project the mutated state back to the UI.

The Angular Zone will automatically trigger the change detection at the end of each event.


## Change Detection

Change Detection is a way of detecting changes to the application state and projecting these changes into the UI. The change detection starts at the root of the application and proceds to the children in the depth-first traversal. The change detection tree follows the View tree.

When a change is detected it is delivered to the coresponding binding. This is either the element property or the property on the directive.

If the directive has `onChange` method, then the `onChange` method is executed after all of the changes have been delivered to the directive. This gives the directive a chance to compute new values for child bindings (to child directives or elements)

Finally if a directive has `onCheck` method, it is invoked, which gives the directive a chance to perform its own change detection. Usually used with structural checks.

Angular's change detection is limited to the reference equality. Angular's change detection can not deep watch objects (known as structural changes). The reason for this is that structural changes are expensive. Furthermore the change delivery mechanism is usage specific. (i.e. `foreach` may want to have its changes deliverd in a animation compatible way, where as `class`-list may have more relaxed requriments.) In ordere to structuraly watch an on object the directive must use a custom structural watcher (common ones are provided) and invoke its `check` method from the `onCheck` lifecycle event. 



### Directed Acyclic Graph

The change detection processes changes from the root to the child bindings in the depth first order. A change in parent binding, may change the application model such that a child binding may fire as a result. The parent to child flow of data is strict. The consequence of this is that the bindings form a directed (parent to child) acyclic (single pass, no stabilization) graph (DAG). This is in contrast to Angular v1.x where bindings could go in any direction (from child to parent) and they could form cycles. Cycles in the graph require multiple digest, and run the risk of not stabilizing after few iterations. This is strictly prohibited in Angular2 and is enforced in the development mode. 

The advantages of DAG is that for large applications the flow of data is easier to reason about, performance is a lot more predictable, and it allows us to disable change detection in some branches under some circumstaces further improving performance.



## View Creation and Destruction

While change detection is running, a binding may cause an Instantiator directive to create, destroy, or move a View in a ViewPort. 

Views have their own lifecycle methods which the directives can tage advantage of. A View goes through these changes.

- *creation* - Instantiate new View from the ProtoView. This is relativly expensive operation which involves DOM cloning and locating of the Nodes which have bindings.
- *hydration* - Create associated directives for the View when the View is attached to the ViewPort.
- *dehydration* - View is removed from the ViewPort and the associated directives need to be destroyed.
- *cached* - A View is no longer in used, but it is cached so that a relativly expensive *creation* operation can be skipped in case someone needs a View again.
- *destruction* - View is released to GC if the cache is filled up.


# Summary

A directive is notified of these lifecycle events.

- `onHydrate()` - Right after the directive is created.
- Change Detection
  - update bindings - A directive property (or property setter) is updated. 
  - `onChange()` - Called to let the directive know that all of the directive properties have been updated and that there are no more changes.
  - `onCheck()` - Called after `onChange()` which allows the directive to perform structural changes as part of the change detection.
- `onDehydrate()` - Called to let the directive know that the associated View has been destroyed.