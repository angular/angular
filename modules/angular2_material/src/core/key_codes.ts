import {CONST} from 'angular2/src/core/facade/lang';

// Can't use an enum because Dart doesn't support enum initializers.
@CONST()
export class KeyCodes {
  @CONST() static ESCAPE = 27;
  @CONST() static SPACE = 32;
  @CONST() static UP = 38;
  @CONST() static DOWN = 40;
}
