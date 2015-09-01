// GENERATED CODE - DO NOT MODIFY BY HAND

part of angular2.transform.common.model.parameter_model;

// **************************************************************************
// Generator: JsonSerializableGenerator
// Target: class ParameterModel
// **************************************************************************

ParameterModel _$ParameterModelFromJson(Map json) => new ParameterModel(
    typeName: json['typeName'],
    typeArgs: json['typeArgs'],
    metadata: json['metadata'],
    paramName: json['paramName']);

abstract class _$ParameterModelSerializerMixin {
  String get typeName;
  String get typeArgs;
  List get metadata;
  String get paramName;
  Map<String, dynamic> toJson() => <String, dynamic>{
        'typeName': typeName,
        'typeArgs': typeArgs,
        'metadata': metadata,
        'paramName': paramName
      };
}
