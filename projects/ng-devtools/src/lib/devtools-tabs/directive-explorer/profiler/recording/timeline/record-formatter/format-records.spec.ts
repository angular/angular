import { addFrame, AppEntry, getLabel, getValue, insertTimelineRecord, TimelineView } from './format-records';
import { ElementProfile } from 'protocol';
import {
  NESTED_FORMATTED_RECORD,
  NESTED_RECORD,
  SIMPLE_FORMATTED_RECORD,
  SIMPLE_RECORD,
} from './format-records-test-constants';

describe('getValue cases', () => {
  let element;

  it('calculates value with  no lifecycle hooks', () => {
    element = {
      children: [],
      directives: [{ changeDetection: 10, isElement: false, isComponent: true, lifecycle: {}, name: 'AppComponent' }],
    };
    expect(getValue(element)).toBe(10);
  });

  it('calculates value with 0 change detection and existing lifecycle hooks', () => {
    element = {
      children: [],
      directives: [
        { isComponent: false, isElement: false, name: 'NgForOf', lifecycle: { ngDoCheck: 5 }, changeDetection: 0 },
      ],
    };
    expect(getValue(element)).toBe(5);
  });

  it('calculates value with non 0 change detection and one lifecycle hook', () => {
    element = {
      children: [],
      directives: [
        { isComponent: false, isElement: false, name: 'NgForOf', lifecycle: { ngDoCheck: 5 }, changeDetection: 10 },
      ],
    };
    expect(getValue(element)).toBe(15);
  });

  it('calculates value with non 0 change detection and multiple lifecycle hooks', () => {
    element = {
      children: [],
      directives: [
        {
          isComponent: false,
          isElement: false,
          name: 'NgForOf',
          lifecycle: { ngDoCheck: 5, ngAfterViewInit: 100 },
          changeDetection: 10,
        },
      ],
    };
    expect(getValue(element)).toBe(115);
  });
});

describe('getLabel cases', () => {
  let element: ElementProfile;

  it('has only components', () => {
    element = {
      children: [],
      directives: [
        {
          changeDetection: 10,
          isElement: false,
          isComponent: true,
          lifecycle: {},
          name: 'AppComponent',
        },
      ],
    };
    expect(getLabel(element)).toBe('AppComponent');
  });

  it('has only directives', () => {
    element = {
      children: [],
      directives: [
        {
          isComponent: false,
          isElement: false,
          name: 'RouterOutlet',
          lifecycle: {},
          changeDetection: 0,
        },
      ],
    };
    expect(getLabel(element)).toBe('[RouterOutlet]');
  });

  it('has a component and a directive', () => {
    element = {
      children: [],
      directives: [
        { isComponent: false, isElement: false, name: 'TooltipDirective', lifecycle: {}, changeDetection: 0 },
        { changeDetection: 0, isElement: false, isComponent: true, lifecycle: {}, name: 'TodoComponent' },
      ],
    };
    expect(getLabel(element)).toBe('TodoComponent[TooltipDirective]');
  });

  it('has a component and multiple directives', () => {
    element = {
      children: [],
      directives: [
        { isComponent: false, isElement: false, name: 'TooltipDirective', lifecycle: {}, changeDetection: 0 },
        { isComponent: false, isElement: false, name: 'RandomDirective', lifecycle: {}, changeDetection: 0 },
        { changeDetection: 0, isElement: false, isComponent: true, lifecycle: {}, name: 'TodoComponent' },
      ],
    };
    expect(getLabel(element)).toBe('TodoComponent[TooltipDirective, RandomDirective]');
  });
});

describe('addFrame cases', () => {
  let entry: AppEntry;
  let timeSpent;

  beforeEach(() => {
    entry = {
      app: [],
      timeSpent: 0,
      source: '',
    };
  });

  it('add frame for simple case', () => {
    timeSpent = addFrame(entry.app, SIMPLE_RECORD);
    expect(timeSpent).toBe(17);
    expect(entry.app).toEqual(SIMPLE_FORMATTED_RECORD);
  });

  it('add frame for deeply nested records', () => {
    timeSpent = addFrame(entry.app, NESTED_RECORD);
    expect(timeSpent).toBe(21);
    expect(entry.app).toEqual(NESTED_FORMATTED_RECORD);
  });
});
