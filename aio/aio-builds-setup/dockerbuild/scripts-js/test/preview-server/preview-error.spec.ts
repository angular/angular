// Imports
import {PreviewServerError} from '../../lib/preview-server/preview-error';

// Tests
describe('PreviewServerError', () => {
  let err: PreviewServerError;

  beforeEach(() => err = new PreviewServerError(999, 'message'));


  it('should extend Error', () => {
    expect(err).toBeInstanceOf(PreviewServerError);
    expect(err).toBeInstanceOf(Error);

    expect(Object.getPrototypeOf(err)).toBe(PreviewServerError.prototype);
  });


  it('should have a \'status\' property', () => {
    expect(err.status).toBe(999);
  });


  it('should have a \'message\' property', () => {
    expect(err.message).toBe('message');
  });


  it('should have a 500 \'status\' by default', () => {
    expect(new PreviewServerError().status).toBe(500);
  });


  it('should have an empty \'message\' by default', () => {
    expect(new PreviewServerError().message).toBe('');
    expect(new PreviewServerError(999).message).toBe('');
  });

});
