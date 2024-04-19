# What is the 'annotations/component' package?

This package implements the `ComponentDecoratorHandler`, which processes and compiles `@Component`-decorated classes.

Component compilation is complex, and so not only is this package split out from the parent 'annotations' package, but its functionality is divided into separate files. In Angular, the concept of a component is an extension of a directive, so much of the component compilation functionality is shared with directive compilation, and is imported from the 'annotations/directive' package.