# 🚧 Prototype of Signal-Based Forms 🏗️

This directory contains prototype code of how a future version of Angular Forms could look and function if built on top of signals. We're using this prototype to explore potential designs for such a system, to play with new ideas, identify challenges, and to demonstrate interoperability with the production version of `@angular/forms`.

## FAQs

### Why are you working on this?

We're exploring ways that we can integrate signals into Angular's forms package. We're looking at all options, including integrating signals into template and reactive forms, and designing a new flavor of forms with signals at the core. Our hope is that we can leverage this work to close the gap between template and reactive forms, which often inspires debate in the Angular ecosystem.

### What does this mean for the future of template and/or reactive forms?

Nothing is changing yet with template and reactive forms. This exploration is early and is highly experimental, and many outcomes are possible - including that this just doesn't work.

Even if we achieve our goals, we will roll out any changes to forms incrementally. Like with NgModules and `standalone`, we don't intend to deprecate template or reactive forms without a clear sign from our community that the ecosystem is fully on board.

### Will I need to rewrite my application code to use the new forms system?

No - a non-negotiable design goal of a new signal-based forms system is interoperability with existing forms code and applications. It should be possible to incrementally start using the new system in existing applications, and as always we will explore the possibility of automated migrations.

### Will there be an RFC?

If we decide to make any changes to forms, then yes.

### What's the timeline of this effort?

We don't know, it depends on what we learn through this process!

### How can I follow what's happening?

Our [Github project tracker](https://github.com/orgs/angular/projects/60) is where we track the active work.
