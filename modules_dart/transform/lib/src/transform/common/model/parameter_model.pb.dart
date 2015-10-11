///
//  Generated code. Do not modify.
///
library angular2.src.transform.common.model.proto_parameter_model;

import 'package:protobuf/protobuf.dart';

class ParameterModel extends GeneratedMessage {
  static final BuilderInfo _i = new BuilderInfo('ParameterModel')
    ..a(1, 'typeName', PbFieldType.OS)
    ..a(2, 'typeArgs', PbFieldType.OS)
    ..p(3, 'metadata', PbFieldType.PS)
    ..a(4, 'paramName', PbFieldType.OS)
    ..hasRequiredFields = false
  ;

  ParameterModel() : super();
  ParameterModel.fromBuffer(List<int> i, [ExtensionRegistry r = ExtensionRegistry.EMPTY]) : super.fromBuffer(i, r);
  ParameterModel.fromJson(String i, [ExtensionRegistry r = ExtensionRegistry.EMPTY]) : super.fromJson(i, r);
  ParameterModel clone() => new ParameterModel()..mergeFromMessage(this);
  BuilderInfo get info_ => _i;
  static ParameterModel create() => new ParameterModel();
  static PbList<ParameterModel> createRepeated() => new PbList<ParameterModel>();
  static ParameterModel getDefault() {
    if (_defaultInstance == null) _defaultInstance = new _ReadonlyParameterModel();
    return _defaultInstance;
  }
  static ParameterModel _defaultInstance;
  static void $checkItem(ParameterModel v) {
    if (v is !ParameterModel) checkItemFailed(v, 'ParameterModel');
  }

  String get typeName => getField(1);
  void set typeName(String v) { setField(1, v); }
  bool hasTypeName() => hasField(1);
  void clearTypeName() => clearField(1);

  String get typeArgs => getField(2);
  void set typeArgs(String v) { setField(2, v); }
  bool hasTypeArgs() => hasField(2);
  void clearTypeArgs() => clearField(2);

  List<String> get metadata => getField(3);

  String get paramName => getField(4);
  void set paramName(String v) { setField(4, v); }
  bool hasParamName() => hasField(4);
  void clearParamName() => clearField(4);
}

class _ReadonlyParameterModel extends ParameterModel with ReadonlyMessageMixin {}

const ParameterModel$json = const {
  '1': 'ParameterModel',
  '2': const [
    const {'1': 'type_name', '3': 1, '4': 1, '5': 9},
    const {'1': 'type_args', '3': 2, '4': 1, '5': 9},
    const {'1': 'metadata', '3': 3, '4': 3, '5': 9},
    const {'1': 'param_name', '3': 4, '4': 1, '5': 9},
  ],
};

/**
 * Generated with:
 * parameter_model.proto (2a97dcb9a65b199f50fba67120a85590bceb083a)
 * libprotoc 2.6.1
 * dart-protoc-plugin (cc35f743de982a4916588b9c505dd21c7fe87d17)
 */
