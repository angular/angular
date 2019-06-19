# What is the `incremental` package?

This package contains logic related to incremental compilation in ngtsc.

In particular, it tracks metadata for `ts.SourceFile`s in between compilations, so the compiler can make intelligent decisions about when to skip certain operations and rely on previously analyzed data.

# How does incremental compilation work?

The initial compilation is no different from a standalone compilation; the compiler is unaware that incremental compilation will be utilized.

When an `NgtscProgram` is created for a _subsequent_ compilation, it is initialized with the `NgtscProgram` from the previous compilation. It is therefore able to take advantage of any information present in the previous compilation to optimize the next one.

This information is leveraged in two major ways:

1) The previous `ts.Program` itself is used to create the next `ts.Program`, allowing TypeScript internally to leverage information from the previous compile in much the same way.

2) An `IncrementalState` instance is constructed from the previous compilation's `IncrementalState` and its `ts.Program`.

After this initialization, the `IncrementalState` contains the knowledge from the previous compilation which will be used to optimize the next one.

# What optimizations can be made?

Currently, ngtsc makes a decision to skip the emit of a file if it can prove that the contents of the file will not have changed. To prove this, two conditions must be true.

* The input file itself must not have changed since the previous compilation.

* As a result of analyzing the file, no dependencies must exist where the output of compilation could vary depending on the contents of any other file.

The second condition is challenging, as Angular allows statically evaluated expressions in lots of contexts that could result in changes from file to file. For example, the `name` of an `@Pipe` could be a reference to a constant in a different file.

Therefore, only two types of files meet these conditions and can be optimized today:

* Files with no Angular decorated classes at all.

* Files with only `@Injectable`s.

# What optimizations are possible in the future?

There is plenty of room for improvement here, with diminishing returns for the work involved.

* The compiler could track the dependencies of each file being compiled, and know whether an `@Pipe` gets its name from a second file, for example. This is sufficient to skip the analysis and emit of more files when none of the dependencies have changed.

* The compiler could also perform analysis on files which _have_ changed dependencies, and skip emit if the analysis indicates nothing has changed which would affect the file being emitted.
