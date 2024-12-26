# idea 1

The actual demo you can see in [demo.ts](./demo.ts),
or [demo-but-no-comments.ts](demo-but-no-comments.ts)

Note, that there are no signals yet, I generally feel we should be able to use
signals for everything: inputs (such as values, disabled, validators), as well
as outputs (values, states, etc.), so that's coming later.

My focus here is to explore a way to create a form that would be:

1. Simple, intuitive
2. Type safe
3. Composable
4. Declarative
5. Familiar to Angular forms users

# Form

In this file I'll try to use a simple user + password + address form with the
following twists:

1. User form with username, password, confirm password, and two addresses:
   shipping and billing.
2. Passwords must match (we'll need a validator for that)
3. There should be a checkbox, 'Billing address is the same'

I'll focus on the dev API, and not the actual implementation.

## Open questions here

(And this prob won't make sense until you look at demo.ts)

1. Are the types we infer enough for most of the cases?
2. What would it take to make controls easily extensible to support dynamic
   forms
3. I don't like the typings for validator, this def needs more work. 
4. Should validators have the ability to set props on input? e.g. should max
   validator set a max prop for input[type=number] 