library dart_gen_change_detectors;

import 'package:angular2/src/core/change_detection/pregen_proto_change_detector.dart'
    as _gen;

class ChangeDetector0 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0;

  ChangeDetector0()
      : super("\"\$\"", 1, ChangeDetector0._gen_propertyBindingTargets,
            ChangeDetector0._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = "\$";
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      this.notifyDispatcher(l_literal0);
      this.logBindingUpdate(l_literal0);

      this.literal0 = l_literal0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.literal0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "\"\$\" in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector0();
  }
}

class ChangeDetector1 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0;

  ChangeDetector1()
      : super("10", 1, ChangeDetector1._gen_propertyBindingTargets,
            ChangeDetector1._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 10;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      this.notifyDispatcher(l_literal0);
      this.logBindingUpdate(l_literal0);

      this.literal0 = l_literal0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.literal0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil
        .bindingTarget("elementProperty", 0, "propName", null, "10 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector1();
  }
}

class ChangeDetector2 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0;

  ChangeDetector2()
      : super("\"str\"", 1, ChangeDetector2._gen_propertyBindingTargets,
            ChangeDetector2._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = "str";
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      this.notifyDispatcher(l_literal0);
      this.logBindingUpdate(l_literal0);

      this.literal0 = l_literal0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.literal0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "\"str\" in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector2();
  }
}

class ChangeDetector3 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0;

  ChangeDetector3()
      : super("\"a\n\nb\"", 1, ChangeDetector3._gen_propertyBindingTargets,
            ChangeDetector3._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = "a\n\nb";
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      this.notifyDispatcher(l_literal0);
      this.logBindingUpdate(l_literal0);

      this.literal0 = l_literal0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.literal0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "\"a\n\nb\" in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector3();
  }
}

class ChangeDetector4 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_add2;

  ChangeDetector4()
      : super("10 + 2", 3, ChangeDetector4._gen_propertyBindingTargets,
            ChangeDetector4._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_literal1, l_operation_add2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 10;

    l_literal1 = 2;

    l_operation_add2 =
        _gen.ChangeDetectionUtil.operation_add(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_add2, l_operation_add2)) {
      this.throwOnChangeError(this.operation_add2, l_operation_add2);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_add2, this.operation_add2)) {
      this.notifyDispatcher(l_operation_add2);
      this.logBindingUpdate(l_operation_add2);

      this.operation_add2 = l_operation_add2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_add2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "10 + 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector4();
  }
}

class ChangeDetector5 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_subtract2;

  ChangeDetector5()
      : super("10 - 2", 3, ChangeDetector5._gen_propertyBindingTargets,
            ChangeDetector5._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_literal1, l_operation_subtract2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 10;

    l_literal1 = 2;

    l_operation_subtract2 =
        _gen.ChangeDetectionUtil.operation_subtract(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_subtract2, l_operation_subtract2)) {
      this.throwOnChangeError(this.operation_subtract2, l_operation_subtract2);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_subtract2, this.operation_subtract2)) {
      this.notifyDispatcher(l_operation_subtract2);
      this.logBindingUpdate(l_operation_subtract2);

      this.operation_subtract2 = l_operation_subtract2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_subtract2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "10 - 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector5();
  }
}

class ChangeDetector6 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_multiply2;

  ChangeDetector6()
      : super("10 * 2", 3, ChangeDetector6._gen_propertyBindingTargets,
            ChangeDetector6._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_literal1, l_operation_multiply2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 10;

    l_literal1 = 2;

    l_operation_multiply2 =
        _gen.ChangeDetectionUtil.operation_multiply(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_multiply2, l_operation_multiply2)) {
      this.throwOnChangeError(this.operation_multiply2, l_operation_multiply2);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_multiply2, this.operation_multiply2)) {
      this.notifyDispatcher(l_operation_multiply2);
      this.logBindingUpdate(l_operation_multiply2);

      this.operation_multiply2 = l_operation_multiply2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_multiply2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "10 * 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector6();
  }
}

class ChangeDetector7 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_divide2;

  ChangeDetector7()
      : super("10 / 2", 3, ChangeDetector7._gen_propertyBindingTargets,
            ChangeDetector7._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_literal1, l_operation_divide2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 10;

    l_literal1 = 2;

    l_operation_divide2 =
        _gen.ChangeDetectionUtil.operation_divide(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_divide2, l_operation_divide2)) {
      this.throwOnChangeError(this.operation_divide2, l_operation_divide2);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_divide2, this.operation_divide2)) {
      this.notifyDispatcher(l_operation_divide2);
      this.logBindingUpdate(l_operation_divide2);

      this.operation_divide2 = l_operation_divide2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_divide2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "10 / 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector7();
  }
}

class ChangeDetector8 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_remainder2;

  ChangeDetector8()
      : super("11 % 2", 3, ChangeDetector8._gen_propertyBindingTargets,
            ChangeDetector8._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_operation_remainder2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 11;

    l_literal1 = 2;

    l_operation_remainder2 =
        _gen.ChangeDetectionUtil.operation_remainder(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_remainder2, l_operation_remainder2)) {
      this.throwOnChangeError(
          this.operation_remainder2, l_operation_remainder2);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_remainder2, this.operation_remainder2)) {
      this.notifyDispatcher(l_operation_remainder2);
      this.logBindingUpdate(l_operation_remainder2);

      this.operation_remainder2 = l_operation_remainder2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_remainder2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "11 % 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector8();
  }
}

class ChangeDetector9 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_equals1;

  ChangeDetector9()
      : super("1 == 1", 2, ChangeDetector9._gen_propertyBindingTargets,
            ChangeDetector9._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_operation_equals1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_operation_equals1 =
        _gen.ChangeDetectionUtil.operation_equals(l_literal0, l_literal0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_equals1, l_operation_equals1)) {
      this.throwOnChangeError(this.operation_equals1, l_operation_equals1);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_equals1, this.operation_equals1)) {
      this.notifyDispatcher(l_operation_equals1);
      this.logBindingUpdate(l_operation_equals1);

      this.operation_equals1 = l_operation_equals1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_equals1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "1 == 1 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector9();
  }
}

class ChangeDetector10 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_not_equals1;

  ChangeDetector10()
      : super("1 != 1", 2, ChangeDetector10._gen_propertyBindingTargets,
            ChangeDetector10._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_operation_not_equals1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_operation_not_equals1 =
        _gen.ChangeDetectionUtil.operation_not_equals(l_literal0, l_literal0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(
            this.operation_not_equals1, l_operation_not_equals1)) {
      this.throwOnChangeError(
          this.operation_not_equals1, l_operation_not_equals1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(
        l_operation_not_equals1, this.operation_not_equals1)) {
      this.notifyDispatcher(l_operation_not_equals1);
      this.logBindingUpdate(l_operation_not_equals1);

      this.operation_not_equals1 = l_operation_not_equals1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_not_equals1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "1 != 1 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector10();
  }
}

class ChangeDetector11 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_equals2;

  ChangeDetector11()
      : super("1 == true", 3, ChangeDetector11._gen_propertyBindingTargets,
            ChangeDetector11._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_literal1, l_operation_equals2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_literal1 = true;

    l_operation_equals2 =
        _gen.ChangeDetectionUtil.operation_equals(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_equals2, l_operation_equals2)) {
      this.throwOnChangeError(this.operation_equals2, l_operation_equals2);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_equals2, this.operation_equals2)) {
      this.notifyDispatcher(l_operation_equals2);
      this.logBindingUpdate(l_operation_equals2);

      this.operation_equals2 = l_operation_equals2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_equals2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "1 == true in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector11();
  }
}

class ChangeDetector12 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_identical1;

  ChangeDetector12()
      : super("1 === 1", 2, ChangeDetector12._gen_propertyBindingTargets,
            ChangeDetector12._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_operation_identical1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_operation_identical1 =
        _gen.ChangeDetectionUtil.operation_identical(l_literal0, l_literal0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_identical1, l_operation_identical1)) {
      this.throwOnChangeError(
          this.operation_identical1, l_operation_identical1);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_identical1, this.operation_identical1)) {
      this.notifyDispatcher(l_operation_identical1);
      this.logBindingUpdate(l_operation_identical1);

      this.operation_identical1 = l_operation_identical1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_identical1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "1 === 1 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector12();
  }
}

class ChangeDetector13 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_not_identical1;

  ChangeDetector13()
      : super("1 !== 1", 2, ChangeDetector13._gen_propertyBindingTargets,
            ChangeDetector13._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_operation_not_identical1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_operation_not_identical1 = _gen.ChangeDetectionUtil
        .operation_not_identical(l_literal0, l_literal0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(
            this.operation_not_identical1, l_operation_not_identical1)) {
      this.throwOnChangeError(
          this.operation_not_identical1, l_operation_not_identical1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(
        l_operation_not_identical1, this.operation_not_identical1)) {
      this.notifyDispatcher(l_operation_not_identical1);
      this.logBindingUpdate(l_operation_not_identical1);

      this.operation_not_identical1 = l_operation_not_identical1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_not_identical1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "1 !== 1 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector13();
  }
}

class ChangeDetector14 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_identical2;

  ChangeDetector14()
      : super("1 === true", 3, ChangeDetector14._gen_propertyBindingTargets,
            ChangeDetector14._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_operation_identical2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_literal1 = true;

    l_operation_identical2 =
        _gen.ChangeDetectionUtil.operation_identical(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_identical2, l_operation_identical2)) {
      this.throwOnChangeError(
          this.operation_identical2, l_operation_identical2);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_identical2, this.operation_identical2)) {
      this.notifyDispatcher(l_operation_identical2);
      this.logBindingUpdate(l_operation_identical2);

      this.operation_identical2 = l_operation_identical2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_identical2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "1 === true in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector14();
  }
}

class ChangeDetector15 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_less_then2;

  ChangeDetector15()
      : super("1 < 2", 3, ChangeDetector15._gen_propertyBindingTargets,
            ChangeDetector15._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_operation_less_then2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_literal1 = 2;

    l_operation_less_then2 =
        _gen.ChangeDetectionUtil.operation_less_then(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_less_then2, l_operation_less_then2)) {
      this.throwOnChangeError(
          this.operation_less_then2, l_operation_less_then2);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_less_then2, this.operation_less_then2)) {
      this.notifyDispatcher(l_operation_less_then2);
      this.logBindingUpdate(l_operation_less_then2);

      this.operation_less_then2 = l_operation_less_then2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_less_then2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "1 < 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector15();
  }
}

class ChangeDetector16 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_less_then2;

  ChangeDetector16()
      : super("2 < 1", 3, ChangeDetector16._gen_propertyBindingTargets,
            ChangeDetector16._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_operation_less_then2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 2;

    l_literal1 = 1;

    l_operation_less_then2 =
        _gen.ChangeDetectionUtil.operation_less_then(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_less_then2, l_operation_less_then2)) {
      this.throwOnChangeError(
          this.operation_less_then2, l_operation_less_then2);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_less_then2, this.operation_less_then2)) {
      this.notifyDispatcher(l_operation_less_then2);
      this.logBindingUpdate(l_operation_less_then2);

      this.operation_less_then2 = l_operation_less_then2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_less_then2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "2 < 1 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector16();
  }
}

class ChangeDetector17 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_greater_then2;

  ChangeDetector17()
      : super("1 > 2", 3, ChangeDetector17._gen_propertyBindingTargets,
            ChangeDetector17._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_operation_greater_then2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_literal1 = 2;

    l_operation_greater_then2 =
        _gen.ChangeDetectionUtil.operation_greater_then(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(
            this.operation_greater_then2, l_operation_greater_then2)) {
      this.throwOnChangeError(
          this.operation_greater_then2, l_operation_greater_then2);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(
        l_operation_greater_then2, this.operation_greater_then2)) {
      this.notifyDispatcher(l_operation_greater_then2);
      this.logBindingUpdate(l_operation_greater_then2);

      this.operation_greater_then2 = l_operation_greater_then2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_greater_then2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "1 > 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector17();
  }
}

class ChangeDetector18 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_greater_then2;

  ChangeDetector18()
      : super("2 > 1", 3, ChangeDetector18._gen_propertyBindingTargets,
            ChangeDetector18._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_operation_greater_then2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 2;

    l_literal1 = 1;

    l_operation_greater_then2 =
        _gen.ChangeDetectionUtil.operation_greater_then(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(
            this.operation_greater_then2, l_operation_greater_then2)) {
      this.throwOnChangeError(
          this.operation_greater_then2, l_operation_greater_then2);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(
        l_operation_greater_then2, this.operation_greater_then2)) {
      this.notifyDispatcher(l_operation_greater_then2);
      this.logBindingUpdate(l_operation_greater_then2);

      this.operation_greater_then2 = l_operation_greater_then2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_greater_then2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "2 > 1 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector18();
  }
}

class ChangeDetector19 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_less_or_equals_then2;

  ChangeDetector19()
      : super("1 <= 2", 3, ChangeDetector19._gen_propertyBindingTargets,
            ChangeDetector19._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_operation_less_or_equals_then2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_literal1 = 2;

    l_operation_less_or_equals_then2 = _gen.ChangeDetectionUtil
        .operation_less_or_equals_then(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(
            this.operation_less_or_equals_then2,
            l_operation_less_or_equals_then2)) {
      this.throwOnChangeError(this.operation_less_or_equals_then2,
          l_operation_less_or_equals_then2);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(
        l_operation_less_or_equals_then2,
        this.operation_less_or_equals_then2)) {
      this.notifyDispatcher(l_operation_less_or_equals_then2);
      this.logBindingUpdate(l_operation_less_or_equals_then2);

      this.operation_less_or_equals_then2 = l_operation_less_or_equals_then2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_less_or_equals_then2 =
        _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "1 <= 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector19();
  }
}

class ChangeDetector20 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_less_or_equals_then1;

  ChangeDetector20()
      : super("2 <= 2", 2, ChangeDetector20._gen_propertyBindingTargets,
            ChangeDetector20._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_operation_less_or_equals_then1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 2;

    l_operation_less_or_equals_then1 = _gen.ChangeDetectionUtil
        .operation_less_or_equals_then(l_literal0, l_literal0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(
            this.operation_less_or_equals_then1,
            l_operation_less_or_equals_then1)) {
      this.throwOnChangeError(this.operation_less_or_equals_then1,
          l_operation_less_or_equals_then1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(
        l_operation_less_or_equals_then1,
        this.operation_less_or_equals_then1)) {
      this.notifyDispatcher(l_operation_less_or_equals_then1);
      this.logBindingUpdate(l_operation_less_or_equals_then1);

      this.operation_less_or_equals_then1 = l_operation_less_or_equals_then1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_less_or_equals_then1 =
        _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "2 <= 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector20();
  }
}

class ChangeDetector21 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_less_or_equals_then2;

  ChangeDetector21()
      : super("2 <= 1", 3, ChangeDetector21._gen_propertyBindingTargets,
            ChangeDetector21._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_operation_less_or_equals_then2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 2;

    l_literal1 = 1;

    l_operation_less_or_equals_then2 = _gen.ChangeDetectionUtil
        .operation_less_or_equals_then(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(
            this.operation_less_or_equals_then2,
            l_operation_less_or_equals_then2)) {
      this.throwOnChangeError(this.operation_less_or_equals_then2,
          l_operation_less_or_equals_then2);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(
        l_operation_less_or_equals_then2,
        this.operation_less_or_equals_then2)) {
      this.notifyDispatcher(l_operation_less_or_equals_then2);
      this.logBindingUpdate(l_operation_less_or_equals_then2);

      this.operation_less_or_equals_then2 = l_operation_less_or_equals_then2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_less_or_equals_then2 =
        _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "2 <= 1 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector21();
  }
}

class ChangeDetector22 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_greater_or_equals_then2;

  ChangeDetector22()
      : super("2 >= 1", 3, ChangeDetector22._gen_propertyBindingTargets,
            ChangeDetector22._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_operation_greater_or_equals_then2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 2;

    l_literal1 = 1;

    l_operation_greater_or_equals_then2 = _gen.ChangeDetectionUtil
        .operation_greater_or_equals_then(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(
            this.operation_greater_or_equals_then2,
            l_operation_greater_or_equals_then2)) {
      this.throwOnChangeError(this.operation_greater_or_equals_then2,
          l_operation_greater_or_equals_then2);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(
        l_operation_greater_or_equals_then2,
        this.operation_greater_or_equals_then2)) {
      this.notifyDispatcher(l_operation_greater_or_equals_then2);
      this.logBindingUpdate(l_operation_greater_or_equals_then2);

      this.operation_greater_or_equals_then2 =
          l_operation_greater_or_equals_then2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_greater_or_equals_then2 =
        _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "2 >= 1 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector22();
  }
}

class ChangeDetector23 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_greater_or_equals_then1;

  ChangeDetector23()
      : super("2 >= 2", 2, ChangeDetector23._gen_propertyBindingTargets,
            ChangeDetector23._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_operation_greater_or_equals_then1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 2;

    l_operation_greater_or_equals_then1 = _gen.ChangeDetectionUtil
        .operation_greater_or_equals_then(l_literal0, l_literal0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(
            this.operation_greater_or_equals_then1,
            l_operation_greater_or_equals_then1)) {
      this.throwOnChangeError(this.operation_greater_or_equals_then1,
          l_operation_greater_or_equals_then1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(
        l_operation_greater_or_equals_then1,
        this.operation_greater_or_equals_then1)) {
      this.notifyDispatcher(l_operation_greater_or_equals_then1);
      this.logBindingUpdate(l_operation_greater_or_equals_then1);

      this.operation_greater_or_equals_then1 =
          l_operation_greater_or_equals_then1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_greater_or_equals_then1 =
        _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "2 >= 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector23();
  }
}

class ChangeDetector24 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_greater_or_equals_then2;

  ChangeDetector24()
      : super("1 >= 2", 3, ChangeDetector24._gen_propertyBindingTargets,
            ChangeDetector24._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_operation_greater_or_equals_then2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_literal1 = 2;

    l_operation_greater_or_equals_then2 = _gen.ChangeDetectionUtil
        .operation_greater_or_equals_then(l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(
            this.operation_greater_or_equals_then2,
            l_operation_greater_or_equals_then2)) {
      this.throwOnChangeError(this.operation_greater_or_equals_then2,
          l_operation_greater_or_equals_then2);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(
        l_operation_greater_or_equals_then2,
        this.operation_greater_or_equals_then2)) {
      this.notifyDispatcher(l_operation_greater_or_equals_then2);
      this.logBindingUpdate(l_operation_greater_or_equals_then2);

      this.operation_greater_or_equals_then2 =
          l_operation_greater_or_equals_then2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_greater_or_equals_then2 =
        _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "1 >= 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector24();
  }
}

class ChangeDetector25 extends _gen.AbstractChangeDetector<dynamic> {
  var cond1;

  ChangeDetector25()
      : super("true && true", 2, ChangeDetector25._gen_propertyBindingTargets,
            ChangeDetector25._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_cond1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = true;

    l_cond1 = _gen.ChangeDetectionUtil.cond(l_literal0, l_literal0, l_literal0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond1, l_cond1)) {
      this.throwOnChangeError(this.cond1, l_cond1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond1, this.cond1)) {
      this.notifyDispatcher(l_cond1);
      this.logBindingUpdate(l_cond1);

      this.cond1 = l_cond1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "true && true in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector25();
  }
}

class ChangeDetector26 extends _gen.AbstractChangeDetector<dynamic> {
  var cond3;

  ChangeDetector26()
      : super("true && false", 4, ChangeDetector26._gen_propertyBindingTargets,
            ChangeDetector26._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_SkipRecordsIfNot1,
        l_literal2,
        l_cond3;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = true;

    if (l_literal0) {
      l_literal2 = false;
    }

    l_cond3 = _gen.ChangeDetectionUtil.cond(l_literal0, l_literal2, l_literal0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond3, l_cond3)) {
      this.throwOnChangeError(this.cond3, l_cond3);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond3, this.cond3)) {
      this.notifyDispatcher(l_cond3);
      this.logBindingUpdate(l_cond3);

      this.cond3 = l_cond3;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond3 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "true && false in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector26();
  }
}

class ChangeDetector27 extends _gen.AbstractChangeDetector<dynamic> {
  var cond3;

  ChangeDetector27()
      : super("true || false", 4, ChangeDetector27._gen_propertyBindingTargets,
            ChangeDetector27._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_SkipRecordsIf1,
        l_literal2,
        l_cond3;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = true;

    if (!l_literal0) {
      l_literal2 = false;
    }

    l_cond3 = _gen.ChangeDetectionUtil.cond(l_literal0, l_literal0, l_literal2);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond3, l_cond3)) {
      this.throwOnChangeError(this.cond3, l_cond3);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond3, this.cond3)) {
      this.notifyDispatcher(l_cond3);
      this.logBindingUpdate(l_cond3);

      this.cond3 = l_cond3;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond3 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "true || false in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector27();
  }
}

class ChangeDetector28 extends _gen.AbstractChangeDetector<dynamic> {
  var cond1;

  ChangeDetector28()
      : super("false || false", 2, ChangeDetector28._gen_propertyBindingTargets,
            ChangeDetector28._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_cond1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = false;

    l_cond1 = _gen.ChangeDetectionUtil.cond(l_literal0, l_literal0, l_literal0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond1, l_cond1)) {
      this.throwOnChangeError(this.cond1, l_cond1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond1, this.cond1)) {
      this.notifyDispatcher(l_cond1);
      this.logBindingUpdate(l_cond1);

      this.cond1 = l_cond1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "false || false in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector28();
  }
}

class ChangeDetector29 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_negate1;

  ChangeDetector29()
      : super("!true", 2, ChangeDetector29._gen_propertyBindingTargets,
            ChangeDetector29._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_operation_negate1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = true;

    l_operation_negate1 = _gen.ChangeDetectionUtil.operation_negate(l_literal0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_negate1, l_operation_negate1)) {
      this.throwOnChangeError(this.operation_negate1, l_operation_negate1);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_negate1, this.operation_negate1)) {
      this.notifyDispatcher(l_operation_negate1);
      this.logBindingUpdate(l_operation_negate1);

      this.operation_negate1 = l_operation_negate1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_negate1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "!true in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector29();
  }
}

class ChangeDetector30 extends _gen.AbstractChangeDetector<dynamic> {
  var operation_negate2;

  ChangeDetector30()
      : super("!!true", 3, ChangeDetector30._gen_propertyBindingTargets,
            ChangeDetector30._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_operation_negate1,
        l_operation_negate2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = true;

    l_operation_negate1 = _gen.ChangeDetectionUtil.operation_negate(l_literal0);

    l_operation_negate2 =
        _gen.ChangeDetectionUtil.operation_negate(l_operation_negate1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.operation_negate2, l_operation_negate2)) {
      this.throwOnChangeError(this.operation_negate2, l_operation_negate2);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_operation_negate2, this.operation_negate2)) {
      this.notifyDispatcher(l_operation_negate2);
      this.logBindingUpdate(l_operation_negate2);

      this.operation_negate2 = l_operation_negate2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.operation_negate2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "!!true in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector30();
  }
}

class ChangeDetector31 extends _gen.AbstractChangeDetector<dynamic> {
  var cond3;

  ChangeDetector31()
      : super("1 < 2 ? 1 : 2", 4, ChangeDetector31._gen_propertyBindingTargets,
            ChangeDetector31._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_operation_less_then2,
        l_cond3;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_literal1 = 2;

    l_operation_less_then2 =
        _gen.ChangeDetectionUtil.operation_less_then(l_literal0, l_literal1);

    l_cond3 = _gen.ChangeDetectionUtil
        .cond(l_operation_less_then2, l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond3, l_cond3)) {
      this.throwOnChangeError(this.cond3, l_cond3);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond3, this.cond3)) {
      this.notifyDispatcher(l_cond3);
      this.logBindingUpdate(l_cond3);

      this.cond3 = l_cond3;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond3 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "1 < 2 ? 1 : 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector31();
  }
}

class ChangeDetector32 extends _gen.AbstractChangeDetector<dynamic> {
  var cond3;

  ChangeDetector32()
      : super("1 > 2 ? 1 : 2", 4, ChangeDetector32._gen_propertyBindingTargets,
            ChangeDetector32._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_operation_greater_then2,
        l_cond3;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_literal1 = 2;

    l_operation_greater_then2 =
        _gen.ChangeDetectionUtil.operation_greater_then(l_literal0, l_literal1);

    l_cond3 = _gen.ChangeDetectionUtil
        .cond(l_operation_greater_then2, l_literal0, l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond3, l_cond3)) {
      this.throwOnChangeError(this.cond3, l_cond3);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond3, this.cond3)) {
      this.notifyDispatcher(l_cond3);
      this.logBindingUpdate(l_cond3);

      this.cond3 = l_cond3;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond3 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "1 > 2 ? 1 : 2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector32();
  }
}

class ChangeDetector33 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0, literal1, arrayFn22, keyedAccess4;

  ChangeDetector33()
      : super(
            "[\"foo\", \"bar\"][0]",
            5,
            ChangeDetector33._gen_propertyBindingTargets,
            ChangeDetector33._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        c_literal0,
        l_literal1,
        c_literal1,
        l_arrayFn22,
        l_literal3,
        l_keyedAccess4;
    c_literal0 = c_literal1 = false;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = "foo";
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      c_literal0 = true;

      this.literal0 = l_literal0;
    }

    l_literal1 = "bar";
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal1, l_literal1)) {
      this.throwOnChangeError(this.literal1, l_literal1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal1, this.literal1)) {
      c_literal1 = true;

      this.literal1 = l_literal1;
    }

    if (c_literal0 || c_literal1) {
      l_arrayFn22 = _gen.ChangeDetectionUtil.arrayFn2(l_literal0, l_literal1);
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil.devModeEqual(this.arrayFn22, l_arrayFn22)) {
        this.throwOnChangeError(this.arrayFn22, l_arrayFn22);
      }

      if (_gen.ChangeDetectionUtil
          .looseNotIdentical(l_arrayFn22, this.arrayFn22)) {
        this.arrayFn22 = l_arrayFn22;
      }
    } else {
      l_arrayFn22 = this.arrayFn22;
    }

    l_literal3 = 0;

    l_keyedAccess4 = l_arrayFn22[l_literal3];
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.keyedAccess4, l_keyedAccess4)) {
      this.throwOnChangeError(this.keyedAccess4, l_keyedAccess4);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_keyedAccess4, this.keyedAccess4)) {
      this.notifyDispatcher(l_keyedAccess4);
      this.logBindingUpdate(l_keyedAccess4);

      this.keyedAccess4 = l_keyedAccess4;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.literal0 = this.literal1 = this.arrayFn22 =
        this.keyedAccess4 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget("elementProperty", 0, "propName",
        null, "[\"foo\", \"bar\"][0] in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector33();
  }
}

class ChangeDetector34 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0, mapFnfoo1, keyedAccess3;

  ChangeDetector34()
      : super(
            "{\"foo\": \"bar\"}[\"foo\"]",
            4,
            ChangeDetector34._gen_propertyBindingTargets,
            ChangeDetector34._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        c_literal0,
        l_mapFnfoo1,
        l_literal2,
        l_keyedAccess3;
    c_literal0 = false;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = "bar";
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      c_literal0 = true;

      this.literal0 = l_literal0;
    }

    if (c_literal0) {
      l_mapFnfoo1 = _gen.ChangeDetectionUtil.mapFn(["foo"])(l_literal0);
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil.devModeEqual(this.mapFnfoo1, l_mapFnfoo1)) {
        this.throwOnChangeError(this.mapFnfoo1, l_mapFnfoo1);
      }

      if (_gen.ChangeDetectionUtil
          .looseNotIdentical(l_mapFnfoo1, this.mapFnfoo1)) {
        this.mapFnfoo1 = l_mapFnfoo1;
      }
    } else {
      l_mapFnfoo1 = this.mapFnfoo1;
    }

    l_literal2 = "foo";

    l_keyedAccess3 = l_mapFnfoo1[l_literal2];
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.keyedAccess3, l_keyedAccess3)) {
      this.throwOnChangeError(this.keyedAccess3, l_keyedAccess3);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_keyedAccess3, this.keyedAccess3)) {
      this.notifyDispatcher(l_keyedAccess3);
      this.logBindingUpdate(l_keyedAccess3);

      this.keyedAccess3 = l_keyedAccess3;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.literal0 = this.mapFnfoo1 =
        this.keyedAccess3 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget("elementProperty", 0, "propName",
        null, "{\"foo\": \"bar\"}[\"foo\"] in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector34();
  }
}

class ChangeDetector35 extends _gen.AbstractChangeDetector<dynamic> {
  var name0;

  ChangeDetector35()
      : super("name", 1, ChangeDetector35._gen_propertyBindingTargets,
            ChangeDetector35._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_name0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_name0 = l_context.name;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.name0, l_name0)) {
      this.throwOnChangeError(this.name0, l_name0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_name0, this.name0)) {
      this.notifyDispatcher(l_name0);
      this.logBindingUpdate(l_name0);

      this.name0 = l_name0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.name0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "name in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector35();
  }
}

class ChangeDetector36 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0, literal1, arrayFn22;

  ChangeDetector36()
      : super("[1, 2]", 3, ChangeDetector36._gen_propertyBindingTargets,
            ChangeDetector36._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        c_literal0,
        l_literal1,
        c_literal1,
        l_arrayFn22;
    c_literal0 = c_literal1 = false;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      c_literal0 = true;

      this.literal0 = l_literal0;
    }

    l_literal1 = 2;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal1, l_literal1)) {
      this.throwOnChangeError(this.literal1, l_literal1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal1, this.literal1)) {
      c_literal1 = true;

      this.literal1 = l_literal1;
    }

    if (c_literal0 || c_literal1) {
      l_arrayFn22 = _gen.ChangeDetectionUtil.arrayFn2(l_literal0, l_literal1);
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil.devModeEqual(this.arrayFn22, l_arrayFn22)) {
        this.throwOnChangeError(this.arrayFn22, l_arrayFn22);
      }

      if (_gen.ChangeDetectionUtil
          .looseNotIdentical(l_arrayFn22, this.arrayFn22)) {
        this.notifyDispatcher(l_arrayFn22);
        this.logBindingUpdate(l_arrayFn22);

        this.arrayFn22 = l_arrayFn22;
      }
    }
    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.literal0 =
        this.literal1 = this.arrayFn22 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "[1, 2] in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector36();
  }
}

class ChangeDetector37 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0, a1, arrayFn22;

  ChangeDetector37()
      : super("[1, a]", 3, ChangeDetector37._gen_propertyBindingTargets,
            ChangeDetector37._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        c_literal0,
        l_a1,
        c_a1,
        l_arrayFn22;
    c_literal0 = c_a1 = false;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      c_literal0 = true;

      this.literal0 = l_literal0;
    }

    l_a1 = l_context.a;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.a1, l_a1)) {
      this.throwOnChangeError(this.a1, l_a1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_a1, this.a1)) {
      c_a1 = true;

      this.a1 = l_a1;
    }

    if (c_literal0 || c_a1) {
      l_arrayFn22 = _gen.ChangeDetectionUtil.arrayFn2(l_literal0, l_a1);
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil.devModeEqual(this.arrayFn22, l_arrayFn22)) {
        this.throwOnChangeError(this.arrayFn22, l_arrayFn22);
      }

      if (_gen.ChangeDetectionUtil
          .looseNotIdentical(l_arrayFn22, this.arrayFn22)) {
        this.notifyDispatcher(l_arrayFn22);
        this.logBindingUpdate(l_arrayFn22);

        this.arrayFn22 = l_arrayFn22;
      }
    }
    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.literal0 =
        this.a1 = this.arrayFn22 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "[1, a] in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector37();
  }
}

class ChangeDetector38 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0, mapFnz1;

  ChangeDetector38()
      : super("{z: 1}", 2, ChangeDetector38._gen_propertyBindingTargets,
            ChangeDetector38._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, c_literal0, l_mapFnz1;
    c_literal0 = false;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      c_literal0 = true;

      this.literal0 = l_literal0;
    }

    if (c_literal0) {
      l_mapFnz1 = _gen.ChangeDetectionUtil.mapFn(["z"])(l_literal0);
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil.devModeEqual(this.mapFnz1, l_mapFnz1)) {
        this.throwOnChangeError(this.mapFnz1, l_mapFnz1);
      }

      if (_gen.ChangeDetectionUtil.looseNotIdentical(l_mapFnz1, this.mapFnz1)) {
        this.notifyDispatcher(l_mapFnz1);
        this.logBindingUpdate(l_mapFnz1);

        this.mapFnz1 = l_mapFnz1;
      }
    }
    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.literal0 = this.mapFnz1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "{z: 1} in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector38();
  }
}

class ChangeDetector39 extends _gen.AbstractChangeDetector<dynamic> {
  var a0, mapFnz1;

  ChangeDetector39()
      : super("{z: a}", 2, ChangeDetector39._gen_propertyBindingTargets,
            ChangeDetector39._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_a0, c_a0, l_mapFnz1;
    c_a0 = false;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_a0 = l_context.a;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.a0, l_a0)) {
      this.throwOnChangeError(this.a0, l_a0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_a0, this.a0)) {
      c_a0 = true;

      this.a0 = l_a0;
    }

    if (c_a0) {
      l_mapFnz1 = _gen.ChangeDetectionUtil.mapFn(["z"])(l_a0);
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil.devModeEqual(this.mapFnz1, l_mapFnz1)) {
        this.throwOnChangeError(this.mapFnz1, l_mapFnz1);
      }

      if (_gen.ChangeDetectionUtil.looseNotIdentical(l_mapFnz1, this.mapFnz1)) {
        this.notifyDispatcher(l_mapFnz1);
        this.logBindingUpdate(l_mapFnz1);

        this.mapFnz1 = l_mapFnz1;
      }
    }
    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.a0 = this.mapFnz1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "{z: a} in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector39();
  }
}

class ChangeDetector40 extends _gen.AbstractChangeDetector<dynamic> {
  var name0, pipe1, pipe1_pipe;

  ChangeDetector40()
      : super("name | pipe", 2, ChangeDetector40._gen_propertyBindingTargets,
            ChangeDetector40._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_name0, c_name0, l_pipe1;
    c_name0 = false;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_name0 = l_context.name;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.name0, l_name0)) {
      this.throwOnChangeError(this.name0, l_name0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_name0, this.name0)) {
      c_name0 = true;

      this.name0 = l_name0;
    }

    if (this.pipe1_pipe == _gen.ChangeDetectionUtil.uninitialized) {
      this.pipe1_pipe = this.pipes.get('pipe');
    }
    if (!this.pipe1_pipe.pure || (c_name0)) {
      l_pipe1 = this.pipe1_pipe.pipe.transform(l_name0, []);
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil.devModeEqual(this.pipe1, l_pipe1)) {
        this.throwOnChangeError(this.pipe1, l_pipe1);
      }

      if (_gen.ChangeDetectionUtil.looseNotIdentical(this.pipe1, l_pipe1)) {
        l_pipe1 = _gen.ChangeDetectionUtil.unwrapValue(l_pipe1);

        this.notifyDispatcher(l_pipe1);
        this.logBindingUpdate(l_pipe1);

        this.pipe1 = l_pipe1;
      }
    }
    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {
      _gen.ChangeDetectionUtil.callPipeOnDestroy(this.pipe1_pipe);
    }
    this.name0 =
        this.pipe1 = this.pipe1_pipe = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "name | pipe in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector40();
  }
}

class ChangeDetector41 extends _gen.AbstractChangeDetector<dynamic> {
  var name0, pipe1, length2, pipe1_pipe;

  ChangeDetector41()
      : super(
            "(name | pipe).length",
            3,
            ChangeDetector41._gen_propertyBindingTargets,
            ChangeDetector41._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_name0, c_name0, l_pipe1, l_length2;
    c_name0 = false;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_name0 = l_context.name;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.name0, l_name0)) {
      this.throwOnChangeError(this.name0, l_name0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_name0, this.name0)) {
      c_name0 = true;

      this.name0 = l_name0;
    }

    if (this.pipe1_pipe == _gen.ChangeDetectionUtil.uninitialized) {
      this.pipe1_pipe = this.pipes.get('pipe');
    }
    if (!this.pipe1_pipe.pure || (c_name0)) {
      l_pipe1 = this.pipe1_pipe.pipe.transform(l_name0, []);
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil.devModeEqual(this.pipe1, l_pipe1)) {
        this.throwOnChangeError(this.pipe1, l_pipe1);
      }

      if (_gen.ChangeDetectionUtil.looseNotIdentical(this.pipe1, l_pipe1)) {
        l_pipe1 = _gen.ChangeDetectionUtil.unwrapValue(l_pipe1);

        this.pipe1 = l_pipe1;
      }
    } else {
      l_pipe1 = this.pipe1;
    }

    l_length2 = l_pipe1.length;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.length2, l_length2)) {
      this.throwOnChangeError(this.length2, l_length2);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_length2, this.length2)) {
      this.notifyDispatcher(l_length2);
      this.logBindingUpdate(l_length2);

      this.length2 = l_length2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {
      _gen.ChangeDetectionUtil.callPipeOnDestroy(this.pipe1_pipe);
    }
    this.name0 = this.pipe1 =
        this.length2 = this.pipe1_pipe = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget("elementProperty", 0, "propName",
        null, "(name | pipe).length in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector41();
  }
}

class ChangeDetector42 extends _gen.AbstractChangeDetector<dynamic> {
  var name0, literal1, city3, pipe4, pipe4_pipe;

  ChangeDetector42()
      : super(
            "name | pipe:'one':address.city",
            5,
            ChangeDetector42._gen_propertyBindingTargets,
            ChangeDetector42._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_name0,
        c_name0,
        l_literal1,
        c_literal1,
        l_address2,
        l_city3,
        c_city3,
        l_pipe4;
    c_name0 = c_literal1 = c_city3 = false;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_name0 = l_context.name;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.name0, l_name0)) {
      this.throwOnChangeError(this.name0, l_name0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_name0, this.name0)) {
      c_name0 = true;

      this.name0 = l_name0;
    }

    l_literal1 = "one";
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal1, l_literal1)) {
      this.throwOnChangeError(this.literal1, l_literal1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal1, this.literal1)) {
      c_literal1 = true;

      this.literal1 = l_literal1;
    }

    l_address2 = l_context.address;

    l_city3 = l_address2.city;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.city3, l_city3)) {
      this.throwOnChangeError(this.city3, l_city3);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_city3, this.city3)) {
      c_city3 = true;

      this.city3 = l_city3;
    }

    if (this.pipe4_pipe == _gen.ChangeDetectionUtil.uninitialized) {
      this.pipe4_pipe = this.pipes.get('pipe');
    }
    if (!this.pipe4_pipe.pure || (c_literal1 || c_city3 || c_name0)) {
      l_pipe4 = this.pipe4_pipe.pipe.transform(l_name0, [l_literal1, l_city3]);
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil.devModeEqual(this.pipe4, l_pipe4)) {
        this.throwOnChangeError(this.pipe4, l_pipe4);
      }

      if (_gen.ChangeDetectionUtil.looseNotIdentical(this.pipe4, l_pipe4)) {
        l_pipe4 = _gen.ChangeDetectionUtil.unwrapValue(l_pipe4);

        this.notifyDispatcher(l_pipe4);
        this.logBindingUpdate(l_pipe4);

        this.pipe4 = l_pipe4;
      }
    }
    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {
      _gen.ChangeDetectionUtil.callPipeOnDestroy(this.pipe4_pipe);
    }
    this.name0 = this.literal1 = this.city3 =
        this.pipe4 = this.pipe4_pipe = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget("elementProperty", 0, "propName",
        null, "name | pipe:'one':address.city in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector42();
  }
}

class ChangeDetector43 extends _gen.AbstractChangeDetector<dynamic> {
  var name0,
      literal1,
      literal2,
      pipe3,
      literal4,
      literal5,
      literal6,
      pipe7,
      pipe3_pipe,
      pipe7_pipe;

  ChangeDetector43()
      : super(
            "name | pipe:'a':'b' | pipe:0:1:2",
            8,
            ChangeDetector43._gen_propertyBindingTargets,
            ChangeDetector43._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_name0,
        c_name0,
        l_literal1,
        c_literal1,
        l_literal2,
        c_literal2,
        l_pipe3,
        c_pipe3,
        l_literal4,
        c_literal4,
        l_literal5,
        c_literal5,
        l_literal6,
        c_literal6,
        l_pipe7;
    c_name0 = c_literal1 =
        c_literal2 = c_pipe3 = c_literal4 = c_literal5 = c_literal6 = false;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_name0 = l_context.name;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.name0, l_name0)) {
      this.throwOnChangeError(this.name0, l_name0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_name0, this.name0)) {
      c_name0 = true;

      this.name0 = l_name0;
    }

    l_literal1 = "a";
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal1, l_literal1)) {
      this.throwOnChangeError(this.literal1, l_literal1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal1, this.literal1)) {
      c_literal1 = true;

      this.literal1 = l_literal1;
    }

    l_literal2 = "b";
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal2, l_literal2)) {
      this.throwOnChangeError(this.literal2, l_literal2);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal2, this.literal2)) {
      c_literal2 = true;

      this.literal2 = l_literal2;
    }

    if (this.pipe3_pipe == _gen.ChangeDetectionUtil.uninitialized) {
      this.pipe3_pipe = this.pipes.get('pipe');
    }
    if (!this.pipe3_pipe.pure || (c_literal1 || c_literal2 || c_name0)) {
      l_pipe3 =
          this.pipe3_pipe.pipe.transform(l_name0, [l_literal1, l_literal2]);
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil.devModeEqual(this.pipe3, l_pipe3)) {
        this.throwOnChangeError(this.pipe3, l_pipe3);
      }

      if (_gen.ChangeDetectionUtil.looseNotIdentical(this.pipe3, l_pipe3)) {
        l_pipe3 = _gen.ChangeDetectionUtil.unwrapValue(l_pipe3);
        c_pipe3 = true;

        this.pipe3 = l_pipe3;
      }
    } else {
      l_pipe3 = this.pipe3;
    }

    l_literal4 = 0;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal4, l_literal4)) {
      this.throwOnChangeError(this.literal4, l_literal4);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal4, this.literal4)) {
      c_literal4 = true;

      this.literal4 = l_literal4;
    }

    l_literal5 = 1;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal5, l_literal5)) {
      this.throwOnChangeError(this.literal5, l_literal5);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal5, this.literal5)) {
      c_literal5 = true;

      this.literal5 = l_literal5;
    }

    l_literal6 = 2;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal6, l_literal6)) {
      this.throwOnChangeError(this.literal6, l_literal6);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal6, this.literal6)) {
      c_literal6 = true;

      this.literal6 = l_literal6;
    }

    if (this.pipe7_pipe == _gen.ChangeDetectionUtil.uninitialized) {
      this.pipe7_pipe = this.pipes.get('pipe');
    }
    if (!this.pipe7_pipe.pure ||
        (c_literal4 || c_literal5 || c_literal6 || c_pipe3)) {
      l_pipe7 = this
          .pipe7_pipe
          .pipe
          .transform(l_pipe3, [l_literal4, l_literal5, l_literal6]);
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil.devModeEqual(this.pipe7, l_pipe7)) {
        this.throwOnChangeError(this.pipe7, l_pipe7);
      }

      if (_gen.ChangeDetectionUtil.looseNotIdentical(this.pipe7, l_pipe7)) {
        l_pipe7 = _gen.ChangeDetectionUtil.unwrapValue(l_pipe7);

        this.notifyDispatcher(l_pipe7);
        this.logBindingUpdate(l_pipe7);

        this.pipe7 = l_pipe7;
      }
    }
    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {
      _gen.ChangeDetectionUtil.callPipeOnDestroy(this.pipe3_pipe);
      _gen.ChangeDetectionUtil.callPipeOnDestroy(this.pipe7_pipe);
    }
    this.name0 = this.literal1 = this.literal2 = this.pipe3 = this.literal4 =
        this.literal5 = this.literal6 = this.pipe7 = this.pipe3_pipe =
            this.pipe7_pipe = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget("elementProperty", 0, "propName",
        null, "name | pipe:'a':'b' | pipe:0:1:2 in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector43();
  }
}

class ChangeDetector44 extends _gen.AbstractChangeDetector<dynamic> {
  var value0;

  ChangeDetector44()
      : super("value", 1, ChangeDetector44._gen_propertyBindingTargets,
            ChangeDetector44._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_value0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_value0 = l_context.value;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.value0, l_value0)) {
      this.throwOnChangeError(this.value0, l_value0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_value0, this.value0)) {
      this.notifyDispatcher(l_value0);
      this.logBindingUpdate(l_value0);

      this.value0 = l_value0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.value0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "value in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector44();
  }
}

class ChangeDetector45 extends _gen.AbstractChangeDetector<dynamic> {
  var a0;

  ChangeDetector45()
      : super("a", 1, ChangeDetector45._gen_propertyBindingTargets,
            ChangeDetector45._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_a0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_a0 = l_context.a;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.a0, l_a0)) {
      this.throwOnChangeError(this.a0, l_a0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_a0, this.a0)) {
      this.notifyDispatcher(l_a0);
      this.logBindingUpdate(l_a0);

      this.a0 = l_a0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.a0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil
        .bindingTarget("elementProperty", 0, "propName", null, "a in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector45();
  }
}

class ChangeDetector46 extends _gen.AbstractChangeDetector<dynamic> {
  var city1;

  ChangeDetector46()
      : super("address.city", 2, ChangeDetector46._gen_propertyBindingTargets,
            ChangeDetector46._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_address0, l_city1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_address0 = l_context.address;

    l_city1 = l_address0.city;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.city1, l_city1)) {
      this.throwOnChangeError(this.city1, l_city1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_city1, this.city1)) {
      this.notifyDispatcher(l_city1);
      this.logBindingUpdate(l_city1);

      this.city1 = l_city1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.city1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "address.city in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector46();
  }
}

class ChangeDetector47 extends _gen.AbstractChangeDetector<dynamic> {
  var city1;

  ChangeDetector47()
      : super("address?.city", 2, ChangeDetector47._gen_propertyBindingTargets,
            ChangeDetector47._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_address0, l_city1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_address0 = l_context.address;

    l_city1 = _gen.ChangeDetectionUtil.isValueBlank(l_address0)
        ? null
        : l_address0.city;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.city1, l_city1)) {
      this.throwOnChangeError(this.city1, l_city1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_city1, this.city1)) {
      this.notifyDispatcher(l_city1);
      this.logBindingUpdate(l_city1);

      this.city1 = l_city1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.city1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "address?.city in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector47();
  }
}

class ChangeDetector48 extends _gen.AbstractChangeDetector<dynamic> {
  var toString1;

  ChangeDetector48()
      : super(
            "address?.toString()",
            2,
            ChangeDetector48._gen_propertyBindingTargets,
            ChangeDetector48._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_address0, l_toString1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_address0 = l_context.address;

    l_toString1 = _gen.ChangeDetectionUtil.isValueBlank(l_address0)
        ? null
        : l_address0.toString();
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.toString1, l_toString1)) {
      this.throwOnChangeError(this.toString1, l_toString1);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_toString1, this.toString1)) {
      this.notifyDispatcher(l_toString1);
      this.logBindingUpdate(l_toString1);

      this.toString1 = l_toString1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.toString1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget("elementProperty", 0, "propName",
        null, "address?.toString() in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector48();
  }
}

class ChangeDetector49 extends _gen.AbstractChangeDetector<dynamic> {
  var sayHi1;

  ChangeDetector49()
      : super("sayHi(\"Jim\")", 2, ChangeDetector49._gen_propertyBindingTargets,
            ChangeDetector49._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_sayHi1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = "Jim";

    l_sayHi1 = l_context.sayHi(l_literal0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.sayHi1, l_sayHi1)) {
      this.throwOnChangeError(this.sayHi1, l_sayHi1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_sayHi1, this.sayHi1)) {
      this.notifyDispatcher(l_sayHi1);
      this.logBindingUpdate(l_sayHi1);

      this.sayHi1 = l_sayHi1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.sayHi1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "sayHi(\"Jim\") in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector49();
  }
}

class ChangeDetector50 extends _gen.AbstractChangeDetector<dynamic> {
  var closure2;

  ChangeDetector50()
      : super("a()(99)", 3, ChangeDetector50._gen_propertyBindingTargets,
            ChangeDetector50._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_a0, l_literal1, l_closure2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_a0 = l_context.a();

    l_literal1 = 99;

    l_closure2 = l_a0(l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.closure2, l_closure2)) {
      this.throwOnChangeError(this.closure2, l_closure2);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_closure2, this.closure2)) {
      this.notifyDispatcher(l_closure2);
      this.logBindingUpdate(l_closure2);

      this.closure2 = l_closure2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.closure2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "a()(99) in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector50();
  }
}

class ChangeDetector51 extends _gen.AbstractChangeDetector<dynamic> {
  var sayHi2;

  ChangeDetector51()
      : super(
            "a.sayHi(\"Jim\")",
            3,
            ChangeDetector51._gen_propertyBindingTargets,
            ChangeDetector51._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_a0, l_literal1, l_sayHi2;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_a0 = l_context.a;

    l_literal1 = "Jim";

    l_sayHi2 = l_a0.sayHi(l_literal1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.sayHi2, l_sayHi2)) {
      this.throwOnChangeError(this.sayHi2, l_sayHi2);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_sayHi2, this.sayHi2)) {
      this.notifyDispatcher(l_sayHi2);
      this.logBindingUpdate(l_sayHi2);

      this.sayHi2 = l_sayHi2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.sayHi2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "a.sayHi(\"Jim\") in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector51();
  }
}

class ChangeDetector52 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0, arrayFn11, passThrough2;

  ChangeDetector52()
      : super(
            "passThrough([12])",
            3,
            ChangeDetector52._gen_propertyBindingTargets,
            ChangeDetector52._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        c_literal0,
        l_arrayFn11,
        l_passThrough2;
    c_literal0 = false;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 12;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      c_literal0 = true;

      this.literal0 = l_literal0;
    }

    if (c_literal0) {
      l_arrayFn11 = _gen.ChangeDetectionUtil.arrayFn1(l_literal0);
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil.devModeEqual(this.arrayFn11, l_arrayFn11)) {
        this.throwOnChangeError(this.arrayFn11, l_arrayFn11);
      }

      if (_gen.ChangeDetectionUtil
          .looseNotIdentical(l_arrayFn11, this.arrayFn11)) {
        this.arrayFn11 = l_arrayFn11;
      }
    } else {
      l_arrayFn11 = this.arrayFn11;
    }

    l_passThrough2 = l_context.passThrough(l_arrayFn11);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil
            .devModeEqual(this.passThrough2, l_passThrough2)) {
      this.throwOnChangeError(this.passThrough2, l_passThrough2);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_passThrough2, this.passThrough2)) {
      this.notifyDispatcher(l_passThrough2);
      this.logBindingUpdate(l_passThrough2);

      this.passThrough2 = l_passThrough2;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.literal0 = this.arrayFn11 =
        this.passThrough2 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "passThrough([12]) in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector52();
  }
}

class ChangeDetector53 extends _gen.AbstractChangeDetector<dynamic> {
  var invalidFn1;

  ChangeDetector53()
      : super("invalidFn(1)", 2, ChangeDetector53._gen_propertyBindingTargets,
            ChangeDetector53._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_invalidFn1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;

    l_invalidFn1 = l_context.invalidFn(l_literal0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.invalidFn1, l_invalidFn1)) {
      this.throwOnChangeError(this.invalidFn1, l_invalidFn1);
    }

    if (_gen.ChangeDetectionUtil
        .looseNotIdentical(l_invalidFn1, this.invalidFn1)) {
      this.notifyDispatcher(l_invalidFn1);
      this.logBindingUpdate(l_invalidFn1);

      this.invalidFn1 = l_invalidFn1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.invalidFn1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "invalidFn(1) in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector53();
  }
}

class ChangeDetector54 extends _gen.AbstractChangeDetector<dynamic> {
  var age0;

  ChangeDetector54()
      : super("age", 1, ChangeDetector54._gen_propertyBindingTargets,
            ChangeDetector54._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_age0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_age0 = l_context.age;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.age0, l_age0)) {
      this.throwOnChangeError(this.age0, l_age0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_age0, this.age0)) {
      this.notifyDispatcher(l_age0);
      this.logBindingUpdate(l_age0);

      this.age0 = l_age0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.age0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "age in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector54();
  }
}

class ChangeDetector55 extends _gen.AbstractChangeDetector<dynamic> {
  var cond5;

  ChangeDetector55()
      : super(
            "true ? city : zipcode",
            6,
            ChangeDetector55._gen_propertyBindingTargets,
            ChangeDetector55._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_SkipRecordsIfNot1,
        l_city2,
        l_SkipRecords3,
        l_zipcode4,
        l_cond5;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = true;

    if (l_literal0) {
      l_city2 = l_context.city;
    } else {
      l_zipcode4 = l_context.zipcode;
    }

    l_cond5 = _gen.ChangeDetectionUtil.cond(l_literal0, l_city2, l_zipcode4);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond5, l_cond5)) {
      this.throwOnChangeError(this.cond5, l_cond5);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond5, this.cond5)) {
      this.notifyDispatcher(l_cond5);
      this.logBindingUpdate(l_cond5);

      this.cond5 = l_cond5;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond5 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget("elementProperty", 0, "propName",
        null, "true ? city : zipcode in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector55();
  }
}

class ChangeDetector56 extends _gen.AbstractChangeDetector<dynamic> {
  var cond5;

  ChangeDetector56()
      : super(
            "false ? city : zipcode",
            6,
            ChangeDetector56._gen_propertyBindingTargets,
            ChangeDetector56._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_SkipRecordsIfNot1,
        l_city2,
        l_SkipRecords3,
        l_zipcode4,
        l_cond5;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = false;

    if (l_literal0) {
      l_city2 = l_context.city;
    } else {
      l_zipcode4 = l_context.zipcode;
    }

    l_cond5 = _gen.ChangeDetectionUtil.cond(l_literal0, l_city2, l_zipcode4);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond5, l_cond5)) {
      this.throwOnChangeError(this.cond5, l_cond5);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond5, this.cond5)) {
      this.notifyDispatcher(l_cond5);
      this.logBindingUpdate(l_cond5);

      this.cond5 = l_cond5;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond5 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget("elementProperty", 0, "propName",
        null, "false ? city : zipcode in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector56();
  }
}

class ChangeDetector57 extends _gen.AbstractChangeDetector<dynamic> {
  var cond3;

  ChangeDetector57()
      : super(
            "getTrue() && getTrue()",
            4,
            ChangeDetector57._gen_propertyBindingTargets,
            ChangeDetector57._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_getTrue0,
        l_SkipRecordsIfNot1,
        l_getTrue2,
        l_cond3;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_getTrue0 = l_context.getTrue();

    if (l_getTrue0) {
      l_getTrue2 = l_context.getTrue();
    }

    l_cond3 = _gen.ChangeDetectionUtil.cond(l_getTrue0, l_getTrue2, l_getTrue0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond3, l_cond3)) {
      this.throwOnChangeError(this.cond3, l_cond3);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond3, this.cond3)) {
      this.notifyDispatcher(l_cond3);
      this.logBindingUpdate(l_cond3);

      this.cond3 = l_cond3;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond3 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget("elementProperty", 0, "propName",
        null, "getTrue() && getTrue() in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector57();
  }
}

class ChangeDetector58 extends _gen.AbstractChangeDetector<dynamic> {
  var cond3;

  ChangeDetector58()
      : super(
            "getFalse() && getTrue()",
            4,
            ChangeDetector58._gen_propertyBindingTargets,
            ChangeDetector58._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_getFalse0,
        l_SkipRecordsIfNot1,
        l_getTrue2,
        l_cond3;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_getFalse0 = l_context.getFalse();

    if (l_getFalse0) {
      l_getTrue2 = l_context.getTrue();
    }

    l_cond3 =
        _gen.ChangeDetectionUtil.cond(l_getFalse0, l_getTrue2, l_getFalse0);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond3, l_cond3)) {
      this.throwOnChangeError(this.cond3, l_cond3);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond3, this.cond3)) {
      this.notifyDispatcher(l_cond3);
      this.logBindingUpdate(l_cond3);

      this.cond3 = l_cond3;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond3 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget("elementProperty", 0, "propName",
        null, "getFalse() && getTrue() in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector58();
  }
}

class ChangeDetector59 extends _gen.AbstractChangeDetector<dynamic> {
  var cond3;

  ChangeDetector59()
      : super(
            "getFalse() || getFalse()",
            4,
            ChangeDetector59._gen_propertyBindingTargets,
            ChangeDetector59._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_getFalse0,
        l_SkipRecordsIf1,
        l_getFalse2,
        l_cond3;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_getFalse0 = l_context.getFalse();

    if (!l_getFalse0) {
      l_getFalse2 = l_context.getFalse();
    }

    l_cond3 =
        _gen.ChangeDetectionUtil.cond(l_getFalse0, l_getFalse0, l_getFalse2);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond3, l_cond3)) {
      this.throwOnChangeError(this.cond3, l_cond3);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond3, this.cond3)) {
      this.notifyDispatcher(l_cond3);
      this.logBindingUpdate(l_cond3);

      this.cond3 = l_cond3;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond3 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget("elementProperty", 0, "propName",
        null, "getFalse() || getFalse() in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector59();
  }
}

class ChangeDetector60 extends _gen.AbstractChangeDetector<dynamic> {
  var cond3;

  ChangeDetector60()
      : super(
            "getTrue() || getFalse()",
            4,
            ChangeDetector60._gen_propertyBindingTargets,
            ChangeDetector60._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_getTrue0,
        l_SkipRecordsIf1,
        l_getFalse2,
        l_cond3;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_getTrue0 = l_context.getTrue();

    if (!l_getTrue0) {
      l_getFalse2 = l_context.getFalse();
    }

    l_cond3 =
        _gen.ChangeDetectionUtil.cond(l_getTrue0, l_getTrue0, l_getFalse2);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond3, l_cond3)) {
      this.throwOnChangeError(this.cond3, l_cond3);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond3, this.cond3)) {
      this.notifyDispatcher(l_cond3);
      this.logBindingUpdate(l_cond3);

      this.cond3 = l_cond3;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond3 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget("elementProperty", 0, "propName",
        null, "getTrue() || getFalse() in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector60();
  }
}

class ChangeDetector61 extends _gen.AbstractChangeDetector<dynamic> {
  var cond15;

  ChangeDetector61()
      : super(
            "name == \"Victor\" ? (true ? address.city : address.zipcode) : address.zipcode",
            16,
            ChangeDetector61._gen_propertyBindingTargets,
            ChangeDetector61._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_name0,
        l_literal1,
        l_operation_equals2,
        l_SkipRecordsIfNot3,
        l_literal4,
        l_SkipRecordsIfNot5,
        l_address6,
        l_city7,
        l_SkipRecords8,
        l_address9,
        l_zipcode10,
        l_cond11,
        l_SkipRecords12,
        l_address13,
        l_zipcode14,
        l_cond15;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_name0 = l_context.name;

    l_literal1 = "Victor";

    l_operation_equals2 =
        _gen.ChangeDetectionUtil.operation_equals(l_name0, l_literal1);

    if (l_operation_equals2) {
      l_literal4 = true;

      if (l_literal4) {
        l_address6 = l_context.address;

        l_city7 = l_address6.city;
      } else {
        l_address9 = l_context.address;

        l_zipcode10 = l_address9.zipcode;
      }

      l_cond11 =
          _gen.ChangeDetectionUtil.cond(l_literal4, l_city7, l_zipcode10);
    } else {
      l_address13 = l_context.address;

      l_zipcode14 = l_address13.zipcode;
    }

    l_cond15 = _gen.ChangeDetectionUtil
        .cond(l_operation_equals2, l_cond11, l_zipcode14);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.cond15, l_cond15)) {
      this.throwOnChangeError(this.cond15, l_cond15);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_cond15, this.cond15)) {
      this.notifyDispatcher(l_cond15);
      this.logBindingUpdate(l_cond15);

      this.cond15 = l_cond15;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.cond15 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty",
        0,
        "propName",
        null,
        "name == \"Victor\" ? (true ? address.city : address.zipcode) : address.zipcode in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector61();
  }
}

class ChangeDetector62 extends _gen.AbstractChangeDetector<dynamic> {
  var key0;

  ChangeDetector62()
      : super(
            "valueFromLocals",
            1,
            ChangeDetector62._gen_propertyBindingTargets,
            ChangeDetector62._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_key0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_key0 = this.locals.get(r'key');
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.key0, l_key0)) {
      this.throwOnChangeError(this.key0, l_key0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_key0, this.key0)) {
      this.notifyDispatcher(l_key0);
      this.logBindingUpdate(l_key0);

      this.key0 = l_key0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.key0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "key in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector62();
  }
}

class ChangeDetector63 extends _gen.AbstractChangeDetector<dynamic> {
  var closure1;

  ChangeDetector63()
      : super(
            "functionFromLocals",
            2,
            ChangeDetector63._gen_propertyBindingTargets,
            ChangeDetector63._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_key0, l_closure1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_key0 = this.locals.get(r'key');

    l_closure1 = l_key0();
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.closure1, l_closure1)) {
      this.throwOnChangeError(this.closure1, l_closure1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_closure1, this.closure1)) {
      this.notifyDispatcher(l_closure1);
      this.logBindingUpdate(l_closure1);

      this.closure1 = l_closure1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.closure1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "key() in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector63();
  }
}

class ChangeDetector64 extends _gen.AbstractChangeDetector<dynamic> {
  var key0;

  ChangeDetector64()
      : super("nestedLocals", 1, ChangeDetector64._gen_propertyBindingTargets,
            ChangeDetector64._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_key0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_key0 = this.locals.get(r'key');
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.key0, l_key0)) {
      this.throwOnChangeError(this.key0, l_key0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_key0, this.key0)) {
      this.notifyDispatcher(l_key0);
      this.logBindingUpdate(l_key0);

      this.key0 = l_key0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.key0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "key in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector64();
  }
}

class ChangeDetector65 extends _gen.AbstractChangeDetector<dynamic> {
  var name0;

  ChangeDetector65()
      : super("fallbackLocals", 1, ChangeDetector65._gen_propertyBindingTargets,
            ChangeDetector65._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_name0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_name0 = l_context.name;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.name0, l_name0)) {
      this.throwOnChangeError(this.name0, l_name0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_name0, this.name0)) {
      this.notifyDispatcher(l_name0);
      this.logBindingUpdate(l_name0);

      this.name0 = l_name0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.name0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "name in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector65();
  }
}

class ChangeDetector66 extends _gen.AbstractChangeDetector<dynamic> {
  var city1;

  ChangeDetector66()
      : super(
            "contextNestedPropertyWithLocals",
            2,
            ChangeDetector66._gen_propertyBindingTargets,
            ChangeDetector66._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_address0, l_city1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_address0 = l_context.address;

    l_city1 = l_address0.city;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.city1, l_city1)) {
      this.throwOnChangeError(this.city1, l_city1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_city1, this.city1)) {
      this.notifyDispatcher(l_city1);
      this.logBindingUpdate(l_city1);

      this.city1 = l_city1;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.city1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "address.city in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector66();
  }
}

class ChangeDetector67 extends _gen.AbstractChangeDetector<dynamic> {
  var city0;

  ChangeDetector67()
      : super(
            "localPropertyWithSimilarContext",
            1,
            ChangeDetector67._gen_propertyBindingTargets,
            ChangeDetector67._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_city0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_city0 = this.locals.get(r'city');
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.city0, l_city0)) {
      this.throwOnChangeError(this.city0, l_city0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_city0, this.city0)) {
      this.notifyDispatcher(l_city0);
      this.logBindingUpdate(l_city0);

      this.city0 = l_city0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.city0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "city in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector67();
  }
}

class ChangeDetector68 extends _gen.AbstractChangeDetector<dynamic> {
  ChangeDetector68()
      : super(
            "emptyUsingDefaultStrategy",
            0,
            ChangeDetector68._gen_propertyBindingTargets,
            ChangeDetector68._gen_directiveIndices,
            _gen.ChangeDetectionStrategy.Default) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector68();
  }
}

class ChangeDetector69 extends _gen.AbstractChangeDetector<dynamic> {
  ChangeDetector69()
      : super(
            "emptyUsingOnPushStrategy",
            0,
            ChangeDetector69._gen_propertyBindingTargets,
            ChangeDetector69._gen_directiveIndices,
            _gen.ChangeDetectionStrategy.OnPush) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector69();
  }
}

class ChangeDetector70 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0, self1, directive_0_0, directive_0_1, detector_0_1;

  ChangeDetector70()
      : super(
            "onPushRecordsUsingDefaultStrategy",
            2,
            ChangeDetector70._gen_propertyBindingTargets,
            ChangeDetector70._gen_directiveIndices,
            _gen.ChangeDetectionStrategy.Default) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0, l_self1;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 42;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      this.directive_0_0.a = l_literal0;
      this.logBindingUpdate(l_literal0);
      isChanged = true;

      this.literal0 = l_literal0;
    }

    changes = null;

    isChanged = false;

    this.propertyBindingIndex = 1;
    l_self1 = l_literal0;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.self1, l_self1)) {
      this.throwOnChangeError(this.self1, l_self1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_self1, this.self1)) {
      this.directive_0_1.a = l_self1;
      this.logBindingUpdate(l_self1);
      isChanged = true;

      this.self1 = l_self1;
    }

    changes = null;
    if (isChanged) {
      this.detector_0_1.markAsCheckOnce();
    }

    isChanged = false;
  }

  void hydrateDirectives(directives) {
    this.directive_0_0 = this.getDirectiveFor(directives, 0);
    this.directive_0_1 = this.getDirectiveFor(directives, 1);
    this.detector_0_1 = this.getDetectorFor(directives, 1);
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.literal0 = this.self1 = this.directive_0_0 = this.directive_0_1 =
        this.detector_0_1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil
        .bindingTarget("directive", 0, "a", null, "42 in location"),
    _gen.ChangeDetectionUtil
        .bindingTarget("directive", 0, "a", null, "42 in location")
  ];

  static final _gen_directiveIndices = [
    _gen.ChangeDetectionUtil.directiveIndex(0, 0),
    _gen.ChangeDetectionUtil.directiveIndex(0, 1)
  ];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector70();
  }
}

class ChangeDetector71 extends _gen.AbstractChangeDetector<dynamic> {
  var directive_0_0, directive_0_1, detector_0_1;

  ChangeDetector71()
      : super(
            "onPushWithEvent",
            0,
            ChangeDetector71._gen_propertyBindingTargets,
            ChangeDetector71._gen_directiveIndices,
            _gen.ChangeDetectionStrategy.OnPush) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  handleEventInternal(eventName, elIndex, locals) {
    var preventDefault = false;
    var l_context = this.context, l_literal0_0, l_literal0_1;
    if (eventName == "event" && elIndex == 0) {
      l_literal0_0 = false;

      if (l_literal0_0 == false) {
        preventDefault = true;
      }
    }
    if (eventName == "host-event" && elIndex == 0) {
      l_literal0_1 = false;
      this.detector_0_1.markPathToRootAsCheckOnce();
      if (l_literal0_1 == false) {
        preventDefault = true;
      }
    }
    return preventDefault;
  }

  void hydrateDirectives(directives) {
    this.directive_0_0 = this.getDirectiveFor(directives, 0);
    this.directive_0_1 = this.getDirectiveFor(directives, 1);
    this.detector_0_1 = this.getDetectorFor(directives, 1);
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.directive_0_0 = this.directive_0_1 =
        this.detector_0_1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [
    _gen.ChangeDetectionUtil.directiveIndex(0, 0),
    _gen.ChangeDetectionUtil.directiveIndex(0, 1)
  ];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector71();
  }
}

class ChangeDetector72 extends _gen.AbstractChangeDetector<dynamic> {
  var directive_0_0, directive_0_1, detector_0_1;

  ChangeDetector72()
      : super(
            "onPushWithHostEvent",
            0,
            ChangeDetector72._gen_propertyBindingTargets,
            ChangeDetector72._gen_directiveIndices,
            _gen.ChangeDetectionStrategy.OnPush) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  handleEventInternal(eventName, elIndex, locals) {
    var preventDefault = false;
    var l_context = this.context, l_literal0_0, l_literal0_1;
    if (eventName == "event" && elIndex == 0) {
      l_literal0_0 = false;

      if (l_literal0_0 == false) {
        preventDefault = true;
      }
    }
    if (eventName == "host-event" && elIndex == 0) {
      l_literal0_1 = false;
      this.detector_0_1.markPathToRootAsCheckOnce();
      if (l_literal0_1 == false) {
        preventDefault = true;
      }
    }
    return preventDefault;
  }

  void hydrateDirectives(directives) {
    this.directive_0_0 = this.getDirectiveFor(directives, 0);
    this.directive_0_1 = this.getDirectiveFor(directives, 1);
    this.detector_0_1 = this.getDetectorFor(directives, 1);
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.directive_0_0 = this.directive_0_1 =
        this.detector_0_1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [
    _gen.ChangeDetectionUtil.directiveIndex(0, 0),
    _gen.ChangeDetectionUtil.directiveIndex(0, 1)
  ];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector72();
  }
}

class ChangeDetector73 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0, directive_0_0;

  ChangeDetector73()
      : super(
            "directNoDispatcher",
            1,
            ChangeDetector73._gen_propertyBindingTargets,
            ChangeDetector73._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 42;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      this.directive_0_0.a = l_literal0;
      this.logBindingUpdate(l_literal0);
      isChanged = true;

      changes = addChange(changes, this.literal0, l_literal0);
      this.literal0 = l_literal0;
    }

    changes = null;

    isChanged = false;
  }

  void afterContentLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterContentInit();
    this.directive_0_0.ngAfterContentChecked();
  }

  void afterViewLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterViewInit();
    this.directive_0_0.ngAfterViewChecked();
  }

  void hydrateDirectives(directives) {
    this.outputSubscriptions = new List(1);
    this.directive_0_0 = this.getDirectiveFor(directives, 0);
    this.outputSubscriptions[0] = this
        .directive_0_0
        .eventEmitter
        .listen((event) => this.handleEvent('host-event', 0, event));
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {
      this.directive_0_0.ngOnDestroy();
    }
    this.literal0 = this.directive_0_0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil
        .bindingTarget("directive", 0, "a", null, "42 in location")
  ];

  static final _gen_directiveIndices = [
    _gen.ChangeDetectionUtil.directiveIndex(0, 0)
  ];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector73();
  }
}

class ChangeDetector74 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0,
      literal1,
      OnChanges2,
      literal3,
      OnChanges4,
      directive_0_0,
      directive_0_1;

  ChangeDetector74()
      : super("groupChanges", 5, ChangeDetector74._gen_propertyBindingTargets,
            ChangeDetector74._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context,
        l_literal0,
        l_literal1,
        l_OnChanges2,
        l_literal3,
        l_OnChanges4;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      this.directive_0_0.a = l_literal0;
      this.logBindingUpdate(l_literal0);
      isChanged = true;

      changes = addChange(changes, this.literal0, l_literal0);
      this.literal0 = l_literal0;
    }

    this.propertyBindingIndex = 1;
    l_literal1 = 2;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal1, l_literal1)) {
      this.throwOnChangeError(this.literal1, l_literal1);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal1, this.literal1)) {
      this.directive_0_0.b = l_literal1;
      this.logBindingUpdate(l_literal1);
      isChanged = true;

      changes = addChange(changes, this.literal1, l_literal1);
      this.literal1 = l_literal1;
    }

    if (!throwOnChange && changes != null)
      this.directive_0_0.ngOnChanges(changes);
    changes = null;

    isChanged = false;

    this.propertyBindingIndex = 3;
    l_literal3 = 3;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal3, l_literal3)) {
      this.throwOnChangeError(this.literal3, l_literal3);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal3, this.literal3)) {
      this.directive_0_1.a = l_literal3;
      this.logBindingUpdate(l_literal3);
      isChanged = true;

      changes = addChange(changes, this.literal3, l_literal3);
      this.literal3 = l_literal3;
    }

    if (!throwOnChange && changes != null)
      this.directive_0_1.ngOnChanges(changes);
    changes = null;

    isChanged = false;
  }

  void afterContentLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_1.ngAfterContentInit();
    this.directive_0_1.ngAfterContentChecked();
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterContentInit();
    this.directive_0_0.ngAfterContentChecked();
  }

  void afterViewLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_1.ngAfterViewInit();
    this.directive_0_1.ngAfterViewChecked();
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterViewInit();
    this.directive_0_0.ngAfterViewChecked();
  }

  void hydrateDirectives(directives) {
    this.outputSubscriptions = new List(2);
    this.directive_0_0 = this.getDirectiveFor(directives, 0);
    this.outputSubscriptions[0] = this
        .directive_0_0
        .eventEmitter
        .listen((event) => this.handleEvent('host-event', 0, event));
    this.directive_0_1 = this.getDirectiveFor(directives, 1);
    this.outputSubscriptions[1] = this
        .directive_0_1
        .eventEmitter
        .listen((event) => this.handleEvent('host-event', 0, event));
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {
      this.directive_0_0.ngOnDestroy();
      this.directive_0_1.ngOnDestroy();
    }
    this.literal0 = this.literal1 = this.OnChanges2 = this.literal3 =
        this.OnChanges4 = this.directive_0_0 =
            this.directive_0_1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil
        .bindingTarget("directive", 0, "a", null, "1 in location"),
    _gen.ChangeDetectionUtil
        .bindingTarget("directive", 0, "b", null, "2 in location"),
    null,
    _gen.ChangeDetectionUtil
        .bindingTarget("directive", 0, "a", null, "3 in location"),
    null
  ];

  static final _gen_directiveIndices = [
    _gen.ChangeDetectionUtil.directiveIndex(0, 0),
    _gen.ChangeDetectionUtil.directiveIndex(0, 1)
  ];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector74();
  }
}

class ChangeDetector75 extends _gen.AbstractChangeDetector<dynamic> {
  var DoCheck0, directive_0_0;

  ChangeDetector75()
      : super(
            "directiveDoCheck",
            1,
            ChangeDetector75._gen_propertyBindingTargets,
            ChangeDetector75._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_DoCheck0;
    var isChanged = false;
    var changes = null;

    if (!throwOnChange) this.directive_0_0.ngDoCheck();
    changes = null;

    isChanged = false;
  }

  void afterContentLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterContentInit();
    this.directive_0_0.ngAfterContentChecked();
  }

  void afterViewLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterViewInit();
    this.directive_0_0.ngAfterViewChecked();
  }

  void hydrateDirectives(directives) {
    this.outputSubscriptions = new List(1);
    this.directive_0_0 = this.getDirectiveFor(directives, 0);
    this.outputSubscriptions[0] = this
        .directive_0_0
        .eventEmitter
        .listen((event) => this.handleEvent('host-event', 0, event));
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {
      this.directive_0_0.ngOnDestroy();
    }
    this.DoCheck0 = this.directive_0_0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [null];

  static final _gen_directiveIndices = [
    _gen.ChangeDetectionUtil.directiveIndex(0, 0)
  ];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector75();
  }
}

class ChangeDetector76 extends _gen.AbstractChangeDetector<dynamic> {
  var OnInit0, directive_0_0;

  ChangeDetector76()
      : super(
            "directiveOnInit",
            1,
            ChangeDetector76._gen_propertyBindingTargets,
            ChangeDetector76._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_OnInit0;
    var isChanged = false;
    var changes = null;

    if (!throwOnChange && this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngOnInit();
    changes = null;

    isChanged = false;
  }

  void afterContentLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterContentInit();
    this.directive_0_0.ngAfterContentChecked();
  }

  void afterViewLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterViewInit();
    this.directive_0_0.ngAfterViewChecked();
  }

  void hydrateDirectives(directives) {
    this.outputSubscriptions = new List(1);
    this.directive_0_0 = this.getDirectiveFor(directives, 0);
    this.outputSubscriptions[0] = this
        .directive_0_0
        .eventEmitter
        .listen((event) => this.handleEvent('host-event', 0, event));
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {
      this.directive_0_0.ngOnDestroy();
    }
    this.OnInit0 = this.directive_0_0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [null];

  static final _gen_directiveIndices = [
    _gen.ChangeDetectionUtil.directiveIndex(0, 0)
  ];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector76();
  }
}

class ChangeDetector77 extends _gen.AbstractChangeDetector<dynamic> {
  var directive_0_0, directive_0_1;

  ChangeDetector77()
      : super(
            "emptyWithDirectiveRecords",
            0,
            ChangeDetector77._gen_propertyBindingTargets,
            ChangeDetector77._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  void afterContentLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_1.ngAfterContentInit();
    this.directive_0_1.ngAfterContentChecked();
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterContentInit();
    this.directive_0_0.ngAfterContentChecked();
  }

  void afterViewLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_1.ngAfterViewInit();
    this.directive_0_1.ngAfterViewChecked();
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterViewInit();
    this.directive_0_0.ngAfterViewChecked();
  }

  void hydrateDirectives(directives) {
    this.outputSubscriptions = new List(2);
    this.directive_0_0 = this.getDirectiveFor(directives, 0);
    this.outputSubscriptions[0] = this
        .directive_0_0
        .eventEmitter
        .listen((event) => this.handleEvent('host-event', 0, event));
    this.directive_0_1 = this.getDirectiveFor(directives, 1);
    this.outputSubscriptions[1] = this
        .directive_0_1
        .eventEmitter
        .listen((event) => this.handleEvent('host-event', 0, event));
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {
      this.directive_0_0.ngOnDestroy();
      this.directive_0_1.ngOnDestroy();
    }
    this.directive_0_0 =
        this.directive_0_1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [
    _gen.ChangeDetectionUtil.directiveIndex(0, 0),
    _gen.ChangeDetectionUtil.directiveIndex(0, 1)
  ];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector77();
  }
}

class ChangeDetector78 extends _gen.AbstractChangeDetector<dynamic> {
  var literal0, directive_0_0;

  ChangeDetector78()
      : super("noCallbacks", 1, ChangeDetector78._gen_propertyBindingTargets,
            ChangeDetector78._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_literal0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_literal0 = 1;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.literal0, l_literal0)) {
      this.throwOnChangeError(this.literal0, l_literal0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_literal0, this.literal0)) {
      this.directive_0_0.a = l_literal0;
      this.logBindingUpdate(l_literal0);
      isChanged = true;

      this.literal0 = l_literal0;
    }

    changes = null;

    isChanged = false;
  }

  void hydrateDirectives(directives) {
    this.directive_0_0 = this.getDirectiveFor(directives, 0);
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.literal0 = this.directive_0_0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil
        .bindingTarget("directive", 0, "a", null, "1 in location")
  ];

  static final _gen_directiveIndices = [
    _gen.ChangeDetectionUtil.directiveIndex(0, 0)
  ];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector78();
  }
}

class ChangeDetector79 extends _gen.AbstractChangeDetector<dynamic> {
  var a0, directive_0_0;

  ChangeDetector79()
      : super(
            "readingDirectives",
            1,
            ChangeDetector79._gen_propertyBindingTargets,
            ChangeDetector79._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_a0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_a0 = this.directive_0_0.a;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.a0, l_a0)) {
      this.throwOnChangeError(this.a0, l_a0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_a0, this.a0)) {
      this.notifyDispatcher(l_a0);
      this.logBindingUpdate(l_a0);

      this.a0 = l_a0;
    }

    changes = null;

    isChanged = false;
  }

  void afterContentLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterContentInit();
    this.directive_0_0.ngAfterContentChecked();
  }

  void afterViewLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterViewInit();
    this.directive_0_0.ngAfterViewChecked();
  }

  void hydrateDirectives(directives) {
    this.outputSubscriptions = new List(1);
    this.directive_0_0 = this.getDirectiveFor(directives, 0);
    this.outputSubscriptions[0] = this
        .directive_0_0
        .eventEmitter
        .listen((event) => this.handleEvent('host-event', 0, event));
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {
      this.directive_0_0.ngOnDestroy();
    }
    this.a0 = this.directive_0_0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil
        .bindingTarget("elementProperty", 0, "propName", null, "a in location")
  ];

  static final _gen_directiveIndices = [
    _gen.ChangeDetectionUtil.directiveIndex(0, 0)
  ];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector79();
  }
}

class ChangeDetector80 extends _gen.AbstractChangeDetector<dynamic> {
  var a0, interpolate1;

  ChangeDetector80()
      : super("interpolation", 2, ChangeDetector80._gen_propertyBindingTargets,
            ChangeDetector80._gen_directiveIndices, null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_a0, c_a0, l_interpolate1;
    c_a0 = false;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_a0 = l_context.a;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.a0, l_a0)) {
      this.throwOnChangeError(this.a0, l_a0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_a0, this.a0)) {
      c_a0 = true;

      this.a0 = l_a0;
    }

    if (c_a0) {
      l_interpolate1 = "${"B"}${_gen.ChangeDetectionUtil.s(l_a0)}${"A"}";
      if (_gen.assertionsEnabled() &&
          throwOnChange &&
          !_gen.ChangeDetectionUtil
              .devModeEqual(this.interpolate1, l_interpolate1)) {
        this.throwOnChangeError(this.interpolate1, l_interpolate1);
      }

      if (_gen.ChangeDetectionUtil
          .looseNotIdentical(l_interpolate1, this.interpolate1)) {
        this.notifyDispatcher(l_interpolate1);
        this.logBindingUpdate(l_interpolate1);

        this.interpolate1 = l_interpolate1;
      }
    }
    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.a0 = this.interpolate1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil.bindingTarget(
        "elementProperty", 0, "propName", null, "B{{a}}A in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector80();
  }
}

class ChangeDetector81 extends _gen.AbstractChangeDetector<dynamic> {
  ChangeDetector81()
      : super(
            "(event)=\"onEvent(\$event)\"",
            0,
            ChangeDetector81._gen_propertyBindingTargets,
            ChangeDetector81._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  handleEventInternal(eventName, elIndex, locals) {
    var preventDefault = false;
    var l_context = this.context, l_event0_0, l_onEvent1_0;
    if (eventName == "event" && elIndex == 0) {
      l_event0_0 = locals.get(r'$event');
      l_onEvent1_0 = l_context.onEvent(l_event0_0);

      if (l_onEvent1_0 == false) {
        preventDefault = true;
      }
    }
    return preventDefault;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector81();
  }
}

class ChangeDetector82 extends _gen.AbstractChangeDetector<dynamic> {
  ChangeDetector82()
      : super(
            "(event)=\"b=a=\$event\"",
            0,
            ChangeDetector82._gen_propertyBindingTargets,
            ChangeDetector82._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  handleEventInternal(eventName, elIndex, locals) {
    var preventDefault = false;
    var l_context = this.context, l_event0_0, l_a1_0, l_b2_0;
    if (eventName == "event" && elIndex == 0) {
      l_event0_0 = locals.get(r'$event');
      l_a1_0 = l_context.a = l_event0_0;
      l_b2_0 = l_context.b = l_a1_0;

      if (l_b2_0 == false) {
        preventDefault = true;
      }
    }
    return preventDefault;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector82();
  }
}

class ChangeDetector83 extends _gen.AbstractChangeDetector<dynamic> {
  ChangeDetector83()
      : super(
            "(event)=\"a[0]=\$event\"",
            0,
            ChangeDetector83._gen_propertyBindingTargets,
            ChangeDetector83._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  handleEventInternal(eventName, elIndex, locals) {
    var preventDefault = false;
    var l_context = this.context, l_a0_0, l_literal1_0, l_event2_0, l_null3_0;
    if (eventName == "event" && elIndex == 0) {
      l_a0_0 = l_context.a;
      l_literal1_0 = 0;
      l_event2_0 = locals.get(r'$event');
      l_null3_0 = l_a0_0[l_literal1_0] = l_event2_0;

      if (l_null3_0 == false) {
        preventDefault = true;
      }
    }
    return preventDefault;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector83();
  }
}

class ChangeDetector84 extends _gen.AbstractChangeDetector<dynamic> {
  ChangeDetector84()
      : super(
            "(event)=\"a=a+1; a=a+1;\"",
            0,
            ChangeDetector84._gen_propertyBindingTargets,
            ChangeDetector84._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  handleEventInternal(eventName, elIndex, locals) {
    var preventDefault = false;
    var l_context = this.context,
        l_a0_0,
        l_literal1_0,
        l_operation_add2_0,
        l_a3_0,
        l_a4_0,
        l_literal5_0,
        l_operation_add6_0,
        l_a7_0,
        l_chain8_0;
    if (eventName == "event" && elIndex == 0) {
      l_a0_0 = l_context.a;
      l_literal1_0 = 1;
      l_operation_add2_0 =
          _gen.ChangeDetectionUtil.operation_add(l_a0_0, l_literal1_0);
      l_a3_0 = l_context.a = l_operation_add2_0;
      l_a4_0 = l_context.a;
      l_literal5_0 = 1;
      l_operation_add6_0 =
          _gen.ChangeDetectionUtil.operation_add(l_a4_0, l_literal5_0);
      l_a7_0 = l_context.a = l_operation_add6_0;
      l_chain8_0 = l_a7_0;

      if (l_chain8_0 == false) {
        preventDefault = true;
      }
    }
    return preventDefault;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector84();
  }
}

class ChangeDetector85 extends _gen.AbstractChangeDetector<dynamic> {
  ChangeDetector85()
      : super(
            "(event)=\"true; false\"",
            0,
            ChangeDetector85._gen_propertyBindingTargets,
            ChangeDetector85._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  handleEventInternal(eventName, elIndex, locals) {
    var preventDefault = false;
    var l_context = this.context, l_literal0_0, l_literal1_0, l_chain2_0;
    if (eventName == "event" && elIndex == 0) {
      l_literal0_0 = true;
      l_literal1_0 = false;
      l_chain2_0 = l_literal1_0;

      if (l_chain2_0 == false) {
        preventDefault = true;
      }
    }
    return preventDefault;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector85();
  }
}

class ChangeDetector86 extends _gen.AbstractChangeDetector<dynamic> {
  ChangeDetector86()
      : super(
            "(event)=\"false\"",
            0,
            ChangeDetector86._gen_propertyBindingTargets,
            ChangeDetector86._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  handleEventInternal(eventName, elIndex, locals) {
    var preventDefault = false;
    var l_context = this.context, l_literal0_0;
    if (eventName == "event" && elIndex == 0) {
      l_literal0_0 = false;

      if (l_literal0_0 == false) {
        preventDefault = true;
      }
    }
    return preventDefault;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector86();
  }
}

class ChangeDetector87 extends _gen.AbstractChangeDetector<dynamic> {
  ChangeDetector87()
      : super(
            "(event)=\"true\"",
            0,
            ChangeDetector87._gen_propertyBindingTargets,
            ChangeDetector87._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  handleEventInternal(eventName, elIndex, locals) {
    var preventDefault = false;
    var l_context = this.context, l_literal0_0;
    if (eventName == "event" && elIndex == 0) {
      l_literal0_0 = true;

      if (l_literal0_0 == false) {
        preventDefault = true;
      }
    }
    return preventDefault;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector87();
  }
}

class ChangeDetector88 extends _gen.AbstractChangeDetector<dynamic> {
  ChangeDetector88()
      : super(
            "(event)=\"true ? a = a + 1 : a = a + 1\"",
            0,
            ChangeDetector88._gen_propertyBindingTargets,
            ChangeDetector88._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  handleEventInternal(eventName, elIndex, locals) {
    var preventDefault = false;
    var l_context = this.context,
        l_literal0_0,
        l_SkipRecordsIfNot1_0,
        l_a2_0,
        l_literal3_0,
        l_operation_add4_0,
        l_a5_0,
        l_SkipRecords6_0,
        l_a7_0,
        l_literal8_0,
        l_operation_add9_0,
        l_a10_0,
        l_cond11_0;
    if (eventName == "event" && elIndex == 0) {
      l_literal0_0 = true;
      if (l_literal0_0) {
        l_a2_0 = l_context.a;
        l_literal3_0 = 1;
        l_operation_add4_0 =
            _gen.ChangeDetectionUtil.operation_add(l_a2_0, l_literal3_0);
        l_a5_0 = l_context.a = l_operation_add4_0;
      } else {
        l_a7_0 = l_context.a;
        l_literal8_0 = 1;
        l_operation_add9_0 =
            _gen.ChangeDetectionUtil.operation_add(l_a7_0, l_literal8_0);
        l_a10_0 = l_context.a = l_operation_add9_0;
      }
      l_cond11_0 = _gen.ChangeDetectionUtil.cond(l_literal0_0, l_a5_0, l_a10_0);

      if (l_cond11_0 == false) {
        preventDefault = true;
      }
    }
    return preventDefault;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector88();
  }
}

class ChangeDetector89 extends _gen.AbstractChangeDetector<dynamic> {
  var directive_0_0, directive_0_1;

  ChangeDetector89()
      : super(
            "(host-event)=\"onEvent(\$event)\"",
            0,
            ChangeDetector89._gen_propertyBindingTargets,
            ChangeDetector89._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  handleEventInternal(eventName, elIndex, locals) {
    var preventDefault = false;
    var l_context = this.context, l_event0_0, l_onEvent1_0;
    if (eventName == "host-event" && elIndex == 0) {
      l_event0_0 = locals.get(r'$event');
      l_onEvent1_0 = this.directive_0_0.onEvent(l_event0_0);

      if (l_onEvent1_0 == false) {
        preventDefault = true;
      }
    }
    return preventDefault;
  }

  void afterContentLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_1.ngAfterContentInit();
    this.directive_0_1.ngAfterContentChecked();
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterContentInit();
    this.directive_0_0.ngAfterContentChecked();
  }

  void afterViewLifecycleCallbacksInternal() {
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_1.ngAfterViewInit();
    this.directive_0_1.ngAfterViewChecked();
    if (this.state == _gen.ChangeDetectorState.NeverChecked)
      this.directive_0_0.ngAfterViewInit();
    this.directive_0_0.ngAfterViewChecked();
  }

  void hydrateDirectives(directives) {
    this.outputSubscriptions = new List(2);
    this.directive_0_0 = this.getDirectiveFor(directives, 0);
    this.outputSubscriptions[0] = this
        .directive_0_0
        .eventEmitter
        .listen((event) => this.handleEvent('host-event', 0, event));
    this.directive_0_1 = this.getDirectiveFor(directives, 1);
    this.outputSubscriptions[1] = this
        .directive_0_1
        .eventEmitter
        .listen((event) => this.handleEvent('host-event', 0, event));
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {
      this.directive_0_0.ngOnDestroy();
      this.directive_0_1.ngOnDestroy();
    }
    this.directive_0_0 =
        this.directive_0_1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [
    _gen.ChangeDetectionUtil.directiveIndex(0, 0),
    _gen.ChangeDetectionUtil.directiveIndex(0, 1)
  ];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector89();
  }
}

class ChangeDetector90 extends _gen.AbstractChangeDetector<dynamic> {
  var a0;

  ChangeDetector90()
      : super(
            "onPushObserveBinding",
            1,
            ChangeDetector90._gen_propertyBindingTargets,
            ChangeDetector90._gen_directiveIndices,
            _gen.ChangeDetectionStrategy.OnPushObserve) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_a0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_a0 = this.observeValue(l_context.a, 1);
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.a0, l_a0)) {
      this.throwOnChangeError(this.a0, l_a0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_a0, this.a0)) {
      this.notifyDispatcher(l_a0);
      this.logBindingUpdate(l_a0);

      this.a0 = l_a0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.a0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil
        .bindingTarget("elementProperty", 0, "propName", null, "a in location")
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector90();
  }
}

class ChangeDetector91 extends _gen.AbstractChangeDetector<dynamic> {
  ChangeDetector91()
      : super(
            "onPushObserveComponent",
            0,
            ChangeDetector91._gen_propertyBindingTargets,
            ChangeDetector91._gen_directiveIndices,
            _gen.ChangeDetectionStrategy.OnPushObserve) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector91();
  }
}

class ChangeDetector92 extends _gen.AbstractChangeDetector<dynamic> {
  var directive_0_0;

  ChangeDetector92()
      : super(
            "onPushObserveDirective",
            0,
            ChangeDetector92._gen_propertyBindingTargets,
            ChangeDetector92._gen_directiveIndices,
            _gen.ChangeDetectionStrategy.OnPushObserve) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context;
    var isChanged = false;
    var changes = null;
  }

  void hydrateDirectives(directives) {
    this.directive_0_0 =
        this.observeDirective(this.getDirectiveFor(directives, 0), 0);
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.directive_0_0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [];

  static final _gen_directiveIndices = [
    _gen.ChangeDetectionUtil.directiveIndex(0, 0)
  ];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector92();
  }
}

class ChangeDetector93 extends _gen.AbstractChangeDetector<dynamic> {
  var name0;

  ChangeDetector93()
      : super(
            "updateElementProduction",
            1,
            ChangeDetector93._gen_propertyBindingTargets,
            ChangeDetector93._gen_directiveIndices,
            null) {
    dehydrateDirectives(false);
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_name0;
    var isChanged = false;
    var changes = null;

    this.propertyBindingIndex = 0;
    l_name0 = l_context.name;
    if (_gen.assertionsEnabled() &&
        throwOnChange &&
        !_gen.ChangeDetectionUtil.devModeEqual(this.name0, l_name0)) {
      this.throwOnChangeError(this.name0, l_name0);
    }

    if (_gen.ChangeDetectionUtil.looseNotIdentical(l_name0, this.name0)) {
      this.notifyDispatcher(l_name0);

      this.name0 = l_name0;
    }

    changes = null;

    isChanged = false;
  }

  void dehydrateDirectives(destroyPipes) {
    if (destroyPipes) {}
    this.name0 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static final _gen_propertyBindingTargets = [
    _gen.ChangeDetectionUtil
        .bindingTarget("elementProperty", 0, "propName", null, null)
  ];

  static final _gen_directiveIndices = [];

  static _gen.ChangeDetector newChangeDetector() {
    return new ChangeDetector93();
  }
}

var _idToProtoMap = {
  '''"\$"''': ChangeDetector0.newChangeDetector,
  '''10''': ChangeDetector1.newChangeDetector,
  '''"str"''': ChangeDetector2.newChangeDetector,
  '''"a

b"''': ChangeDetector3.newChangeDetector,
  '''10 + 2''': ChangeDetector4.newChangeDetector,
  '''10 - 2''': ChangeDetector5.newChangeDetector,
  '''10 * 2''': ChangeDetector6.newChangeDetector,
  '''10 / 2''': ChangeDetector7.newChangeDetector,
  '''11 % 2''': ChangeDetector8.newChangeDetector,
  '''1 == 1''': ChangeDetector9.newChangeDetector,
  '''1 != 1''': ChangeDetector10.newChangeDetector,
  '''1 == true''': ChangeDetector11.newChangeDetector,
  '''1 === 1''': ChangeDetector12.newChangeDetector,
  '''1 !== 1''': ChangeDetector13.newChangeDetector,
  '''1 === true''': ChangeDetector14.newChangeDetector,
  '''1 < 2''': ChangeDetector15.newChangeDetector,
  '''2 < 1''': ChangeDetector16.newChangeDetector,
  '''1 > 2''': ChangeDetector17.newChangeDetector,
  '''2 > 1''': ChangeDetector18.newChangeDetector,
  '''1 <= 2''': ChangeDetector19.newChangeDetector,
  '''2 <= 2''': ChangeDetector20.newChangeDetector,
  '''2 <= 1''': ChangeDetector21.newChangeDetector,
  '''2 >= 1''': ChangeDetector22.newChangeDetector,
  '''2 >= 2''': ChangeDetector23.newChangeDetector,
  '''1 >= 2''': ChangeDetector24.newChangeDetector,
  '''true && true''': ChangeDetector25.newChangeDetector,
  '''true && false''': ChangeDetector26.newChangeDetector,
  '''true || false''': ChangeDetector27.newChangeDetector,
  '''false || false''': ChangeDetector28.newChangeDetector,
  '''!true''': ChangeDetector29.newChangeDetector,
  '''!!true''': ChangeDetector30.newChangeDetector,
  '''1 < 2 ? 1 : 2''': ChangeDetector31.newChangeDetector,
  '''1 > 2 ? 1 : 2''': ChangeDetector32.newChangeDetector,
  '''["foo", "bar"][0]''': ChangeDetector33.newChangeDetector,
  '''{"foo": "bar"}["foo"]''': ChangeDetector34.newChangeDetector,
  '''name''': ChangeDetector35.newChangeDetector,
  '''[1, 2]''': ChangeDetector36.newChangeDetector,
  '''[1, a]''': ChangeDetector37.newChangeDetector,
  '''{z: 1}''': ChangeDetector38.newChangeDetector,
  '''{z: a}''': ChangeDetector39.newChangeDetector,
  '''name | pipe''': ChangeDetector40.newChangeDetector,
  '''(name | pipe).length''': ChangeDetector41.newChangeDetector,
  '''name | pipe:'one':address.city''': ChangeDetector42.newChangeDetector,
  '''name | pipe:'a':'b' | pipe:0:1:2''': ChangeDetector43.newChangeDetector,
  '''value''': ChangeDetector44.newChangeDetector,
  '''a''': ChangeDetector45.newChangeDetector,
  '''address.city''': ChangeDetector46.newChangeDetector,
  '''address?.city''': ChangeDetector47.newChangeDetector,
  '''address?.toString()''': ChangeDetector48.newChangeDetector,
  '''sayHi("Jim")''': ChangeDetector49.newChangeDetector,
  '''a()(99)''': ChangeDetector50.newChangeDetector,
  '''a.sayHi("Jim")''': ChangeDetector51.newChangeDetector,
  '''passThrough([12])''': ChangeDetector52.newChangeDetector,
  '''invalidFn(1)''': ChangeDetector53.newChangeDetector,
  '''age''': ChangeDetector54.newChangeDetector,
  '''true ? city : zipcode''': ChangeDetector55.newChangeDetector,
  '''false ? city : zipcode''': ChangeDetector56.newChangeDetector,
  '''getTrue() && getTrue()''': ChangeDetector57.newChangeDetector,
  '''getFalse() && getTrue()''': ChangeDetector58.newChangeDetector,
  '''getFalse() || getFalse()''': ChangeDetector59.newChangeDetector,
  '''getTrue() || getFalse()''': ChangeDetector60.newChangeDetector,
  '''name == "Victor" ? (true ? address.city : address.zipcode) : address.zipcode''':
      ChangeDetector61.newChangeDetector,
  '''valueFromLocals''': ChangeDetector62.newChangeDetector,
  '''functionFromLocals''': ChangeDetector63.newChangeDetector,
  '''nestedLocals''': ChangeDetector64.newChangeDetector,
  '''fallbackLocals''': ChangeDetector65.newChangeDetector,
  '''contextNestedPropertyWithLocals''': ChangeDetector66.newChangeDetector,
  '''localPropertyWithSimilarContext''': ChangeDetector67.newChangeDetector,
  '''emptyUsingDefaultStrategy''': ChangeDetector68.newChangeDetector,
  '''emptyUsingOnPushStrategy''': ChangeDetector69.newChangeDetector,
  '''onPushRecordsUsingDefaultStrategy''': ChangeDetector70.newChangeDetector,
  '''onPushWithEvent''': ChangeDetector71.newChangeDetector,
  '''onPushWithHostEvent''': ChangeDetector72.newChangeDetector,
  '''directNoDispatcher''': ChangeDetector73.newChangeDetector,
  '''groupChanges''': ChangeDetector74.newChangeDetector,
  '''directiveDoCheck''': ChangeDetector75.newChangeDetector,
  '''directiveOnInit''': ChangeDetector76.newChangeDetector,
  '''emptyWithDirectiveRecords''': ChangeDetector77.newChangeDetector,
  '''noCallbacks''': ChangeDetector78.newChangeDetector,
  '''readingDirectives''': ChangeDetector79.newChangeDetector,
  '''interpolation''': ChangeDetector80.newChangeDetector,
  '''(event)="onEvent(\$event)"''': ChangeDetector81.newChangeDetector,
  '''(event)="b=a=\$event"''': ChangeDetector82.newChangeDetector,
  '''(event)="a[0]=\$event"''': ChangeDetector83.newChangeDetector,
  '''(event)="a=a+1; a=a+1;"''': ChangeDetector84.newChangeDetector,
  '''(event)="true; false"''': ChangeDetector85.newChangeDetector,
  '''(event)="false"''': ChangeDetector86.newChangeDetector,
  '''(event)="true"''': ChangeDetector87.newChangeDetector,
  '''(event)="true ? a = a + 1 : a = a + 1"''':
      ChangeDetector88.newChangeDetector,
  '''(host-event)="onEvent(\$event)"''': ChangeDetector89.newChangeDetector,
  '''onPushObserveBinding''': ChangeDetector90.newChangeDetector,
  '''onPushObserveComponent''': ChangeDetector91.newChangeDetector,
  '''onPushObserveDirective''': ChangeDetector92.newChangeDetector,
  '''updateElementProduction''': ChangeDetector93.newChangeDetector
};

getFactoryById(String id) => _idToProtoMap[id];

