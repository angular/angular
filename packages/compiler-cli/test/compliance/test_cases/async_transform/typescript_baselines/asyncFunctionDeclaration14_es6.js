function* foo_generator() {
  return;
}
function foo() {
    return Zone.__awaiter(this, [], foo_generator);
}
