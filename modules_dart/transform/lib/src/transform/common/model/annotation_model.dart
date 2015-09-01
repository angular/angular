library angular2.transform.common.model.annotation_model;

import 'package:source_gen/generators/json_serializable.dart';

part 'annotation_model.g.dart';

@JsonSerializable()
class AnnotationModel extends Object with _$AnnotationModelSerializerMixin {
  final String name;
  final List<String> parameters;
  final Map<String, String> namedParameters;
  final bool isView;
  final bool isDirective;
  final bool isComponent;
  final bool isInjectable;

  AnnotationModel({this.name, this.isView, this.isDirective, this.isComponent, this.isInjectable, List<String> parameters, Map<String, String> namedParameters})
  : this.parameters = parameters != null ? parameters : <String>[],
  this.namedParameters = namedParameters != null ? namedParameters : <String, String>{};

  factory AnnotationModel.fromJson(Map json) => _$AnnotationModelFromJson(json);
}
