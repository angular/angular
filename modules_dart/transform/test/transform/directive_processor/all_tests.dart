library angular2.test.transform.directive_processor.all_tests;

import 'dart:async';

import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';

import 'package:angular2/src/compiler/directive_metadata.dart' show CompileIdentifierMetadata;
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

      expect(ngMeta.identifiers.isNotEmpty).toBeTrue();
      expect(ngMeta.identifiers['ChangingSoupComponent']).toBeNotNull();
      expect(ngMeta.identifiers['ChangingSoupComponent'].selector).toEqual('[soup]');
      expect(ngMeta.identifiers['ChangingSoupComponent'].lifecycleHooks)
          .toContain(LifecycleHooks.OnChanges);
    });

    it('should include hooks for implemented types (many)', () async {
      var ngMeta = await _testCreateModel(
          'multiple_interface_lifecycle_files/soup.dart');

      expect(ngMeta.identifiers.isNotEmpty).toBeTrue();
      expect(ngMeta.identifiers['MultiSoupComponent']).toBeNotNull();
      expect(ngMeta.identifiers['MultiSoupComponent'].selector).toEqual('[soup]');
      expect(ngMeta.identifiers['MultiSoupComponent'].lifecycleHooks)
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

      expect(ngMeta.identifiers.isNotEmpty).toBeTrue();
      expect(ngMeta.identifiers['HelloCmp']).toBeNotNull();
      expect(ngMeta.identifiers['HelloCmp'].selector).toEqual('hello-app');
    });

    it('should populate all provided values for Components & Directives',
        () async {
      var ngMeta = await _testCreateModel('unusual_component_files/hello.dart');

      expect(ngMeta.identifiers.isNotEmpty).toBeTrue();

      var component = ngMeta.identifiers['UnusualComp'];
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

      var directive = ngMeta.identifiers['UnusualDirective'];
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

      expect(ngMeta.identifiers.isNotEmpty).toBeTrue();
      expect(ngMeta.identifiers['ChangingSoupComponent']).toBeNotNull();
      expect(ngMeta.identifiers['ChangingSoupComponent'].selector).toEqual('[soup]');
      expect(ngMeta.identifiers['ChangingSoupComponent'].lifecycleHooks)
          .toContain(LifecycleHooks.OnChanges);
    });

    it('should include hooks for implemented types (many)', () async {
      var ngMeta = await _testCreateModel(
          'multiple_interface_lifecycle_files/soup.dart');

      expect(ngMeta.identifiers.isNotEmpty).toBeTrue();
      expect(ngMeta.identifiers['MultiSoupComponent']).toBeNotNull();
      expect(ngMeta.identifiers['MultiSoupComponent'].selector).toEqual('[soup]');
      expect(ngMeta.identifiers['MultiSoupComponent'].lifecycleHooks)
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

      expect(ngMeta.identifiers.isNotEmpty).toBeTrue();
      expect(ngMeta.identifiers['HelloCmp']).toBeNotNull();
      expect(ngMeta.identifiers['HelloCmp'].template).toBeNotNull();
      expect(ngMeta.identifiers['HelloCmp'].template.templateUrl)
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

  describe("identifiers", () {
    it("should populate `identifier` with class types.", () async {
      var model = (await _testCreateModel('identifiers/classes.dart'));
      final moduleUrl = "asset:angular2/test/transform/directive_processor/identifiers/classes.dart";
      expect(model.identifiers['Service1'].name).toEqual('Service1');
      expect(model.identifiers['Service1'].moduleUrl).toEqual(moduleUrl);
      expect(model.identifiers['Service2'].name).toEqual('Service2');
      expect(model.identifiers['Service2'].moduleUrl).toEqual(moduleUrl);
    });

    it("should populate `identifier` with constants.", () async {
      var model = (await _testCreateModel('identifiers/constants.dart'));
      final moduleUrl = "asset:angular2/test/transform/directive_processor/identifiers/constants.dart";
      expect(model.identifiers['a']).
        toHaveSameProps(new CompileIdentifierMetadata(name: 'a', moduleUrl: moduleUrl));
      expect(model.identifiers['b']).
        toHaveSameProps(new CompileIdentifierMetadata(name: 'b', moduleUrl: moduleUrl));
      expect(model.identifiers['c']).toBeNull();
    });
  });

  describe('directives', () {
    final reflectableNamed = (NgDepsModel model, String name) {
      return model.reflectables
          .firstWhere((r) => r.name == name, orElse: () => null);
    };

    it('should populate `directives` from @View value specified second.',
        () async {
      var model =
          (await _testCreateModel('directives_files/components.dart')).ngDeps;
      final componentFirst = reflectableNamed(model, 'ComponentFirst');
      expect(componentFirst).toBeNotNull();
      expect(componentFirst.directives).toBeNotNull();
      expect(componentFirst.directives.length).toEqual(2);
      expect(componentFirst.directives.first)
          .toEqual(new PrefixedType()..name = 'Dep');
      expect(componentFirst.directives[1]).toEqual(new PrefixedType()
        ..name = 'Dep'
        ..prefix = 'dep2');
    });

    it('should populate `directives` from @View value specified first.',
        () async {
      var model =
          (await _testCreateModel('directives_files/components.dart')).ngDeps;
      final viewFirst = reflectableNamed(model, 'ViewFirst');
      expect(viewFirst).toBeNotNull();
      expect(viewFirst.directives).toBeNotNull();
      expect(viewFirst.directives.length).toEqual(2);
      expect(viewFirst.directives.first).toEqual(new PrefixedType()
        ..name = 'Dep'
        ..prefix = 'dep2');
      expect(viewFirst.directives[1]).toEqual(new PrefixedType()..name = 'Dep');
    });

    it('should populate `directives` from @Component value with no @View.',
        () async {
      var model =
          (await _testCreateModel('directives_files/components.dart')).ngDeps;
      final componentOnly = reflectableNamed(model, 'ComponentOnly');
      expect(componentOnly).toBeNotNull();
      expect(componentOnly.directives).toBeNotNull();
      expect(componentOnly.directives.length).toEqual(2);
      expect(componentOnly.directives.first)
          .toEqual(new PrefixedType()..name = 'Dep');
      expect(componentOnly.directives[1]).toEqual(new PrefixedType()
        ..name = 'Dep'
        ..prefix = 'dep2');
    });

    it('should populate `pipes` from @View value specified second.', () async {
      var model =
          (await _testCreateModel('directives_files/components.dart')).ngDeps;
      final componentFirst = reflectableNamed(model, 'ComponentFirst');
      expect(componentFirst).toBeNotNull();
      expect(componentFirst.pipes).toBeNotNull();
      expect(componentFirst.pipes.length).toEqual(2);
      expect(componentFirst.pipes.first)
          .toEqual(new PrefixedType()..name = 'PipeDep');
      expect(componentFirst.pipes[1]).toEqual(new PrefixedType()
        ..name = 'PipeDep'
        ..prefix = 'dep2');
    });

    it('should populate `pipes` from @View value specified first.', () async {
      var model =
          (await _testCreateModel('directives_files/components.dart')).ngDeps;
      final viewFirst = reflectableNamed(model, 'ViewFirst');
      expect(viewFirst).toBeNotNull();
      expect(viewFirst.pipes).toBeNotNull();
      expect(viewFirst.pipes.length).toEqual(2);
      expect(viewFirst.pipes.first).toEqual(new PrefixedType()
        ..name = 'PipeDep'
        ..prefix = 'dep2');
      expect(viewFirst.pipes[1]).toEqual(new PrefixedType()..name = 'PipeDep');
    });

    it('should populate `pipes` from @Component value with no @View.',
        () async {
      var model =
          (await _testCreateModel('directives_files/components.dart')).ngDeps;
      final componentOnly = reflectableNamed(model, 'ComponentOnly');
      expect(componentOnly).toBeNotNull();
      expect(componentOnly.pipes).toBeNotNull();
      expect(componentOnly.pipes.length).toEqual(2);
      expect(componentOnly.pipes.first)
          .toEqual(new PrefixedType()..name = 'PipeDep');
      expect(componentOnly.pipes[1]).toEqual(new PrefixedType()
        ..name = 'PipeDep'
        ..prefix = 'dep2');
    });

    it('should populate `diDependency`.',
        () async {
      var cmp =
      (await _testCreateModel('directives_files/components.dart')).identifiers['ComponentWithDiDeps'];

      expect(cmp).toBeNotNull();
      var deps = cmp.type.diDeps;
      expect(deps).toBeNotNull();
      expect(deps.length).toEqual(2);
      expect(deps[0].token.name).toEqual("ServiceDep");
      expect(deps[1].token.name).toEqual("ServiceDep");
    });

    it('should populate `diDependency` using a string token.',
        () async {
      var cmp =
      (await _testCreateModel('directives_files/components.dart')).identifiers['ComponentWithDiDepsStrToken'];

      var deps = cmp.type.diDeps;
      expect(deps).toBeNotNull();
      expect(deps.length).toEqual(1);
      expect(deps[0].token).toEqual("StringDep");
    });

    it('should populate `services`.',
        () async {
      var service =
      (await _testCreateModel('directives_files/services.dart')).identifiers['Service'];

      expect(service).toBeNotNull();

      var deps = service.diDeps;
      expect(deps).toBeNotNull();
      expect(deps.length).toEqual(2);
      expect(deps[0].token.name).toEqual("ServiceDep");
      expect(deps[1].token.name).toEqual("ServiceDep");
    });

    it('should populate `providers` using types.',
        () async {
      var cmp =
          (await _testCreateModel('directives_files/components.dart')).identifiers['ComponentWithProvidersTypes'];

      expect(cmp).toBeNotNull();
      expect(cmp.providers).toBeNotNull();
      expect(cmp.providers.length).toEqual(2);

      var firstToken = cmp.providers.first.token;
      expect(firstToken.prefix).toEqual(null);
      expect(firstToken.name).toEqual("ServiceDep");

      var secondToken = cmp.providers[1].token;
      expect(secondToken.prefix).toEqual("dep2");
      expect(secondToken.name).toEqual("ServiceDep");
    });

    it('should populate `providers` using useClass.',
        () async {
      var cmp =
          (await _testCreateModel('directives_files/components.dart')).identifiers['ComponentWithProvidersUseClass'];

      expect(cmp).toBeNotNull();
      expect(cmp.providers).toBeNotNull();
      expect(cmp.providers.length).toEqual(1);

      var token = cmp.providers.first.token;
      var useClass = cmp.providers.first.useClass;
      expect(token.prefix).toEqual(null);
      expect(token.name).toEqual("ServiceDep");

      expect(useClass.prefix).toEqual(null);
      expect(useClass.name).toEqual("ServiceDep");
    });

    it('should populate `providers` using a string token.',
        () async {
      var cmp =
          (await _testCreateModel('directives_files/components.dart')).identifiers['ComponentWithProvidersStringToken'];

      expect(cmp).toBeNotNull();
      expect(cmp.providers).toBeNotNull();
      expect(cmp.providers.length).toEqual(1);

      var token = cmp.providers.first.token;
      expect(token).toEqual("StringDep");
    });

    it('should merge `outputs` from the annotation and fields.', () async {
      var model = await _testCreateModel('directives_files/components.dart');
      expect(model.identifiers['ComponentWithOutputs'].outputs).toEqual(
          {'a': 'a', 'b': 'b', 'c': 'renamed', 'd': 'd', 'e': 'get-renamed'});
    });

    it('should merge `inputs` from the annotation and fields.', () async {
      var model = await _testCreateModel('directives_files/components.dart');
      expect(model.identifiers['ComponentWithInputs'].inputs).toEqual(
          {'a': 'a', 'b': 'b', 'c': 'renamed', 'd': 'd', 'e': 'set-renamed'});
    });

    it('should merge host bindings from the annotation and fields.', () async {
      var model = await _testCreateModel('directives_files/components.dart');
      expect(model.identifiers['ComponentWithHostBindings'].hostProperties)
          .toEqual({'a': 'a', 'b': 'b', 'renamed': 'c', 'd': 'd', 'get-renamed': 'e'});
    });

    it('should merge host listeners from the annotation and fields.', () async {
      var model = await _testCreateModel('directives_files/components.dart');
      expect(model.identifiers['ComponentWithHostListeners'].hostListeners).toEqual({
        'a': 'onA()',
        'b': 'onB()',
        'c': 'onC(\$event.target,\$event.target.value)'
      });
    });

    it('should warn if @Component has a `template` and @View is present.',
        () async {
      final logger = new RecordingLogger();
      final model = await _testCreateModel('bad_directives_files/template.dart',
          logger: logger);
      var warning =
          logger.logs.firstWhere((l) => l.contains('WARN'), orElse: () => null);
      expect(warning).toBeNotNull();
      expect(warning.toLowerCase())
          .toContain('cannot specify view parameters on @component');
    });

    it('should warn if @Component has a `templateUrl` and @View is present.',
        () async {
      final logger = new RecordingLogger();
      final model = await _testCreateModel(
          'bad_directives_files/template_url.dart',
          logger: logger);
      var warning =
          logger.logs.firstWhere((l) => l.contains('WARN'), orElse: () => null);
      expect(warning).toBeNotNull();
      expect(warning.toLowerCase())
          .toContain('cannot specify view parameters on @component');
    });

    it('should warn if @Component has `directives` and @View is present.',
        () async {
      final logger = new RecordingLogger();
      final model = await _testCreateModel(
          'bad_directives_files/directives.dart',
          logger: logger);
      var warning =
          logger.logs.firstWhere((l) => l.contains('WARN'), orElse: () => null);
      expect(warning).toBeNotNull();
      expect(warning.toLowerCase())
          .toContain('cannot specify view parameters on @component');
    });

    it('should warn if @Component has `pipes` and @View is present.', () async {
      final logger = new RecordingLogger();
      final model = await _testCreateModel('bad_directives_files/pipes.dart',
          logger: logger);
      var warning =
          logger.logs.firstWhere((l) => l.contains('WARN'), orElse: () => null);
      expect(warning).toBeNotNull();
      expect(warning.toLowerCase())
          .toContain('cannot specify view parameters on @component');
    });
  });

  describe('pipes', () {
    it('should read the pipe name', () async {
      var model = await _testCreateModel('pipe_files/pipes.dart');
      expect(model.identifiers['NameOnlyPipe'].name).toEqual('nameOnly');
      expect(model.identifiers['NameOnlyPipe'].pure).toBe(false);
    });

    it('should read the pure flag', () async {
      var model = await _testCreateModel('pipe_files/pipes.dart');
      expect(model.identifiers['NameAndPurePipe'].pure).toBe(true);
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
