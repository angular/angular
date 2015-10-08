library angular.core.facade.exceptions;

import 'exception_handler.dart';
export 'exception_handler.dart';

class BaseException extends Error {
  final String message;

  BaseException([this.message]);

  String toString() {
    return this.message;
  }
}

class WrappedException extends Error {
  final dynamic context;
  final String wrapperMessage;
  final originalException;
  final originalStack;

  WrappedException(
      [this.wrapperMessage, this.originalException, this.originalStack, this.context]);

  get message { return ExceptionHandler.exceptionToString(this); }

  String toString() { return this.message; }
}

Error makeTypeError([String message = ""]) {
  return new BaseException(message);
}

dynamic unimplemented() {
  throw new BaseException('unimplemented');
}
