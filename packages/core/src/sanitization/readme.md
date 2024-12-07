# Sanitization

This folder contains sanitization related code.


## History

It used to be that sanitization related code used to be in `@angular/platform-browser` since it is platform related. While this is true, in practice the compiler schema is permanently tied to the DOM and hence the fact that sanitizer could in theory be replaced is not used in practice.

In order to better support tree shaking we need to be able to refer to the sanitization functions from the Ivy code. For this reason the code has been moved into the `@angular/core`.