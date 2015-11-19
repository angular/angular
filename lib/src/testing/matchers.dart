library testing.matchers;

import 'dart:async';

import 'package:guinness/guinness.dart' as gns;

import 'package:angular2/src/core/dom/dom_adapter.dart' show DOM;

Expect expect(actual, [matcher]) {
  final expect = new Expect(actual);
  if (matcher != null) expect.to(matcher);
  return expect;
}

const _u = const Object();

expectErrorMessage(actual, expectedMessage) {
  expect(actual.toString()).toContain(expectedMessage);
}

expectException(Function actual, expectedMessage) {
  try {
    actual();
  } catch (e, s) {
    expectErrorMessage(e, expectedMessage);
  }
}

class Expect extends gns.Expect {
  Expect(actual) : super(actual);

  NotExpect get not => new NotExpect(actual);

  void toEqual(expected) => toHaveSameProps(expected);
  void toContainError(message) => expectErrorMessage(this.actual, message);
  void toThrowError([message = ""]) => toThrowWith(message: message);
  void toThrowErrorWith(message) => expectException(this.actual, message);
  void toBePromise() => gns.guinness.matchers.toBeTrue(actual is Future);
  void toHaveCssClass(className) =>
      gns.guinness.matchers.toBeTrue(DOM.hasClass(actual, className));
  void toImplement(expected) => toBeA(expected);
  void toBeNaN() =>
      gns.guinness.matchers.toBeTrue(double.NAN.compareTo(actual) == 0);
  void toHaveText(expected) => _expect(elementText(actual), expected);
  void toHaveBeenCalledWith([a = _u, b = _u, c = _u, d = _u, e = _u, f = _u]) =>
      _expect(_argsMatch(actual, a, b, c, d, e, f), true,
          reason: 'method invoked with correct arguments');
  Function get _expect => gns.guinness.matchers.expect;

  // TODO(tbosch): move this hack into Guinness
  _argsMatch(spyFn, [a0 = _u, a1 = _u, a2 = _u, a3 = _u, a4 = _u, a5 = _u]) {
    var calls = spyFn.calls;
    final toMatch = _takeDefined([a0, a1, a2, a3, a4, a5]);
    if (calls.isEmpty) {
      return false;
    } else {
      gns.SamePropsMatcher matcher = new gns.SamePropsMatcher(toMatch);
      for (var i = 0; i < calls.length; i++) {
        var call = calls[i];
        // TODO: create a better error message, not just 'Expected: <true> Actual: <false>'.
        // For hacking this is good:
        // print(call.positionalArguments);
        if (matcher.matches(call.positionalArguments, null)) {
          return true;
        }
      }
      return false;
    }
  }

  List _takeDefined(List iter) => iter.takeWhile((_) => _ != _u).toList();
}

class NotExpect extends gns.NotExpect {
  NotExpect(actual) : super(actual);

  void toEqual(expected) => toHaveSameProps(expected);
  void toBePromise() => gns.guinness.matchers.toBeFalse(actual is Future);
  void toHaveCssClass(className) =>
      gns.guinness.matchers.toBeFalse(DOM.hasClass(actual, className));
  void toBeNull() => gns.guinness.matchers.toBeFalse(actual == null);
  Function get _expect => gns.guinness.matchers.expect;
}

String elementText(n) {
  hasNodes(n) {
    var children = DOM.childNodes(n);
    return children != null && children.length > 0;
  }

  if (n is Iterable) {
    return n.map(elementText).join("");
  }

  if (DOM.isCommentNode(n)) {
    return '';
  }

  if (DOM.isElementNode(n) && DOM.tagName(n) == 'CONTENT') {
    return elementText(DOM.getDistributedNodes(n));
  }

  if (DOM.hasShadowRoot(n)) {
    return elementText(DOM.childNodesAsList(DOM.getShadowRoot(n)));
  }

  if (hasNodes(n)) {
    return elementText(DOM.childNodesAsList(n));
  }

  return DOM.getText(n);
}
