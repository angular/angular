# What is the 'annotations/common' package?

This package contains common code related to the processing of Angular-decorated classes by `DecoratorHandler` implementations. Some common utilities provided by this package help with:

* Static evaluation of different kinds of expressions
* Construction of various diagnostics
* Extraction of dependency injection information
* Compilation of dependency injection factories
* Extraction of raw metadata suitable for generating `setClassMetadata` calls  