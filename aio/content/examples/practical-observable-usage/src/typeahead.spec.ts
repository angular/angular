import { of } from 'rxjs';
import { docRegionTypeahead } from './typeahead';

describe('typeahead', () => {
  let document;
  let ajax;
  let triggertInputChange;

  beforeEach(() => {
    jasmine.clock().install();
    const input = {
      addEventListener: jasmine
        .createSpy('addEvent')
        .and.callFake((eventName: string, cb: (e) => void) => {
          if (eventName === 'input') {
            triggertInputChange = cb;
          }
        }),
      removeEventListener: jasmine.createSpy('removeEvent'),
    };

    document = { getElementById: (id: string) => input };
    ajax = jasmine.createSpy('ajax').and.callFake((url: string) => of('foo bar'));
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should make an ajax call to the corrent endpoint', () => {
    docRegionTypeahead(document, ajax);
    triggertInputChange({ target: { value: 'foo' } });
    jasmine.clock().tick(11);
    expect(ajax).toHaveBeenCalledWith('/api/endpoint?search=foo');
  });

  it('should not make an ajax call, when the input length < 3', () => {
    docRegionTypeahead(document, ajax);
    triggertInputChange({ target: { value: '' } });
    jasmine.clock().tick(11);
    expect(ajax).not.toHaveBeenCalled();
    triggertInputChange({ target: { value: 'fo' } });
    jasmine.clock().tick(11);
    expect(ajax).not.toHaveBeenCalled();
  });

  it('should not make an ajax call for intermediate values when debouncing', () => {
    docRegionTypeahead(document, ajax);
    triggertInputChange({ target: { value: 'foo' } });
    jasmine.clock().tick(9);
    triggertInputChange({ target: { value: 'bar' } });
    jasmine.clock().tick(9);
    triggertInputChange({ target: { value: 'baz' } });
    jasmine.clock().tick(9);
    triggertInputChange({ target: { value: 'qux' } });
    expect(ajax).not.toHaveBeenCalled();
    jasmine.clock().tick(10);
    expect(ajax).toHaveBeenCalledTimes(1);
    expect(ajax).toHaveBeenCalledWith('/api/endpoint?search=qux');
  });

  it('should not make an ajax call, when the input value has not changed', () => {
    docRegionTypeahead(document, ajax);
    triggertInputChange({ target: { value: 'foo' } });
    jasmine.clock().tick(11);
    expect(ajax).toHaveBeenCalled();
    ajax.calls.reset();
    triggertInputChange({ target: { value: 'foo' } });
    jasmine.clock().tick(11);
    expect(ajax).not.toHaveBeenCalled();
  });
});
