library angular2.test.transform.common.read_file;

import 'dart:io';

/// Smooths over differences in CWD between IDEs and running tests in Travis.
String readFile(String path) {
  for (var myPath in [path, 'test/transform/${path}']) {
    var file = new File(myPath);
    if (file.existsSync()) {
      return file.readAsStringSync();
    }
  }
  return null;
}
