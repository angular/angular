function same(a, b) {
  return a === b;
}

function notSame(a, b) {
  if ((a !== a) && (b !== b)) return true;
  return a !== b;
}

function main() {
  var obj = {};
  assert(same({}, {}) == false);
  assert(same(obj, obj) == true);
  assert(notSame({}, {}) == true);
  assert(notSame(obj, obj) == false);
}
