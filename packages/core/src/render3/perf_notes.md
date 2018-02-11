
## General Notes

Each Array costs 70 bytes and is composed of `Array` and `(array)` object
  * `Array` javascript visible object: 32 bytes
  * `(array)` VM object where the array is actually stored in: 38 bytes

Each Object cost is 24 bytes plus 8 bytes per property.

For small arrays, it is more efficient to store the data as a linked list 
of items rather than small arrays. However, the array access is faster as 
shown here: https://jsperf.com/small-arrays-vs-linked-objects

## Monomorphic vs Megamorphic code

1) Monomophic prop access is 100 times faster then megamorphic.
2) Monomorphic call is 4 times faster the megamorphic call.
 
 See benchmark [here](https://jsperf.com/mono-vs-megamorphic-property-access).