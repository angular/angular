import 'package:code_transformers/resolver.dart';

Resolvers createResolvers() {
  return new Resolvers.fromMock({
    // The list of types below is derived from:
    //   * types that are used internally by the resolver (see
    //   _initializeFrom in resolver.dart).
    // TODO(jakemac): Move this into code_transformers so it can be shared.
    'dart:core': '''
            library dart.core;
            class Object {}
            class Function {}
            class StackTrace {}
            class Symbol {}
            class Type {}

            class String extends Object {}
            class bool extends Object {}
            class num extends Object {}
            class int extends num {}
            class double extends num {}
            class DateTime extends Object {}
            class Null extends Object {}

            class Deprecated extends Object {
              final String expires;
              const Deprecated(this.expires);
            }
            const Object deprecated = const Deprecated("next release");
            class _Override { const _Override(); }
            const Object override = const _Override();
            class _Proxy { const _Proxy(); }
            const Object proxy = const _Proxy();

            class List<V> extends Object {}
            class Map<K, V> extends Object {}
            ''',
    'dart:html': '''
            library dart.html;
            class HtmlElement {}
            ''',
  });
}
