class C {
  method() {
    function other() {}

    var asyncArrow =
        async (foo: any) => {
      await foo;
      await (other as any).apply(this, arguments);
    }

    const localArgs = arguments;

    const syncArrow = (foo: any) => {
      (other as any).apply(this, arguments);
    };
  }
}
