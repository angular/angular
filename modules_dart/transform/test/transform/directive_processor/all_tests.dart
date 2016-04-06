library angular2.test.transform.directive_processor.all_tests;

import 'dart:async';

import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';
import 'package:test/test.dart';

import 'package:angular2/src/compiler/directive_metadata.dart'
    show CompileIdentifierMetadata;
import 'package:angular2/src/core/change_detection/change_detection.dart';
import 'package:angular2/src/platform/server/html_adapter.dart';
import 'package:angular2/src/core/linker/interfaces.dart' show LifecycleHooks;
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/code/ng_deps_code.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:angular2/src/transform/common/model/reflection_info_model.pb.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:angular2/src/transform/common/zone.dart' as zone;
import 'package:angular2/src/transform/directive_processor/rewriter.dart';

import '../common/read_file.dart';
import '../common/recording_logger.dart';

var formatter = new DartFormatter();

main() {
  Html5LibDomAdapter.makeCurrent();
  allTests();
}

void _expectSelector(ReflectionInfoModel model, Matcher matcher) {
  expect(model.annotations.isNotEmpty, isTrue);
  var componentAnnotation = model.annotations
      .firstWhere((e) => e.name == 'Component', orElse: () => null);
  expect(componentAnnotation, isNotNull);
  var selectorArg = componentAnnotation.namedParameters
      .firstWhere((e) => e.name == 'selector', orElse: () => null);
  expect(selectorArg, isNotNull);
  return expect(selectorArg.value, matcher);
}

void allTests() {
  test('should preserve parameter annotations.', () async {
    var model = (await _testCreateModel('parameter_metadata/soup.dart')).ngDeps;
    expect(model.reflectables.length, equals(1));
    var reflectable = model.reflectables.first;
    expect(reflectable.parameters.length, equals(2));

    expect(reflectable.parameters.first.typeName, equals('String'));
    expect(reflectable.parameters.first.metadata.length, equals(1));
    expect(reflectable.parameters.first.metadata.first, contains('Tasty'));
    expect(reflectable.parameters.first.paramName, equals('description'));

    var typeName = reflectable.parameters[1].typeName;
    expect(typeName == null || typeName.isEmpty, isTrue);
    var secondParam = reflectable.parameters[1];
    expect(secondParam.metadata.first, contains('Inject(Salt)'));
    expect(secondParam.paramName, equals('salt'));
  });

  group('part support', () {
    var modelFuture = _testCreateModel('part_files/main.dart')
        .then((ngMeta) => ngMeta != null ? ngMeta.ngDeps : null);

    test('should include directives from the part.', () async {
      var model = await modelFuture;
      expect(model.reflectables.length, equals(2));
    });

    test('should list part contributions first.', () async {
      var model = await modelFuture;
      expect(model.reflectables.first.name, equals('PartComponent'));
      _expectSelector(model.reflectables.first, equals("'[part]'"));
    });

    test('should list main contributions second.', () async {
      var model = await modelFuture;
      expect(model.reflectables[1].name, equals('MainComponent'));
      _expectSelector(model.reflectables[1], equals("'[main]'"));
    });

    test('should handle multiple `part` directives.', () async {
      var model =
          (await _testCreateModel('multiple_part_files/main.dart')).ngDeps;
      expect(model.reflectables.length, equals(3));
      _expectSelector(model.reflectables.first, equals("'[part1]'"));
      _expectSelector(model.reflectables[1], equals("'[part2]'"));
      _expectSelector(model.reflectables[2], equals("'[main]'"));
    });

    test('should not generate anything for `part` files.', () async {
      expect(await _testCreateModel('part_files/part.dart'), isNull);
    });
  });

  group('custom annotations', () {
    test('should be recognized from package: imports', () async {
      var ngMeta = await _testCreateModel('custom_metadata/package_soup.dart',
          customDescriptors: [
            const ClassDescriptor('Soup', 'package:soup/soup.dart',
                superClass: 'Component')
          ]);
      var model = ngMeta.ngDeps;
      expect(model.reflectables.length, equals(1));
      expect(model.reflectables.first.name, equals('PackageSoup'));
    });

    test('should be recognized from relative imports', () async {
      var ngMeta = await _testCreateModel('custom_metadata/relative_soup.dart',
          assetId: new AssetId('soup', 'lib/relative_soup.dart'),
          customDescriptors: [
            const ClassDescriptor('Soup', 'package:soup/annotations/soup.dart',
                superClass: 'Component')
          ]);
      var model = ngMeta.ngDeps;
      expect(model.reflectables.length, equals(1));
      expect(model.reflectables.first.name, equals('RelativeSoup'));
    });

    test('should ignore annotations that are not imported', () async {
      var ngMeta = await _testCreateModel('custom_metadata/bad_soup.dart',
          customDescriptors: [
            const ClassDescriptor('Soup', 'package:soup/soup.dart',
                superClass: 'Component')
          ]);
      expect(
          ngMeta.ngDeps == null || ngMeta.ngDeps.reflectables.isEmpty, isTrue);
    });
  });

  group('interfaces', () {
    test('should include implemented types', () async {
      var model = (await _testCreateModel('interfaces_files/soup.dart')).ngDeps;

      expect(model.reflectables.first.interfaces, isNotNull);
      expect(model.reflectables.first.interfaces.isNotEmpty, isTrue);
      expect(model.reflectables.first.interfaces.contains('OnChanges'), isTrue);
      expect(model.reflectables.first.interfaces.contains('AnotherInterface'),
          isTrue);
    });

    test('should not include transitively implemented types', () async {
      var model =
          (await _testCreateModel('interface_chain_files/soup.dart')).ngDeps;

      expect(model.reflectables.first.interfaces, isNotNull);
      expect(model.reflectables.first.interfaces.isNotEmpty, isTrue);
      expect(model.reflectables.first.interfaces.contains('PrimaryInterface'),
          isTrue);
      expect(model.reflectables.first.interfaces.contains('SecondaryInterface'),
          isFalse);
      expect(model.reflectables.first.interfaces.contains('TernaryInterface'),
          isFalse);
    });

    test('should not include superclasses.', () async {
      var model = (await _testCreateModel('superclass_files/soup.dart')).ngDeps;

      var interfaces = model.reflectables.first.interfaces;
      expect(interfaces == null || interfaces.isEmpty, isTrue);
    });

    test('should populate multiple `lifecycle` values when necessary.',
        () async {
      var model = (await _testCreateModel(
              'multiple_interface_lifecycle_files/soup.dart'))
          .ngDeps;

      expect(model.reflectables.first.interfaces, isNotNull);
      expect(model.reflectables.first.interfaces.isNotEmpty, isTrue);
      expect(model.reflectables.first.interfaces.contains('OnChanges'), isTrue);
      expect(model.reflectables.first.interfaces.contains('OnDestroy'), isTrue);
      expect(model.reflectables.first.interfaces.contains('OnInit'), isTrue);
    });

    test(
        'should not populate `lifecycle` when lifecycle superclass is present.',
        () async {
      var model =
          (await _testCreateModel('superclass_lifecycle_files/soup.dart'))
              .ngDeps;

      var interfaces = model.reflectables.first.interfaces;
      expect(interfaces == null || interfaces.isEmpty, isTrue);
    });

    test('should populate `lifecycle` with prefix when necessary.', () async {
      var model = (await _testCreateModel(
              'prefixed_interface_lifecycle_files/soup.dart'))
          .ngDeps;
      expect(model.reflectables.first.interfaces, isNotNull);
      expect(model.reflectables.first.interfaces.isNotEmpty, isTrue);
      expect(
          model.reflectables.first.interfaces
              .firstWhere((i) => i.contains('OnChanges'), orElse: () => null),
          isNotNull);
    });
  });

  group('property metadata', () {
    test('should be recorded on fields', () async {
      var model =
          (await _testCreateModel('prop_metadata_files/fields.dart')).ngDeps;

      expect(model.reflectables.first.propertyMetadata, isNotNull);
      expect(model.reflectables.first.propertyMetadata.isNotEmpty, isTrue);
      expect(model.reflectables.first.propertyMetadata.first.name,
          equals('field'));
      expect(
          model.reflectables.first.propertyMetadata.first.annotations
              .firstWhere((a) => a.name == 'FieldDecorator',
                  orElse: () => null),
          isNotNull);
    });

    test('should be recorded on getters', () async {
      var model =
          (await _testCreateModel('prop_metadata_files/getters.dart')).ngDeps;

      expect(model.reflectables.first.propertyMetadata, isNotNull);
      expect(model.reflectables.first.propertyMetadata.isNotEmpty, isTrue);
      expect(model.reflectables.first.propertyMetadata.first.name,
          equals('getVal'));

      var getDecoratorAnnotation = model
          .reflectables.first.propertyMetadata.first.annotations
          .firstWhere((a) => a.name == 'GetDecorator', orElse: () => null);
      expect(getDecoratorAnnotation, isNotNull);
      expect(getDecoratorAnnotation.isConstObject, isFalse);
    });

    test('should gracefully handle const instances of annotations', () async {
      // Regression test for i/4481
      var model =
          (await _testCreateModel('prop_metadata_files/override.dart')).ngDeps;

      expect(model.reflectables.first.propertyMetadata, isNotNull);
      expect(model.reflectables.first.propertyMetadata.isNotEmpty, isTrue);
      expect(model.reflectables.first.propertyMetadata.first.name,
          equals('getVal'));
      var overrideAnnotation = model
          .reflectables.first.propertyMetadata.first.annotations
          .firstWhere((a) => a.name == 'override', orElse: () => null);

      expect(overrideAnnotation, isNotNull);
      expect(overrideAnnotation.isConstObject, isTrue);

      var buf = new StringBuffer();
      new NgDepsWriter(buf).writeAnnotationModel(overrideAnnotation);
      expect(buf.toString(), equals('override'));
    });

    test('should be recorded on setters', () async {
      var model =
          (await _testCreateModel('prop_metadata_files/setters.dart')).ngDeps;

      expect(model.reflectables.first.propertyMetadata, isNotNull);
      expect(model.reflectables.first.propertyMetadata.isNotEmpty, isTrue);
      expect(model.reflectables.first.propertyMetadata.first.name,
          equals('setVal'));
      expect(
          model.reflectables.first.propertyMetadata.first.annotations
              .firstWhere((a) => a.name == 'SetDecorator', orElse: () => null),
          isNotNull);
    });

    test('should be coalesced when getters and setters have the same name',
        () async {
      var model = (await _testCreateModel(
              'prop_metadata_files/getters_and_setters.dart'))
          .ngDeps;

      expect(model.reflectables.first.propertyMetadata, isNotNull);
      expect(model.reflectables.first.propertyMetadata.length, equals(1));
      expect(model.reflectables.first.propertyMetadata.first.name,
          equals('myVal'));
      expect(
          model.reflectables.first.propertyMetadata.first.annotations
              .firstWhere((a) => a.name == 'GetDecorator', orElse: () => null),
          isNotNull);
      expect(
          model.reflectables.first.propertyMetadata.first.annotations
              .firstWhere((a) => a.name == 'SetDecorator', orElse: () => null),
          isNotNull);
    });
  });

  test('should record information about abstract classes', () async {
    var model =
        (await _testCreateModel('abstract_classes/classes.dart')).ngDeps;

    expect(model.reflectables.first.name, equals("Service"));
  });

  test('should not throw/hang on invalid urls', () async {
    var logger = new RecordingLogger();
    await _testCreateModel('invalid_url_files/hello.dart', logger: logger);
    expect(logger.hasErrors, isTrue);
    expect(
        logger.logs,
        contains('ERROR: ERROR: Invalid argument (url): '
            '"Could not read asset at uri asset:/bad/absolute/url.html"'));
  });

  test('should find and register static functions.', () async {
    var model =
        (await _testCreateModel('static_function_files/hello.dart')).ngDeps;

    var functionReflectable =
        model.reflectables.firstWhere((i) => i.isFunction, orElse: () => null);
    expect(functionReflectable, isNotNull);
    expect(functionReflectable.name, equals('getMessage'));
  });

  group('NgMeta', () {
    var fakeReader;
    setUp(() {
      fakeReader = new TestAssetReader();
    });

    test('should find direcive aliases patterns.', () async {
      var ngMeta = await _testCreateModel('directive_aliases_files/hello.dart');

      expect(ngMeta.aliases, contains('alias1'));
      expect(ngMeta.aliases['alias1'], contains('HelloCmp'));

      expect(ngMeta.aliases, contains('alias2'));
      expect(ngMeta.aliases['alias2'], contains('HelloCmp'));
      expect(ngMeta.aliases['alias2'], contains('Foo'));
    });

    test('should include hooks for implemented types (single)', () async {
      var ngMeta = await _testCreateModel('interfaces_files/soup.dart');

      expect(ngMeta.identifiers.isNotEmpty, isTrue);
      expect(ngMeta.identifiers['ChangingSoupComponent'], isNotNull);
      expect(ngMeta.identifiers['ChangingSoupComponent'].selector,
          equals('[soup]'));
      expect(ngMeta.identifiers['ChangingSoupComponent'].lifecycleHooks,
          contains(LifecycleHooks.OnChanges));
    });

    test('should include hooks for implemented types (many)', () async {
      var ngMeta = await _testCreateModel(
          'multiple_interface_lifecycle_files/soup.dart');

      expect(ngMeta.identifiers.isNotEmpty, isTrue);
      expect(ngMeta.identifiers['MultiSoupComponent'], isNotNull);
      expect(
          ngMeta.identifiers['MultiSoupComponent'].selector, equals('[soup]'));
      final hooks = ngMeta.identifiers['MultiSoupComponent'].lifecycleHooks;
      expect(hooks, contains(LifecycleHooks.OnChanges));
      expect(hooks, contains(LifecycleHooks.OnDestroy));
      expect(hooks, contains(LifecycleHooks.OnInit));
    });

    test('should create type entries for Directives', () async {
      fakeReader
        ..addAsset(new AssetId('other_package', 'lib/template.html'), '')
        ..addAsset(new AssetId('other_package', 'lib/template.css'), '');
      var ngMeta = await _testCreateModel(
          'absolute_url_expression_files/hello.dart',
          reader: fakeReader);

      expect(ngMeta.identifiers.isNotEmpty, isTrue);
      expect(ngMeta.identifiers['HelloCmp'], isNotNull);
      expect(ngMeta.identifiers['HelloCmp'].selector, equals('hello-app'));
    });

    test('should populate all provided values for Components & Directives',
        () async {
      var ngMeta = await _testCreateModel('unusual_component_files/hello.dart');

      expect(ngMeta.identifiers.isNotEmpty, isTrue);

      var component = ngMeta.identifiers['UnusualComp'];
      expect(component, isNotNull);
      expect(component.selector, equals('unusual-comp'));
      expect(component.isComponent, isTrue);
      expect(component.exportAs, equals('ComponentExportAsValue'));
      expect(component.changeDetection,
          equals(ChangeDetectionStrategy.CheckAlways));
      expect(component.inputs, contains('aProperty'));
      expect(component.inputs['aProperty'], equals('aProperty'));
      expect(component.outputs, contains('anEvent'));
      expect(component.outputs['anEvent'], equals('anEvent'));
      expect(component.hostAttributes, contains('hostKey'));
      expect(component.hostAttributes['hostKey'], equals('hostValue'));

      var directive = ngMeta.identifiers['UnusualDirective'];
      expect(directive, isNotNull);
      expect(directive.selector, equals('unusual-directive'));
      expect(directive.isComponent, isFalse);
      expect(directive.exportAs, equals('DirectiveExportAsValue'));
      expect(directive.inputs, contains('aDirectiveProperty'));
      expect(
          directive.inputs['aDirectiveProperty'], equals('aDirectiveProperty'));
      expect(directive.outputs, contains('aDirectiveEvent'));
      expect(directive.outputs['aDirectiveEvent'], equals('aDirectiveEvent'));
      expect(directive.hostAttributes, contains('directiveHostKey'));
      expect(directive.hostAttributes['directiveHostKey'],
          equals('directiveHostValue'));
    });

    test('should include hooks for implemented types (single)', () async {
      var ngMeta = await _testCreateModel('interfaces_files/soup.dart');

      expect(ngMeta.identifiers.isNotEmpty, isTrue);
      expect(ngMeta.identifiers['ChangingSoupComponent'], isNotNull);
      expect(ngMeta.identifiers['ChangingSoupComponent'].selector,
          equals('[soup]'));
      expect(ngMeta.identifiers['ChangingSoupComponent'].lifecycleHooks,
          contains(LifecycleHooks.OnChanges));
    });

    test('should include hooks for implemented types (many)', () async {
      var ngMeta = await _testCreateModel(
          'multiple_interface_lifecycle_files/soup.dart');

      expect(ngMeta.identifiers.isNotEmpty, isTrue);
      expect(ngMeta.identifiers['MultiSoupComponent'], isNotNull);
      expect(
          ngMeta.identifiers['MultiSoupComponent'].selector, equals('[soup]'));
      final hooks = ngMeta.identifiers['MultiSoupComponent'].lifecycleHooks;
      expect(hooks, contains(LifecycleHooks.OnChanges));
      expect(hooks, contains(LifecycleHooks.OnDestroy));
      expect(hooks, contains(LifecycleHooks.OnInit));
    });

    test('should parse templates from View annotations', () async {
      fakeReader
        ..addAsset(new AssetId('other_package', 'lib/template.html'), '')
        ..addAsset(new AssetId('other_package', 'lib/template.css'), '');
      var ngMeta = await _testCreateModel(
          'absolute_url_expression_files/hello.dart',
          reader: fakeReader);

      expect(ngMeta.identifiers.isNotEmpty, isTrue);
      expect(ngMeta.identifiers['HelloCmp'], isNotNull);
      expect(ngMeta.identifiers['HelloCmp'].template, isNotNull);
      expect(ngMeta.identifiers['HelloCmp'].template.templateUrl,
          equals('asset:other_package/lib/template.html'));
    });

    test('should handle prefixed annotations', () async {
      var model =
          (await _testCreateModel('prefixed_annotations_files/soup.dart'))
              .ngDeps;

      expect(model.reflectables.isEmpty, isFalse);
      final annotations = model.reflectables.first.annotations;
      final viewAnnotation =
          annotations.firstWhere((m) => m.isView, orElse: () => null);
      final componentAnnotation =
          annotations.firstWhere((m) => m.isComponent, orElse: () => null);
      expect(viewAnnotation, isNotNull);
      expect(viewAnnotation.namedParameters.first.name, equals('template'));
      expect(viewAnnotation.namedParameters.first.value, contains('SoupView'));
      expect(componentAnnotation, isNotNull);
      expect(
          componentAnnotation.namedParameters.first.name, equals('selector'));
      expect(
          componentAnnotation.namedParameters.first.value, contains('[soup]'));
    });
  });

  group("identifiers", () {
    test("should populate `identifier` with class types.", () async {
      var model = (await _testCreateModel('identifiers/classes.dart'));
      final moduleUrl =
          "asset:angular2/test/transform/directive_processor/identifiers/classes.dart";
      expect(model.identifiers['Service1'].name, equals('Service1'));
      expect(model.identifiers['Service1'].moduleUrl, equals(moduleUrl));
      expect(model.identifiers['Service2'].name, equals('Service2'));
      expect(model.identifiers['Service2'].moduleUrl, equals(moduleUrl));
    });

    test("should populate `identifier` with constants.", () async {
      var model = (await _testCreateModel('identifiers/constants.dart'));
      final moduleUrl =
          "asset:angular2/test/transform/directive_processor/identifiers/constants.dart";
      expect(
          model.identifiers['a'].toJson(),
          equals(new CompileIdentifierMetadata(name: 'a', moduleUrl: moduleUrl)
              .toJson()));
      expect(
          model.identifiers['b'].toJson(),
          equals(new CompileIdentifierMetadata(name: 'b', moduleUrl: moduleUrl)
              .toJson()));
      expect(model.identifiers['c'], isNull);
    });

    test(
        "should populate `identifier` with class names that do not have @Injectable;'.",
        () async {
      var model =
          (await _testCreateModel('identifiers/classes_no_injectable.dart'));
      final moduleUrl =
          "asset:angular2/test/transform/directive_processor/identifiers/classes_no_injectable.dart";
      expect(
          model.identifiers['ClassA'].toJson(),
          equals(new CompileIdentifierMetadata(
                  name: 'ClassA', moduleUrl: moduleUrl)
              .toJson()));
    });

    test("should populate `identifier` with typedefs.", () async {
      var model = (await _testCreateModel('identifiers/typedefs.dart'));
      final moduleUrl =
          "asset:angular2/test/transform/directive_processor/identifiers/typedefs.dart";
      expect(
          model.identifiers['TypeDef'].toJson(),
          equals(new CompileIdentifierMetadata(
                  name: 'TypeDef', moduleUrl: moduleUrl)
              .toJson()));
    });

    test("should populate `identifier` with enums.", () async {
      var model = (await _testCreateModel('identifiers/enums.dart'));
      final moduleUrl =
          "asset:angular2/test/transform/directive_processor/identifiers/enums.dart";

      expect(
          model.identifiers['Enum'].toJson(),
          equals(
              new CompileIdentifierMetadata(name: 'Enum', moduleUrl: moduleUrl)
                  .toJson()));
    });
  });

  group('directives', () {
    final reflectableNamed = (NgDepsModel model, String name) {
      return model.reflectables
          .firstWhere((r) => r.name == name, orElse: () => null);
    };

    test('should populate `directives` from @View value specified second.',
        () async {
      var model =
          (await _testCreateModel('directives_files/components.dart')).ngDeps;
      final componentFirst = reflectableNamed(model, 'ComponentFirst');
      expect(componentFirst, isNotNull);
      expect(componentFirst.directives, isNotNull);
      expect(componentFirst.directives.length, equals(2));
      expect(componentFirst.directives.first,
          equals(new PrefixedType()..name = 'Dep'));
      expect(
          componentFirst.directives[1],
          equals(new PrefixedType()
            ..name = 'Dep'
            ..prefix = 'dep2'));
    });

    test('should populate `directives` from @View value specified first.',
        () async {
      var model =
          (await _testCreateModel('directives_files/components.dart')).ngDeps;
      final viewFirst = reflectableNamed(model, 'ViewFirst');
      expect(viewFirst, isNotNull);
      expect(viewFirst.directives, isNotNull);
      expect(viewFirst.directives.length, equals(2));
      expect(
          viewFirst.directives.first,
          equals(new PrefixedType()
            ..name = 'Dep'
            ..prefix = 'dep2'));
      expect(viewFirst.directives[1], equals(new PrefixedType()..name = 'Dep'));
    });

    test('should populate `directives` from @Component value with no @View.',
        () async {
      var model =
          (await _testCreateModel('directives_files/components.dart')).ngDeps;
      final componentOnly = reflectableNamed(model, 'ComponentOnly');
      expect(componentOnly, isNotNull);
      expect(componentOnly.directives, isNotNull);
      expect(componentOnly.directives.length, equals(2));
      expect(componentOnly.directives.first,
          equals(new PrefixedType()..name = 'Dep'));
      expect(
          componentOnly.directives[1],
          equals(new PrefixedType()
            ..name = 'Dep'
            ..prefix = 'dep2'));
    });

    test('should populate `pipes` from @View value specified second.',
        () async {
      var model =
          (await _testCreateModel('directives_files/components.dart')).ngDeps;
      final componentFirst = reflectableNamed(model, 'ComponentFirst');
      expect(componentFirst, isNotNull);
      expect(componentFirst.pipes, isNotNull);
      expect(componentFirst.pipes.length, equals(2));
      expect(componentFirst.pipes.first,
          equals(new PrefixedType()..name = 'PipeDep'));
      expect(
          componentFirst.pipes[1],
          equals(new PrefixedType()
            ..name = 'PipeDep'
            ..prefix = 'dep2'));
    });

    test('should populate `pipes` from @View value specified first.', () async {
      var model =
          (await _testCreateModel('directives_files/components.dart')).ngDeps;
      final viewFirst = reflectableNamed(model, 'ViewFirst');
      expect(viewFirst, isNotNull);
      expect(viewFirst.pipes, isNotNull);
      expect(viewFirst.pipes.length, equals(2));
      expect(
          viewFirst.pipes.first,
          equals(new PrefixedType()
            ..name = 'PipeDep'
            ..prefix = 'dep2'));
      expect(viewFirst.pipes[1], equals(new PrefixedType()..name = 'PipeDep'));
    });

    test('should populate `pipes` from @Component value with no @View.',
        () async {
      var model =
          (await _testCreateModel('directives_files/components.dart')).ngDeps;
      final componentOnly = reflectableNamed(model, 'ComponentOnly');
      expect(componentOnly, isNotNull);
      expect(componentOnly.pipes, isNotNull);
      expect(componentOnly.pipes.length, equals(2));
      expect(componentOnly.pipes.first,
          equals(new PrefixedType()..name = 'PipeDep'));
      expect(
          componentOnly.pipes[1],
          equals(new PrefixedType()
            ..name = 'PipeDep'
            ..prefix = 'dep2'));
    });

    test('should populate `diDependency`.', () async {
      var cmp = (await _testCreateModel('directives_files/components.dart'))
          .identifiers['ComponentWithDiDeps'];

      expect(cmp, isNotNull);
      var deps = cmp.type.diDeps;
      expect(deps, isNotNull);
      expect(deps.length, equals(8));
      expect(deps[0].token.name, equals("ServiceDep"));
      expect(deps[1].token.name, equals("ServiceDep"));
      expect(deps[2].isAttribute, isTrue);
      expect(deps[3].isSelf, isTrue);
      expect(deps[4].isSkipSelf, isTrue);
      expect(deps[5].isOptional, isTrue);
      expect(deps[6].query.selectors[0].name, equals("ServiceDep"));
      expect(deps[6].query.descendants, isTrue);
      expect(deps[7].viewQuery.selectors[0], equals("one"));
      expect(deps[7].viewQuery.selectors[1], equals("two"));
    });

    test('should populate `diDependency` using a string token.', () async {
      var cmp = (await _testCreateModel('directives_files/components.dart'))
          .identifiers['ComponentWithDiDepsStrToken'];

      var deps = cmp.type.diDeps;
      expect(deps, isNotNull);
      expect(deps.length, equals(1));
      expect(deps[0].token, equals("StringDep"));
    });

    test('should populate `services`.', () async {
      var service = (await _testCreateModel('directives_files/services.dart'))
          .identifiers['Service'];

      expect(service, isNotNull);

      var deps = service.diDeps;
      expect(deps, isNotNull);
      expect(deps.length, equals(2));
      expect(deps[0].token.name, equals("ServiceDep"));
      expect(deps[1].token.name, equals("ServiceDep"));
    });

    test('should populate `providers` using types.', () async {
      var cmp = (await _testCreateModel('directives_files/components.dart'))
          .identifiers['ComponentWithProvidersTypes'];

      expect(cmp, isNotNull);
      expect(cmp.providers, isNotNull);
      expect(cmp.providers.length, equals(2));

      var firstToken = cmp.providers.first.token;
      expect(firstToken.prefix, isNull);
      expect(firstToken.name, equals("ServiceDep"));

      var secondToken = cmp.providers[1].token;
      expect(secondToken.prefix, equals("dep2"));
      expect(secondToken.name, equals("ServiceDep"));
    });

    test('should populate `providers` using useClass.', () async {
      var cmp = (await _testCreateModel('directives_files/components.dart'))
          .identifiers['ComponentWithProvidersUseClass'];

      expect(cmp, isNotNull);
      expect(cmp.providers, isNotNull);
      expect(cmp.providers.length, equals(1));

      var token = cmp.providers.first.token;
      var useClass = cmp.providers.first.useClass;
      expect(token.prefix, isNull);
      expect(token.name, equals("ServiceDep"));

      expect(useClass.prefix, isNull);
      expect(useClass.name, equals("ServiceDep"));
    });

    test('should populate `providers` using a string token.', () async {
      var cmp = (await _testCreateModel('directives_files/components.dart'))
          .identifiers['ComponentWithProvidersStringToken'];

      expect(cmp, isNotNull);
      expect(cmp.providers, isNotNull);
      expect(cmp.providers.length, equals(1));

      var token = cmp.providers.first.token;
      expect(token, equals("StringDep"));
    });

    test('should populate `providers` using a const token.', () async {
      var cmp = (await _testCreateModel('directives_files/components.dart'))
          .identifiers['ComponentWithProvidersConstToken'];

      expect(cmp, isNotNull);
      expect(cmp.providers, isNotNull);
      expect(cmp.providers.length, equals(1));

      var token = cmp.providers.first.token;
      expect(token.name, equals("ServiceDep"));
      expect(token.constConstructor, isTrue);
    });

    test('should merge `outputs` from the annotation and fields.', () async {
      var model = await _testCreateModel('directives_files/components.dart');
      expect(
          model.identifiers['ComponentWithOutputs'].outputs,
          equals({
            'a': 'a',
            'b': 'b',
            'c': 'renamed',
            'd': 'd',
            'e': 'get-renamed'
          }));
    });

    test('should merge `inputs` from the annotation and fields.', () async {
      var model = await _testCreateModel('directives_files/components.dart');
      expect(
          model.identifiers['ComponentWithInputs'].inputs,
          equals({
            'a': 'a',
            'b': 'b',
            'c': 'renamed',
            'd': 'd',
            'e': 'set-renamed'
          }));
    });

    test('should merge host bindings from the annotation and fields.',
        () async {
      var model = await _testCreateModel('directives_files/components.dart');
      expect(
          model.identifiers['ComponentWithHostBindings'].hostProperties,
          equals({
            'a': 'a',
            'b': 'b',
            'renamed': 'c',
            'd': 'd',
            'get-renamed': 'e'
          }));
    });

    test('should merge host listeners from the annotation and fields.',
        () async {
      var model = await _testCreateModel('directives_files/components.dart');
      expect(
          model.identifiers['ComponentWithHostListeners'].hostListeners,
          equals({
            'a': 'onA()',
            'b': 'onB()',
            'c': 'onC(\$event.target,\$event.target.value)'
          }));
    });

    test('should warn if @Component has a `template` and @View is present.',
        () async {
      final logger = new RecordingLogger();
      final model = await _testCreateModel('bad_directives_files/template.dart',
          logger: logger);
      var warning =
          logger.logs.firstWhere((l) => l.contains('WARN'), orElse: () => null);
      expect(warning, isNotNull);
      expect(warning.toLowerCase(),
          contains('cannot specify view parameters on @component'));
    });

    test('should warn if @Component has a `templateUrl` and @View is present.',
        () async {
      final logger = new RecordingLogger();
      final model = await _testCreateModel(
          'bad_directives_files/template_url.dart',
          logger: logger);
      var warning =
          logger.logs.firstWhere((l) => l.contains('WARN'), orElse: () => null);
      expect(warning, isNotNull);
      expect(warning.toLowerCase(),
          contains('cannot specify view parameters on @component'));
    });

    test('should warn if @Component has `directives` and @View is present.',
        () async {
      final logger = new RecordingLogger();
      final model = await _testCreateModel(
          'bad_directives_files/directives.dart',
          logger: logger);
      var warning =
          logger.logs.firstWhere((l) => l.contains('WARN'), orElse: () => null);
      expect(warning, isNotNull);
      expect(warning.toLowerCase(),
          contains('cannot specify view parameters on @component'));
    });

    test('should warn if @Component has `pipes` and @View is present.',
        () async {
      final logger = new RecordingLogger();
      final model = await _testCreateModel('bad_directives_files/pipes.dart',
          logger: logger);
      var warning =
          logger.logs.firstWhere((l) => l.contains('WARN'), orElse: () => null);
      expect(warning, isNotNull);
      expect(warning.toLowerCase(),
          contains('cannot specify view parameters on @component'));
    });
  });

  group('pipes', () {
    test('should read the pipe name', () async {
      var model = await _testCreateModel('pipe_files/pipes.dart');
      expect(model.identifiers['NameOnlyPipe'].name, equals('nameOnly'));
      expect(model.identifiers['NameOnlyPipe'].pure, isFalse);
    });

    test('should read the pure flag', () async {
      var model = await _testCreateModel('pipe_files/pipes.dart');
      expect(model.identifiers['NameAndPurePipe'].pure, isTrue);
    });
  });
}

Future<NgMeta> _testCreateModel(String inputPath,
    {List<AnnotationDescriptor> customDescriptors: const [],
    AssetId assetId,
    AssetReader reader,
    TransformLogger logger}) {
  if (logger == null) logger = new RecordingLogger();
  return zone.exec(() async {
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
  }, log: logger);
}

AssetId _assetIdForPath(String path) =>
    new AssetId('angular2', 'test/transform/directive_processor/$path');
