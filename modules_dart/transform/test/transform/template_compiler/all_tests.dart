library angular2.test.transform.template_compiler.all_tests;

import 'dart:async';
import 'dart:convert';

import 'package:barback/barback.dart';
import 'package:angular2/src/core/change_detection/codegen_name_util.dart'
    show CONTEXT_ACCESSOR;
import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/template_compiler/generator.dart';
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;
import 'package:guinness/guinness.dart';

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

  Future<String> process(AssetId assetId) {
    logger = new RecordingLogger();
    return log.setZoned(logger,
        () => processTemplates(reader, assetId));
  }

  // TODO(tbosch): This is just a temporary test that makes sure that the dart
  // server and dart browser is in sync.
  it('should not contain notifyBinding', () async {
    fooComponentMeta.template = new CompileTemplateMetadata(
        template: '<li *ng-for="#thing of things"><div>test</div></li>');
    final viewAnnotation = new AnnotationModel()
      ..name = 'View'
      ..isView = true;
    viewAnnotation.namedParameters.add(new NamedParameter()
      ..name = 'directives'
      ..value = 'const [NgFor]');
    fooNgMeta.ngDeps.reflectables.first.annotations.add(viewAnnotation);
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

  it('should handle `directives` regardless of annotation ordering', () async {
    fooComponentMeta.template =
    new CompileTemplateMetadata(template: '<${barComponentMeta.selector}>');
    final viewAnnotation = new AnnotationModel()
      ..name = 'View'
      ..isView = true;
    final directivesParameter = new NamedParameter()
      ..name = 'directives'
      ..value = 'const [${barComponentMeta.type.name}]';
    viewAnnotation.namedParameters.add(directivesParameter);
    final componentAnnotation = new AnnotationModel()
      ..name = 'Component'
      ..isComponent = true;
    fooNgMeta.ngDeps.reflectables.first.annotations
        .addAll([viewAnnotation, componentAnnotation]);
    fooNgMeta.ngDeps.imports.add(new ImportModel()..uri = 'bar.dart');
    barComponentMeta.template =
    new CompileTemplateMetadata(template: 'BarTemplate');
    updateReader();

    final viewFirstOutputs = await process(fooAssetId);

    fooNgMeta.ngDeps.reflectables.first.annotations.clear();
    fooNgMeta.ngDeps.reflectables.first.annotations
        .addAll([componentAnnotation, viewAnnotation]);
    updateReader();

    final componentFirstOutputs = await process(fooAssetId);

    expect(viewFirstOutputs.templatesCode).toEqual(componentFirstOutputs.templatesCode);
  });

  it('should handle `directives` on @Component or @View', () async {
    fooComponentMeta.template =
    new CompileTemplateMetadata(template: '<${barComponentMeta.selector}>');
    final viewAnnotation = new AnnotationModel()
      ..name = 'View'
      ..isView = true;
    final directivesParameter = new NamedParameter()
      ..name = 'directives'
      ..value = 'const [${barComponentMeta.type.name}]';
    viewAnnotation.namedParameters.add(directivesParameter);
    final componentAnnotation = new AnnotationModel()
      ..name = 'Component'
      ..isComponent = true;
    fooNgMeta.ngDeps.reflectables.first.annotations
        .addAll([viewAnnotation, componentAnnotation]);
    fooNgMeta.ngDeps.imports.add(new ImportModel()..uri = 'bar.dart');
    barComponentMeta.template =
    new CompileTemplateMetadata(template: 'BarTemplate');
    updateReader();

    final onViewOutputs = await process(fooAssetId);

    viewAnnotation.namedParameters.clear();
    componentAnnotation.namedParameters.add(directivesParameter);
    updateReader();

    final onComponentOutputs = await process(fooAssetId);

    expect(onComponentOutputs.templatesCode).toEqual(onViewOutputs.templatesCode);
  });

  it('should parse `View` directives with a single prefixed dependency.',
      () async {
    fooComponentMeta.template =
        new CompileTemplateMetadata(template: '<${barComponentMeta.selector}>');
    final componentAnnotation = new AnnotationModel()
      ..name = 'View'
      ..isView = true;
    componentAnnotation.namedParameters.add(new NamedParameter()
      ..name = 'directives'
      ..value = 'const [prefix.${barComponentMeta.type.name}]');
    fooNgMeta.ngDeps.reflectables.first.annotations.add(componentAnnotation);
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
    final directivesParam = new NamedParameter()
      ..name = 'directives'
      ..value = 'const [directiveAlias]';
    componentAnnotation.namedParameters.add(directivesParam);
    fooNgMeta.ngDeps.reflectables.first.annotations.add(componentAnnotation);
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
}

void _formatThenExpectEquals(String actual, String expected) {
  expect(formatter.format(actual)).toEqual(formatter.format(expected));
}
