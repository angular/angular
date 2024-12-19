import {form} from '../src/prototype1/form';
import {field, FormValidationError, group} from '../src/prototype1/schema';

describe('FormFieldSchema', () => {
  describe('create', () => {
    it('no default', () => {
      const schema = field<number>();
      expect(schema.defaultValue).toBeUndefined();
    });

    it('default value', () => {
      const schema = field(0);
      expect(schema.defaultValue).toBe(0);
    });
  });
});

describe('FormGroupSchema', () => {
  it('create', () => {
    const f = field();
    const schema = group({prop: f});
    expect(Object.keys(schema.fields)).toEqual(['prop']);
    expect(schema.fields.prop).toBe(f);
  });
});

describe('FormFieldNode', () => {
  it('create', () => {
    const f = form(field(0));
    expect(f.$()).toBe(0);
    expect(f.$.errors()).toEqual([]);
    expect(f.$.valid()).toBe(true);
  });

  describe('validation', () => {
    it('multiple errors', () => {
      const f = form(
        field(0)
          .validate((n) => (n() > 9 ? 'too large' : null))
          .validate((n) => (n() > 99 ? 'much too large' : null)),
      );
      expect(f.$.errors()).toEqual([]);
      expect(f.$.valid()).toBe(true);

      f.$.set(10);
      expect(f.$.errors()).toEqual([new FormValidationError('too large')]);
      expect(f.$.valid()).toBe(false);

      f.$.set(100);
      expect(f.$.errors()).toEqual([
        new FormValidationError('much too large'),
        new FormValidationError('too large'),
      ]);
      expect(f.$.valid()).toBe(false);
    });
  });

  describe('disabled', () => {
    it('default', () => {
      expect(form(field()).$.disabled()).toBe(false);
    });

    it('const', () => {
      expect(form(field().disabled(false)).$.disabled()).toBe(false);
      expect(form(field().disabled(true)).$.disabled()).toBe(true);
      expect(form(field().disabled('unavailable')).$.disabled()).toEqual({reason: 'unavailable'});
    });

    it('dynamic', () => {
      const f = form(field('test').disabled((n) => n() === 'disabled'));
      expect(f.$.disabled()).toBe(false);
      f.$.set('disabled');
      expect(f.$.disabled()).toBe(true);
    });

    it('multiple conditions', () => {
      const f = form(
        field('test')
          .disabled((n) =>
            n().includes('first:false')
              ? false
              : n().includes('first:true')
                ? 'disabled by first'
                : undefined,
          )
          .disabled((n) =>
            n().includes('second:false')
              ? false
              : n().includes('second:true')
                ? 'disabled by second'
                : undefined,
          ),
      );
      expect(f.$.disabled()).toBe(false);
      f.$.set('first:true');
      expect(f.$.disabled()).toEqual({reason: 'disabled by first'});
      f.$.set('second:true');
      expect(f.$.disabled()).toEqual({reason: 'disabled by second'});
      f.$.set('first:true second:true');
      expect(f.$.disabled()).toEqual({reason: 'disabled by second'});
      f.$.set('first:true second:false');
      expect(f.$.disabled()).toEqual(false);
    });
  });

  it('corsslink', () => {
    const f = form(
      field(0)
        .disabled((n) => n() > 9)
        .xlink((s, f) => s.validate(() => (f.$.disabled() ? 'disabled' : null)))
        .xlink((s, f) => s.validate(() => (!f.$.disabled() ? 'not disabled' : null))),
    );
    expect(f.$.disabled()).toBe(false);
    expect(f.$.errors()).toEqual([new FormValidationError('not disabled')]);
    f.$.set(10);
    expect(f.$.disabled()).toBe(true);
    expect(f.$.errors()).toEqual([new FormValidationError('disabled')]);
  });
});

describe('FormGroupNode', () => {
  it('create', () => {
    const f = form(group({prop1: field(1), prop2: group({prop3: field(3)})}));
    expect(f.$()).toEqual({prop1: 1, prop2: {prop3: 3}});
    expect(f.$.errors()).toEqual([]);
    expect(f.$.valid()).toBe(true);
    expect(f.prop1.$()).toBe(1);
    expect(f.prop2.$()).toEqual({prop3: 3});
    expect(f.prop2.prop3.$()).toBe(3);
  });

  it('update', () => {
    const f = form(group({prop1: field(1), prop2: group({prop3: field(3)})}));
    expect(f.$()).toEqual({prop1: 1, prop2: {prop3: 3}});
    expect(f.prop1.$()).toBe(1);
    expect(f.prop2.prop3.$()).toBe(3);

    f.$.set({prop1: 9, prop2: {prop3: 9}});
    expect(f.$()).toEqual({prop1: 9, prop2: {prop3: 9}});
    expect(f.prop1.$()).toBe(9);
    expect(f.prop2.prop3.$()).toBe(9);
  });

  describe('validation', () => {
    it('valid', () => {
      const f = form(
        group({
          prop1: field(0).validate((n) => (n() > 9 ? 'too large' : null)),
          prop2: group({
            prop3: field(0).validate((n) => (n() > 9 ? 'too large' : null)),
          }),
        }).validate((n) => (n().prop1 + n().prop2.prop3 > 9 ? 'sum too large' : null)),
      );
      expect(f.$.errors()).toEqual([]);
      expect(f.$.valid()).toBe(true);
    });

    it('field-level invalid', () => {
      const f = form(
        group({
          prop1: field(10).validate((n) => (n() > 9 ? 'too large' : null)),
          prop2: group({
            prop3: field(-10).validate((n) => (n() > 9 ? 'too large' : null)),
          }),
        }).validate((n) => (n().prop1 + n().prop2.prop3 > 9 ? 'sum too large' : null)),
      );
      expect(f.$.errors()).toEqual([]);
      expect(f.$.valid()).toBe(false);
      expect(f.prop1.$.valid()).toBe(false);
    });

    it('group-level invalid', () => {
      const f = form(
        group({
          prop1: field(9).validate((n) => (n() > 9 ? 'too large' : null)),
          prop2: group({
            prop3: field(9).validate((n) => (n() > 9 ? 'too large' : null)),
          }),
        }).validate((n) => (n().prop1 + n().prop2.prop3 > 9 ? 'sum too large' : null)),
      );
      expect(f.$.errors()).toEqual([new FormValidationError('sum too large')]);
      expect(f.$.valid()).toBe(false);
      expect(f.prop1.$.valid()).toBe(true);
      expect(f.prop2.$.valid()).toBe(true);
      expect(f.prop2.prop3.$.valid()).toBe(true);
    });
  });

  describe('disabled', () => {
    it('disables enabled children', () => {
      const f = form(group({a: field(), b: group({c: field()})}).disabled(true));
      expect(f.$.disabled()).toBe(true);
      expect(f.a.$.disabled()).toBe(true);
      expect(f.b.$.disabled()).toBe(true);
      expect(f.b.c.$.disabled()).toBe(true);
    });

    it('does not enable disabled children', () => {
      const f = form(
        group({
          a: field().disabled(true),
          b: group({c: field()}).disabled(true),
        }).disabled(false),
      );
      expect(f.$.disabled()).toBe(false);
      expect(f.a.$.disabled()).toBe(true);
      expect(f.b.$.disabled()).toBe(true);
      expect(f.b.c.$.disabled()).toBe(true);
    });
  });

  describe('xlink', () => {
    it('top-level', () => {
      const f = form(
        group({
          prop1: field(0).disabled((n) => n() > 9),
          prop2: field(0).disabled((n) => n() > 9),
        })
          .xlink((s, f) => s.validate(() => (f.prop1.$.disabled() ? 'prop1 disabled' : null)))
          .xlink((s, f) => s.validate(() => (f.prop2.$.disabled() ? 'prop2 disabled' : null))),
      );
      expect(f.$.errors()).toEqual([]);
      f.$.set({prop1: 10, prop2: 10});
      expect(f.$.errors()).toEqual([
        new FormValidationError('prop2 disabled'),
        new FormValidationError('prop1 disabled'),
      ]);
    });

    it('properties', () => {
      const f = form(
        group({
          prop1: field(0),
          prop2: field(0),
        })
          .disabled((n) => n().prop1 > n().prop2)
          .xlink({
            prop1: (s, f) => s.validate(() => (f.$.disabled() ? 'parent disabled' : null)),
          })
          .xlink({
            prop2: (s, f) => s.validate(() => (f.$.disabled() ? 'parent disabled' : null)),
          }),
      );
      expect(f.prop1.$.errors()).toEqual([]);
      expect(f.prop2.$.errors()).toEqual([]);
      f.$.set({prop1: 10, prop2: 0});
      expect(f.prop1.$.errors()).toEqual([new FormValidationError('parent disabled')]);
      expect(f.prop2.$.errors()).toEqual([new FormValidationError('parent disabled')]);
    });

    it('nested', () => {
      const f = form(
        group({
          prop1: group({
            prop2: field(0),
          }),
        })
          .disabled((n) => n().prop1.prop2 > 9)
          .xlink((s, f) => s.validate(() => (f.$.disabled() ? 'root disabled' : null)), {
            // TODO: support updating deep fields too:
            // option1: { prop1: { prop2: (s, f) => ... } }
            // option2: { 'prop1.prop2': (s, f) => ... } // nicer, but not minification-safe
            prop1: (s, f) =>
              s
                .validate(() => (f.$.disabled() ? 'root disabled' : null))
                .xlink((s, f) => s.validate(() => (f.$.disabled() ? 'subgroup disabled' : null)), {
                  prop2: (s, f) =>
                    s
                      .validate(() => (f.$.disabled() ? 'subgroup disabled' : null))
                      .xlink((s, f) =>
                        s.validate(() => (f.$.disabled() ? 'field disabled' : null)),
                      ),
                }),
          }),
      );
      expect(f.$.errors()).toEqual([]);
      expect(f.prop1.$.errors()).toEqual([]);
      expect(f.prop1.prop2.$.errors()).toEqual([]);
      f.prop1.prop2.$.set(10);
      expect(f.$.errors()).toEqual([new FormValidationError('root disabled')]);
      expect(f.prop1.$.errors()).toEqual([
        new FormValidationError('subgroup disabled'),
        new FormValidationError('root disabled'),
      ]);
      expect(f.prop1.prop2.$.errors()).toEqual([
        new FormValidationError('field disabled'),
        new FormValidationError('subgroup disabled'),
      ]);
    });
  });
});

describe('form', () => {
  describe('values', () => {
    const userSchema = group({
      name: group({
        first: field(''),
        last: field(''),
      }),
      address: group({
        street: field(''),
        city: field(''),
        state: field(''),
        zip: field(''),
      }),
    });

    it('default', () => {
      expect(form(userSchema).$()).toEqual({
        name: {first: '', last: ''},
        address: {street: '', city: '', state: '', zip: ''},
      });
    });

    it('explicit values', () => {
      expect(form(userSchema, {address: {city: 'New York', state: 'NY'}}).$()).toEqual({
        name: {first: '', last: ''},
        address: {street: '', city: 'New York', state: 'NY', zip: ''},
      });
    });
  });
});
