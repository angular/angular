library angular2.transform.common.annotati_ON_matcher;

import 'package:analyzer/src/generated/ast.dart';
import 'package:barback/barback.dart' show AssetId;
import 'class_matcher_base.dart';

export 'class_matcher_base.dart' show ClassDescriptor;

/// [ClassDescriptor]s for the default angular interfaces that may be
/// implemented by a class. These classes are re-exported in many places so this
/// covers all libraries which provide them.
const _ON_CHANGE_INTERFACES = const [
  const ClassDescriptor('OnChanges', 'package:angular2/angular2.dart'),
  const ClassDescriptor('OnChanges', 'package:angular2/metadata.dart'),
  const ClassDescriptor(
      'OnChanges', 'package:angular2/src/core/compiler/interfaces.dart'),
];
const _ON_DESTROY_INTERFACES = const [
  const ClassDescriptor('OnDestroy', 'package:angular2/angular2.dart'),
  const ClassDescriptor('OnDestroy', 'package:angular2/metadata.dart'),
  const ClassDescriptor(
      'OnDestroy', 'package:angular2/src/core/compiler/interfaces.dart'),
];
const _ON_CHECK_INTERFACES = const [
  const ClassDescriptor('DoCheck', 'package:angular2/angular2.dart'),
  const ClassDescriptor('DoCheck', 'package:angular2/metadata.dart'),
  const ClassDescriptor(
      'DoCheck', 'package:angular2/src/core/compiler/interfaces.dart'),
];
const _ON_INIT_INTERFACES = const [
  const ClassDescriptor('OnInit', 'package:angular2/angular2.dart'),
  const ClassDescriptor('OnInit', 'package:angular2/metadata.dart'),
  const ClassDescriptor(
      'OnInit', 'package:angular2/src/core/compiler/interfaces.dart'),
];
const _ON_ALL_CHANGES_DONE_INTERFACES = const [
  const ClassDescriptor('AfterContentChecked', 'package:angular2/angular2.dart'),
  const ClassDescriptor(
      'AfterContentChecked', 'package:angular2/metadata.dart'),
  const ClassDescriptor(
      'AfterContentChecked', 'package:angular2/src/core/compiler/interfaces.dart')
];

/// Checks if a given [Annotation] matches any of the given
/// [ClassDescriptors].
class InterfaceMatcher extends ClassMatcherBase {
  InterfaceMatcher._(classDescriptors) : super(classDescriptors);

  factory InterfaceMatcher() {
    return new InterfaceMatcher._([]
      ..addAll(_ON_CHANGE_INTERFACES)
      ..addAll(_ON_DESTROY_INTERFACES)
      ..addAll(_ON_CHECK_INTERFACES)
      ..addAll(_ON_INIT_INTERFACES)
      ..addAll(_ON_ALL_CHANGES_DONE_INTERFACES));
  }

  /// Checks if an [Identifier] implements [OnChanges].
  bool isOnChange(Identifier typeName, AssetId assetId) =>
      implements(firstMatch(typeName, assetId), _ON_CHANGE_INTERFACES);

  /// Checks if an [Identifier] implements [OnDestroy].
  bool isOnDestroy(Identifier typeName, AssetId assetId) =>
      implements(firstMatch(typeName, assetId), _ON_DESTROY_INTERFACES);

  /// Checks if an [Identifier] implements [DoCheck].
  bool isOnCheck(Identifier typeName, AssetId assetId) =>
      implements(firstMatch(typeName, assetId), _ON_CHECK_INTERFACES);

  /// Checks if an [Identifier] implements [OnInit].
  bool isOnInit(Identifier typeName, AssetId assetId) =>
      implements(firstMatch(typeName, assetId), _ON_INIT_INTERFACES);

  /// Checks if an [Identifier] implements [AfterContentChecked].
  bool isAfterContentChecked(Identifier typeName, AssetId assetId) => implements(
      firstMatch(typeName, assetId), _ON_ALL_CHANGES_DONE_INTERFACES);
}
