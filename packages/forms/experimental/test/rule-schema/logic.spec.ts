import {signal} from '@angular/core';
import {disable, error, metadata, required, when} from '../../src/rule-schema/logic';

describe('logic', () => {
  describe('error', () => {
    it('should accept no args', () => {
      const logic = error();
      expect(logic.validate!(signal(0), [], {})).toEqual([{type: 'custom', message: ''}]);
    });

    it('should accept a message string', () => {
      const logic = error('some message');
      expect(logic.validate!(signal(0), [], {})).toEqual([
        {type: 'custom', message: 'some message'},
      ]);
    });

    it('should accept an error object', () => {
      const logic = error({type: 'my-err', message: '', data: 6});
      expect(logic.validate!(signal(0), [], {})).toEqual([{type: 'my-err', message: '', data: 6}]);
    });

    describe('should accept function to', () => {
      it('null', () => {
        const logic = error(() => null);
        expect(logic.validate!(signal(0), [], {})).toEqual([]);
      });

      it('string', () => {
        const logic = error(() => 'some message');
        expect(logic.validate!(signal(0), [], {})).toEqual([
          {type: 'custom', message: 'some message'},
        ]);
      });

      it('error object', () => {
        const logic = error(() => ({type: 'my-err', message: '', data: 6}));
        expect(logic.validate!(signal(0), [], {})).toEqual([
          {type: 'my-err', message: '', data: 6},
        ]);
      });

      it('error array', () => {
        const logic = error(() => [{type: 'my-err', message: '', data: 6}]);
        expect(logic.validate!(signal(0), [], {})).toEqual([
          {type: 'my-err', message: '', data: 6},
        ]);
      });
    });

    it('should conditionally produce error', () => {
      const data = signal(0);
      const logic = error<number>((value) => (value() <= 0 ? 'Must be >0' : []));
      expect(logic.validate!(data, [], {})).toEqual([{type: 'custom', message: 'Must be >0'}]);
      data.set(1);
      expect(logic.validate!(data, [], {})).toEqual([]);
    });

    it('should merge error with previous errors', () => {
      const data = signal(0);
      const logic = error<number>((value, previous) =>
        value() <= 0 ? [...previous, {type: 'custom', message: 'Must be >0'}] : previous,
      );
      expect(logic.validate!(data, [{type: 'required', message: ''}], {})).toEqual([
        {type: 'required', message: ''},
        {type: 'custom', message: 'Must be >0'},
      ]);
      data.set(1);
      expect(logic.validate!(data, [{type: 'required', message: ''}], {})).toEqual([
        {type: 'required', message: ''},
      ]);
    });
  });

  describe('disable', () => {
    it('should accept no args', () => {
      const logic = disable();
      expect(logic.disabled!(signal(0), false, {})).toEqual(true);
    });

    it('should accept a boolean', () => {
      const logic = disable(true);
      expect(logic.disabled!(signal(0), false, {})).toEqual(true);
    });

    it('should accept a reason string', () => {
      const logic = disable('some reason');
      expect(logic.disabled!(signal(0), false, {})).toEqual({reason: 'some reason'});
    });

    it('should accept a disabled object', () => {
      const logic = disable({reason: 'some reason'});
      expect(logic.disabled!(signal(0), false, {})).toEqual({reason: 'some reason'});
    });

    describe('should accept function to', () => {
      it('boolean', () => {
        const logic = disable(() => true);
        expect(logic.disabled!(signal(0), false, {})).toEqual(true);
      });

      it('string', () => {
        const logic = disable(() => 'some reason');
        expect(logic.disabled!(signal(0), false, {})).toEqual({reason: 'some reason'});
      });

      it('disabled object', () => {
        const logic = disable(() => ({reason: 'some reason'}));
        expect(logic.disabled!(signal(0), false, {})).toEqual({reason: 'some reason'});
      });
    });

    it('should conditionally disable', () => {
      const data = signal(0);
      const logic = disable<number>((value) => (value() < 0 ? 'Unavailable' : false));
      expect(logic.disabled!(data, false, {})).toEqual(false);
      data.set(-1);
      expect(logic.disabled!(data, false, {})).toEqual({reason: 'Unavailable'});
    });

    it('should merge disabled with previous disabled', () => {
      const data = signal(0);
      const logic = disable<number>((value, previous) =>
        value() < 0 ? previous || true : previous,
      );
      data.set(-1);
      expect(logic.disabled!(data, {reason: 'Some reason'}, {})).toEqual({
        reason: 'Some reason',
      });
      expect(logic.disabled!(data, false, {})).toEqual(true);
    });
  });

  describe('metadata', () => {
    it('should add static metadata', () => {
      const data = signal(0);
      const logic = metadata('some-prop', 'value');
      expect(logic.metadata!(data, {})).toEqual({'some-prop': 'value'});
      expect(logic.metadata!(data, {'prev-prop': 'prev-value'})).toEqual({
        'some-prop': 'value',
        'prev-prop': 'prev-value',
      });
    });

    it('should add computed metadata', () => {
      const data = signal(0);
      const logic = metadata('some-prop', (a) => a());
      expect(logic.metadata!(data, {})).toEqual({'some-prop': 0});
      expect(logic.metadata!(data, {'prev-prop': 'prev-value'})).toEqual({
        'some-prop': 0,
        'prev-prop': 'prev-value',
      });
    });

    it('should add function metadata', () => {
      const data = signal(0);
      const logic = metadata('some-prop', () => () => 'ret-val');
      expect((logic.metadata!(data, {})['some-prop'] as Function)()).toEqual('ret-val');
    });
  });

  describe('required', () => {
    it('should require a value', () => {
      const data = signal<number | null>(null);
      const logic = required();
      expect(logic.validate!(data, [], {})).toEqual([{type: 'required', message: ''}]);
      data.set(0);
      expect(logic.validate!(data, [], {})).toEqual([]);
    });

    it('should un-require a previously required value', () => {
      const data = signal<number | null>(null);
      const logic = required(false);
      expect(
        logic.validate!(
          data,
          [
            {type: 'custom', message: ''},
            {type: 'required', message: ''},
          ],
          {required: true},
        ),
      ).toEqual([{type: 'custom', message: ''}]);
      expect(logic.metadata!(data, {required: true})).toEqual({required: false});
    });

    it('should override previous required rule', () => {
      const data = signal<number | null>(null);
      const logic = required('new message');
      expect(
        logic.validate!(
          data,
          [
            {type: 'custom', message: ''},
            {type: 'required', message: 'previous messsage'},
          ],
          {required: true},
        ),
      ).toEqual([
        {type: 'custom', message: ''},
        {type: 'required', message: 'new message'},
      ]);
      expect(logic.metadata!(data, {required: true})).toEqual({required: true});
    });

    it('should customize message based on value', () => {
      const data = signal<string | null>(null);
      const logic = required((value) => `got ${JSON.stringify(value())} for a required field`);
      expect(logic.validate!(data, [], {})).toEqual([
        {type: 'required', message: 'got null for a required field'},
      ]);
      expect(logic.metadata!(data, {required: true})).toEqual({required: true});
      data.set('');
      expect(logic.validate!(data, [], {})).toEqual([
        {type: 'required', message: 'got "" for a required field'},
      ]);
      expect(logic.metadata!(data, {required: true})).toEqual({required: true});
      data.set('hi');
      expect(logic.validate!(data, [], {})).toEqual([]);
      expect(logic.metadata!(data, {required: true})).toEqual({required: true});
    });
  });

  describe('when', () => {
    it('should conditionally apply logic', () => {
      const data = signal(0);
      const logic = when<number>((value) => value() <= 0, error('Must be >0'));
      expect(logic.validate!(data, [], {})).toEqual([{type: 'custom', message: 'Must be >0'}]);
      data.set(1);
      expect(logic.validate!(data, [], {})).toEqual([]);
      expect(logic.validate!(data, [{type: 'prev-error', message: ''}], {})).toEqual([
        {type: 'prev-error', message: ''},
      ]);
    });
  });
});
