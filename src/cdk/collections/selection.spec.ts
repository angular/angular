import {getMultipleValuesInSingleSelectionError, SelectionModel} from './selection';


describe('SelectionModel', () => {
  describe('single selection', () => {
    let model: SelectionModel<any>;

    beforeEach(() => model = new SelectionModel());

    it('should be able to select a single value', () => {
      model.select(1);

      expect(model.selected.length).toBe(1);
      expect(model.isSelected(1)).toBe(true);
    });

    it('should deselect the previously selected value', () => {
      model.select(1);
      model.select(2);

      expect(model.isSelected(1)).toBe(false);
      expect(model.isSelected(2)).toBe(true);
    });

    it('should throw an error if multiple values are passed to model', () => {
      expect(() => model.select(1, 2)).toThrow(getMultipleValuesInSingleSelectionError());
    });

    it('should only preselect one value', () => {
      model = new SelectionModel(false, [1, 2]);

      expect(model.selected.length).toBe(1);
      expect(model.isSelected(1)).toBe(true);
      expect(model.isSelected(2)).toBe(false);
    });
  });

  describe('multiple selection', () => {
    let model: SelectionModel<any>;

    beforeEach(() => model = new SelectionModel(true));

    it('should be able to select multiple options', () => {
      const onChangeSpy = jasmine.createSpy('onChange spy');

      model.onChange!.subscribe(onChangeSpy);
      model.select(1);
      model.select(2);

      expect(model.selected.length).toBe(2);
      expect(model.isSelected(1)).toBe(true);
      expect(model.isSelected(2)).toBe(true);
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
    });

    it('should be able to select multiple options at the same time', () => {
      const onChangeSpy = jasmine.createSpy('onChange spy');

      model.onChange!.subscribe(onChangeSpy);
      model.select(1, 2);

      expect(model.selected.length).toBe(2);
      expect(model.isSelected(1)).toBe(true);
      expect(model.isSelected(2)).toBe(true);
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('should be able to preselect multiple options', () => {
      model = new SelectionModel(true, [1, 2]);

      expect(model.selected.length).toBe(2);
      expect(model.isSelected(1)).toBe(true);
      expect(model.isSelected(2)).toBe(true);
    });

    it('should be able to sort the selected values', () => {
      model = new SelectionModel(true, [2, 3, 1]);

      expect(model.selected).toEqual([2, 3, 1]);

      model.sort();

      expect(model.selected).toEqual([1, 2, 3]);
    });
  });

  describe('onChange event', () => {
    it('should return both the added and removed values', () => {
      let model = new SelectionModel();
      let spy = jasmine.createSpy('SelectionModel change event');

      model.select(1);

      model.onChange!.subscribe(spy);

      model.select(2);

      let event = spy.calls.mostRecent().args[0];

      expect(spy).toHaveBeenCalled();
      expect(event.removed).toEqual([1]);
      expect(event.added).toEqual([2]);
    });

    it('should have updated the selected value before emitting the change event', () => {
      let model = new SelectionModel(true);
      let spy = jasmine.createSpy('SelectionModel change event');

      // Note: this assertion is only here to run the getter.
      expect(model.selected).toEqual([]);

      model.onChange!.subscribe(() => spy(model.selected));
      model.select(1);

      expect(spy).toHaveBeenCalledWith([1]);
    });

    describe('selection', () => {
      let model: SelectionModel<any>;
      let spy: jasmine.Spy;

      beforeEach(() => {
        model = new SelectionModel(true);
        spy = jasmine.createSpy('SelectionModel change event');

        model.onChange!.subscribe(spy);
      });

      it('should emit an event when a value is selected', () => {
        model.select(1);

        let event = spy.calls.mostRecent().args[0];

        expect(spy).toHaveBeenCalled();
        expect(event.added).toEqual([1]);
        expect(event.removed).toEqual([]);
      });

      it('should not emit multiple events for the same value', () => {
        model.select(1);
        model.select(1);

        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('should not emit an event when preselecting values', () => {
        model = new SelectionModel(false, [1]);
        spy = jasmine.createSpy('SelectionModel initial change event');
        model.onChange!.subscribe(spy);

        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('deselection', () => {
      let model: SelectionModel<any>;
      let spy: jasmine.Spy;

      beforeEach(() => {
        model = new SelectionModel(true, [1, 2, 3]);
        spy = jasmine.createSpy('SelectionModel change event');

        model.onChange!.subscribe(spy);
      });

      it('should emit an event when a value is deselected', () => {
        model.deselect(1);

        let event = spy.calls.mostRecent().args[0];

        expect(spy).toHaveBeenCalled();
        expect(event.removed).toEqual([1]);
      });

      it('should not emit an event when a non-selected value is deselected', () => {
        model.deselect(4);
        expect(spy).not.toHaveBeenCalled();
      });

      it('should emit a single event when clearing all of the selected options', () => {
        model.clear();

        let event = spy.calls.mostRecent().args[0];

        expect(spy).toHaveBeenCalledTimes(1);
        expect(event.removed).toEqual([1, 2, 3]);
      });

    });
  });

  describe('disabling the change event', () => {
    let model: SelectionModel<any>;

    beforeEach(() => {
      model = new SelectionModel(true, undefined, false);
    });

    it('should not have an onChange stream if change events are disabled', () => {
      expect(model.onChange).toBeFalsy();
    });

    it('should still update the select value', () => {
      model.select(1);
      expect(model.selected).toEqual([1]);

      model.select(2);
      expect(model.selected).toEqual([1, 2]);
    });
  });

  it('should be able to determine whether it is empty', () => {
    let model = new SelectionModel();

    expect(model.isEmpty()).toBe(true);

    model.select(1);

    expect(model.isEmpty()).toBe(false);
  });

  it('should be able to determine whether it has a value', () => {
    let model = new SelectionModel();

    expect(model.hasValue()).toBe(false);

    model.select(1);

    expect(model.hasValue()).toBe(true);
  });

  it('should be able to toggle an option', () => {
    let model = new SelectionModel();

    model.toggle(1);
    expect(model.isSelected(1)).toBe(true);

    model.toggle(1);
    expect(model.isSelected(1)).toBe(false);
  });

  it('should be able to clear the selected options', () => {
    let model = new SelectionModel(true);

    model.select(1);
    model.select(2);

    expect(model.selected.length).toBe(2);

    model.clear();

    expect(model.selected.length).toBe(0);
    expect(model.isEmpty()).toBe(true);
  });
});
