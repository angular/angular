library angular2.test.transform.directive_processor.all_tests;

import 'dart:async';
import 'dart:convert';

import 'package:barback/barback.dart';
import 'package:angular2/src/core/change_detection/change_detection.dart';
import 'package:angular2/src/core/compiler/interfaces.dart'
    show LifecycleHooks;
import 'package:angular2/src/transform/directive_processor/rewriter.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/model/reflection_info_model.pb.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:code_transformers/messages/build_logger.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';
import 'package:path/path.dart' as path;
import 'package:source_span/source_span.dart';
import '../common/read_file.dart';

var formatter = new DartFormatter();

main() {
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
    var model = await _testCreateModel('parameter_metadata/soup.dart');
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
    var modelFuture = _testCreateModel('part_files/main.dart');

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
      var model = await _testCreateModel('multiple_part_files/main.dart');
      expect(model.reflectables.length).toEqual(3);
      _expectSelector(model.reflectables.first).toEqual("'[part1]'");
      _expectSelector(model.reflectables[1]).toEqual("'[part2]'");
      _expectSelector(model.reflectables[2]).toEqual("'[main]'");
    });

    it('should not generate .ng_deps.dart for `part` files.', () async {
      var model = await _testCreateModel('part_files/part.dart');
      expect(model).toBeNull();
    });
  });

  describe('custom annotations', () {
    it('should be recognized from package: imports', () async {
      var model =
          await _testCreateModel('custom_metadata/package_soup.dart', customDescriptors:
              [
        const ClassDescriptor('Soup', 'package:soup/soup.dart',
            superClass: 'Component')
      ]);
      expect(model.reflectables.length).toEqual(1);
      expect(model.reflectables.first.name).toEqual('PackageSoup');
    });

    it('should be recognized from relative imports', () async {
      var model = await _testCreateModel('custom_metadata/relative_soup.dart',
          assetId: new AssetId('soup', 'lib/relative_soup.dart'),
          customDescriptors: [
            const ClassDescriptor('Soup', 'package:soup/annotations/soup.dart',
                superClass: 'Component')
          ]);
      expect(model.reflectables.length).toEqual(1);
      expect(model.reflectables.first.name).toEqual('RelativeSoup');
    });

    it('should ignore annotations that are not imported', () async {
      var model =
          await _testCreateModel('custom_metadata/bad_soup.dart', customDescriptors:
              [
        const ClassDescriptor('Soup', 'package:soup/soup.dart',
            superClass: 'Component')
      ]);
      expect(model).toBeNull();
    });
  });

  describe('inliner', () {
    var absoluteReader;
    beforeEach(() {
      absoluteReader = new TestAssetReader();
    });

    it('should inline `templateUrl` values', () async {
      var model = await _testCreateModel('url_expression_files/hello.dart');
      expect(model.reflectables.isNotEmpty).toBeTrue();
      var view =
          model.reflectables.first.annotations.firstWhere((a) => a.isView);
      expect(view.namedParameters
          .firstWhere((p) => p.name == 'templateUrl')
          .value).toContain('template.html');
      expect(view.namedParameters.firstWhere((p) => p.name == 'template').value)
          .toContain('{{greeting}}');
    });

    it(
        'should inline `templateUrl` and `styleUrls` values expressed as '
        'absolute urls.', () async {
      absoluteReader.addAsset(
          new AssetId('other_package', 'lib/template.html'),
          readFile(
              'directive_processor/absolute_url_expression_files/template.html'));
      absoluteReader.addAsset(
          new AssetId('other_package', 'lib/template.css'),
          readFile(
              'directive_processor/absolute_url_expression_files/template.css'));
      var model = await _testCreateModel(
          'absolute_url_expression_files/hello.dart',
          reader: absoluteReader);

      expect(model.reflectables.length).toEqual(2);
      var view =
          model.reflectables.first.annotations.firstWhere((a) => a.isView);
      expect(view.namedParameters
          .firstWhere((p) => p.name == 'templateUrl')
          .value).toContain('package:other_package/template.html');
      expect(view.namedParameters.firstWhere((p) => p.name == 'template').value)
          .toContain('{{greeting}}');
      expect(view.namedParameters.firstWhere((p) => p.name == 'styles').value)
          .toContain('.greeting { .color: blue; }');

      // TODO(kegluneq): Split this test out, as it is logically very different.
      expect(model.reflectables[1].isFunction).toBeTrue();
      expect(model.reflectables[1].name).toEqual('hello');
    });

    it('should inline multiple `styleUrls` values expressed as absolute urls.',
        () async {
      var model =
          await _testCreateModel('multiple_style_urls_files/hello.dart');

      expect(model.reflectables.isNotEmpty).toBeTrue();
      var view =
          model.reflectables.first.annotations.firstWhere((a) => a.isView);
      var expectStyles = expect(
          view.namedParameters.firstWhere((p) => p.name == 'styles').value);
      expectStyles
        ..toContain('.greeting { .color: blue; }')
        ..toContain('.hello { .color: red; }');
    });

    it(
        'should not inline multiple `styleUrls` values expressed as absolute '
        'urls.', () async {
      absoluteReader.addAsset(
          new AssetId('a', 'lib/template.html'),
          readFile(
              'directive_processor/multiple_style_urls_files/template.html'));
      absoluteReader.addAsset(
          new AssetId('a', 'lib/template.css'),
          readFile(
              'directive_processor/multiple_style_urls_files/template.css'));
      absoluteReader.addAsset(
          new AssetId('a', 'lib/template_other.css'),
          readFile(
              'directive_processor/multiple_style_urls_files/template_other.css'));
      var model = await _testCreateModel(
          'multiple_style_urls_not_inlined_files/hello.dart',
          inlineViews: false,
          reader: absoluteReader);
      expect(model.reflectables.isNotEmpty).toBeTrue();
      var view =
          model.reflectables.first.annotations.firstWhere((a) => a.isView);
      expect(view.namedParameters.firstWhere((p) => p.name == 'styles',
          orElse: () => null)).toBeNull();
      expect(
          view.namedParameters.firstWhere((p) => p.name == 'styleUrls').value)
        ..toContain('package:a/template.css')
        ..toContain('package:a/template_other.css');
    });

    it('should inline `templateUrl`s expressed as adjacent strings.', () async {
      var model =
          await _testCreateModel('split_url_expression_files/hello.dart');
      expect(model.reflectables.isNotEmpty).toBeTrue();
      var view =
          model.reflectables.first.annotations.firstWhere((a) => a.isView);
      expect(view.namedParameters.firstWhere((p) => p.name == 'template').value)
          .toContain('{{greeting}}');
    });
  });

  describe('interfaces', () {
    it('should include implemented types', () async {
      var model = await _testCreateModel('interfaces_files/soup.dart');

      expect(model.reflectables.first.interfaces).toBeNotNull();
      expect(model.reflectables.first.interfaces.isNotEmpty).toBeTrue();
      expect(model.reflectables.first.interfaces.contains('OnChanges'))
          .toBeTrue();
      expect(model.reflectables.first.interfaces.contains('AnotherInterface'))
          .toBeTrue();
    });

    it('should not include transitively implemented types', () async {
      var model = await _testCreateModel('interface_chain_files/soup.dart');

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
      var model = await _testCreateModel('superclass_files/soup.dart');

      var interfaces = model.reflectables.first.interfaces;
      expect(interfaces == null || interfaces.isEmpty).toBeTrue();
    });

    it('should populate multiple `lifecycle` values when necessary.', () async {
      var model = await _testCreateModel(
          'multiple_interface_lifecycle_files/soup.dart');

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
          await _testCreateModel('superclass_lifecycle_files/soup.dart');

      var interfaces = model.reflectables.first.interfaces;
      expect(interfaces == null || interfaces.isEmpty).toBeTrue();
    });

    it('should populate `lifecycle` with prefix when necessary.', () async {
      var model = await _testCreateModel(
          'prefixed_interface_lifecycle_files/soup.dart');
      expect(model.reflectables.first.interfaces).toBeNotNull();
      expect(model.reflectables.first.interfaces.isNotEmpty).toBeTrue();
      expect(model.reflectables.first.interfaces
              .firstWhere((i) => i.contains('OnChanges'), orElse: () => null))
          .toBeNotNull();
    });
  });

  describe('property metadata', () {
    it('should be recorded on fields', () async {
      var model = await _testCreateModel('prop_metadata_files/fields.dart');

      expect(model.reflectables.first.propertyMetadata).toBeNotNull();
      expect(model.reflectables.first.propertyMetadata.isNotEmpty).toBeTrue();
      expect(model.reflectables.first.propertyMetadata.first.name)
          .toEqual('field');
      expect(model.reflectables.first.propertyMetadata.first.annotations
          .firstWhere((a) => a.name == 'FieldDecorator',
              orElse: () => null)).toBeNotNull();
    });

    it('should be recorded on getters', () async {
      var model = await _testCreateModel('prop_metadata_files/getters.dart');

      expect(model.reflectables.first.propertyMetadata).toBeNotNull();
      expect(model.reflectables.first.propertyMetadata.isNotEmpty).toBeTrue();
      expect(model.reflectables.first.propertyMetadata.first.name)
          .toEqual('getVal');
      expect(model.reflectables.first.propertyMetadata.first.annotations
              .firstWhere((a) => a.name == 'GetDecorator', orElse: () => null))
          .toBeNotNull();
    });

    it('should be recorded on setters', () async {
      var model = await _testCreateModel('prop_metadata_files/setters.dart');

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
      var model = await _testCreateModel(
          'prop_metadata_files/getters_and_setters.dart');

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
    var model =
        await _testCreateModel('invalid_url_files/hello.dart', logger: logger);
    expect(logger.hasErrors).toBeTrue();
    expect(logger.logs)
      ..toContain(
          'ERROR: Uri /bad/absolute/url.html not supported from angular2|test/'
          'transform/directive_processor/invalid_url_files/hello.dart, could not '
          'build AssetId')
      ..toContain(
          'ERROR: Could not read asset at uri package:invalid/package.css from '
          'angular2|test/transform/directive_processor/invalid_url_files/'
          'hello.dart')
      ..toContain(
          'ERROR: Could not read asset at uri bad_relative_url.css from angular2|'
          'test/transform/directive_processor/invalid_url_files/hello.dart');
  });

  it('should find and register static functions.', () async {
    var model = await _testCreateModel('static_function_files/hello.dart');

    var functionReflectable =
        model.reflectables.firstWhere((i) => i.isFunction, orElse: () => null);
    expect(functionReflectable)..toBeNotNull();
    expect(functionReflectable.name).toEqual('getMessage');
  });

  ddescribe('NgMeta', () {
    it('should find direcive aliases patterns.', () async {
      var ngMeta = new NgMeta.empty();
      await _testCreateModel('directive_aliases_files/hello.dart',
          ngMeta: ngMeta);

      expect(ngMeta.aliases).toContain('alias1');
      expect(ngMeta.aliases['alias1']).toContain('HelloCmp');

      expect(ngMeta.aliases).toContain('alias2');
      expect(ngMeta.aliases['alias2'])
        ..toContain('HelloCmp')..toContain('Foo');
    });

    it('should create type entries for Directives', () async {
      var ngMeta = new NgMeta.empty();
      await _testCreateModel('absolute_url_expression_files/hello.dart',
          ngMeta: ngMeta);

      expect(ngMeta.types.isNotEmpty).toBeTrue();
      expect(ngMeta.types['HelloCmp']).toBeNotNull();
      expect(ngMeta.types['HelloCmp'].selector).toEqual('hello-app');
    });

    it('should populate all provided values for Components & Directives', () async {
      var ngMeta = new NgMeta.empty();
      await _testCreateModel('unusual_component_files/hello.dart',
          ngMeta: ngMeta);

      expect(ngMeta.types.isNotEmpty).toBeTrue();

      var component = ngMeta.types['UnusualComp'];
      expect(component).toBeNotNull();
      expect(component.selector).toEqual('unusual-comp');
      expect(component.isComponent).toBeTrue();
      expect(component.exportAs).toEqual('ComponentExportAsValue');
      expect(component.changeDetection).toEqual(ChangeDetectionStrategy.CheckAlways);
      expect(component.properties).toContain('aProperty');
      expect(component.properties['aProperty']).toEqual('aProperty');
      expect(component.events).toContain('anEvent');
      expect(component.events['anEvent']).toEqual('anEvent');
      expect(component.hostAttributes).toContain('hostKey');
      expect(component.hostAttributes['hostKey']).toEqual('hostValue');

      var directive = ngMeta.types['UnusualDirective'];
      expect(directive).toBeNotNull();
      expect(directive.selector).toEqual('unusual-directive');
      expect(directive.isComponent).toBeFalse();
      expect(directive.exportAs).toEqual('DirectiveExportAsValue');
      expect(directive.properties).toContain('aDirectiveProperty');
      expect(directive.properties['aDirectiveProperty']).toEqual('aDirectiveProperty');
      expect(directive.events).toContain('aDirectiveEvent');
      expect(directive.events['aDirectiveEvent']).toEqual('aDirectiveEvent');
      expect(directive.hostAttributes).toContain('directiveHostKey');
      expect(directive.hostAttributes['directiveHostKey']).toEqual('directiveHostValue');
    });

    it('should include hooks for implemented types (single)', () async {
      var ngMeta = new NgMeta.empty();
      await _testCreateModel('interfaces_files/soup.dart',
          ngMeta: ngMeta);

      expect(ngMeta.types.isNotEmpty).toBeTrue();
      expect(ngMeta.types['ChangingSoupComponent']).toBeNotNull();
      expect(ngMeta.types['ChangingSoupComponent'].selector).toEqual('[soup]');
      expect(ngMeta.types['ChangingSoupComponent'].lifecycleHooks).toContain(LifecycleHooks.OnChanges);
    });

    it('should include hooks for implemented types (many)', () async {
      var ngMeta = new NgMeta.empty();
      await _testCreateModel('multiple_interface_lifecycle_files/soup.dart',
          ngMeta: ngMeta);

      expect(ngMeta.types.isNotEmpty).toBeTrue();
      expect(ngMeta.types['MultiSoupComponent']).toBeNotNull();
      expect(ngMeta.types['MultiSoupComponent'].selector).toEqual('[soup]');
      expect(ngMeta.types['MultiSoupComponent'].lifecycleHooks)
          ..toContain(LifecycleHooks.OnChanges)
          ..toContain(LifecycleHooks.OnDestroy)
          ..toContain(LifecycleHooks.OnInit);
    });

    it('should parse templates from View annotations', () async {
      var ngMeta = new NgMeta.empty();
      await _testCreateModel('absolute_url_expression_files/hello.dart',
          ngMeta: ngMeta);

      expect(ngMeta.types.isNotEmpty).toBeTrue();
      expect(ngMeta.types['HelloCmp']).toBeNotNull();
      expect(ngMeta.types['HelloCmp'].template).toBeNotNull();
      expect(ngMeta.types['HelloCmp'].template.templateUrl).toEqual('package:other_package/template.html');
    });
  });
}

Future<NgDepsModel> _testCreateModel(String inputPath,
    {List<AnnotationDescriptor> customDescriptors: const [],
    AssetId assetId,
    AssetReader reader,
    BuildLogger logger,
    NgMeta ngMeta,
    bool inlineViews: true}) {
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
    if (ngMeta == null) {
      ngMeta = new NgMeta.empty();
    }

    var annotationMatcher = new AnnotationMatcher()..addAll(customDescriptors);
    return createNgDeps(reader, inputId, annotationMatcher, ngMeta,
        inlineViews: inlineViews);
  });
}

AssetId _assetIdForPath(String path) =>
    new AssetId('angular2', 'test/transform/directive_processor/$path');

class RecordingLogger implements BuildLogger {
  @override
  final String detailsUri = '';
  @override
  final bool convertErrorsToWarnings = false;

  bool hasErrors = false;

  List<String> logs = [];

  void _record(prefix, msg) => logs.add('$prefix: $msg');

  void info(msg, {AssetId asset, SourceSpan span}) => _record('INFO', msg);

  void fine(msg, {AssetId asset, SourceSpan span}) => _record('FINE', msg);

  void warning(msg, {AssetId asset, SourceSpan span}) => _record('WARN', msg);

  void error(msg, {AssetId asset, SourceSpan span}) {
    hasErrors = true;
    _record('ERROR', msg);
  }

  Future writeOutput() => throw new UnimplementedError();
  Future addLogFilesFromAsset(AssetId id, [int nextNumber = 1]) =>
      throw new UnimplementedError();
}
