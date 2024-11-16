# Purpose

This test exists to validate that ngtsc, when compiling an application where Ivy would otherwise
require a circular dependency, uses "remote scoping" via the `setComponentScope` function instead.

# How it works

There are two files, `index.ts` and `trigger.ts`. `index.ts` contains the NgModule and a simple
component (`<dep>`).

`trigger.ts` contains a component `TriggerComponent` that uses `<dep>` in its template. Normally,
Ivy would want `DepComponent` to be listed in `TriggerComponent`'s definition. However, this
requires adding an import from `trigger.ts` -> `index.ts`, and there's already an import from
`index.ts` to `trigger.ts` (for the NgModule).

In this case, ngtsc decides to set the directives in `TriggerComponent`'s definition via a different
mechanism: remote scoping. Alongside the NgModule (in `index.ts`) a call to `setComponentScope` is
generated which sets up `TriggerComponent`'s definition correctly, without introducing any imports.
This call is not tree-shakeable, but does not create a cycle.

The symbol test here verifies that `setComponentScope` is used, and the e2e spec verifies that the
application works correctly.