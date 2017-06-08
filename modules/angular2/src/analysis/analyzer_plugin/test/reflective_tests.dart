// Copyright (c) 2014, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.

library reflective_tests;

@MirrorsUsed(metaTargets: 'ReflectiveTest')
import 'dart:mirrors';
import 'dart:async';

import 'package:unittest/unittest.dart';

/**
 * Runs test methods existing in the given [type].
 *
 * Methods with names starting with `test` are run using [test] function.
 * Methods with names starting with `solo_test` are run using [solo_test] function.
 *
 * Each method is run with a new instance of [type].
 * So, [type] should have a default constructor.
 *
 * If [type] declares method `setUp`, it methods will be invoked before any test
 * method invocation.
 *
 * If [type] declares method `tearDown`, it will be invoked after any test
 * method invocation. If method returns [Future] to test some asyncronous
 * behavior, then `tearDown` will be invoked in `Future.complete`.
 */
void runReflectiveTests(Type type) {
  ClassMirror classMirror = reflectClass(type);
  if (!classMirror.metadata.any((InstanceMirror annotation) =>
      annotation.type.reflectedType == ReflectiveTest)) {
    String name = MirrorSystem.getName(classMirror.qualifiedName);
    throw new Exception('Class $name must have annotation "@reflectiveTest" '
        'in order to be run by runReflectiveTests.');
  }
  String className = MirrorSystem.getName(classMirror.simpleName);
  group(className, () {
    classMirror.instanceMembers.forEach((symbol, memberMirror) {
      // we need only methods
      if (memberMirror is! MethodMirror || !memberMirror.isRegularMethod) {
        return;
      }
      String memberName = MirrorSystem.getName(symbol);
      // test_
      if (memberName.startsWith('test_')) {
        test(memberName, () {
          return _runTest(classMirror, symbol);
        });
        return;
      }
      // solo_test_
      if (memberName.startsWith('solo_test_')) {
        solo_test(memberName, () {
          return _runTest(classMirror, symbol);
        });
      }
      // fail_test_
      if (memberName.startsWith('fail_')) {
        test(memberName, () {
          return _runFailingTest(classMirror, symbol);
        });
      }
      // solo_fail_test_
      if (memberName.startsWith('solo_fail_')) {
        solo_test(memberName, () {
          return _runFailingTest(classMirror, symbol);
        });
      }
    });
  });
}

Future _invokeSymbolIfExists(InstanceMirror instanceMirror, Symbol symbol) {
  var invocationResult = null;
  try {
    invocationResult = instanceMirror.invoke(symbol, []).reflectee;
  } on NoSuchMethodError {}
  if (invocationResult is Future) {
    return invocationResult;
  } else {
    return new Future.value(invocationResult);
  }
}

/**
 * Run a test that is expected to fail, and confirm that it fails.
 *
 * This properly handles the following cases:
 * - The test fails by throwing an exception
 * - The test returns a future which completes with an error.
 *
 * However, it does not handle the case where the test creates an asynchronous
 * callback using expectAsync(), and that callback generates a failure.
 */
Future _runFailingTest(ClassMirror classMirror, Symbol symbol) {
  return new Future(() => _runTest(classMirror, symbol)).then((_) {
    fail('Test passed - expected to fail.');
  }, onError: (_) {});
}

_runTest(ClassMirror classMirror, Symbol symbol) {
  InstanceMirror instanceMirror = classMirror.newInstance(new Symbol(''), []);
  return _invokeSymbolIfExists(instanceMirror, #setUp)
      .then((_) => instanceMirror.invoke(symbol, []).reflectee)
      .whenComplete(() => _invokeSymbolIfExists(instanceMirror, #tearDown));
}

/**
 * A marker annotation used to instruct dart2js to keep reflection information
 * for the annotated classes.
 */
class ReflectiveTest {
  const ReflectiveTest();
}

/**
 * A marker annotation used to instruct dart2js to keep reflection information
 * for the annotated classes.
 */
const ReflectiveTest reflectiveTest = const ReflectiveTest();
