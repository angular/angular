library angular2.test.transform.template_compiler.all_tests;

import 'dart:async';
import 'dart:convert';

import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;
import 'package:guinness/guinness.dart';

import 'package:angular2/src/core/change_detection/codegen_name_util.dart'
    show CONTEXT_ACCESSOR;
import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/transform/template_compiler/generator.dart';
import 'package:angular2/src/transform/common/zone.dart' as zone;

import '../common/compile_directive_metadata/ng_for.ng_meta.dart' as ngMeta;
import '../common/ng_meta_helper.dart';
import '../common/read_file.dart';
import '../common/recording_logger.dart';

var formatter = new DartFormatter();
TestAssetReader reader;
RecordingLogger logger;

main() => allTests();

var fooComponentMeta, fooNgMeta, fooAssetId;
var barComponentMeta, barNgMeta, barAssetId;
var bazComponentMeta, bazNgMeta, bazAssetId;

/// Call after making changes to `fooNgMeta`, `barNgMeta`, or `bazNgMeta` and
/// before trying to read them from `reader`.
TestAssetReader updateReader() => reader
  ..addAsset(fooAssetId, JSON.encode(fooNgMeta.toJson()))
  ..addAsset(barAssetId, JSON.encode(barNgMeta.toJson()))
  ..addAsset(bazAssetId, JSON.encode(bazNgMeta.toJson()));

void allTests() {
  Html5LibDomAdapter.makeCurrent();

  final moduleBase = 'asset:a';

  beforeEach(() {
    reader = new TestAssetReader()
      ..addAsset(
          new AssetId('angular2', 'lib/src/directives/ng_for.ng_meta.json'),
          JSON.encode(ngMeta.ngFor));

    // Establish some test NgMeta objects with one Component each.
    // NOTE(kegluneq): For simplicity, the NgDepsModel objects created here are
    // lacking some details that would be created by DirectiveProcessor but
    // which are not used in the template compiler.
    fooComponentMeta = createFoo(moduleBase);
    fooNgMeta = new NgMeta(ngDeps: new NgDepsModel()
      ..libraryUri = 'test.foo'
      ..reflectables.add(new ReflectionInfoModel()..name = fooComponentMeta.type.name));
    fooNgMeta.types[fooComponentMeta.type.name] = fooComponentMeta;

    barComponentMeta = createBar(moduleBase);
    barNgMeta = new NgMeta(ngDeps: new NgDepsModel()
      ..libraryUri = 'test.bar'
      ..reflectables.add(new ReflectionInfoModel()..name = barComponentMeta.type.name));
    barNgMeta.types[barComponentMeta.type.name] = barComponentMeta;

    bazComponentMeta = createBaz(moduleBase);
    bazNgMeta = new NgMeta(ngDeps: new NgDepsModel()
      ..libraryUri = 'test.baz'
      ..reflectables.add(new ReflectionInfoModel()..name = bazComponentMeta.type.name));
    barNgMeta.types[bazComponentMeta.type.name] = bazComponentMeta;

    fooAssetId = new AssetId('a', 'lib/foo.ng_meta.json');
    barAssetId = new AssetId('a', 'lib/bar.ng_meta.json');
    bazAssetId = new AssetId('a', 'lib/baz.ng_meta.json');
    updateReader();
  });

  Future<String> process(AssetId assetId, {List<String> ambientDirectives}) {
    logger = new RecordingLogger();
    return zone.exec(
        () => processTemplates(reader, assetId,
            ambientDirectives: ambientDirectives),
        log: logger);
  }

  // TODO(tbosch): This is just a temporary test that makes sure that the dart
  // server and dart browser is in sync.
  it('should not contain notifyBinding', () async {
    fooComponentMeta.template = new CompileTemplateMetadata(
        template: '<li *ng-for="#thing of things"><div>test</div></li>');
    final viewAnnotation = new AnnotationModel()
      ..name = 'View'
      ..isView = true;
    fooNgMeta.ngDeps.reflectables.first.annotations.add(viewAnnotation);
    fooNgMeta.ngDeps.reflectables.first.directives
        .add(new PrefixedDirective()..name = 'NgFor');
    fooNgMeta.ngDeps.imports.add(
        new ImportModel()..uri = 'package:angular2/src/directives/ng_for.dart');

    reader.addAsset(new AssetId('angular2', 'lib/src/directives/ng_for.dart'),
        JSON.encode(ngMeta.ngFor));

    updateReader();

    final outputs = await process(fooAssetId);
    // TODO(kegluenq): Does this next line need to be updated as well?
    expect(outputs.templatesCode).not.toContain('notifyDispatcher');
  });

  it('should parse simple expressions in inline templates.', () async {
    fooComponentMeta.template = new CompileTemplateMetadata(
        template: '<div [a]="b">{{greeting}}</div>',
        templateUrl: 'template.html');
    updateReader();

    final outputs = await process(fooAssetId);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps).toBeNotNull();
    expect(ngDeps.imports).toContain(new ImportModel()
      ..uri = 'foo.template.dart'
      ..prefix = '_templates');
    expect(ngDeps.reflectables.first.annotations)
        .toContain(new AnnotationModel()
          ..name = '_templates.HostFooComponentTemplate'
          ..isConstObject = true);
    expect(outputs.templatesCode)
      ..toContain('$CONTEXT_ACCESSOR.greeting')
      ..toContain('$CONTEXT_ACCESSOR.b');
  });

  it('should parse simple methods in inline templates.', () async {
    fooComponentMeta.template = new CompileTemplateMetadata(
        template: '<button (click)="action()">go</button>',
        templateUrl: 'template.html');
    updateReader();

    final outputs = await process(fooAssetId);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps).toBeNotNull();
    expect(ngDeps.imports).toContain(new ImportModel()
      ..uri = 'foo.template.dart'
      ..prefix = '_templates');
    expect(ngDeps.reflectables.first.annotations)
        .toContain(new AnnotationModel()
          ..name = '_templates.HostFooComponentTemplate'
          ..isConstObject = true);
    expect(outputs.templatesCode)..toContain('$CONTEXT_ACCESSOR.action()');
  });

  it('should parse `View` directives with a single dependency.', () async {
    fooComponentMeta.template =
        new CompileTemplateMetadata(template: '<${barComponentMeta.selector}>');
    final viewAnnotation = new AnnotationModel()
      ..name = 'View'
      ..isView = true;
    viewAnnotation.namedParameters.add(new NamedParameter()
      ..name = 'directives'
      ..value = 'const [${barComponentMeta.type.name}]');
    fooNgMeta.ngDeps.reflectables.first.annotations.add(viewAnnotation);
    fooNgMeta.ngDeps.reflectables.first.directives
        .add(new PrefixedDirective()..name = barComponentMeta.type.name);
    fooNgMeta.ngDeps.imports.add(new ImportModel()..uri = 'bar.dart');
    barComponentMeta.template =
        new CompileTemplateMetadata(template: 'BarTemplate');
    updateReader();

    final outputs = await process(fooAssetId);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps).toBeNotNull();
    expect(ngDeps.imports).toContain(new ImportModel()
      ..uri = 'foo.template.dart'
      ..prefix = '_templates');
    expect(ngDeps.reflectables.first.annotations)
        .toContain(new AnnotationModel()
          ..name = '_templates.HostFooComponentTemplate'
          ..isConstObject = true);

    expect(outputs.templatesCode)
      ..toContain("import 'bar.dart'")
      ..toContain("import 'bar.template.dart'");
  });

  it('should parse `View` directives with a single prefixed dependency.',
      () async {
    fooComponentMeta.template =
        new CompileTemplateMetadata(template: '<${barComponentMeta.selector}>');
    final componentAnnotation = new AnnotationModel()
      ..name = 'View'
      ..isView = true;
    fooNgMeta.ngDeps.reflectables.first.annotations.add(componentAnnotation);
    fooNgMeta.ngDeps.reflectables.first.directives.add(new PrefixedDirective()
      ..name = barComponentMeta.type.name
      ..prefix = 'prefix');
    fooNgMeta.ngDeps.imports.add(new ImportModel()
      ..uri = 'bar.dart'
      ..prefix = 'prefix');
    barComponentMeta.template =
        new CompileTemplateMetadata(template: 'BarTemplate');
    updateReader();

    final outputs = await process(fooAssetId);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps).toBeNotNull();
    expect(ngDeps.imports).toContain(new ImportModel()
      ..uri = 'foo.template.dart'
      ..prefix = '_templates');
    expect(ngDeps.reflectables.first.annotations)
        .toContain(new AnnotationModel()
          ..name = '_templates.HostFooComponentTemplate'
          ..isConstObject = true);

    expect(outputs.templatesCode)
      ..toContain("import 'bar.dart'")
      ..toContain("import 'bar.template.dart'");
  });

  it('should include directives mentioned in directive aliases.', () async {
    fooComponentMeta.template =
        new CompileTemplateMetadata(template: '<${barComponentMeta.selector}>');
    final componentAnnotation = new AnnotationModel()
      ..name = 'View'
      ..isView = true;
    fooNgMeta.ngDeps.reflectables.first.annotations.add(componentAnnotation);
    fooNgMeta.ngDeps.reflectables.first.directives
        .add(new PrefixedDirective()..name = 'directiveAlias');
    fooNgMeta.ngDeps.imports.add(new ImportModel()..uri = 'bar.dart');

    fooNgMeta.aliases['directiveAlias'] = [barComponentMeta.type.name];
    barComponentMeta.template =
        new CompileTemplateMetadata(template: 'BarTemplate');
    updateReader();

    final outputs = await process(fooAssetId);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps).toBeNotNull();
    expect(ngDeps.imports).toContain(new ImportModel()
      ..uri = 'foo.template.dart'
      ..prefix = '_templates');
    expect(ngDeps.reflectables.first.annotations)
        .toContain(new AnnotationModel()
          ..name = '_templates.HostFooComponentTemplate'
          ..isConstObject = true);

    expect(outputs.templatesCode)
      ..toContain("import 'bar.dart'")
      ..toContain("import 'bar.template.dart'");
  });

  it('should create the same output for multiple calls.', () async {
    fooComponentMeta.template = new CompileTemplateMetadata(
        template: '<div [a]="b">{{greeting}}</div>',
        templateUrl: 'template.html');
    updateReader();

    final firstOutputs = await process(fooAssetId);
    final secondOutputs = await process(fooAssetId);
    expect(firstOutputs.ngDeps).toEqual(secondOutputs.ngDeps);
    expect(firstOutputs.templatesCode).toEqual(secondOutputs.templatesCode);
  });

  it('should generate getters for Component#outputs.', () async {
    fooComponentMeta.template = new CompileTemplateMetadata(
        template: '<div>{{greeting}}</div>', templateUrl: 'template.html');
    fooComponentMeta.outputs = {'eventName': 'eventName'};
    updateReader();

    final outputs = await process(fooAssetId);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps.getters).toContain('eventName');
  });

  it('should generate getters for Directive#outputs.', () async {
    fooComponentMeta
      ..template = null
      ..isComponent = false;
    fooComponentMeta.outputs = {'eventName': 'eventName'};
    updateReader();

    final outputs = await process(fooAssetId);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps.getters).toContain('eventName');
  });

  it('should generate setters for Component#inputs.', () async {
    fooComponentMeta.template = new CompileTemplateMetadata(
        template: '<div>{{greeting}}</div>', templateUrl: 'template.html');
    fooComponentMeta.inputs = {'text': 'tool-tip'};
    updateReader();

    final outputs = await process(fooAssetId);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps.setters).toContain('text');
  });

  it('should generate setters for Directive#inputs.', () async {
    fooComponentMeta
      ..template = null
      ..isComponent = false;
    fooComponentMeta.inputs = {'text': 'tool-tip'};
    updateReader();

    final outputs = await process(fooAssetId);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps.setters).toContain('text');
  });

  it(
      'should generate a single setter for two `Directive`s '
      'with the same inputs.', () async {
    fooComponentMeta
      ..template = null
      ..isComponent = false;
    fooComponentMeta.inputs = {'text': 'tool-tip'};
    barComponentMeta
      ..template = null
      ..isComponent = false;
    barComponentMeta.inputs = {'text': 'tool-tip'};
    updateReader();

    final outputs = await process(fooAssetId);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps.setters).toContain('text');
    expect(ngDeps.setters.length).toEqual(1);
  });

  it('should gracefully handle null .ng_meta.json files', () async {
    final dne =
        new AssetId('package', 'lib/file_that_does_not_exist.ng_meta.json');

    var didThrow = false;
    await process(dne).then((out) {
      expect(out).toBeNull();
    }).catchError((_) {
      didThrow = true;
    });

    expect(didThrow).toBeFalse();
  });

  it('should gracefully handle empty .ng_meta.json files', () async {
    final emptyId = new AssetId('package', 'lib/empty.ng_meta.json');
    reader.addAsset(emptyId, '');

    var didThrow = false;
    await process(emptyId).then((out) {
      expect(out).toBeNull();
    }).catchError((_) {
      didThrow = true;
    });

    expect(didThrow).toBeFalse();
  });

  it('should include ambient directives.', () async {
    fooComponentMeta.template = new CompileTemplateMetadata(template: '<bar/>');
    final viewAnnotation = new AnnotationModel()
      ..name = 'View'
      ..isView = true;

    barNgMeta.aliases['AMBIENT'] = [barComponentMeta.type.name];
    updateReader();

    final outputs = await process(fooAssetId,
        ambientDirectives: ['package:a/bar.dart#AMBIENT']);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps).toBeNotNull();
    expect(outputs.templatesCode)
      ..toBeNotNull()
      ..toContain(barComponentMeta.template.template);
  });

  it('should include ambient directives when it it a list.', () async {
    fooComponentMeta.template = new CompileTemplateMetadata(template: '<bar/>');
    final viewAnnotation = new AnnotationModel()
      ..name = 'View'
      ..isView = true;

    barNgMeta.types['AMBIENT'] = barComponentMeta;
    updateReader();

    final outputs = await process(fooAssetId,
        ambientDirectives: ['package:a/bar.dart#AMBIENT']);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps).toBeNotNull();
    expect(outputs.templatesCode)
      ..toBeNotNull()
      ..toContain(barComponentMeta.template.template);
  });

  it('should work when ambient directives config is null.', () async {
    final outputs = await process(fooAssetId, ambientDirectives: null);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps).toBeNotNull();
  });

  it('should work when the ambient directives config is not formatted properly.',
      () async {
    final outputs = await process(fooAssetId, ambientDirectives: ['INVALID']);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps).toBeNotNull();
  });

  it('should work when the file with ambient directives cannot be found.',
      () async {
    final outputs = await process(fooAssetId,
        ambientDirectives: ['package:a/invalid.dart#AMBIENT']);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps).toBeNotNull();
  });

  it('should work when the ambient directives token cannot be found.',
      () async {
    final outputs = await process(fooAssetId,
        ambientDirectives: ['package:a/bar.dart#AMBIENT']);
    final ngDeps = outputs.ngDeps;
    expect(ngDeps).toBeNotNull();
  });
}

void _formatThenExpectEquals(String actual, String expected) {
  expect(formatter.format(actual)).toEqual(formatter.format(expected));
}
