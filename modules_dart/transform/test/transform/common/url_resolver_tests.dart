library angular2.test.transform.common.url_resolver_tests;

import 'package:angular2/src/transform/common/url_resolver.dart';
import 'package:barback/barback.dart';
import 'package:guinness/guinness.dart';

main() => allTests();

void allTests() {
  var urlResolver = const TransformerUrlResolver();

  describe('toAssetUri', () {
    it('should convert `AssetId`s to asset: uris', () {
      var assetId = new AssetId('test_package', 'lib/src/impl.dart');
      expect(toAssetUri(assetId))
          .toEqual('asset:test_package/lib/src/impl.dart');
    });

    it('should throw if passed a null AssetId', () {
      expect(() => toAssetUri(null)).toThrowWith(anInstanceOf: ArgumentError);
    });
  });

  describe('fromUri', () {
    it('should convert asset: `uri`s to `AssetId`s', () {
      expect(fromUri('asset:test_package/lib/src/impl.dart'))
          .toEqual(new AssetId('test_package', 'lib/src/impl.dart'));
    });

    it('should convert package: `uri`s to `AssetId`s', () {
      expect(fromUri('package:test_package/src/impl.dart'))
          .toEqual(new AssetId('test_package', 'lib/src/impl.dart'));
    });

    it('should throw if passed a null uri', () {
      expect(() => fromUri(null)).toThrowWith(anInstanceOf: ArgumentError);
    });

    it('should throw if passed an empty uri', () {
      expect(() => fromUri('')).toThrowWith(anInstanceOf: ArgumentError);
    });
  });

  describe('isDartCoreUri', () {
    it('should detect dart: uris', () {
      expect(isDartCoreUri('dart:core')).toBeTrue();
      expect(isDartCoreUri('dart:convert')).toBeTrue();
      expect(isDartCoreUri('package:angular2/angular2.dart')).toBeFalse();
      expect(isDartCoreUri('asset:angular2/lib/angular2.dart')).toBeFalse();
    });

    it('should throw if passed a null uri', () {
      expect(() => isDartCoreUri(null))
          .toThrowWith(anInstanceOf: ArgumentError);
    });

    it('should throw if passed an empty uri', () {
      expect(() => isDartCoreUri('')).toThrowWith(anInstanceOf: ArgumentError);
    });
  });

  describe('toAssetScheme', () {
    it('should throw for relative `Uri`s', () {
      expect(() => toAssetScheme(Uri.parse('/lib/src/file.dart')))
          .toThrowWith(anInstanceOf: ArgumentError);
    });

    it('should convert package: `Uri`s to asset:', () {
      expect(toAssetScheme(Uri.parse('package:angular2/angular2.dart')))
          .toEqual(Uri.parse('asset:angular2/lib/angular2.dart'));
    });

    it('should throw for package: `Uri`s which are too short', () {
      expect(() => toAssetScheme(Uri.parse('package:angular2')))
          .toThrowWith(anInstanceOf: FormatException);
    });

    it('should convert asset: `Uri`s to asset:', () {
      expect(toAssetScheme(Uri.parse('asset:angular2/lib/angular2.dart')))
          .toEqual(Uri.parse('asset:angular2/lib/angular2.dart'));
    });

    it('should throw for asset: `Uri`s which are too short', () {
      expect(() => toAssetScheme(Uri.parse('asset:angular2')))
          .toThrowWith(anInstanceOf: FormatException);

      expect(() => toAssetScheme(Uri.parse('asset:angular2/lib')))
          .toThrowWith(anInstanceOf: FormatException);
    });

    it('should throw for unsupported schemes', () {
      expect(() => toAssetScheme(Uri.parse('file:///angular2')))
          .toThrowWith(anInstanceOf: FormatException);
    });

    it('should throw if passed a null uri', () {
      expect(() => toAssetScheme(null))
          .toThrowWith(anInstanceOf: ArgumentError);
    });
  });

  describe('resolve', () {
    it('should resolve package: uris to asset: uris', () {
      expect(urlResolver.resolve('', 'package:angular2/angular2.dart'))
          .toEqual('asset:angular2/lib/angular2.dart');
    });

    it('should ignore baseUrl for absolute uris', () {
      expect(urlResolver.resolve(null, 'package:angular2/angular2.dart'))
          .toEqual('asset:angular2/lib/angular2.dart');
      expect(urlResolver.resolve(null, 'asset:angular2/lib/angular2.dart'))
          .toEqual('asset:angular2/lib/angular2.dart');
    });

    it('should resolve asset: uris to asset: uris', () {
      expect(urlResolver.resolve('', 'asset:angular2/lib/angular2.dart'))
          .toEqual('asset:angular2/lib/angular2.dart');
    });

    it('should resolve relative uris when baseUrl is package: uri', () {
      expect(urlResolver.resolve('package:angular2/angular2.dart',
              'src/transform/transformer.dart'))
          .toEqual('asset:angular2/lib/src/transform/transformer.dart');
    });

    it('should resolve relative uris when baseUrl is asset: uri', () {
      expect(urlResolver.resolve('asset:angular2/lib/angular2.dart',
              'src/transform/transformer.dart'))
          .toEqual('asset:angular2/lib/src/transform/transformer.dart');
    });

    it('should normalize uris', () {
      expect(urlResolver.resolve('asset:angular2/lib/angular2.dart',
              'src/transform/../transform/transformer.dart'))
          .toEqual('asset:angular2/lib/src/transform/transformer.dart');
      expect(urlResolver.resolve('asset:angular2/lib/src/../angular2.dart',
              'src/transform/transformer.dart'))
          .toEqual('asset:angular2/lib/src/transform/transformer.dart');
    });

    it('should throw if passed a null uri', () {
      expect(() => urlResolver.resolve('package:angular2/angular2.dart', null))
          .toThrowWith(anInstanceOf: ArgumentError);
    });

    it('should gracefully handle an empty uri', () {
      expect(urlResolver.resolve('package:angular2/angular2.dart', ''))
          .toEqual('asset:angular2/lib/angular2.dart');
    });

    it('should throw if passed a relative uri and a null baseUri', () {
      expect(() => urlResolver.resolve(null, 'angular2/angular2.dart'))
          .toThrowWith(anInstanceOf: ArgumentError);
    });

    it('should throw if passed a relative uri and an empty baseUri', () {
      expect(() => urlResolver.resolve('', 'angular2/angular2.dart'))
          .toThrowWith(anInstanceOf: ArgumentError);
    });

    it('should throw if the resolved uri is relative', () {
      expect(() => urlResolver.resolve('/angular2/', 'angular2.dart'))
          .toThrowWith(anInstanceOf: ArgumentError);
    });
  });
}
