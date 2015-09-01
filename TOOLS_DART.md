# Developer Tools for Dart

Here you will find a collection of tools and tips for keeping your application
perform well and contain fewer bugs.

## Code size

Code needs to be downloaded, parsed and executed. Too much code could lead to
slow application start-up time, especially on slow networks and low-end devices.
The tools below will help you identify contributors to code size and keep them
in check.

### Finding contributors to code size

#### --dump-info

`dart2js` has an option `--dump-info` that outputs information about what
happened during compilation. Enable this option in your transformer options
like this:

```yaml
transformers:
...
- $dart2js:
    commandLineOptions:
    - --dump-info
```

Use the [visualizer](https://github.com/dart-lang/dump-info-visualizer) to
analyze the output or any of the command-line tools documented
[here](http://dart-lang.github.io/dart2js_info/doc/api/index.html).

#### ng2soyc.dart

[ng2soyc](https://github.com/angular/ng2soyc.dart) is a utility for analyzing
code size contributors in Angular 2 applications. It groups code size by
library. It also assumes your library names follow
"package.library.sub-library..." convention and gives code size breakdown at
each level. To reduce noise in the output (for very large apps) it also provides
an option to hide libraries that are too small, so you can focus on the biggest
contributors.

#### Use code coverage to find dead code

When running in Dartium (or in Dart VM in general) you can request code
coverage information from the VM. You can either use
[observatory](https://www.dartlang.org/tools/observatory/), or download
the coverage file and use your own tools to inspect it. Lines of code that are
not covered are top candidates for dead code.

Keep in mind, however, that uncovered code is not sufficient evidence of dead
code, only necessary evidence. It is perfectly possible that you simply didn't
exercise your application in a way that triggers the execution of uncovered
code. A common example is error handling code. Just because your testing never
encountered an error does not mean the error won't happen in production. You
therefore do not have to rush and remove all the `catch` blocks.

### Reducing code size

#### Disable reflection

`dart:mirrors` allows discovering program metadata at runtime. However, this
means that `dart2js` needs to retain that metadata and thus increase the size
of resulting JS output. In practice, however, it is possible to extract most
metadata necessary for your metaprogramming tasks statically using a
transformer and `package:analyzer`, and act on it before compiling to JS.

#### Enable minification

Minification shortens all your `longMethodNames` into 2- or 3-letter long
symbols. `dart2js` ensures that this kind of renaming is done safely, without
breaking the functionality of your programs. You can enable it in `pubspec.yaml`
under `$dart2js` transformer:

```yaml
transformers:
...
- $dart2js:
    minify: true
```

#### Manually remove dead code

`dart2js` comes with dead code elimination out-of-the-box. However, it may not
always be able to tell if a piece of code could be used. Consider the following
example:

```dart
/// This function decides which serialization format to use
void setupSerializers() {
  if (server.doYouSupportProtocolBuffers()) {
    useProtobufSerializaers();
  } else {
    useJsonSerializaers();
  }
}
```

In this example the application asks the server what kind of serialization
format it uses and dynamically chooses one or the other. `dart2js` could never
tell whether the server responds with yes or no and so it must retain both
kinds of serializers. However, you, as the developer of the application, may
know in advance that your server supports protocol buffers and so you could
remove that `if` block entirely and default to protocol buffers.

Code coverage (see above) is a good way to find dead code in your app.

#### Unsafe options

Dart also provides more aggressive optimization options. However, you have to
be careful when using them and as of today the benefits aren't that clear. If
your type annotations are inaccurate you may end up with non-Darty runtime
behavior, including the classic "undefined is not a function" tautology, as
well as the "keep on truckin'" behavior, e.g. `null + 1 == 1` and
`{} + [] == 0`.

`--trust-type-annotations` tells `dart2js` to trust that your type annotations
are correct. So if you have a function `foo(Bar bar)` the compiler can omit the
check that `bar` is truly `Bar` when calling methods on it.

`--trust-primitives` tells `dart2js` that primitive types, such as numbers and
booleans are never `null` when performing arithmetic, and that your program
does not run into range error when operating on lists, letting the compiler
remove some of the error checking code.

These options are specified in `pubspec.yaml`.

Example:

```yaml
transformers:
...
- $dart2js:
    commandLineOptions:
    - --trust-type-annotations
    - --trust-primitives
```
