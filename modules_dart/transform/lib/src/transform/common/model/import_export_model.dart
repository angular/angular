library angular2.transform.common.model.import_export_model;

import 'package:source_gen/generators/json_serializable.dart';

part 'import_export_model.g.dart';

@JsonSerializable()
class ImportModel extends Object
    with _$ImportModelSerializerMixin
    implements ImportOrExportModel {
  final String uri;
  final String prefix;
  final bool isDeferred;
  final List<String> showCombinators;
  final List<String> hideCombinators;

  ImportModel(this.uri,
      {this.isDeferred: false,
      this.prefix: '',
      List<String> showCombinators,
      List<String> hideCombinators})
  : this.showCombinators = showCombinators != null ? showCombinators : <String>[],
  this.hideCombinators = hideCombinators != null ? hideCombinators : <String>[];

  factory ImportModel.fromJson(Map json) => _$ImportModelFromJson(json);
}

@JsonSerializable()
class ExportModel extends Object
    with _$ExportModelSerializerMixin
    implements ImportOrExportModel {
  final String uri;
  final List<String> showCombinators;
  final List<String> hideCombinators;

  ExportModel(this.uri,
      {List<String> showCombinators,
      List<String> hideCombinators})
: this.showCombinators = showCombinators != null ? showCombinators : <String>[],
this.hideCombinators = hideCombinators != null ? hideCombinators : <String>[];

  factory ExportModel.fromJson(Map json) => _$ExportModelFromJson(json);
}

abstract class ImportOrExportModel {
  String get uri;
  List<String> get showCombinators;
  List<String> get hideCombinators;
}
