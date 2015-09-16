///
//  Generated code. Do not modify.
///
library angular2.src.transform.common.model.proto_reflection_info_model;

import 'package:protobuf/protobuf.dart';
import 'annotation_model.pb.dart';
import 'parameter_model.pb.dart';

class ReflectionInfoModel extends GeneratedMessage {
  static final BuilderInfo _i = new BuilderInfo('ReflectionInfoModel')
    ..a(1, 'name', PbFieldType.QS)
    ..a(2, 'ctorName', PbFieldType.OS)
    ..a(3, 'isFunction', PbFieldType.OB)
    ..pp(4, 'annotations', PbFieldType.PM, AnnotationModel.$checkItem, AnnotationModel.create)
    ..pp(5, 'parameters', PbFieldType.PM, ParameterModel.$checkItem, ParameterModel.create)
    ..p(6, 'interfaces', PbFieldType.PS)
  ;

  ReflectionInfoModel() : super();
  ReflectionInfoModel.fromBuffer(List<int> i, [ExtensionRegistry r = ExtensionRegistry.EMPTY]) : super.fromBuffer(i, r);
  ReflectionInfoModel.fromJson(String i, [ExtensionRegistry r = ExtensionRegistry.EMPTY]) : super.fromJson(i, r);
  ReflectionInfoModel clone() => new ReflectionInfoModel()..mergeFromMessage(this);
  BuilderInfo get info_ => _i;
  static ReflectionInfoModel create() => new ReflectionInfoModel();
  static PbList<ReflectionInfoModel> createRepeated() => new PbList<ReflectionInfoModel>();
  static ReflectionInfoModel getDefault() {
    if (_defaultInstance == null) _defaultInstance = new _ReadonlyReflectionInfoModel();
    return _defaultInstance;
  }
  static ReflectionInfoModel _defaultInstance;
  static void $checkItem(ReflectionInfoModel v) {
    if (v is !ReflectionInfoModel) checkItemFailed(v, 'ReflectionInfoModel');
  }

  String get name => getField(1);
  void set name(String v) { setField(1, v); }
  bool hasName() => hasField(1);
  void clearName() => clearField(1);

  String get ctorName => getField(2);
  void set ctorName(String v) { setField(2, v); }
  bool hasCtorName() => hasField(2);
  void clearCtorName() => clearField(2);

  bool get isFunction => getField(3);
  void set isFunction(bool v) { setField(3, v); }
  bool hasIsFunction() => hasField(3);
  void clearIsFunction() => clearField(3);

  List<AnnotationModel> get annotations => getField(4);

  List<ParameterModel> get parameters => getField(5);

  List<String> get interfaces => getField(6);
}

class _ReadonlyReflectionInfoModel extends ReflectionInfoModel with ReadonlyMessageMixin {}

const ReflectionInfoModel$json = const {
  '1': 'ReflectionInfoModel',
  '2': const [
    const {'1': 'name', '3': 1, '4': 2, '5': 9},
    const {'1': 'ctor_name', '3': 2, '4': 1, '5': 9},
    const {'1': 'is_function', '3': 3, '4': 1, '5': 8},
    const {'1': 'annotations', '3': 4, '4': 3, '5': 11, '6': '.angular2.src.transform.common.model.proto.AnnotationModel'},
    const {'1': 'parameters', '3': 5, '4': 3, '5': 11, '6': '.angular2.src.transform.common.model.proto.ParameterModel'},
    const {'1': 'interfaces', '3': 6, '4': 3, '5': 9},
  ],
};

/**
 * Generated with:
 * reflection_info_model.proto (fd01d8a29e6bccccc343ef975829fd7cb6a63312)
 * libprotoc 2.5.0
 * dart-protoc-plugin (cc35f743de982a4916588b9c505dd21c7fe87d17)
 */
