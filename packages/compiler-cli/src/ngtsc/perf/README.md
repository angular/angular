# What is the `perf` package?

This package contains utilities for collecting performance information from around the compiler and for producing ngtsc performance traces.

This feature is currently undocumented and not exposed to users as the trace file format is still unstable.

# What is a performance trace?

A performance trace is a JSON file which logs events within ngtsc with microsecond precision. It tracks the phase of compilation, the file and possibly symbol being compiled, and other metadata explaining what the compiler was doing during the event.

Traces track two specific kinds of events: marks and spans. A mark is a single event with a timestamp, while a span is two events (start and end) that cover a section of work in the compiler. Analyzing a file is a span event, while a decision (such as deciding not to emit a particular file) is a mark event.

# Enabling performance traces

Performance traces are enabled via the undocumented `tracePerformance` option in `angularCompilerOptions` inside the tsconfig.json file. This option takes a string path relative to the current directory, which will be used to write the trace JSON file.

## In-Memory TS Host Tracing

By default, the trace file will be written with the `fs` package directly. However, ngtsc supports in-memory compilation using a `ts.CompilerHost` for all operations. In the event that tracing is required when using an in-memory filesystem, a `ts:` prefix can be added to the value of `tracePerformance`, which will cause the trace JSON file to be written with the TS host's `writeFile` method instead.

This is not done by default as `@angular/cli` does not allow writing arbitrary JSON files via its host.
