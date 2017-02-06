// Imports
import {BuildEvent, CreatedBuildEvent} from '../../lib/upload-server/build-events';

// Tests
describe('BuildEvent', () => {
  let evt: BuildEvent;

  beforeEach(() => evt = new BuildEvent('foo', 42, 'bar'));


  it('should have a \'type\' property', () => {
    expect(evt.type).toBe('foo');
  });


  it('should have a \'pr\' property', () => {
    expect(evt.pr).toBe(42);
  });


  it('should have a \'sha\' property', () => {
    expect(evt.sha).toBe('bar');
  });

});


describe('CreatedBuildEvent', () => {
  let evt: CreatedBuildEvent;

  beforeEach(() => evt = new CreatedBuildEvent(42, 'bar'));


  it('should have a static \'type\' property', () => {
    expect(CreatedBuildEvent.type).toBe('build.created');
  });


  it('should extend BuildEvent', () => {
    expect(evt).toEqual(jasmine.any(CreatedBuildEvent));
    expect(evt).toEqual(jasmine.any(BuildEvent));

    expect(Object.getPrototypeOf(evt)).toBe(CreatedBuildEvent.prototype);
  });


  it('should automatically set the \'type\'', () => {
    expect(evt.type).toBe(CreatedBuildEvent.type);
  });


  it('should have a \'pr\' property', () => {
    expect(evt.pr).toBe(42);
  });


  it('should have a \'sha\' property', () => {
    expect(evt.sha).toBe('bar');
  });

});
