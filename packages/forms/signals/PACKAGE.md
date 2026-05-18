# Signal-Based Forms API

This directory contains Angular's signal-based forms API, built on top of
[signals](https://angular.dev/guide/signals). It provides a third option for building
forms in Angular — alongside template-driven forms and reactive forms — and offers
interoperability with the existing version of `@angular/forms`.

## Not yet supported

- Dynamic objects
- Tuples

## FAQs

### Why are you working on this?

We've been exploring ways that we can integrate signals into Angular's forms package. We've looked
at several options, including integrating signals into template and reactive forms, and designing a
new flavor of forms with signals at the core. Our hope is that we can leverage this work to close
the gap between template and reactive forms, which often inspires debate in the Angular ecosystem.

### What does this mean for the future of template and/or reactive forms?

Nothing is changing yet with template and reactive forms.

Even if we achieve our goals, we will roll out any changes to forms incrementally. Like with NgModules
and `standalone`, we don't intend to deprecate template or reactive forms without a clear sign from
our community that the ecosystem is fully on board.

### Will I need to rewrite my application code to use the new forms system?

No - a non-negotiable design goal of a new signal-based forms system is interoperability with
existing forms code and applications. It should be possible to incrementally start using the new
system in existing applications, and as always we will explore the possibility of automated migrations.
