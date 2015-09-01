library angular2_transform_source_gen;

import 'dart:async';

import 'package:source_gen/generators/json_serializable_generator.dart';
import 'package:source_gen/source_gen.dart';

Future main(List<String> args) async {
  var projectPath = args[0];
  var changedFiles = args.length > 1 ? args.getRange(1, args.length) : null;

  await generate(projectPath, [const JsonSerializableGenerator()],
      changeFilePaths: changedFiles, omitGenerateTimestamp: true);
}
