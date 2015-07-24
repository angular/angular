library angular.test.transform.artifact_consumer.all_tests;

import 'package:angular2/src/transform/artifact_consumer/transformer.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:barback/barback.dart';
import 'package:guinness/guinness.dart';

main() => allTests();

allTests() {
  var transformer = new ArtifactConsumer(new TransformerOptions([]));

  it('should apply to .ng_meta.json files', () {
    expect(transformer.isPrimary(new AssetId('foo', 'foo.ng_meta.json')))
        .toBeTrue();
  });

  it('should apply to .aliases.json files', () {
    expect(transformer.isPrimary(new AssetId('foo', 'foo.aliases.json')))
        .toBeTrue();
  });

  it('should not apply if cleanupBuildArtifacts is false', () {
    var transformer = new ArtifactConsumer(
        new TransformerOptions([], cleanupBuildArtifacts: false));
    expect(transformer.isPrimary(new AssetId('foo', 'foo.ng_meta.json')))
        .toBeFalse();
    expect(transformer.isPrimary(new AssetId('foo', 'foo.aliases.json')))
        .toBeFalse();
  });

  it('should not apply to dart files', () {
    expect(transformer.isPrimary(new AssetId('foo', 'foo.dart'))).toBeFalse();
  });

  it('apply should consume primary input', () {
    var transform = new RecordingTransform();
    transformer.apply(transform);
    expect(transform.consumePrimaryCalled).toBeTrue();
  });
}

// Simple transform which records when consumePrimary is called.
class RecordingTransform implements Transform {
  bool consumePrimaryCalled = false;

  // The only function we actually do anything with.
  consumePrimary() {
    consumePrimaryCalled = true;
  }

  // Stub out everything else.
  AssetId get primaryInput => throw new UnimplementedError();
  TransformLogger get logger => throw new UnimplementedError();
  Future<Asset> getInput(AssetId id) => throw new UnimplementedError();
  Future<String> readInputAsString(AssetId id, {Encoding encoding}) =>
      throw new UnimplementedError();
  Stream<List<int>> readInput(AssetId id) => throw new UnimplementedError();
  Future<bool> hasInput(AssetId id) => throw new UnimplementedError();
  void addOutput(Asset output) => throw new UnimplementedError();
}
