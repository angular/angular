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
    ..a(6, 'sourceFile', PbFieldType.OS);

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

  String get libraryUri => getField(1);
  void set libraryUri(String v) {
    setField(1, v);
  }

  bool hasLibraryUri() => hasField(1);
  void clearLibraryUri() => clearField(1);

  List<String> get partUris => getField(2);

  List<ImportModel> get imports => getField(3);

  List<ExportModel> get exports => getField(4);

  List<ReflectionInfoModel> get reflectables => getField(5);

  String get sourceFile => getField(6);
  void set sourceFile(String v) {
    setField(6, v);
  }

  bool hasSourceFile() => hasField(6);
  void clearSourceFile() => clearField(6);
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
  ],
};

/**
 * Generated with:
 * ng_deps_model.proto (7188431b4430396fdeb24367c8042d1e661a0ec8)
 * libprotoc 2.5.0
 * dart-protoc-plugin (cc35f743de982a4916588b9c505dd21c7fe87d17)
 */
