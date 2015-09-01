library angular2.transform.common.model.injectable_model;

import 'package:source_gen/generators/json_serializable.dart';

import 'annotation_model.dart';
import 'parameter_model.dart';

part 'injectable_model.g.dart';

@JsonSerializable()
class InjectableModel extends Object with _$InjectableModelSerializerMixin {
  /// The (potentially prefixed) type name of this Injectable.
  final String typeName;

  /// The name of the ctor used to create this Injectable. In most cases, this
  /// will be null and we will use the default constructor.
  final String ctorName;

  final bool isFunction;

  final List<AnnotationModel> annotations;
  final List<ParameterModel> parameters;
  final List<String> interfaces;

  InjectableModel(this.typeName, {this.ctorName, this.isFunction: false, List<ParameterModel> parameters, List<AnnotationModel> annotations, List<String> interfaces}) :
    this.parameters = parameters != null ? parameters : <ParameterModel>[],
    this.annotations = annotations != null ? annotations : <AnnotationModel>[],
    this.interfaces = interfaces != null ? interfaces : <String>[];

  factory InjectableModel.fromJson(Map json) => _$InjectableModelFromJson(json);
}
