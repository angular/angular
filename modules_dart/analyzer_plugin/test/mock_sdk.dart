library test.src.mock_sdk;

import 'package:analyzer/file_system/file_system.dart' as resource;
import 'package:analyzer/file_system/memory_file_system.dart' as resource;
import 'package:analyzer/src/context/cache.dart';
import 'package:analyzer/src/context/context.dart';
import 'package:analyzer/src/generated/engine.dart'
    show AnalysisEngine, ChangeSet;
import 'package:analyzer/src/generated/sdk.dart';
import 'package:analyzer/src/generated/source.dart';

class MockSdk implements DartSdk {
  static const _MockSdkLibrary LIB_CORE = const _MockSdkLibrary('dart:core',
      '/lib/core/core.dart', '''
library dart.core;

import 'dart:async';

class Object {
  bool operator ==(other) => identical(this, other);
  String toString() => 'a string';
  int get hashCode => 0;
}

class Function {}
class StackTrace {}
class Symbol {}
class Type {}

abstract class Comparable<T> {
  int compareTo(T other);
}

abstract class String implements Comparable<String> {
  external factory String.fromCharCodes(Iterable<int> charCodes,
                                        [int start = 0, int end]);
  bool get isEmpty => false;
  bool get isNotEmpty => false;
  int get length => 0;
  String toUpperCase();
  List<int> get codeUnits;
}

class bool extends Object {}
abstract class num implements Comparable<num> {
  bool operator <(num other);
  bool operator <=(num other);
  bool operator >(num other);
  bool operator >=(num other);
  num operator +(num other);
  num operator -(num other);
  num operator *(num other);
  num operator /(num other);
  int toInt();
  num abs();
  int round();
}
abstract class int extends num {
  bool get isEven => false;
  int operator -();
  external static int parse(String source,
                            { int radix,
                              int onError(String source) });
}
class double extends num {}
class DateTime extends Object {}
class Null extends Object {}

class Deprecated extends Object {
  final String expires;
  const Deprecated(this.expires);
}
const Object deprecated = const Deprecated("next release");

class Iterator<E> {
  bool moveNext();
  E get current;
}

abstract class Iterable<E> {
  Iterator<E> get iterator;
  bool get isEmpty;
}

abstract class List<E> implements Iterable<E> {
  void add(E value);
  E operator [](int index);
  void operator []=(int index, E value);
  Iterator<E> get iterator => null;
  void clear();
}

abstract class Map<K, V> extends Object {
  Iterable<K> get keys;
}

external bool identical(Object a, Object b);

void print(Object object) {}

class _Override {
  const _Override();
}
const Object override = const _Override();
''');

  static const _MockSdkLibrary LIB_ASYNC = const _MockSdkLibrary('dart:async',
      '/lib/async/async.dart', '''
library dart.async;

import 'dart:math';

class Future<T> {
  factory Future.delayed(Duration duration, [T computation()]) => null;
  factory Future.value([value]) => null;
  static Future wait(List<Future> futures) => null;
}

class Stream<T> {}
abstract class StreamTransformer<S, T> {}
''');

  static const _MockSdkLibrary LIB_COLLECTION = const _MockSdkLibrary(
      'dart:collection', '/lib/collection/collection.dart', '''
library dart.collection;

abstract class HashMap<K, V> implements Map<K, V> {}
''');

  static const _MockSdkLibrary LIB_CONVERT = const _MockSdkLibrary(
      'dart:convert', '/lib/convert/convert.dart', '''
library dart.convert;

import 'dart:async';

abstract class Converter<S, T> implements StreamTransformer {}
class JsonDecoder extends Converter<String, Object> {}
''');

  static const _MockSdkLibrary LIB_MATH = const _MockSdkLibrary('dart:math',
      '/lib/math/math.dart', '''
library dart.math;
const double E = 2.718281828459045;
const double PI = 3.1415926535897932;
const double LN10 =  2.302585092994046;
num min(num a, num b) => 0;
num max(num a, num b) => 0;
external double cos(num x);
external double sin(num x);
external double sqrt(num x);
class Random {
  bool nextBool() => true;
  double nextDouble() => 2.0;
  int nextInt() => 1;
}
''');

  static const _MockSdkLibrary LIB_HTML = const _MockSdkLibrary('dart:html',
      '/lib/html/dartium/html_dartium.dart', '''
library dart.html;
class HtmlElement {}
''');

  static const List<SdkLibrary> LIBRARIES = const [
    LIB_CORE,
    LIB_ASYNC,
    LIB_COLLECTION,
    LIB_CONVERT,
    LIB_MATH,
    LIB_HTML,
  ];

  final resource.MemoryResourceProvider provider =
      new resource.MemoryResourceProvider();

  /**
   * The [AnalysisContext] which is used for all of the sources.
   */
  AnalysisContextImpl _analysisContext;

  MockSdk() {
    LIBRARIES.forEach((_MockSdkLibrary library) {
      provider.newFile(library.path, library.content);
    });
  }

  @override
  AnalysisContextImpl get context {
    if (_analysisContext == null) {
      _analysisContext = new _SdkAnalysisContext(this);
      SourceFactory factory = new SourceFactory([new DartUriResolver(this)]);
      _analysisContext.sourceFactory = factory;
      ChangeSet changeSet = new ChangeSet();
      for (String uri in uris) {
        Source source = factory.forUri(uri);
        changeSet.addedSource(source);
      }
      _analysisContext.applyChanges(changeSet);
    }
    return _analysisContext;
  }

  @override
  List<SdkLibrary> get sdkLibraries => LIBRARIES;

  @override
  String get sdkVersion => throw unimplemented;

  UnimplementedError get unimplemented => new UnimplementedError();

  @override
  List<String> get uris {
    List<String> uris = <String>[];
    for (SdkLibrary library in LIBRARIES) {
      uris.add(library.shortName);
    }
    return uris;
  }

  @override
  Source fromFileUri(Uri uri) {
    String filePath = uri.path;
    String libPath = '/lib';
    if (!filePath.startsWith("$libPath/")) {
      return null;
    }
    for (SdkLibrary library in LIBRARIES) {
      String libraryPath = library.path;
      if (filePath.replaceAll('\\', '/') == libraryPath) {
        try {
          resource.File file = provider.getResource(uri.path);
          Uri dartUri = Uri.parse(library.shortName);
          return file.createSource(dartUri);
        } catch (exception) {
          return null;
        }
      }
      if (filePath.startsWith("$libraryPath/")) {
        String pathInLibrary = filePath.substring(libraryPath.length + 1);
        String path = '${library.shortName}/${pathInLibrary}';
        try {
          resource.File file = provider.getResource(uri.path);
          Uri dartUri = new Uri(scheme: 'dart', path: path);
          return file.createSource(dartUri);
        } catch (exception) {
          return null;
        }
      }
    }
    return null;
  }

  @override
  SdkLibrary getSdkLibrary(String dartUri) {
    // getSdkLibrary() is only used to determine whether a library is internal
    // to the SDK.  The mock SDK doesn't have any internals, so it's safe to
    // return null.
    return null;
  }

  @override
  Source mapDartUri(String dartUri) {
    const Map<String, String> uriToPath = const {
      "dart:core": "/lib/core/core.dart",
      "dart:html": "/lib/html/dartium/html_dartium.dart",
      "dart:async": "/lib/async/async.dart",
      "dart:collection": "/lib/collection/collection.dart",
      "dart:convert": "/lib/convert/convert.dart",
      "dart:math": "/lib/math/math.dart"
    };

    String path = uriToPath[dartUri];
    if (path != null) {
      resource.File file = provider.getResource(path);
      Uri uri = new Uri(scheme: 'dart', path: dartUri.substring(5));
      return file.createSource(uri);
    }

    // If we reach here then we tried to use a dartUri that's not in the
    // table above.
    return null;
  }
}

class _MockSdkLibrary implements SdkLibrary {
  final String shortName;
  final String path;
  final String content;

  const _MockSdkLibrary(this.shortName, this.path, this.content);

  @override
  String get category => throw unimplemented;

  @override
  bool get isDart2JsLibrary => throw unimplemented;

  @override
  bool get isDocumented => throw unimplemented;

  @override
  bool get isImplementation => throw unimplemented;

  @override
  bool get isInternal => throw unimplemented;

  @override
  bool get isShared => throw unimplemented;

  @override
  bool get isVmLibrary => throw unimplemented;

  UnimplementedError get unimplemented => new UnimplementedError();
}

/**
 * An [AnalysisContextImpl] that only contains sources for a Dart SDK.
 */
class _SdkAnalysisContext extends AnalysisContextImpl {
  final DartSdk sdk;

  _SdkAnalysisContext(this.sdk);

  @override
  AnalysisCache createCacheFromSourceFactory(SourceFactory factory) {
    if (factory == null) {
      return super.createCacheFromSourceFactory(factory);
    }
    return new AnalysisCache(<CachePartition>[
      AnalysisEngine.instance.partitionManager_new.forSdk(sdk)
    ]);
  }
}
