library angular2.transform.common.model.parameter_model;

import 'package:source_gen/generators/json_serializable.dart';

part 'parameter_model.g.dart';

@JsonSerializable()
class ParameterModel extends Object with _$ParameterModelSerializerMixin {
  /// The type of the requested parameter. May be `null`.
  final String typeName;

  final String typeArgs;

  /// Any annotations attached to the parameter. May be empty but never null.
  final List<String> metadata;

  /// The name of the parameter. Not necessary for correctness but may be
  /// helpful for debugging.
  final String paramName;

  ParameterModel({this.typeName, this.typeArgs, List<String> metadata, this.paramName})
  : this.metadata = metadata != null ? metadata : <String>[];

  factory ParameterModel.fromJson(Map json) => _$ParameterModelFromJson(json);
}
