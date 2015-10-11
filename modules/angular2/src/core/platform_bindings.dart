library angular2.src.core.platform_bindings;


import 'package:angular2/core.dart';
import 'package:angular2/src/core/facade/exceptions.dart';
import 'package:angular2/src/core/dom/dom_adapter.dart';

exceptionFactory() => new ExceptionHandler(DOM, true);

const EXCEPTION_PROVIDER = const Binding(ExceptionHandler, toFactory: exceptionFactory, deps: const []);

const EXCEPTION_BINDING = EXCEPTION_PROVIDER;
