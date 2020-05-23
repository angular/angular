# What is the `incremental` package?

This package contains logic related to incremental compilation in ngtsc.

In particular, it tracks dependencies between `ts.SourceFile`s, so the compiler can make intelligent decisions about when it's safe to skip certain operations.

# What optimizations are made?

ngtsc currently makes two optimizations: reuse of prior analysis work, and the skipping of file emits.

## Reuse of analyses

If a build has succeeded previously, ngtsc has available the analyses of all Angular classes in the prior program, as well as the dependency graph which outlines inter-file dependencies. This is known as the "last good compilation".

When the next build begins, ngtsc follows a simple algorithm which reuses prior work where possible:

1) For each input file, ngtsc makes a determination as to whether the file is "logically changed".

"Logically changed" means that either:

* The file itself has physically changed on disk, or
* One of the file's dependencies has physically changed on disk.

Either of these conditions invalidates the previous analysis of the file.

2) ngtsc begins constructing a new dependency graph.

For each logically unchanged file, its dependencies are copied wholesale into the new graph.

3) ngtsc begins analyzing each file in the program.

If the file is logically unchanged, ngtsc will reuse the previous analysis and only call the 'register' phase of compilation, to apply any necessary side effects.

If the file is logically changed, ngtsc will re-analyze it.

## Reuse of template type-checking code

Generally speaking, the generation of a template type-checking "shim" for an input component file is a time-consuming operation. Such generation produces several outputs:

1) The text of the template type-checking shim file, which can later be fed to TypeScript for the production of raw diagnostics.
2) Metadata regarding source mappings within the template type-checking shim, which can be used to convert the raw diagnostics into mapped template diagnostics.
3) "Construction" diagnostics, which are diagnostics produced as a side effect of generation of the shim itself.

When a component file is logically unchanged, ngtsc attempts to reuse this generation work. As part of creating both the new emit program and template type-checking program, the `ts.SourceFile` of the shim for the component file is included directly and not re-generated.

At the same time, the metadata and construction diagnostics are passed via the incremental build system. When TS gets diagnostics for the shim file, this metadata is used to convert them into mapped template diagnostics for delivery to the user.

### Limitations on template type-checking reuse

In certain cases the template type-checking system is unable to use the existing shim code. If the component is logically changed, the shim is regenerated in case its contents may have changed. If generating the shim itself required the use of any "inline" code (type-checking code which needs to be inserted into the component file instead for some reason), it also becomes ineligible for reuse.

## Skipping emit

ngtsc makes a decision to skip the emit of a file if it can prove that the contents of the file will not have changed since the last good compilation. To prove this, two conditions must be true.

* The input file itself must not have changed since the previous compilation.

* None of the files on which the input file is dependent have changed since the previous compilation.

The second condition is challenging to prove, as Angular allows statically evaluated expressions in lots of contexts that could result in changes from file to file. For example, the `name` of an `@Pipe` could be a reference to a constant in a different file. As part of analyzing the program, the compiler keeps track of such dependencies in order to answer this question.

The emit of a file is the most expensive part of TypeScript/Angular compilation, so skipping emits when they are not necessary is one of the most valuable things the compiler can do to improve incremental build performance.

## The two dependency graphs

For both of the above optimizations, ngtsc makes use of dependency information extracted from the program. But these usages are subtly different.

To reuse previous analyses, ngtsc uses the _prior_ compilation's dependency graph, plus the information about which files have changed, to determine whether it's safe to reuse the prior compilation's work.

To skip emit, ngtsc uses the _current_ compilation's dependency graph, coupled with the information about which files have changed since the last successful build, to determine the set of outputs that need to be re-emitted.

# How does incremental compilation work?

The initial compilation is no different from a standalone compilation; the compiler is unaware that incremental compilation will be utilized.

When an `NgtscProgram` is created for a _subsequent_ compilation, it is initialized with the `NgtscProgram` from the previous compilation. It is therefore able to take advantage of any information present in the previous compilation to optimize the next one.

This information is leveraged in two major ways:

1) The previous `ts.Program` itself is used to create the next `ts.Program`, allowing TypeScript internally to leverage information from the previous compile in much the same way.

2) An `IncrementalDriver` instance is constructed from the old and new `ts.Program`s, and the previous program's `IncrementalDriver`.

The compiler then proceeds normally, using the `IncrementalDriver` to manage the reuse of any pertinent information while processing the new program. As a part of this process, the compiler (again) maps out all of the dependencies between files.

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

1. The compiler uses the last good compilation's dependency graph to determine which parts of its analysis work can be reused, and an initial set of files which need to be re-emitted.
2. The compiler analyzes the rest of the program and generates an updated dependency graph, which describes the relationships between files in the program as they are currently.
3. Based on this graph, the compiler can make a final determination for each TS file whether it needs to be re-emitted or can safely be skipped. This produces a set called `pendingEmit` of every file which requires a re-emit.
4. The compiler cycles through the files and emits those which are necessary, removing them from `pendingEmit`.

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

## Component to NgModule dependencies

The dependency of a component on its NgModule is slightly problematic, because its arrow is in the opposite direction of the source dependency (which is from NgModule to the component, via `declarations`). This creates a scenario where, if the NgModule is changed to no longer include the component, the component still needs to be re-emitted because the module has changed.

This is one of very few cases where `pendingEmit` must be populated with the logical changes from the previous program (those files determined to be changed in step 1 under "Tracking of changes" above), and cannot simply be created from the current dependency graph.

# What optimizations are possible in the future?

There is plenty of room for improvement here, with diminishing returns for the work involved.

## Semantic dependency tracking

Currently the compiler tracks dependencies only at the file level, and will re-emit dependent files if they _may_ have been affected by a change. Often times a change though does _not_ require updates to dependent files.

For example, today a component's `NgModule` and all of the other components which consume that module's export scope are considered to depend on the component file itself. If the component's template changes, this triggers a re-emit of not only the component's file, but the entire chain of its NgModule and that module's export scope. This happens even though the template of a component _does not have any impact_ on any components which consume it - these other emits are deeply unnecessary.

In contrast, if the component's _selector_ changes, then all those dependent files do need to be updated since their `directiveDefs` might have changed.

Currently the compiler does not distinguish these two cases, and conservatively always re-emits the entire NgModule chain. It would be possible to break the dependency graph down into finer-grained nodes and distinguish between updates that affect the component, vs updates that affect its dependents. This would be a huge win, but is exceedingly complex.

## Skipping template type-checking

Under ideal conditions, after an initial template type-checking program is created, it may be possible to reuse it for emit _and_ type-checking in subsequent builds. This would be a pretty advanced optimization but would save creation of a second `ts.Program` on each valid rebuild.
