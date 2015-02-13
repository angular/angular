library angular2.transformer;

import 'package:path/path.dart' as path;

class TransformerOptions {
  final String entryPoint;
  final String newEntryPoint;
  final String htmlEntryPoint;

  TransformerOptions(this.entryPoint, this.newEntryPoint, this.htmlEntryPoint);

  bool inSameTopLevelDir() {
    var expectedDir = path.split(htmlEntryPoint)[0];
    return (expectedDir == path.split(entryPoint)[0] &&
        expectedDir == path.split(newEntryPoint)[0]);
  }
}
