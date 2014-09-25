function same(a, b) {
  return a === b;
}

function main() {
  var obj = {};
  assert(same({}, {}) == false);
  assert(same(obj, obj) == true);
}
