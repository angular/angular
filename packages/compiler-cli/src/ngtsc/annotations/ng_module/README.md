# What is the 'annotations/ng_module' package?

This package implements the `NgModuleDecoratorHandler`, which processes and compiles `@NgModule`-decorated classes.

It's separated out because other `DecoratorHandler`s interact with the `NgModuleSymbol` to implement the incremental compilation semantics of Angular.