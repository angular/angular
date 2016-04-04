///
//  Generated code. Do not modify.
///
library angular2.src.transform.common.model.proto_reflection_info_model;

import 'package:protobuf/protobuf.dart';
import 'annotation_model.pb.dart';
import 'parameter_model.pb.dart';

class PropertyMetadataModel extends GeneratedMessage {
  static final BuilderInfo _i = new BuilderInfo('PropertyMetadataModel')
    ..a(1, 'name', PbFieldType.QS)
    ..pp(2, 'annotations', PbFieldType.PM, AnnotationModel.$checkItem,
        AnnotationModel.create);

  PropertyMetadataModel() : super();
  PropertyMetadataModel.fromBuffer(List<int> i,
      [ExtensionRegistry r = ExtensionRegistry.EMPTY])
      : super.fromBuffer(i, r);
  PropertyMetadataModel.fromJson(String i,
      [ExtensionRegistry r = ExtensionRegistry.EMPTY])
      : super.fromJson(i, r);
  PropertyMetadataModel clone() =>
      new PropertyMetadataModel()..mergeFromMessage(this);
  BuilderInfo get info_ => _i;
  static PropertyMetadataModel create() => new PropertyMetadataModel();
  static PbList<PropertyMetadataModel> createRepeated() =>
      new PbList<PropertyMetadataModel>();
  static PropertyMetadataModel getDefault() {
    if (_defaultInstance == null)
      _defaultInstance = new _ReadonlyPropertyMetadataModel();
    return _defaultInstance;
  }

  static PropertyMetadataModel _defaultInstance;
  static void $checkItem(PropertyMetadataModel v) {
    if (v is! PropertyMetadataModel)
      checkItemFailed(v, 'PropertyMetadataModel');
  }

  String get name => $_get(0, 1, '');
  void set name(String v) {
    $_setString(0, 1, v);
  }

  bool hasName() => $_has(0, 1);
  void clearName() => clearField(1);

  List<AnnotationModel> get annotations => $_get(1, 2, null);
}

class _ReadonlyPropertyMetadataModel extends PropertyMetadataModel
    with ReadonlyMessageMixin {}

class PrefixedType extends GeneratedMessage {
  static final BuilderInfo _i = new BuilderInfo('PrefixedType')
    ..a(1, 'prefix', PbFieldType.OS)
    ..a(2, 'name', PbFieldType.OS)
    ..hasRequiredFields = false;

  PrefixedType() : super();
  PrefixedType.fromBuffer(List<int> i,
      [ExtensionRegistry r = ExtensionRegistry.EMPTY])
      : super.fromBuffer(i, r);
  PrefixedType.fromJson(String i,
      [ExtensionRegistry r = ExtensionRegistry.EMPTY])
      : super.fromJson(i, r);
  PrefixedType clone() => new PrefixedType()..mergeFromMessage(this);
  BuilderInfo get info_ => _i;
  static PrefixedType create() => new PrefixedType();
  static PbList<PrefixedType> createRepeated() => new PbList<PrefixedType>();
  static PrefixedType getDefault() {
    if (_defaultInstance == null)
      _defaultInstance = new _ReadonlyPrefixedType();
    return _defaultInstance;
  }

  static PrefixedType _defaultInstance;
  static void $checkItem(PrefixedType v) {
    if (v is! PrefixedType) checkItemFailed(v, 'PrefixedType');
  }

  String get prefix => $_get(0, 1, '');
  void set prefix(String v) {
    $_setString(0, 1, v);
  }

  bool hasPrefix() => $_has(0, 1);
  void clearPrefix() => clearField(1);

  String get name => $_get(1, 2, '');
  void set name(String v) {
    $_setString(1, 2, v);
  }

  bool hasName() => $_has(1, 2);
  void clearName() => clearField(2);
}

class _ReadonlyPrefixedType extends PrefixedType with ReadonlyMessageMixin {}

class ReflectionInfoModel extends GeneratedMessage {
  static final BuilderInfo _i = new BuilderInfo('ReflectionInfoModel')
    ..a(1, 'name', PbFieldType.QS)
    ..a(2, 'ctorName', PbFieldType.OS)
    ..a(3, 'isFunction', PbFieldType.OB)
    ..pp(4, 'annotations', PbFieldType.PM, AnnotationModel.$checkItem,
        AnnotationModel.create)
    ..pp(5, 'parameters', PbFieldType.PM, ParameterModel.$checkItem,
        ParameterModel.create)
    ..p(6, 'interfaces', PbFieldType.PS)
    ..pp(7, 'propertyMetadata', PbFieldType.PM,
        PropertyMetadataModel.$checkItem, PropertyMetadataModel.create)
    ..pp(8, 'directives', PbFieldType.PM, PrefixedType.$checkItem,
        PrefixedType.create)
    ..pp(9, 'pipes', PbFieldType.PM, PrefixedType.$checkItem,
        PrefixedType.create);

  ReflectionInfoModel() : super();
  ReflectionInfoModel.fromBuffer(List<int> i,
      [ExtensionRegistry r = ExtensionRegistry.EMPTY])
      : super.fromBuffer(i, r);
  ReflectionInfoModel.fromJson(String i,
      [ExtensionRegistry r = ExtensionRegistry.EMPTY])
      : super.fromJson(i, r);
  ReflectionInfoModel clone() =>
      new ReflectionInfoModel()..mergeFromMessage(this);
  BuilderInfo get info_ => _i;
  static ReflectionInfoModel create() => new ReflectionInfoModel();
  static PbList<ReflectionInfoModel> createRepeated() =>
      new PbList<ReflectionInfoModel>();
  static ReflectionInfoModel getDefault() {
    if (_defaultInstance == null)
      _defaultInstance = new _ReadonlyReflectionInfoModel();
    return _defaultInstance;
  }

  static ReflectionInfoModel _defaultInstance;
  static void $checkItem(ReflectionInfoModel v) {
    if (v is! ReflectionInfoModel) checkItemFailed(v, 'ReflectionInfoModel');
  }

  String get name => $_get(0, 1, '');
  void set name(String v) {
    $_setString(0, 1, v);
  }

  bool hasName() => $_has(0, 1);
  void clearName() => clearField(1);

  String get ctorName => $_get(1, 2, '');
  void set ctorName(String v) {
    $_setString(1, 2, v);
  }

  bool hasCtorName() => $_has(1, 2);
  void clearCtorName() => clearField(2);

  bool get isFunction => $_get(2, 3, false);
  void set isFunction(bool v) {
    $_setBool(2, 3, v);
  }

  bool hasIsFunction() => $_has(2, 3);
  void clearIsFunction() => clearField(3);

  List<AnnotationModel> get annotations => $_get(3, 4, null);

  List<ParameterModel> get parameters => $_get(4, 5, null);

  List<String> get interfaces => $_get(5, 6, null);

  List<PropertyMetadataModel> get propertyMetadata => $_get(6, 7, null);

  List<PrefixedType> get directives => $_get(7, 8, null);

  List<PrefixedType> get pipes => $_get(8, 9, null);
}

class _ReadonlyReflectionInfoModel extends ReflectionInfoModel
    with ReadonlyMessageMixin {}

const PropertyMetadataModel$json = const {
  '1': 'PropertyMetadataModel',
  '2': const [
    const {'1': 'name', '3': 1, '4': 2, '5': 9},
    const {
      '1': 'annotations',
      '3': 2,
      '4': 3,
      '5': 11,
      '6': '.angular2.src.transform.common.model.proto.AnnotationModel'
    },
  ],
};

const PrefixedType$json = const {
  '1': 'PrefixedType',
  '2': const [
    const {'1': 'prefix', '3': 1, '4': 1, '5': 9},
    const {'1': 'name', '3': 2, '4': 1, '5': 9},
  ],
};

const ReflectionInfoModel$json = const {
  '1': 'ReflectionInfoModel',
  '2': const [
    const {'1': 'name', '3': 1, '4': 2, '5': 9},
    const {'1': 'ctor_name', '3': 2, '4': 1, '5': 9},
    const {'1': 'is_function', '3': 3, '4': 1, '5': 8},
    const {
      '1': 'annotations',
      '3': 4,
      '4': 3,
      '5': 11,
      '6': '.angular2.src.transform.common.model.proto.AnnotationModel'
    },
    const {
      '1': 'parameters',
      '3': 5,
      '4': 3,
      '5': 11,
      '6': '.angular2.src.transform.common.model.proto.ParameterModel'
    },
    const {'1': 'interfaces', '3': 6, '4': 3, '5': 9},
    const {
      '1': 'propertyMetadata',
      '3': 7,
      '4': 3,
      '5': 11,
      '6': '.angular2.src.transform.common.model.proto.PropertyMetadataModel'
    },
    const {
      '1': 'directives',
      '3': 8,
      '4': 3,
      '5': 11,
      '6': '.angular2.src.transform.common.model.proto.PrefixedType'
    },
    const {
      '1': 'pipes',
      '3': 9,
      '4': 3,
      '5': 11,
      '6': '.angular2.src.transform.common.model.proto.PrefixedType'
    },
  ],
};

/**
 * Generated with:
 * reflection_info_model.proto (7670e589733b1190f9b4f1c9b42f90a613975afd)
 * libprotoc 2.6.1
 * dart-protoc-plugin (af5fc2bf1de367a434c3b1847ab260510878ffc0)
 */
