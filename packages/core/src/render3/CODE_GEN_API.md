# Code Gen API

### Prefix ɵɵ

Ivy exports a number of functions prefixed with `ɵɵ`, for example `ɵɵelementStart`, or `ɵɵinject`, et al. These functions are part of API required for code generation by the Angular compiler. These functions are called by generated code, and they must be publicly exposed in order to be consumed by this generated code. **They are not meant for developer consumption**. The reason they are prefixed with `ɵɵ` is not only to identify them as different from other functions, but also to make them not show up at the top of IDE code completion in environments such as Visual Studio code.


### Guidance

- Do not use `ɵɵ` functions directly. They are meant to be used in generated code.
- Do not create new `ɵɵ` functions, it's not a convention that Angular consumes, and it is liable to confuse other developers into thinking consuming Angular's `ɵɵ` functions is a good pattern to follow.
