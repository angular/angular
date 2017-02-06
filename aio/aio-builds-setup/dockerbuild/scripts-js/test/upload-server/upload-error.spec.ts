// Imports
import {UploadError} from '../../lib/upload-server/upload-error';

// Tests
describe('UploadError', () => {
  let err: UploadError;

  beforeEach(() => err = new UploadError(999, 'message'));


  it('should extend Error', () => {
    expect(err).toEqual(jasmine.any(UploadError));
    expect(err).toEqual(jasmine.any(Error));

    expect(Object.getPrototypeOf(err)).toBe(UploadError.prototype);
  });


  it('should have a \'status\' property', () => {
    expect(err.status).toBe(999);
  });


  it('should have a \'message\' property', () => {
    expect(err.message).toBe('message');
  });


  it('should have a 500 \'status\' by default', () => {
    expect(new UploadError().status).toBe(500);
  });


  it('should have an empty \'message\' by default', () => {
    expect(new UploadError().message).toBe('');
    expect(new UploadError(999).message).toBe('');
  });

});
