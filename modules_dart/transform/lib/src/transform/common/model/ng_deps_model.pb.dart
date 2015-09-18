///
//  Generated code. Do not modify.
///
library angular2.src.transform.common.model.proto_ng_deps_model;

import 'package:protobuf/protobuf.dart';
import 'import_export_model.pb.dart';
import 'reflection_info_model.pb.dart';

class NgDepsModel extends GeneratedMessage {
  static final BuilderInfo _i = new BuilderInfo('NgDepsModel')
    ..a(1, 'libraryUri', PbFieldType.OS)
    ..p(2, 'partUris', PbFieldType.PS)
    ..pp(3, 'imports', PbFieldType.PM, ImportModel.$checkItem,
        ImportModel.create)
    ..pp(4, 'exports', PbFieldType.PM, ExportModel.$checkItem,
        ExportModel.create)
    ..pp(5, 'reflectables', PbFieldType.PM, ReflectionInfoModel.$checkItem,
        ReflectionInfoModel.create)
    ..a(6, 'sourceFile', PbFieldType.OS)
    ..p(7, 'getters', PbFieldType.PS)
    ..p(8, 'setters', PbFieldType.PS)
    ..p(9, 'methods', PbFieldType.PS);

  NgDepsModel() : super();
  NgDepsModel.fromBuffer(List<int> i,
      [ExtensionRegistry r = ExtensionRegistry.EMPTY])
      : super.fromBuffer(i, r);
  NgDepsModel.fromJson(String i,
      [ExtensionRegistry r = ExtensionRegistry.EMPTY])
      : super.fromJson(i, r);
  NgDepsModel clone() => new NgDepsModel()..mergeFromMessage(this);
  BuilderInfo get info_ => _i;
  static NgDepsModel create() => new NgDepsModel();
  static PbList<NgDepsModel> createRepeated() => new PbList<NgDepsModel>();
  static NgDepsModel getDefault() {
    if (_defaultInstance == null) _defaultInstance = new _ReadonlyNgDepsModel();
    return _defaultInstance;
  }

  static NgDepsModel _defaultInstance;
  static void $checkItem(NgDepsModel v) {
    if (v is! NgDepsModel) checkItemFailed(v, 'NgDepsModel');
  }

  String get libraryUri => $_get(0, 1, '');
  void set libraryUri(String v) {
    $_setString(0, 1, v);
  }

  bool hasLibraryUri() => $_has(0, 1);
  void clearLibraryUri() => clearField(1);

  List<String> get partUris => $_get(1, 2, null);

  List<ImportModel> get imports => $_get(2, 3, null);

  List<ExportModel> get exports => $_get(3, 4, null);

  List<ReflectionInfoModel> get reflectables => $_get(4, 5, null);

  String get sourceFile => $_get(5, 6, '');
  void set sourceFile(String v) {
    $_setString(5, 6, v);
  }

  bool hasSourceFile() => $_has(5, 6);
  void clearSourceFile() => clearField(6);

  List<String> get getters => $_get(6, 7, null);

  List<String> get setters => $_get(7, 8, null);

  List<String> get methods => $_get(8, 9, null);
}

class _ReadonlyNgDepsModel extends NgDepsModel with ReadonlyMessageMixin {}

const NgDepsModel$json = const {
  '1': 'NgDepsModel',
  '2': const [
    const {'1': 'library_uri', '3': 1, '4': 1, '5': 9},
    const {'1': 'part_uris', '3': 2, '4': 3, '5': 9},
    const {
      '1': 'imports',
      '3': 3,
      '4': 3,
      '5': 11,
      '6': '.angular2.src.transform.common.model.proto.ImportModel'
    },
    const {
      '1': 'exports',
      '3': 4,
      '4': 3,
      '5': 11,
      '6': '.angular2.src.transform.common.model.proto.ExportModel'
    },
    const {
      '1': 'reflectables',
      '3': 5,
      '4': 3,
      '5': 11,
      '6': '.angular2.src.transform.common.model.proto.ReflectionInfoModel'
    },
    const {'1': 'source_file', '3': 6, '4': 1, '5': 9},
    const {'1': 'getters', '3': 7, '4': 3, '5': 9},
    const {'1': 'setters', '3': 8, '4': 3, '5': 9},
    const {'1': 'methods', '3': 9, '4': 3, '5': 9},
  ],
};

/**
 * Generated with:
 * ng_deps_model.proto (ab93a7f3c411be8a6dafe914f8aae56027e1bac6)
 * libprotoc 2.6.1
 * dart-protoc-plugin (af5fc2bf1de367a434c3b1847ab260510878ffc0)
 */
