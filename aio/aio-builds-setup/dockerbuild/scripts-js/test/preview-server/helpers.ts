import {PreviewServerError} from '../../lib/preview-server/preview-error';

export const expectToBePreviewServerError = (actual: PreviewServerError, status?: number, message?: string) => {
  expect(actual).toEqual(jasmine.any(PreviewServerError));
  if (status != null) {
    expect(actual.status).toBe(status);
  }
  if (message != null) {
    expect(actual.message).toBe(message);
  }
};
