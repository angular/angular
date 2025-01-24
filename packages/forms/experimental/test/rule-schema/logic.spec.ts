import {signal} from '@angular/core';
import {disable, error, when} from '../../src/rule-schema/logic';

describe('logic', () => {
  describe('error', () => {
    it('should accept no args', () => {
      const logic = error();
      expect(logic.validate!(signal(0), [])).toEqual([{type: 'custom', message: ''}]);
    });

    it('should accept a message string', () => {
      const logic = error('some message');
      expect(logic.validate!(signal(0), [])).toEqual([{type: 'custom', message: 'some message'}]);
    });

    it('should accept an error object', () => {
      const logic = error({type: 'my-err', message: '', data: 6});
      expect(logic.validate!(signal(0), [])).toEqual([{type: 'my-err', message: '', data: 6}]);
    });

    describe('should accept function to', () => {
      it('null', () => {
        const logic = error(() => null);
        expect(logic.validate!(signal(0), [])).toEqual([]);
      });

      it('string', () => {
        const logic = error(() => 'some message');
        expect(logic.validate!(signal(0), [])).toEqual([{type: 'custom', message: 'some message'}]);
      });

      it('error object', () => {
        const logic = error(() => ({type: 'my-err', message: '', data: 6}));
        expect(logic.validate!(signal(0), [])).toEqual([{type: 'my-err', message: '', data: 6}]);
      });

      it('error array', () => {
        const logic = error(() => [{type: 'my-err', message: '', data: 6}]);
        expect(logic.validate!(signal(0), [])).toEqual([{type: 'my-err', message: '', data: 6}]);
      });
    });

    it('should conditionally produce error', () => {
      const data = signal(0);
      const logic = error<number>((value) => (value() <= 0 ? 'Must be >0' : []));
      expect(logic.validate!(data, [])).toEqual([{type: 'custom', message: 'Must be >0'}]);
      data.set(1);
      expect(logic.validate!(data, [])).toEqual([]);
    });

    it('should merge error with previous errors', () => {
      const data = signal(0);
      const logic = error<number>((value, previous) =>
        value() <= 0 ? [...previous, {type: 'custom', message: 'Must be >0'}] : previous,
      );
      expect(logic.validate!(data, [{type: 'required', message: ''}])).toEqual([
        {type: 'required', message: ''},
        {type: 'custom', message: 'Must be >0'},
      ]);
      data.set(1);
      expect(logic.validate!(data, [{type: 'required', message: ''}])).toEqual([
        {type: 'required', message: ''},
      ]);
    });
  });

  describe('disable', () => {
    it('should accept no args', () => {
      const logic = disable();
      expect(logic.disabled!(signal(0), false)).toEqual(true);
    });

    it('should accept a boolean', () => {
      const logic = disable(true);
      expect(logic.disabled!(signal(0), false)).toEqual(true);
    });

    it('should accept a reason string', () => {
      const logic = disable('some reason');
      expect(logic.disabled!(signal(0), false)).toEqual({reason: 'some reason'});
    });

    it('should accept a disabled object', () => {
      const logic = disable({reason: 'some reason'});
      expect(logic.disabled!(signal(0), false)).toEqual({reason: 'some reason'});
    });

    describe('should accept function to', () => {
      it('boolean', () => {
        const logic = disable(() => true);
        expect(logic.disabled!(signal(0), false)).toEqual(true);
      });

      it('string', () => {
        const logic = disable(() => 'some reason');
        expect(logic.disabled!(signal(0), false)).toEqual({reason: 'some reason'});
      });

      it('disabled object', () => {
        const logic = disable(() => ({reason: 'some reason'}));
        expect(logic.disabled!(signal(0), false)).toEqual({reason: 'some reason'});
      });
    });

    it('should conditionally disable', () => {
      const data = signal(0);
      const logic = disable<number>((value) => (value() < 0 ? 'Unavailable' : false));
      expect(logic.disabled!(data, false)).toEqual(false);
      data.set(-1);
      expect(logic.disabled!(data, false)).toEqual({reason: 'Unavailable'});
    });

    it('should merge disabled with previous disabled', () => {
      const data = signal(0);
      const logic = disable<number>((value, previous) =>
        value() < 0 ? previous || true : previous,
      );
      data.set(-1);
      expect(logic.disabled!(data, {reason: 'Some reason'})).toEqual({reason: 'Some reason'});
      expect(logic.disabled!(data, false)).toEqual(true);
    });
  });

  describe('when', () => {
    it('should conditionally apply logic', () => {
      const data = signal(0);
      const logic = when<number>((value) => value() <= 0, error('Must be >0'));
      expect(logic.validate!(data, [])).toEqual([{type: 'custom', message: 'Must be >0'}]);
      data.set(1);
      expect(logic.validate!(data, [])).toEqual([]);
      expect(logic.validate!(data, [{type: 'prev-error', message: ''}])).toEqual([
        {type: 'prev-error', message: ''},
      ]);
    });
  });
});
