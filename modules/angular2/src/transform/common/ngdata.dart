library angular2.transform.common.ng_data;

import 'dart:convert';

const NG_DATA_VERSION = 1;

class NgData extends Object {
  int importOffset = 0;
  int registerOffset = 0;
  List<String> imports = [];

  NgData();

  factory NgData.fromJson(String json) {
    var data = JSON.decode(json);
    return new NgData()
      ..importOffset = data['importOffset']
      ..registerOffset = data['registerOffset']
      ..imports = data['imports'];
  }

  String toJson() {
    return JSON.encode({
      'version': NG_DATA_VERSION,
      'importOffset': importOffset,
      'registerOffset': registerOffset,
      'imports': imports
    });
  }

  @override
  String toString() {
    return '[NgData: ${toJson()}]';
  }
}
