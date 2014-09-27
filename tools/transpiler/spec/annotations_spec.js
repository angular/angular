import annotations from './fixtures/annotations';

class Inject {}
class Bar {}

@annotations.Provide('Foo')
class Foo {
  @Inject
  constructor() {}
}

@annotations.Provide(Foo)
function baz() {}

function annotatedParams(@Inject(Foo) f, @Inject(Bar) b) {}

function main() {
  annotations.main();
}