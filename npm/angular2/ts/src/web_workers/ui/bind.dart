library angular2.src.web_workers.ui.bind;

/**
 * Binding is not necessary in dart.
 * This method just returns the passed function regardless of scope.
 * It's only here to match the TypeScript implementation.
 * TODO(jteplitz602) Have ts2dart remove calls to bind(#3820)
 */
Function bind(Function fn, dynamic scope) {
  return fn;
}
