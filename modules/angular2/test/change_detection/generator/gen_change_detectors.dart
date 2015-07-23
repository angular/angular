library angular2.src.transform.di_transformer;

import 'dart:convert';
import 'dart:io';

import 'package:dart_style/dart_style.dart';
import 'package:angular2/src/transform/template_compiler/change_detector_codegen.dart';
import '../change_detector_config.dart';

/// This tool consumes pre-defined `ChangeDetectorDefinition` objects and
/// outputs code defining `AbstractChangeDetector` implementations corresponding
/// to those definitions. These are used by the tests in
/// ../change_detector_spec. Please see that library for more details.
void main(List<String> args) {
  var buf = new StringBuffer('var $_MAP_NAME = {');
  var codegen = new Codegen();
  var allDefs = getAllDefinitions();
  for (var i = 0; i < allDefs.length; ++i) {
    var className = 'ChangeDetector${i}';
    codegen.generate('dynamic', className, allDefs[i].cdDef);
    if (i > 0) {
      buf.write(',');
    }
    buf.write(" '''${_escape(allDefs[i].cdDef.id)}''': "
        "$className.$PROTO_CHANGE_DETECTOR_FACTORY_METHOD");
  }
  buf.write('};');
  print(new DartFormatter().format('''
    library dart_gen_change_detectors;

    ${codegen.imports}

    $codegen
    $buf

    getFactoryById(String id) => $_MAP_NAME[id];
  '''));
}

String _escape(String id) => id.replaceAll(r'$', r'\$');

const _MAP_NAME = '_idToProtoMap';
