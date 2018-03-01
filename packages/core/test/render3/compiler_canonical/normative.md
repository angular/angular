This folder contains canonical examples of how the Ivy compiler translates annotations into code

- The specs are marked with `NORMATIVE` => `/NORMATIVE` comments which designates what the compiler is expected to generate.
- All local variable names are considered non-normative (informative). They should be wrapped in `$` on each end to simplify testing on the compiler side.

A common trick in spec files is to map types to `$x$` (such as `boolean` => `$boolean$`, etc) to simplify testing for compiler, as types aren't saved. (See bullet above).
```
type $boolean$ = boolean;
type $any$ = any;
type $number$ = number;
```