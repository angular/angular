# What is the `incremental` package?

This package contains logic related to incremental compilation in ngtsc.

In particular, it tracks dependencies between `ts.SourceFile`s, so the compiler can make intelligent decisions about when it's safe to skip certain operations. The main class performing this task is the `IncrementalDriver`.

# What optimizations are made?

ngtsc makes a decision to skip the emit of a file if it can prove that the contents of the file will not have changed. To prove this, two conditions must be true.

* The input file itself must not have changed since the previous compilation.

* None of the files on which the input file is dependent have changed since the previous compilation.

The second condition is challenging to prove, as Angular allows statically evaluated expressions in lots of contexts that could result in changes from file to file. For example, the `name` of an `@Pipe` could be a reference to a constant in a different file. As part of analyzing the program, the compiler keeps track of such dependencies in order to answer this question.

The emit of a file is the most expensive part of TypeScript/Angular compilation, so skipping emits when they are not necessary is one of the most valuable things the compiler can do to improve incremental build performance.

# How does incremental compilation work?

The initial compilation is no different from a standalone compilation; the compiler is unaware that incremental compilation will be utilized.

When an `NgtscProgram` is created for a _subsequent_ compilation, it is initialized with the `NgtscProgram` from the previous compilation. It is therefore able to take advantage of any information present in the previous compilation to optimize the next one.

This information is leveraged in two major ways:

1) The previous `ts.Program` itself is used to create the next `ts.Program`, allowing TypeScript internally to leverage information from the previous compile in much the same way.

2) An `IncrementalDriver` instance is constructed from the old and new `ts.Program`s, and the previous program's `IncrementalDriver`.

The compiler then proceeds normally, analyzing all of the Angular code within the program. As a part of this process, the compiler maps out all of the dependencies between files in the `IncrementalDriver`.

## Determination of files to emit

The principle question the incremental build system must answer is "which TS files need to be emitted for a given compilation?"

To determine whether an individual TS file needs to be emitted, the compiler must determine 3 things about the file:

1. Have its contents changed since the last time it was emitted?
2. Has any resource file that the TS file depends on (like an HTML template) changed since the last time it was emitted?
3. Have any of the dependencies of the TS file changed since the last time it was emitted?

If the answer to any of these questions is yes, then the TS file needs to be re-emitted.

## Tracking of changes

On every invocation, the compiler receives (or can easily determine) several pieces of information:

* The set of `ts.SourceFile`s that have changed since the last invocation.
* The set of resources (`.html` files) that have changed since the last invocation.

With this information, the compiler can perform rebuild optimizations:

1. The compiler analyzes the full program and generates a dependency graph, which describes the relationships between files in the program.
2. Based on this graph, the compiler can make a determination for each TS file whether it needs to be re-emitted or can safely be skipped. This produces a set called `pendingEmit` of every file which requires a re-emit.
3. The compiler cycles through the files and emits those which are necessary, removing them from `pendingEmit`.

Theoretically, after this process `pendingEmit` should be empty. As a precaution against errors which might happen in the future, `pendingEmit` is also passed into future compilations, so any files which previously were determined to need an emit (but have not been successfully produced yet) will be retried on subsequent compilations. This is mostly relevant if a client of `ngtsc` attempts to implement emit-on-error functionality.

However, normally the execution of these steps requires a correct input program. In the presence of TypeScript errors, the compiler cannot perform this process. It might take many invocations for the user to fix all their TypeScript errors and reach a compilation that can be analyzed.

As a result, the compiler must accumulate the set of these changes (to source files and resource files) from build to build until analysis can succeed.

This accumulation happens via a type called `BuildState`. This type is a union of two possible states.

### `PendingBuildState`

This is the initial state of any build, and the final state of any unsuccessful build. This state tracks both `pendingEmit` files from the previous program as well as any source or resource files which have changed since the last successful analysis.

If a new build starts and inherits from a failed build, it will merge the failed build's `PendingBuildState` into its own, including the sets of changed files.

### `AnalyzedBuildState`

After analysis is successfully performed, the compiler uses its dependency graph to evaluate the impact of any accumulated changes from the `PendingBuildState`, and updates `pendingEmit` with all of the pending files. At this point, the compiler transitions from a `PendingBuildState` to an `AnalyzedBuildState`, which only tracks `pendingEmit`. In `AnalyzedBuildState` this set is complete, and the raw changes can be forgotten.

If a new build is started after a successful build, only `pendingEmit` from the `AnalyzedBuildState` needs to be merged into the new build's `PendingBuildState`.

# What optimizations are possible in the future?

There is plenty of room for improvement here, with diminishing returns for the work involved.

## Optimization of re-analysis

Currently, the compiler re-analyzes the entire `ts.Program` on each compilation. Under certain circumstances it may be possible for the compiler to reuse parts of the previous compilation's analysis rather than repeat the work, if it can be proven to be safe.

## Semantic dependency tracking

Currently the compiler tracks dependencies only at the file level, and will re-emit dependent files if they _may_ have been affected by a change. Often times a change though does _not_ require updates to dependent files.

For example, today a component's `NgModule` and all of the other components which consume that module's export scope are considered to depend on the component file itself. If the component's template changes, this triggers a re-emit of not only the component's file, but the entire chain of its NgModule and that module's export scope. This happens even though the template of a component _does not have any impact_ on any components which consume it - these other emits are deeply unnecessary.

In contrast, if the component's _selector_ changes, then all those dependent files do need to be updated since their `directiveDefs` might have changed.

Currently the compiler does not distinguish these two cases, and conservatively always re-emits the entire NgModule chain. It would be possible to break the dependency graph down into finer-grained nodes and distinguish between updates that affect the component, vs updates that affect its dependents. This would be a huge win, but is exceedingly complex.
