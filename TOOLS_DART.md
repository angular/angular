# Developer Tools for Dart

Here you will find a collection of tools and tips for keeping your application
perform well and contain fewer bugs.

## Angular debug tools in the dev console

Angular provides a set of debug tools that are accessible from any browser's
developer console. In Chrome the dev console can be accessed by pressing
Ctrl + Shift + j.

### Enabling debug tools

By default the debug tools are disabled. You can enable debug tools as follows:

```dart
import 'package:angular2/tools.dart';

main() {
  var appRef = await bootstrap(Application);
  enableDebugTools(appRef);
}
```

### Using debug tools

In the browser open the developer console (Ctrl + Shift + j in Chrome). The
top level object is called `ng` and contains more specific tools inside it.

Example:

```javascript
ng.profiler.timeChangeDetection();
```

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

#### Track unused reflection data

Call `reflector.trackUsage()` to cause it to track reflection information used
by the application. Reflection information (`ReflectionInfo`) is a data
structure that stores information about your application that Angular uses for
locating DI factories, generated change detectors and other code related to a
given type. After exercising your application, call `reflector.listUnusedKeys()`
to get a list of types and functions whose reflection information was retained
but was never used by the application.

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

## Performance

### Change detection profiler

If your application is janky (it misses frames) or is slow according to other
metrics it is important to find the root cause of the issue. Change detection
is a phase in Angular's lifecycle that detects changes in values that are
bound to UI, and if it finds a change it performs the corresponding UI update.
However, sometimes it is hard to tell if the slowness is due to the act of
computing the changes being slow, or due to the act of applying those changes
to the UI. For your application to be performant it is important that the
process of computing changes is very fast. For best results it should be under
3 milliseconds in order to leave room for the application logic, the UI updates
and browser's rendering pipeline to fit withing the 16 millisecond frame
(assuming the 60 FPS target frame rate).

Change detection profiler repeatedly performs change detection without invoking
any user actions, such as clicking buttons or entering text in input fields. It
then computes the average amount of time it took to perform a single cycle of
change detection in milliseconds and prints it to the console. This number
depends on the current state of the UI. You will likely see different numbers
as you go from one screen in your application to another.

#### Running the profiler

Enable debug tools (see above), then in the dev console enter the following:

```javascript
ng.profiler.timeChangeDetection();
```

The results will be printed to the console.

#### Recording CPU profile

Pass `{record: true}` an argument:

```javascript
ng.profiler.timeChangeDetection({record: true});
```

Then open the "Profiles" tab. You will see the recorded profile titled
"Change Detection". In Chrome, if you record the profile repeatedly, all the
profiles will be nested under "Change Detection".

#### Interpreting the numbers

In a properly-designed application repeated attempts to detect changes without
any user actions should result in no changes to be applied on the UI. It is
also desirable to have the cost of a user action be proportional to the amount
of UI changes required. For example, popping up a menu with 5 items should be
vastly faster than rendering a table of 500 rows and 10 columns. Therefore,
change detection with no UI updates should be as fast as possible. Ideally the
number printed by the profiler should be well below the length of a single
animation frame (16ms). A good rule of thumb is to keep it under 3ms.

#### Investigating slow change detection

So you found a screen in your application on which the profiler reports a very
high number (i.e. >3ms). This is where a recorded CPU profile can help. Enable
recording while profiling:

```javascript
ng.profiler.timeChangeDetection({record: true});
```

Then look for hot spots using
[Chrome CPU profiler](https://developer.chrome.com/devtools/docs/cpu-profiling).

#### Reducing change detection cost

There are many reasons for slow change detection. To gain intuition about
possible causes it would help to understand how change detection works. Such a
discussion is outside the scope of this document (TODO link to docs), but here
are some key concepts in brief.

By default Angular uses "dirty checking" mechanism for finding model changes.
This mechanism involves evaluating every bound expression that's active on the
UI. These usually include text interpolation via `{{expression}}` and property
bindings via `[prop]="expression"`. If any of the evaluated expressions are
costly to compute they could contribute to slow change detection. A good way to
speed things up is to use plain class fields in your expressions and avoid any
kinds of computation. Example:

```dart
@View(
  template: '<button [enabled]="isEnabled">{{title}}</button>'
)
class FancyButton {
  // GOOD: no computation, just return the value
  bool isEnabled;

  // BAD: computes the final value upon request
  String _title;
  String get title => _title.trim().toUpperCase();
}
```

Most cases like these could be solved by precomputing the value and storing the
final value in a field.

Angular also supports a second type of change detection - the "push" model. In
this model Angular does not poll your component for changes. Instead, the
component "tells" Angular when it changes and only then does Angular perform
the update. This model is suitable in situations when your data model uses
observable or immutable objects (also a discussion for another time).
