# Migrating to zoneless tutorial

## What is "Zone.js"?

Zone.js is a fundamental part of Angular's change detection mechanism. Zone.js
intercepts events such as mouse clicks, HTTP requests, and `setTimeout` calls.
This interception tells Angular when the UI might require updating.
Consequently, Angular triggers its change detection process across the component
tree to ensure the view reflects the latest application state.

These checks can be resource-intensive on a large page. Many larger applications
adopt `OnPush` as a performance best practice to prevent unnecessary view
updates. You can read more about this practice in the
[skipping component subtrees](/best-practices/skipping-subtrees#using-onpush)
guide. Components that use `OnPush` do not use Zone.js and its automatic change
detection trigger. Applications using `OnPush` generally don't require Zone.js
and are typically zoneless compatible.

## What is "Zoneless"?

What does "zoneless" mean? A zoneless Angular application operates without
Zone.js. Instead of relying on Zone.js to signal potential changes, a zoneless
approach gives you more explicit control over when and how the system triggers
change detection. This typically involves using newer Angular features, such as
signals, or manually triggering change detection.

You will see improved performance and a smaller application bundle size.
Removing Zone.js removes a dependency, which results in a smaller initial
download. More importantly, you have more control over change detection. As a
result, you can prevent unnecessary checks across your application. Angular does
less work. This leads to faster updates, animations, and a more responsive user
experience, especially in complex applications.

Zoneless setups improve ecosystem compatibility. Because Zone.js patches native
browser APIs, it can create incompatibilities with other JavaScript libraries or
tools that modify or expect original browser behaviors. Zoneless setups avoid
these patching-related issues. This simplifies integration with various tools
and upcoming JavaScript features.

A zoneless approach simplifies debugging change detection issues because the
triggers for updates are more explicit. It also means that
Zone.js machinery is absent from stack traces.

## Why *this* tutorial and *these* steps?

Enabling zoneless is simpler than the steps in this tutorial:

*   Enable *OnPush*.
*   Remove uses of *NgZone* (keep *NgZone.run* and *runOutsideAngular* until you
    no longer need to support ZoneJS).
*   If you use SSR: use the *PendingTasks* service for asynchronous work in
    components that should delay serialization.

Most of the work is in the first step. For applications that use *OnPush*
extensively, migrating to zoneless is straightforward. Applications that use
*OnPush* for the root component (the one in *bootstrapApplication*) can often
enable zoneless with no other changes.

This tutorial outlines a path for migrating to zoneless Angular with the
following goals:

*   Easily test the application with zoneless enabled and compare it with
    existing behavior.
*   Incrementally make changes and minimize the risk to the production
    application.
*   Use test-driven development.
*   Be thorough, present common cases, and avoid oversimplification.

When enabling zoneless functionality, you disable or remove the features that
the ZoneJS integration enables. Base Angular behaves as zoneless. ZoneJS
integrates with Angular to provide additional functionality. If an application
works without ZoneJS, it also works with ZoneJS enabled. As you incrementally
discover and fix issues to make your application zoneless-compatible, these
changes should not break applications that use ZoneJS.

HELPFUL: You can target zoneless and be compatible with applications that use ZoneJS. ZoneJS can still trigger excessive change detection for events.  You might sometimes need to run code outside the zone to prevent excessive change detection (see [resolving zone pollution](/best-practices/zone-pollution)).

This tutorial walks you step-by-step through the considerations and actions
needed to migrate your Angular application to a more performant, zoneless
architecture.

If you get stuck, click "Reveal answer" at the top.

Alright, let's
[get started](/tutorials/zoneless-migration/1-set-up-an-experiment).
