// GENERATED CODE - DO NOT MODIFY BY HAND

part of angular2.transform.common.model.ng_deps_model;

// **************************************************************************
// Generator: JsonSerializableGenerator
// Target: class NgDepsModel
// **************************************************************************

NgDepsModel _$NgDepsModelFromJson(Map json) => new NgDepsModel(
    libraryUri: json['libraryUri'],
    partUris: json['partUris'],
    imports: json['imports'],
    exports: json['exports'],
    injectables: json['injectables']);

abstract class _$NgDepsModelSerializerMixin {
  String get libraryUri;
  List get partUris;
  List get imports;
  List get exports;
  List get injectables;
  Map<String, dynamic> toJson() => <String, dynamic>{
        'libraryUri': libraryUri,
        'partUris': partUris,
        'imports': imports,
        'exports': exports,
        'injectables': injectables
      };
}
