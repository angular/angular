library angular2.test.transform.stylesheet_compiler.all_tests;

import 'dart:async';
import 'dart:convert';

import 'package:angular2/src/transform/stylesheet_compiler/transformer.dart';

import 'package:barback/barback.dart';
import 'package:guinness/guinness.dart';

const SIMPLE_CSS = '''
.foo {
  width: 10px;
}
''';

main() {
  Html5LibDomAdapter.makeCurrent();
  allTests();
}

allTests() {
  StylesheetCompiler subject;

  beforeEach(() {
    subject = new StylesheetCompiler();
  });

  it('should accept CSS assets', () {
    expect(subject.isPrimary(new AssetId('somepackage', 'lib/style.css'))).toBe(true);
  });

  it('should reject non-CSS assets', () {
    expect(subject.isPrimary(new AssetId('somepackage', 'lib/style.scss'))).toBe(false);
  });

  it('should declare outputs', () {
    var transform = new FakeDeclaringTransform()
      ..primaryId = new AssetId('somepackage', 'lib/style.css');
    subject.declareOutputs(transform);
    expect(transform.outputs.length).toBe(2);
    expect(transform.outputs[0].toString())
        .toEqual('somepackage|lib/style.css.dart');
    expect(transform.outputs[1].toString())
        .toEqual('somepackage|lib/style.css.shim.dart');
  });

  it('should compile stylesheets', () async {
    var cssFile = new Asset.fromString(
        new AssetId('somepackage', 'lib/style.css'), SIMPLE_CSS);
    var transform = new FakeTransform()..primaryInput = cssFile;
    await subject.apply(transform);
    expect(transform.outputs.length).toBe(2);
    expect(transform.outputs[0].id.toString())
        .toEqual('somepackage|lib/style.css.dart');
    expect(transform.outputs[1].id.toString())
        .toEqual('somepackage|lib/style.css.shim.dart');
  });
}

@proxy
class FakeTransform implements Transform {
  final outputs = <Asset>[];
  Asset primaryInput;

  addOutput(Asset output) {
    this.outputs.add(output);
  }

  noSuchMethod(Invocation i) {
    throw '${i.memberName} not implemented';
  }
}

@proxy
class FakeDeclaringTransform implements DeclaringTransform {
  final outputs = <AssetId>[];
  AssetId primaryId;

  declareOutput(AssetId output) {
    this.outputs.add(output);
  }

  noSuchMethod(Invocation i) {
    throw '${i.memberName} not implemented';
  }
}
