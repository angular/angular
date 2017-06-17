// Imports
import {CreatedBuildEvent} from '../../lib/upload-server/build-events';

// Tests
describe('CreatedBuildEvent', () => {
  let evt: CreatedBuildEvent;

  beforeEach(() => evt = new CreatedBuildEvent(42, 'bar'));


  it('should have a static \'type\' property', () => {
    expect(CreatedBuildEvent.type).toBe('build.created');
  });


  it('should have a \'pr\' property', () => {
    expect(evt.pr).toBe(42);
  });


  it('should have a \'sha\' property', () => {
    expect(evt.sha).toBe('bar');
  });

});
