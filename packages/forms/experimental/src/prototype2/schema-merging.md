# Problem

How do we merge schemas when multiple rules specify the constraints on the same property?

- For errors the merging is trivial because we can put them all in an array
- For everything else: `disabled`, `required`, `min`, etc. it wouldn't make sense to have an array
  of values
- Example 1: If a common schema chunk defines a disabled value and then we include it into our
  schema and define our own rule for that same disabled state
  - does ours win?
  - do we `||` them together?
- Example 2: What about the same situation with a `min` validator?
  - does ours win?
  - do we take the minimum of the two?
  - do we take the maximum of the two?

## Idea 1

Last wins & allow returning `null` as a special value to indicate that we should fallback to earlier
rules. Any more complicated merging is outside our scope.

```ts
const commonAddressSchema = schema<{
  shipping: Address;
  billing: Address;
  billingSameAsShipping: boolean;
}>((addr) => {
  rule(addr.billing, disable(addr.billingSameAsShipping.$() ? "same as shipping" : null));
});

const myUserSchema = schema<{
  name: Name;
  address: {
    shipping: Address;
    billing: Address;
    billingSameAsShipping: boolean;
  };
}>((user) => {
  rule(user.address, commonAddressSchema);
  rule(user.address.billing, disable(accountLocked() ? "account locked" : null));
});
```

## Idea 2

Last wins & allow and offer an APIs that split the condition and value, to allow only conditionally
setting it. Any more complicated merging is outside our scope.

```ts
const commonAddressSchema = schema<{
  shipping: Address;
  billing: Address;
  billingSameAsShipping: boolean;
}>((addr) => {
  rule(addr.billing, when(addr.billingSameAsShipping.$, disable("same as shipping")));
});

const myUserSchema = schema<{
  name: Name;
  address: {
    shipping: Address;
    billing: Address;
    billingSameAsShipping: boolean;
  };
}>((user) => {
  rule(user.address, commonAddressSchema);
  rule(user.address.billing, when(accountLocked, disable("account locked")));
});
```

## ??

Other ideas? is there an elegant way to handle more complicated merging?
