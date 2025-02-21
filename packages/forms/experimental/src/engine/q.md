```ts
const addrSchema = schema(a => {

  rule(a.province, disable(province, f) => {...});

  array(a.lines, (l: FormPath) => {
    rule(l.meta.priority, disable(f, l, (prov, f) => f.$get(l));
  });

  rule(a, disable(() => {
    a().
    // how do i access things above my rule?
    if(a.contry == '')
     return {field: a.lines[0], disabled: true};
    }
  }));
})

const addrSchema = schema((a: FormPath) => {
  // called once, no need to recreate rules for each field
  // can have conditional logic, but applies equally to all
  // address instances

  rule(a.province, disable((province, resolve) => resolve(a).country.$.value() !== 'Canada'));

  array(a.lines, l => {
    rule(l.text, validate((c) => c.value().length > 0));

    rule(l.meta.priority, disable([a, l], (c, a, l) => {
      // how do i access the country field?
      f.country.$.value();


      f.lines[key].thing;

      resolve(l)
      resolve(a)

      // how do i access the text of the current line?

    }));
  });
});

const addrSchema = schema((a: FormNode) => {
  // schema is called for every node/field - less performant
  // a "looks like" you can access the value/etc here
  a.$.value(); // illegal; would throw

  // it looks like you can conditionally create rules

  if (disableCanada) {
    rule(a.province, disable(() => a.country.$.value() !== 'Canada'));
  }

  // alternative?
  rule(a, disable((c) => c.value().country !== 'Canada', a.province));

  array(a.lines, l => {
    rule(l.text, validate((c) => c.value().length > 0));
    rule(l.meta.priority, disable((c, f, key ?) => {
      // how do i access the country field?
      f.country.$.value();

      // how do i access the text of the current line?
      l.text.$.value();
    }));
});

function isNotCanada(c: FormField<{country: string}>): boolean;
function isNotCanada(f: FormNav<{country: string}>): boolean;

```
