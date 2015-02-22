library angular2.src.transform;

import 'package:path/path.dart' as path;

/// Provides information necessary to transform an Angular2 app.
class TransformerOptions {
  /// The file where the application's call to [bootstrap] is.
  // TODO(kegluenq): Allow multiple bootstrap entry points.
  final String bootstrapEntryPoint;

  /// The Dart entry point, that is, where the initial call to [main] occurs.
  final String entryPoint;

  /// The path where we should generate code.
  final String newEntryPoint;

  /// The html file that includes [entryPoint].
  final String htmlEntryPoint;

  TransformerOptions(this.bootstrapEntryPoint, this.entryPoint,
      this.newEntryPoint, this.htmlEntryPoint);

  bool inSameTopLevelDir() {
    var expectedDir = path.split(htmlEntryPoint)[0];
    return (expectedDir == path.split(entryPoint)[0] &&
        expectedDir == path.split(newEntryPoint)[0]);
  }
}
