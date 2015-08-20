library angular2.platform_bindings;


import 'package:angular2/di.dart';
import './exception_handler.dart';
import 'package:angular2/src/core/dom/dom_adapter.dart';

exceptionFactory() => new ExceptionHandler(DOM, true);

const EXCEPTION_BINDING = const Binding(ExceptionHandler, toFactory: exceptionFactory, deps: const []);
