library angular2.transform.common.model.ng_deps_model;

import 'package:source_gen/generators/json_serializable.dart';

import 'import_export_model.dart';
import 'injectable_model.dart';

part 'ng_deps_model.g.dart';

@JsonSerializable()
class NgDepsModel extends Object with _$NgDepsModelSerializerMixin {
  final String libraryUri;
  final List<String> partUris;
  final List<ImportModel> imports;
  final List<ExportModel> exports;
  final List<InjectableModel> injectables;

  NgDepsModel(
      {this.libraryUri,
      List<String> partUris,
      List<ImportModel> imports,
      List<ExportModel> exports,
      List<InjectableModel> injectables}) :
      this.partUris = partUris != null ? partUris : <String>[],
      this.imports = imports != null ? imports : <ImportModel>[],
      this.exports = exports != null ? exports : <ExportModel>[],
      this.injectables = injectables != null ? injectables : <InjectableModel>[];

  factory NgDepsModel.fromJson(Map json) => _$NgDepsModelFromJson(json);
}
