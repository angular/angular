library angular2.src.transform.di_transformer;

import 'dart:convert';
import 'dart:io';

import 'package:angular2/src/test_lib/utils.dart';
import 'package:dart_style/dart_style.dart';
import 'template_compiler/change_detector_codegen.dart';

void main(List<String> args) {
  var index = 0;
  var buf = new StringBuffer();
  var factory = new ChangeDetectorDefFactory(null);
  var codegen = new Codegen();
  for (var file in args) {
    var contents = new File(file).readAsStringSync();
    contents = contents.replaceAll("'", '"').replaceAll(r'\\', r'\');
    var configs = JSON.decode(contents)["testConfig"];
    for (var config in configs) {
      var cdDef =
          factory.forConstBind(config["propName"], config["expression"]);
      codegen.generate('ChangeDetector${index++}', cdDef);
    }
  }
  print(new DartFormatter().format('''
    library dart_gen_change_detectors;
    ${codegen.imports}
    $codegen
  '''));
}
