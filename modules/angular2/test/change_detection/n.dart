library dart_gen_change_detectors;

import 'package:angular2/src/change_detection/pregen_proto_change_detector.dart'
    as _gen;

class ChangeDetector0 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector0(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var change_context = false;
    var change_literal0 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 10;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;
      if (throwOnChange) {
        _gen.ChangeDetectionUtil.throwOnChange(currentProto,
            _gen.ChangeDetectionUtil.simpleChange(_literal0, literal0));
      }

      _dispatcher.notifyOnBinding(currentProto.bindingRecord, literal0);

      _literal0 = literal0;
    }

    isChanged = false;
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector0(a, b, c, d), registry, def);
  }
}
class ChangeDetector1 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector1(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var change_context = false;
    var change_literal0 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = "str";
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;
      if (throwOnChange) {
        _gen.ChangeDetectionUtil.throwOnChange(currentProto,
            _gen.ChangeDetectionUtil.simpleChange(_literal0, literal0));
      }

      _dispatcher.notifyOnBinding(currentProto.bindingRecord, literal0);

      _literal0 = literal0;
    }

    isChanged = false;
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector1(a, b, c, d), registry, def);
  }
}
class ChangeDetector2 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector2(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var change_context = false;
    var change_literal0 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = "a\n\nb";
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;
      if (throwOnChange) {
        _gen.ChangeDetectionUtil.throwOnChange(currentProto,
            _gen.ChangeDetectionUtil.simpleChange(_literal0, literal0));
      }

      _dispatcher.notifyOnBinding(currentProto.bindingRecord, literal0);

      _literal0 = literal0;
    }

    isChanged = false;
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector2(a, b, c, d), registry, def);
  }
}
class ChangeDetector3 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_add2 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector3(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_add2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_add2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 10;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 2;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_add2 =
          _gen.ChangeDetectionUtil.operation_add(literal0, literal1);
      if (!_gen.looseIdentical(operation_add2, _operation_add2)) {
        change_operation_add2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_add2, operation_add2));
        }

        _dispatcher.notifyOnBinding(currentProto.bindingRecord, operation_add2);

        _operation_add2 = operation_add2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_add2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector3(a, b, c, d), registry, def);
  }
}
class ChangeDetector4 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_subtract2 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector4(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_subtract2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_subtract2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 10;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 2;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_subtract2 =
          _gen.ChangeDetectionUtil.operation_subtract(literal0, literal1);
      if (!_gen.looseIdentical(operation_subtract2, _operation_subtract2)) {
        change_operation_subtract2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_subtract2, operation_subtract2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_subtract2);

        _operation_subtract2 = operation_subtract2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_subtract2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector4(a, b, c, d), registry, def);
  }
}
class ChangeDetector5 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_multiply2 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector5(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_multiply2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_multiply2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 10;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 2;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_multiply2 =
          _gen.ChangeDetectionUtil.operation_multiply(literal0, literal1);
      if (!_gen.looseIdentical(operation_multiply2, _operation_multiply2)) {
        change_operation_multiply2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_multiply2, operation_multiply2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_multiply2);

        _operation_multiply2 = operation_multiply2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_multiply2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector5(a, b, c, d), registry, def);
  }
}
class ChangeDetector6 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_remainder2 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector6(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_remainder2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_remainder2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 11;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 2;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_remainder2 =
          _gen.ChangeDetectionUtil.operation_remainder(literal0, literal1);
      if (!_gen.looseIdentical(operation_remainder2, _operation_remainder2)) {
        change_operation_remainder2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_remainder2, operation_remainder2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_remainder2);

        _operation_remainder2 = operation_remainder2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_remainder2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector6(a, b, c, d), registry, def);
  }
}
class ChangeDetector7 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_equals1 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector7(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var operation_equals1 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_operation_equals1 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 1;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    if (change_literal0 || change_literal0) {
      currentProto = _protos[1];
      operation_equals1 =
          _gen.ChangeDetectionUtil.operation_equals(literal0, literal0);
      if (!_gen.looseIdentical(operation_equals1, _operation_equals1)) {
        change_operation_equals1 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_equals1, operation_equals1));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_equals1);

        _operation_equals1 = operation_equals1;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_equals1 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector7(a, b, c, d), registry, def);
  }
}
class ChangeDetector8 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_not_equals1 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector8(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var operation_not_equals1 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_operation_not_equals1 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 1;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    if (change_literal0 || change_literal0) {
      currentProto = _protos[1];
      operation_not_equals1 =
          _gen.ChangeDetectionUtil.operation_not_equals(literal0, literal0);
      if (!_gen.looseIdentical(operation_not_equals1, _operation_not_equals1)) {
        change_operation_not_equals1 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_not_equals1, operation_not_equals1));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_not_equals1);

        _operation_not_equals1 = operation_not_equals1;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_not_equals1 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector8(a, b, c, d), registry, def);
  }
}
class ChangeDetector9 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_less_then2 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector9(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_less_then2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_less_then2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 1;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 2;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_less_then2 =
          _gen.ChangeDetectionUtil.operation_less_then(literal0, literal1);
      if (!_gen.looseIdentical(operation_less_then2, _operation_less_then2)) {
        change_operation_less_then2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_less_then2, operation_less_then2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_less_then2);

        _operation_less_then2 = operation_less_then2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_less_then2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector9(a, b, c, d), registry, def);
  }
}
class ChangeDetector10 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_less_then2 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector10(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_less_then2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_less_then2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 2;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 1;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_less_then2 =
          _gen.ChangeDetectionUtil.operation_less_then(literal0, literal1);
      if (!_gen.looseIdentical(operation_less_then2, _operation_less_then2)) {
        change_operation_less_then2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_less_then2, operation_less_then2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_less_then2);

        _operation_less_then2 = operation_less_then2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_less_then2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector10(a, b, c, d), registry, def);
  }
}
class ChangeDetector11 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_greater_then2 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector11(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_greater_then2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_greater_then2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 2;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 1;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_greater_then2 =
          _gen.ChangeDetectionUtil.operation_greater_then(literal0, literal1);
      if (!_gen.looseIdentical(
          operation_greater_then2, _operation_greater_then2)) {
        change_operation_greater_then2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_greater_then2, operation_greater_then2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_greater_then2);

        _operation_greater_then2 = operation_greater_then2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_greater_then2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector11(a, b, c, d), registry, def);
  }
}
class ChangeDetector12 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_less_then2 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector12(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_less_then2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_less_then2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 2;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 1;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_less_then2 =
          _gen.ChangeDetectionUtil.operation_less_then(literal0, literal1);
      if (!_gen.looseIdentical(operation_less_then2, _operation_less_then2)) {
        change_operation_less_then2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_less_then2, operation_less_then2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_less_then2);

        _operation_less_then2 = operation_less_then2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_less_then2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector12(a, b, c, d), registry, def);
  }
}
class ChangeDetector13 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_less_or_equals_then2 =
      _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector13(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_less_or_equals_then2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_less_or_equals_then2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 1;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 2;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_less_or_equals_then2 = _gen.ChangeDetectionUtil
          .operation_less_or_equals_then(literal0, literal1);
      if (!_gen.looseIdentical(
          operation_less_or_equals_then2, _operation_less_or_equals_then2)) {
        change_operation_less_or_equals_then2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_less_or_equals_then2,
                  operation_less_or_equals_then2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_less_or_equals_then2);

        _operation_less_or_equals_then2 = operation_less_or_equals_then2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_less_or_equals_then2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector13(a, b, c, d), registry, def);
  }
}
class ChangeDetector14 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_less_or_equals_then1 =
      _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector14(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var operation_less_or_equals_then1 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_operation_less_or_equals_then1 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 2;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    if (change_literal0 || change_literal0) {
      currentProto = _protos[1];
      operation_less_or_equals_then1 = _gen.ChangeDetectionUtil
          .operation_less_or_equals_then(literal0, literal0);
      if (!_gen.looseIdentical(
          operation_less_or_equals_then1, _operation_less_or_equals_then1)) {
        change_operation_less_or_equals_then1 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_less_or_equals_then1,
                  operation_less_or_equals_then1));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_less_or_equals_then1);

        _operation_less_or_equals_then1 = operation_less_or_equals_then1;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_less_or_equals_then1 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector14(a, b, c, d), registry, def);
  }
}
class ChangeDetector15 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_less_or_equals_then2 =
      _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector15(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_less_or_equals_then2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_less_or_equals_then2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 2;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 1;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_less_or_equals_then2 = _gen.ChangeDetectionUtil
          .operation_less_or_equals_then(literal0, literal1);
      if (!_gen.looseIdentical(
          operation_less_or_equals_then2, _operation_less_or_equals_then2)) {
        change_operation_less_or_equals_then2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_less_or_equals_then2,
                  operation_less_or_equals_then2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_less_or_equals_then2);

        _operation_less_or_equals_then2 = operation_less_or_equals_then2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_less_or_equals_then2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector15(a, b, c, d), registry, def);
  }
}
class ChangeDetector16 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_greater_or_equals_then2 =
      _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector16(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_greater_or_equals_then2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_greater_or_equals_then2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 2;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 1;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_greater_or_equals_then2 = _gen.ChangeDetectionUtil
          .operation_greater_or_equals_then(literal0, literal1);
      if (!_gen.looseIdentical(operation_greater_or_equals_then2,
          _operation_greater_or_equals_then2)) {
        change_operation_greater_or_equals_then2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_greater_or_equals_then2,
                  operation_greater_or_equals_then2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_greater_or_equals_then2);

        _operation_greater_or_equals_then2 = operation_greater_or_equals_then2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_greater_or_equals_then2 =
        _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector16(a, b, c, d), registry, def);
  }
}
class ChangeDetector17 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_greater_or_equals_then1 =
      _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector17(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var operation_greater_or_equals_then1 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_operation_greater_or_equals_then1 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 2;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    if (change_literal0 || change_literal0) {
      currentProto = _protos[1];
      operation_greater_or_equals_then1 = _gen.ChangeDetectionUtil
          .operation_greater_or_equals_then(literal0, literal0);
      if (!_gen.looseIdentical(operation_greater_or_equals_then1,
          _operation_greater_or_equals_then1)) {
        change_operation_greater_or_equals_then1 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_greater_or_equals_then1,
                  operation_greater_or_equals_then1));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_greater_or_equals_then1);

        _operation_greater_or_equals_then1 = operation_greater_or_equals_then1;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_greater_or_equals_then1 =
        _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector17(a, b, c, d), registry, def);
  }
}
class ChangeDetector18 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_greater_or_equals_then2 =
      _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector18(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_greater_or_equals_then2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_greater_or_equals_then2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 1;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 2;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_greater_or_equals_then2 = _gen.ChangeDetectionUtil
          .operation_greater_or_equals_then(literal0, literal1);
      if (!_gen.looseIdentical(operation_greater_or_equals_then2,
          _operation_greater_or_equals_then2)) {
        change_operation_greater_or_equals_then2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_greater_or_equals_then2,
                  operation_greater_or_equals_then2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_greater_or_equals_then2);

        _operation_greater_or_equals_then2 = operation_greater_or_equals_then2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_greater_or_equals_then2 =
        _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector18(a, b, c, d), registry, def);
  }
}
class ChangeDetector19 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_logical_and1 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector19(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var operation_logical_and1 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_operation_logical_and1 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = true;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    if (change_literal0 || change_literal0) {
      currentProto = _protos[1];
      operation_logical_and1 =
          _gen.ChangeDetectionUtil.operation_logical_and(literal0, literal0);
      if (!_gen.looseIdentical(
          operation_logical_and1, _operation_logical_and1)) {
        change_operation_logical_and1 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_logical_and1, operation_logical_and1));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_logical_and1);

        _operation_logical_and1 = operation_logical_and1;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_logical_and1 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector19(a, b, c, d), registry, def);
  }
}
class ChangeDetector20 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_logical_and2 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector20(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_logical_and2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_logical_and2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = true;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = false;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_logical_and2 =
          _gen.ChangeDetectionUtil.operation_logical_and(literal0, literal1);
      if (!_gen.looseIdentical(
          operation_logical_and2, _operation_logical_and2)) {
        change_operation_logical_and2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_logical_and2, operation_logical_and2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_logical_and2);

        _operation_logical_and2 = operation_logical_and2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_logical_and2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector20(a, b, c, d), registry, def);
  }
}
class ChangeDetector21 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_logical_or2 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector21(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_logical_or2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_logical_or2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = true;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = false;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_logical_or2 =
          _gen.ChangeDetectionUtil.operation_logical_or(literal0, literal1);
      if (!_gen.looseIdentical(operation_logical_or2, _operation_logical_or2)) {
        change_operation_logical_or2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_logical_or2, operation_logical_or2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_logical_or2);

        _operation_logical_or2 = operation_logical_or2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_logical_or2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector21(a, b, c, d), registry, def);
  }
}
class ChangeDetector22 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_logical_or1 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector22(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var operation_logical_or1 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_operation_logical_or1 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = false;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    if (change_literal0 || change_literal0) {
      currentProto = _protos[1];
      operation_logical_or1 =
          _gen.ChangeDetectionUtil.operation_logical_or(literal0, literal0);
      if (!_gen.looseIdentical(operation_logical_or1, _operation_logical_or1)) {
        change_operation_logical_or1 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_logical_or1, operation_logical_or1));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_logical_or1);

        _operation_logical_or1 = operation_logical_or1;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_logical_or1 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector22(a, b, c, d), registry, def);
  }
}
class ChangeDetector23 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_negate1 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector23(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var operation_negate1 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_operation_negate1 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = true;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    if (change_literal0) {
      currentProto = _protos[1];
      operation_negate1 = _gen.ChangeDetectionUtil.operation_negate(literal0);
      if (!_gen.looseIdentical(operation_negate1, _operation_negate1)) {
        change_operation_negate1 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_negate1, operation_negate1));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_negate1);

        _operation_negate1 = operation_negate1;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_negate1 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector23(a, b, c, d), registry, def);
  }
}
class ChangeDetector24 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_negate1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_negate2 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector24(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var operation_negate1 = null;
    var operation_negate2 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_operation_negate1 = false;
    var change_operation_negate2 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = true;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    if (change_literal0) {
      currentProto = _protos[1];
      operation_negate1 = _gen.ChangeDetectionUtil.operation_negate(literal0);
      if (!_gen.looseIdentical(operation_negate1, _operation_negate1)) {
        change_operation_negate1 = true;

        _operation_negate1 = operation_negate1;
      }

      isChanged = false;
    }
    if (change_operation_negate1) {
      currentProto = _protos[2];
      operation_negate2 =
          _gen.ChangeDetectionUtil.operation_negate(operation_negate1);
      if (!_gen.looseIdentical(operation_negate2, _operation_negate2)) {
        change_operation_negate2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _operation_negate2, operation_negate2));
        }

        _dispatcher.notifyOnBinding(
            currentProto.bindingRecord, operation_negate2);

        _operation_negate2 = operation_negate2;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_negate1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_negate2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector24(a, b, c, d), registry, def);
  }
}
class ChangeDetector25 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_less_then2 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _cond3 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector25(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_less_then2 = null;
    var cond3 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_less_then2 = false;
    var change_cond3 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 1;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 2;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_less_then2 =
          _gen.ChangeDetectionUtil.operation_less_then(literal0, literal1);
      if (!_gen.looseIdentical(operation_less_then2, _operation_less_then2)) {
        change_operation_less_then2 = true;

        _operation_less_then2 = operation_less_then2;
      }

      isChanged = false;
    }
    if (change_operation_less_then2 || change_literal0 || change_literal1) {
      currentProto = _protos[3];
      cond3 = _gen.ChangeDetectionUtil.cond(
          operation_less_then2, literal0, literal1);
      if (!_gen.looseIdentical(cond3, _cond3)) {
        change_cond3 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(_cond3, cond3));
        }

        _dispatcher.notifyOnBinding(currentProto.bindingRecord, cond3);

        _cond3 = cond3;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_less_then2 = _gen.ChangeDetectionUtil.uninitialized();
    _cond3 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector25(a, b, c, d), registry, def);
  }
}
class ChangeDetector26 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _operation_greater_then2 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _cond3 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector26(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var operation_greater_then2 = null;
    var cond3 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_operation_greater_then2 = false;
    var change_cond3 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = 1;
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = 2;
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      operation_greater_then2 =
          _gen.ChangeDetectionUtil.operation_greater_then(literal0, literal1);
      if (!_gen.looseIdentical(
          operation_greater_then2, _operation_greater_then2)) {
        change_operation_greater_then2 = true;

        _operation_greater_then2 = operation_greater_then2;
      }

      isChanged = false;
    }
    if (change_operation_greater_then2 || change_literal0 || change_literal1) {
      currentProto = _protos[3];
      cond3 = _gen.ChangeDetectionUtil.cond(
          operation_greater_then2, literal0, literal1);
      if (!_gen.looseIdentical(cond3, _cond3)) {
        change_cond3 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(_cond3, cond3));
        }

        _dispatcher.notifyOnBinding(currentProto.bindingRecord, cond3);

        _cond3 = cond3;
      }

      isChanged = false;
    }
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _operation_greater_then2 = _gen.ChangeDetectionUtil.uninitialized();
    _cond3 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector26(a, b, c, d), registry, def);
  }
}
class ChangeDetector27 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _arrayFn22 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal3 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _keyedAccess4 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector27(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var literal1 = null;
    var arrayFn22 = null;
    var literal3 = null;
    var keyedAccess4 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_literal1 = false;
    var change_arrayFn22 = false;
    var change_literal3 = false;
    var change_keyedAccess4 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = "foo";
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    currentProto = _protos[1];
    literal1 = "bar";
    if (!_gen.looseIdentical(literal1, _literal1)) {
      change_literal1 = true;

      _literal1 = literal1;
    }

    isChanged = false;

    if (change_literal0 || change_literal1) {
      currentProto = _protos[2];
      arrayFn22 = _gen.ChangeDetectionUtil.arrayFn2(literal0, literal1);
      if (!_gen.looseIdentical(arrayFn22, _arrayFn22)) {
        change_arrayFn22 = true;

        _arrayFn22 = arrayFn22;
      }

      isChanged = false;
    }
    currentProto = _protos[3];
    literal3 = 0;
    if (!_gen.looseIdentical(literal3, _literal3)) {
      change_literal3 = true;

      _literal3 = literal3;
    }

    isChanged = false;

    currentProto = _protos[4];
    keyedAccess4 = arrayFn22[literal3];
    if (!_gen.looseIdentical(keyedAccess4, _keyedAccess4)) {
      change_keyedAccess4 = true;
      if (throwOnChange) {
        _gen.ChangeDetectionUtil.throwOnChange(currentProto,
            _gen.ChangeDetectionUtil.simpleChange(_keyedAccess4, keyedAccess4));
      }

      _dispatcher.notifyOnBinding(currentProto.bindingRecord, keyedAccess4);

      _keyedAccess4 = keyedAccess4;
    }

    isChanged = false;
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _literal1 = _gen.ChangeDetectionUtil.uninitialized();
    _arrayFn22 = _gen.ChangeDetectionUtil.uninitialized();
    _literal3 = _gen.ChangeDetectionUtil.uninitialized();
    _keyedAccess4 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector27(a, b, c, d), registry, def);
  }
}
class ChangeDetector28 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;

  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _mapFnfoo1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _literal2 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _keyedAccess3 = _gen.ChangeDetectionUtil.uninitialized();
  ChangeDetector28(this._dispatcher, this._pipeRegistry, this._protos,
      this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var literal0 = null;
    var mapFnfoo1 = null;
    var literal2 = null;
    var keyedAccess3 = null;
    var change_context = false;
    var change_literal0 = false;
    var change_mapFnfoo1 = false;
    var change_literal2 = false;
    var change_keyedAccess3 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    literal0 = "bar";
    if (!_gen.looseIdentical(literal0, _literal0)) {
      change_literal0 = true;

      _literal0 = literal0;
    }

    isChanged = false;

    if (change_literal0) {
      currentProto = _protos[1];
      mapFnfoo1 = _gen.ChangeDetectionUtil.mapFn(["foo"])(literal0);
      if (!_gen.looseIdentical(mapFnfoo1, _mapFnfoo1)) {
        change_mapFnfoo1 = true;

        _mapFnfoo1 = mapFnfoo1;
      }

      isChanged = false;
    }
    currentProto = _protos[2];
    literal2 = "foo";
    if (!_gen.looseIdentical(literal2, _literal2)) {
      change_literal2 = true;

      _literal2 = literal2;
    }

    isChanged = false;

    currentProto = _protos[3];
    keyedAccess3 = mapFnfoo1[literal2];
    if (!_gen.looseIdentical(keyedAccess3, _keyedAccess3)) {
      change_keyedAccess3 = true;
      if (throwOnChange) {
        _gen.ChangeDetectionUtil.throwOnChange(currentProto,
            _gen.ChangeDetectionUtil.simpleChange(_keyedAccess3, keyedAccess3));
      }

      _dispatcher.notifyOnBinding(currentProto.bindingRecord, keyedAccess3);

      _keyedAccess3 = keyedAccess3;
    }

    isChanged = false;
  }

  void callOnAllChangesDone() {}

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _literal0 = _gen.ChangeDetectionUtil.uninitialized();
    _mapFnfoo1 = _gen.ChangeDetectionUtil.uninitialized();
    _literal2 = _gen.ChangeDetectionUtil.uninitialized();
    _keyedAccess3 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new ChangeDetector28(a, b, c, d), registry, def);
  }
}

