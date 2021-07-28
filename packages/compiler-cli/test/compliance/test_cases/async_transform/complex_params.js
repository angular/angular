function * foo_generator(...[, {a}, {b: [{c: d}]}]) {
  yield a;
  yield d;
}

export function foo(...[, {a}, {b: [{c: d}]}]) {
  return Zone.__awaiter(this, [...[, {a}, {b: [{c: d}]}]], foo_generator);
}
