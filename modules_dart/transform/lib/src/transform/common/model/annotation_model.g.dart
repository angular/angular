// GENERATED CODE - DO NOT MODIFY BY HAND

part of angular2.transform.common.model.annotation_model;

// **************************************************************************
// Generator: JsonSerializableGenerator
// Target: class AnnotationModel
// **************************************************************************

AnnotationModel _$AnnotationModelFromJson(Map json) => new AnnotationModel(
    name: json['name'],
    isView: json['isView'],
    isDirective: json['isDirective'],
    isComponent: json['isComponent'],
    isInjectable: json['isInjectable'],
    parameters: json['parameters'],
    namedParameters: json['namedParameters']);

abstract class _$AnnotationModelSerializerMixin {
  String get name;
  List get parameters;
  Map get namedParameters;
  bool get isView;
  bool get isDirective;
  bool get isComponent;
  bool get isInjectable;
  Map<String, dynamic> toJson() => <String, dynamic>{
        'name': name,
        'parameters': parameters,
        'namedParameters': namedParameters,
        'isView': isView,
        'isDirective': isDirective,
        'isComponent': isComponent,
        'isInjectable': isInjectable
      };
}
