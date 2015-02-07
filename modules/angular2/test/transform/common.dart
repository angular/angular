// Copyright (c) 2013, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.
library initialize.test.build.common;

import 'package:barback/barback.dart';
import 'package:code_transformers/src/test_harness.dart';
import 'package:unittest/unittest.dart';

// Simple mock of Directive.
const mockDirective = '''
    library angular2.src.core.annotations.annotations_dart;

    const class Directive {
      final context;

      const Directive({this.context});
    }''';

final htmlEntryPointContent = """
<html><head></head><body>
  <script type="application/dart" src="index.dart"></script>
</body></html>
""".replaceAll('  ', '');
