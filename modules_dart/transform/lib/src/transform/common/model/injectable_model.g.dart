// GENERATED CODE - DO NOT MODIFY BY HAND

part of angular2.transform.common.model.injectable_model;

// **************************************************************************
// Generator: JsonSerializableGenerator
// Target: class InjectableModel
// **************************************************************************

InjectableModel _$InjectableModelFromJson(Map json) =>
    new InjectableModel(json['typeName'],
        ctorName: json['ctorName'],
        isFunction: json['isFunction'],
        parameters: json['parameters'],
        annotations: json['annotations'],
        interfaces: json['interfaces']);

abstract class _$InjectableModelSerializerMixin {
  String get typeName;
  String get ctorName;
  bool get isFunction;
  List get annotations;
  List get parameters;
  List get interfaces;
  Map<String, dynamic> toJson() => <String, dynamic>{
        'typeName': typeName,
        'ctorName': ctorName,
        'isFunction': isFunction,
        'annotations': annotations,
        'parameters': parameters,
        'interfaces': interfaces
      };
}
