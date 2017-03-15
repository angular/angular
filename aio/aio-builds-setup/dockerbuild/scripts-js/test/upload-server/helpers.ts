import {UploadError} from '../../lib/upload-server/upload-error';

export const expectToBeUploadError = (actual: UploadError, status?: number, message?: string) => {
  expect(actual).toEqual(jasmine.any(UploadError));
  if (status != null) {
    expect(actual.status).toBe(status);
  }
  if (message != null) {
    expect(actual.message).toBe(message);
  }
};
