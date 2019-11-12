# What is the `incremental` package?

This package contains logic related to incremental compilation in ngtsc.

In particular, it tracks dependencies between `ts.SourceFile`s, so the compiler can make intelligent decisions about when it's safe to skip certain operations.

# How does incremental compilation work?

The initial compilation is no different from a standalone compilation; the compiler is unaware that incremental compilation will be utilized.

When an `NgtscProgram` is created for a _subsequent_ compilation, it is initialized with the `NgtscProgram` from the previous compilation. It is therefore able to take advantage of any information present in the previous compilation to optimize the next one.

This information is leveraged in two major ways:

1) The previous `ts.Program` itself is used to create the next `ts.Program`, allowing TypeScript internally to leverage information from the previous compile in much the same way.

2) An `IncrementalState` instance is constructed from the old and new `ts.Program`s.

The compiler then proceeds normally, analyzing all of the Angular code within the program. As a part of this process, the compiler maps out all of the dependencies between files in the `IncrementalState`.

# What optimizations are made?

ngtsc makes a decision to skip the emit of a file if it can prove that the contents of the file will not have changed. To prove this, two conditions must be true.

* The input file itself must not have changed since the previous compilation.

* None of the files on which the input file is dependent have changed since the previous compilation.

The second condition is challenging to prove, as Angular allows statically evaluated expressions in lots of contexts that could result in changes from file to file. For example, the `name` of an `@Pipe` could be a reference to a constant in a different file. As part of analyzing the program, the compiler keeps track of such dependencies in order to answer this question.

The emit of a file is the most expensive part of TypeScript/Angular compilation, so skipping emits when they are not necessary is one of the most valuable things the compiler can do to improve incremental build performance.

# What optimizations are possible in the future?

There is plenty of room for improvement here, with diminishing returns for the work involved.

## Optimization of re-analysis

Currently, the compiler re-analyzes the entire `ts.Program` on each compilation. Under certain circumstances it may be possible for the compiler to reuse parts of the previous compilation's analysis rather than repeat the work, if it can be proven to be safe.

## Semantic dependency tracking

Currently the compiler tracks dependencies only at the file level, and will re-emit dependent files if they _may_ have been affected by a change. Often times a change though does _not_ require updates to dependent files.

For example, today a component's `NgModule` and all of the other components which consume that module's export scope are considered to depend on the component file itself. If the component's template changes, this triggers a re-emit of not only the component's file, but the entire chain of its NgModule and that module's export scope. This happens even though the template of a component _does not have any impact_ on any components which consume it - these other emits are deeply unnecessary.

In contrast, if the component's _selector_ changes, then all those dependent files do need to be updated since their `directiveDefs` might have changed.

Currently the compiler does not distinguish these two cases, and conservatively always re-emits the entire NgModule chain. It would be possible to break the dependency graph down into finer-grained nodes and distinguish between updates that affect the component, vs updates that affect its dependents. This would be a huge win, but is exceedingly complex.
