
## General Notes

Each Array costs 70 bytes and is composed of `Array` and `(array)` object
  * `Array` javascript visible object: 32 bytes
  * `(array)` VM object where the array is actually stored in: 38 bytes

Each Object cost is 24 bytes plus 8 bytes per property.

For small arrays, it is more efficient to store the data as a linked list
of items rather than small arrays. However, the array access is faster as
shown here: https://jsperf.com/small-arrays-vs-linked-objects

## Monomorphic vs Megamorphic code

Great read: [What's up with monomorphism?](http://mrale.ph/blog/2015/01/11/whats-up-with-monomorphism.html)

1) Monomorphic prop access is 100 times faster then megamorphic.
2) Monomorphic call is 4 times faster the megamorphic call.

 See benchmark [here](https://jsperf.com/mono-vs-megamorphic-property-access).

 ## Exporting top level variables

 Exporting top level variables should be avoided where possible where performance
 and code size matters:

 ```
 // Typescript
export let exported = 0;
let notExported = 0;

notExported = exported;

// Would be compiled to
exports.exported = 0;
var notExported = 0;

notExported = exports.exported;
```

Most minifiers do not rename properties (closure is an exception here).

What could be done instead is:

```
let exported = 0;

export function getExported() { return exported; }
export function setExported(v) { exported = v; }
```

Also writing to a property of `exports` might change its hidden class resulting in megamorphic access.