// GENERATED CODE - DO NOT MODIFY BY HAND

part of angular2.transform.common.model.import_export_model;

// **************************************************************************
// Generator: JsonSerializableGenerator
// Target: class ImportModel
// **************************************************************************

ImportModel _$ImportModelFromJson(Map json) => new ImportModel(json['uri'],
    isDeferred: json['isDeferred'],
    prefix: json['prefix'],
    showCombinators: json['showCombinators'],
    hideCombinators: json['hideCombinators']);

abstract class _$ImportModelSerializerMixin {
  String get uri;
  String get prefix;
  bool get isDeferred;
  List get showCombinators;
  List get hideCombinators;
  Map<String, dynamic> toJson() => <String, dynamic>{
        'uri': uri,
        'prefix': prefix,
        'isDeferred': isDeferred,
        'showCombinators': showCombinators,
        'hideCombinators': hideCombinators
      };
}

// **************************************************************************
// Generator: JsonSerializableGenerator
// Target: class ExportModel
// **************************************************************************

ExportModel _$ExportModelFromJson(Map json) => new ExportModel(json['uri'],
    showCombinators: json['showCombinators'],
    hideCombinators: json['hideCombinators']);

abstract class _$ExportModelSerializerMixin {
  String get uri;
  List get showCombinators;
  List get hideCombinators;
  Map<String, dynamic> toJson() => <String, dynamic>{
        'uri': uri,
        'showCombinators': showCombinators,
        'hideCombinators': hideCombinators
      };
}
