// Imports
import {ChangedPrVisibilityEvent, CreatedBuildEvent} from '../../lib/preview-server/build-events';

// Tests
describe('ChangedPrVisibilityEvent', () => {
  let evt: ChangedPrVisibilityEvent;

  beforeEach(() => evt = new ChangedPrVisibilityEvent(42, ['foo', 'bar'], true));


  it('should have a static \'type\' property', () => {
    expect(ChangedPrVisibilityEvent.type).toBe('pr.changedVisibility');
  });


  it('should have a \'pr\' property', () => {
    expect(evt.pr).toBe(42);
  });


  it('should have a \'shas\' property', () => {
    expect(evt.shas).toEqual(['foo', 'bar']);
  });


  it('should have an \'isPublic\' property', () => {
    expect(evt.isPublic).toBe(true);
  });

});


describe('CreatedBuildEvent', () => {
  let evt: CreatedBuildEvent;

  beforeEach(() => evt = new CreatedBuildEvent(42, 'bar', true));


  it('should have a static \'type\' property', () => {
    expect(CreatedBuildEvent.type).toBe('build.created');
  });


  it('should have a \'pr\' property', () => {
    expect(evt.pr).toBe(42);
  });


  it('should have a \'sha\' property', () => {
    expect(evt.sha).toBe('bar');
  });


  it('should have an \'isPublic\' property', () => {
    expect(evt.isPublic).toBe(true);
  });

});
