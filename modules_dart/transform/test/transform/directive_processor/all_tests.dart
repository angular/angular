library angular2.test.transform.directive_processor.all_tests;

import 'dart:async';

import 'package:angular2/src/core/change_detection/change_detection.dart';
import 'package:angular2/src/core/linker/interfaces.dart' show LifecycleHooks;
import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/transform/directive_processor/rewriter.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/code/ng_deps_code.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/model/reflection_info_model.pb.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';
import '../common/read_file.dart';
import '../common/recording_logger.dart';

var formatter = new DartFormatter();

main() {
  Html5LibDomAdapter.makeCurrent();
  allTests();
}

Expect _expectSelector(ReflectionInfoModel model) {
  expect(model.annotations.isNotEmpty).toBeTrue();
  var componentAnnotation = model.annotations
      .firstWhere((e) => e.name == 'Component', orElse: () => null);
  expect(componentAnnotation).toBeNotNull();
  var selectorArg = componentAnnotation.namedParameters
      .firstWhere((e) => e.name == 'selector', orElse: () => null);
  expect(selectorArg).toBeNotNull();
  return expect(selectorArg.value);
}

void allTests() {
  it('should preserve parameter annotations.', () async {
    var model = (await _testCreateModel('parameter_metadata/soup.dart')).ngDeps;
    expect(model.reflectables.length).toBe(1);
    var reflectable = model.reflectables.first;
    expect(reflectable.parameters.length).toBe(2);

    expect(reflectable.parameters.first.typeName).toEqual('String');
    expect(reflectable.parameters.first.metadata.length).toBe(1);
    expect(reflectable.parameters.first.metadata.first).toContain('Tasty');
    expect(reflectable.parameters.first.paramName).toEqual('description');

    var typeName = reflectable.parameters[1].typeName;
    expect(typeName == null || typeName.isEmpty).toBeTrue();
    var secondParam = reflectable.parameters[1];
    expect(secondParam.metadata.first).toContain('Inject(Salt)');
    expect(secondParam.paramName).toEqual('salt');
  });

  describe('part support', () {
    var modelFuture = _testCreateModel('part_files/main.dart')
        .then((ngMeta) => ngMeta != null ? ngMeta.ngDeps : null);

    it('should include directives from the part.', () async {
      var model = await modelFuture;
      expect(model.reflectables.length).toBe(2);
    });

    it('should list part contributions first.', () async {
      var model = await modelFuture;
      expect(model.reflectables.first.name).toEqual('PartComponent');
      _expectSelector(model.reflectables.first).toEqual("'[part]'");
    });

    it('should list main contributions second.', () async {
      var model = await modelFuture;
      expect(model.reflectables[1].name).toEqual('MainComponent');
      _expectSelector(model.reflectables[1]).toEqual("'[main]'");
    });

    it('should handle multiple `part` directives.', () async {
      var model =
          (await _testCreateModel('multiple_part_files/main.dart')).ngDeps;
      expect(model.reflectables.length).toEqual(3);
      _expectSelector(model.reflectables.first).toEqual("'[part1]'");
      _expectSelector(model.reflectables[1]).toEqual("'[part2]'");
      _expectSelector(model.reflectables[2]).toEqual("'[main]'");
    });

    it('should not generate anything for `part` files.', () async {
      expect(await _testCreateModel('part_files/part.dart')).toBeNull();
    });
  });

  describe('custom annotations', () {
    it('should be recognized from package: imports', () async {
      var ngMeta =
          await _testCreateModel('custom_metadata/package_soup.dart', customDescriptors:
              [
        const ClassDescriptor('Soup', 'package:soup/soup.dart',
            superClass: 'Component')
      ]);
      var model = ngMeta.ngDeps;
      expect(model.reflectables.length).toEqual(1);
      expect(model.reflectables.first.name).toEqual('PackageSoup');
    });

    it('should be recognized from relative imports', () async {
      var ngMeta = await _testCreateModel('custom_metadata/relative_soup.dart',
          assetId: new AssetId('soup', 'lib/relative_soup.dart'),
          customDescriptors: [
            const ClassDescriptor('Soup', 'package:soup/annotations/soup.dart',
                superClass: 'Component')
          ]);
      var model = ngMeta.ngDeps;
      expect(model.reflectables.length).toEqual(1);
      expect(model.reflectables.first.name).toEqual('RelativeSoup');
    });

    it('should ignore annotations that are not imported', () async {
      var ngMeta =
          await _testCreateModel('custom_metadata/bad_soup.dart', customDescriptors:
              [
        const ClassDescriptor('Soup', 'package:soup/soup.dart',
            superClass: 'Component')
      ]);
      expect(ngMeta.ngDeps == null || ngMeta.ngDeps.reflectables.isEmpty)
          .toBeTrue();
    });
  });

  describe('interfaces', () {
    it('should include implemented types', () async {
      var model = (await _testCreateModel('interfaces_files/soup.dart')).ngDeps;

      expect(model.reflectables.first.interfaces).toBeNotNull();
      expect(model.reflectables.first.interfaces.isNotEmpty).toBeTrue();
      expect(model.reflectables.first.interfaces.contains('OnChanges'))
          .toBeTrue();
      expect(model.reflectables.first.interfaces.contains('AnotherInterface'))
          .toBeTrue();
    });

    it('should not include transitively implemented types', () async {
      var model =
          (await _testCreateModel('interface_chain_files/soup.dart')).ngDeps;

      expect(model.reflectables.first.interfaces).toBeNotNull();
      expect(model.reflectables.first.interfaces.isNotEmpty).toBeTrue();
      expect(model.reflectables.first.interfaces.contains('PrimaryInterface'))
          .toBeTrue();
      expect(model.reflectables.first.interfaces.contains('SecondaryInterface'))
          .toBeFalse();
      expect(model.reflectables.first.interfaces.contains('TernaryInterface'))
          .toBeFalse();
    });

    it('should not include superclasses.', () async {
      var model = (await _testCreateModel('superclass_files/soup.dart')).ngDeps;

      var interfaces = model.reflectables.first.interfaces;
      expect(interfaces == null || interfaces.isEmpty).toBeTrue();
    });

    it('should populate multiple `lifecycle` values when necessary.', () async {
      var model = (await _testCreateModel(
          'multiple_interface_lifecycle_files/soup.dart')).ngDeps;

      expect(model.reflectables.first.interfaces).toBeNotNull();
      expect(model.reflectables.first.interfaces.isNotEmpty).toBeTrue();
      expect(model.reflectables.first.interfaces.contains('OnChanges'))
          .toBeTrue();
      expect(model.reflectables.first.interfaces.contains('OnDestroy'))
          .toBeTrue();
      expect(model.reflectables.first.interfaces.contains('OnInit')).toBeTrue();
    });

    it('should not populate `lifecycle` when lifecycle superclass is present.',
        () async {
      var model =
          (await _testCreateModel('superclass_lifecycle_files/soup.dart'))
              .ngDeps;

      var interfaces = model.reflectables.first.interfaces;
      expect(interfaces == null || interfaces.isEmpty).toBeTrue();
    });

    it('should populate `lifecycle` with prefix when necessary.', () async {
      var model = (await _testCreateModel(
          'prefixed_interface_lifecycle_files/soup.dart')).ngDeps;
      expect(model.reflectables.first.interfaces).toBeNotNull();
      expect(model.reflectables.first.interfaces.isNotEmpty).toBeTrue();
      expect(model.reflectables.first.interfaces
              .firstWhere((i) => i.contains('OnChanges'), orElse: () => null))
          .toBeNotNull();
    });
  });

  describe('property metadata', () {
    it('should be recorded on fields', () async {
      var model =
          (await _testCreateModel('prop_metadata_files/fields.dart')).ngDeps;

      expect(model.reflectables.first.propertyMetadata).toBeNotNull();
      expect(model.reflectables.first.propertyMetadata.isNotEmpty).toBeTrue();
      expect(model.reflectables.first.propertyMetadata.first.name)
          .toEqual('field');
      expect(model.reflectables.first.propertyMetadata.first.annotations
          .firstWhere((a) => a.name == 'FieldDecorator',
              orElse: () => null)).toBeNotNull();
    });

    it('should be recorded on getters', () async {
      var model =
          (await _testCreateModel('prop_metadata_files/getters.dart')).ngDeps;

      expect(model.reflectables.first.propertyMetadata).toBeNotNull();
      expect(model.reflectables.first.propertyMetadata.isNotEmpty).toBeTrue();
      expect(model.reflectables.first.propertyMetadata.first.name)
          .toEqual('getVal');

      var getDecoratorAnnotation = model
          .reflectables.first.propertyMetadata.first.annotations
          .firstWhere((a) => a.name == 'GetDecorator', orElse: () => null);
      expect(getDecoratorAnnotation).toBeNotNull();
      expect(getDecoratorAnnotation.isConstObject).toBeFalse();
    });

    it('should gracefully handle const instances of annotations', () async {
      // Regression test for i/4481
      var model =
          (await _testCreateModel('prop_metadata_files/override.dart')).ngDeps;

      expect(model.reflectables.first.propertyMetadata).toBeNotNull();
      expect(model.reflectables.first.propertyMetadata.isNotEmpty).toBeTrue();
      expect(model.reflectables.first.propertyMetadata.first.name)
          .toEqual('getVal');
      var overrideAnnotation = model
          .reflectables.first.propertyMetadata.first.annotations
          .firstWhere((a) => a.name == 'override', orElse: () => null);

      expect(overrideAnnotation).toBeNotNull();
      expect(overrideAnnotation.isConstObject).toBeTrue();

      var buf = new StringBuffer();
      new NgDepsWriter(buf).writeAnnotationModel(overrideAnnotation);
      expect(buf.toString()).toEqual('override');
    });

    it('should be recorded on setters', () async {
      var model =
          (await _testCreateModel('prop_metadata_files/setters.dart')).ngDeps;

      expect(model.reflectables.first.propertyMetadata).toBeNotNull();
      expect(model.reflectables.first.propertyMetadata.isNotEmpty).toBeTrue();
      expect(model.reflectables.first.propertyMetadata.first.name)
          .toEqual('setVal');
      expect(model.reflectables.first.propertyMetadata.first.annotations
              .firstWhere((a) => a.name == 'SetDecorator', orElse: () => null))
          .toBeNotNull();
    });

    it('should be coalesced when getters and setters have the same name',
        () async {
      var model = (await _testCreateModel(
          'prop_metadata_files/getters_and_setters.dart')).ngDeps;

      expect(model.reflectables.first.propertyMetadata).toBeNotNull();
      expect(model.reflectables.first.propertyMetadata.length).toBe(1);
      expect(model.reflectables.first.propertyMetadata.first.name)
          .toEqual('myVal');
      expect(model.reflectables.first.propertyMetadata.first.annotations
              .firstWhere((a) => a.name == 'GetDecorator', orElse: () => null))
          .toBeNotNull();
      expect(model.reflectables.first.propertyMetadata.first.annotations
              .firstWhere((a) => a.name == 'SetDecorator', orElse: () => null))
          .toBeNotNull();
    });
  });

  it('should not throw/hang on invalid urls', () async {
    var logger = new RecordingLogger();
    await _testCreateModel('invalid_url_files/hello.dart', logger: logger);
    expect(logger.hasErrors).toBeTrue();
    expect(logger.logs)
      ..toContain('ERROR: ERROR: Invalid argument (url): '
          '"Could not read asset at uri asset:/bad/absolute/url.html"');
  });

  it('should find and register static functions.', () async {
    var model =
        (await _testCreateModel('static_function_files/hello.dart')).ngDeps;

    var functionReflectable =
        model.reflectables.firstWhere((i) => i.isFunction, orElse: () => null);
    expect(functionReflectable)..toBeNotNull();
    expect(functionReflectable.name).toEqual('getMessage');
  });

  describe('NgMeta', () {
    var fakeReader;
    beforeEach(() {
      fakeReader = new TestAssetReader();
    });

    it('should find direcive aliases patterns.', () async {
      var ngMeta = await _testCreateModel('directive_aliases_files/hello.dart');

      expect(ngMeta.aliases).toContain('alias1');
      expect(ngMeta.aliases['alias1']).toContain('HelloCmp');

      expect(ngMeta.aliases).toContain('alias2');
      expect(ngMeta.aliases['alias2'])..toContain('HelloCmp')..toContain('Foo');
    });

    it('should include hooks for implemented types (single)', () async {
      var ngMeta = await _testCreateModel('interfaces_files/soup.dart');

      expect(ngMeta.types.isNotEmpty).toBeTrue();
      expect(ngMeta.types['ChangingSoupComponent']).toBeNotNull();
      expect(ngMeta.types['ChangingSoupComponent'].selector).toEqual('[soup]');
      expect(ngMeta.types['ChangingSoupComponent'].lifecycleHooks)
          .toContain(LifecycleHooks.OnChanges);
    });

    it('should include hooks for implemented types (many)', () async {
      var ngMeta = await _testCreateModel(
          'multiple_interface_lifecycle_files/soup.dart');

      expect(ngMeta.types.isNotEmpty).toBeTrue();
      expect(ngMeta.types['MultiSoupComponent']).toBeNotNull();
      expect(ngMeta.types['MultiSoupComponent'].selector).toEqual('[soup]');
      expect(ngMeta.types['MultiSoupComponent'].lifecycleHooks)
        ..toContain(LifecycleHooks.OnChanges)
        ..toContain(LifecycleHooks.OnDestroy)
        ..toContain(LifecycleHooks.OnInit);
    });

    it('should create type entries for Directives', () async {
      fakeReader
        ..addAsset(new AssetId('other_package', 'lib/template.html'), '')
        ..addAsset(new AssetId('other_package', 'lib/template.css'), '');
      var ngMeta = await _testCreateModel(
          'absolute_url_expression_files/hello.dart',
          reader: fakeReader);

      expect(ngMeta.types.isNotEmpty).toBeTrue();
      expect(ngMeta.types['HelloCmp']).toBeNotNull();
      expect(ngMeta.types['HelloCmp'].selector).toEqual('hello-app');
    });

    it('should populate all provided values for Components & Directives',
        () async {
      var ngMeta = await _testCreateModel('unusual_component_files/hello.dart');

      expect(ngMeta.types.isNotEmpty).toBeTrue();

      var component = ngMeta.types['UnusualComp'];
      expect(component).toBeNotNull();
      expect(component.selector).toEqual('unusual-comp');
      expect(component.isComponent).toBeTrue();
      expect(component.exportAs).toEqual('ComponentExportAsValue');
      expect(component.changeDetection)
          .toEqual(ChangeDetectionStrategy.CheckAlways);
      expect(component.inputs).toContain('aProperty');
      expect(component.inputs['aProperty']).toEqual('aProperty');
      expect(component.outputs).toContain('anEvent');
      expect(component.outputs['anEvent']).toEqual('anEvent');
      expect(component.hostAttributes).toContain('hostKey');
      expect(component.hostAttributes['hostKey']).toEqual('hostValue');

      var directive = ngMeta.types['UnusualDirective'];
      expect(directive).toBeNotNull();
      expect(directive.selector).toEqual('unusual-directive');
      expect(directive.isComponent).toBeFalse();
      expect(directive.exportAs).toEqual('DirectiveExportAsValue');
      expect(directive.inputs).toContain('aDirectiveProperty');
      expect(directive.inputs['aDirectiveProperty'])
          .toEqual('aDirectiveProperty');
      expect(directive.outputs).toContain('aDirectiveEvent');
      expect(directive.outputs['aDirectiveEvent']).toEqual('aDirectiveEvent');
      expect(directive.hostAttributes).toContain('directiveHostKey');
      expect(directive.hostAttributes['directiveHostKey'])
          .toEqual('directiveHostValue');
    });

    it('should include hooks for implemented types (single)', () async {
      var ngMeta = await _testCreateModel('interfaces_files/soup.dart');

      expect(ngMeta.types.isNotEmpty).toBeTrue();
      expect(ngMeta.types['ChangingSoupComponent']).toBeNotNull();
      expect(ngMeta.types['ChangingSoupComponent'].selector).toEqual('[soup]');
      expect(ngMeta.types['ChangingSoupComponent'].lifecycleHooks)
          .toContain(LifecycleHooks.OnChanges);
    });

    it('should include hooks for implemented types (many)', () async {
      var ngMeta = await _testCreateModel(
          'multiple_interface_lifecycle_files/soup.dart');

      expect(ngMeta.types.isNotEmpty).toBeTrue();
      expect(ngMeta.types['MultiSoupComponent']).toBeNotNull();
      expect(ngMeta.types['MultiSoupComponent'].selector).toEqual('[soup]');
      expect(ngMeta.types['MultiSoupComponent'].lifecycleHooks)
        ..toContain(LifecycleHooks.OnChanges)
        ..toContain(LifecycleHooks.OnDestroy)
        ..toContain(LifecycleHooks.OnInit);
    });

    it('should parse templates from View annotations', () async {
      fakeReader
        ..addAsset(new AssetId('other_package', 'lib/template.html'), '')
        ..addAsset(new AssetId('other_package', 'lib/template.css'), '');
      var ngMeta = await _testCreateModel(
          'absolute_url_expression_files/hello.dart',
          reader: fakeReader);

      expect(ngMeta.types.isNotEmpty).toBeTrue();
      expect(ngMeta.types['HelloCmp']).toBeNotNull();
      expect(ngMeta.types['HelloCmp'].template).toBeNotNull();
      expect(ngMeta.types['HelloCmp'].template.templateUrl)
          .toEqual('asset:other_package/lib/template.html');
    });

    it('should handle prefixed annotations', () async {
      var model =
          (await _testCreateModel('prefixed_annotations_files/soup.dart'))
              .ngDeps;

      expect(model.reflectables.isEmpty).toBeFalse();
      final annotations = model.reflectables.first.annotations;
      final viewAnnotation =
          annotations.firstWhere((m) => m.isView, orElse: () => null);
      final componentAnnotation =
          annotations.firstWhere((m) => m.isComponent, orElse: () => null);
      expect(viewAnnotation).toBeNotNull();
      expect(viewAnnotation.namedParameters.first.name).toEqual('template');
      expect(viewAnnotation.namedParameters.first.value).toContain('SoupView');
      expect(componentAnnotation).toBeNotNull();
      expect(componentAnnotation.namedParameters.first.name)
          .toEqual('selector');
      expect(componentAnnotation.namedParameters.first.value)
          .toContain('[soup]');
    });
  });
}

Future<NgMeta> _testCreateModel(String inputPath,
    {List<AnnotationDescriptor> customDescriptors: const [],
    AssetId assetId,
    AssetReader reader,
    TransformLogger logger}) {
  if (logger == null) logger = new RecordingLogger();
  return log.setZoned(logger, () async {
    var inputId = _assetIdForPath(inputPath);
    if (reader == null) {
      reader = new TestAssetReader();
    }
    if (assetId != null) {
      reader.addAsset(assetId, await reader.readAsString(inputId));
      inputId = assetId;
    }

    var annotationMatcher = new AnnotationMatcher()..addAll(customDescriptors);
    return createNgMeta(reader, inputId, annotationMatcher);
  });
}

AssetId _assetIdForPath(String path) =>
    new AssetId('angular2', 'test/transform/directive_processor/$path');
