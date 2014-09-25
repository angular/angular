// Constructor
// Define fields
class Foo {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  sum() {
    return this.a + this.b;
  }
}

function main() {
  var foo = new Foo(2, 3);

  assert(foo.a == 2);
  assert(foo.b == 3);
  assert(foo.sum() == 5);
}
