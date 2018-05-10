import * as express from 'express';
import {UploadError} from '../../lib/upload-server/upload-error';
import {respondWithError, throwRequestError} from '../../lib/upload-server/utils';

describe('upload-server/utils', () => {
  describe('respondWithError', () => {
    let endSpy: jasmine.Spy;
    let statusSpy: jasmine.Spy;
    let response: express.Response;

    beforeEach(() => {
      endSpy = jasmine.createSpy('end');
      statusSpy = jasmine.createSpy('status').and.callFake(() => response);
      response = {status: statusSpy, end: endSpy} as any;
    });

    it('should set the status on the response', () => {
      respondWithError(response, new UploadError(505, 'TEST MESSAGE'));

      expect(statusSpy).toHaveBeenCalledWith(505);
      expect(endSpy).toHaveBeenCalledWith('TEST MESSAGE', jasmine.any(Function));
      expect(console.error).toHaveBeenCalledWith('Upload error: 505 - HTTP Version Not Supported');
      expect(console.error).toHaveBeenCalledWith('TEST MESSAGE');
    });

    it('should convert non-UploadError errors to 500 UploadErrors', () => {
      respondWithError(response, new Error('OTHER MESSAGE'));

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(endSpy).toHaveBeenCalledWith('OTHER MESSAGE', jasmine.any(Function));
      expect(console.error).toHaveBeenCalledWith('Upload error: 500 - Internal Server Error');
      expect(console.error).toHaveBeenCalledWith('OTHER MESSAGE');
    });
  });

  describe('throwRequestError', () => {
    it('should throw a suitable error', () => {
      let caught = false;
      try {
        const request = {
          body: 'The request body',
          method: 'POST',
          originalUrl: 'some.domain.com/path',
        } as express.Request;
        throwRequestError(505, 'ERROR MESSAGE', request);
      } catch (error) {
        caught = true;
        expect(error).toEqual(jasmine.any(UploadError));
        expect(error.status).toEqual(505);
        expect(error.message).toEqual(`ERROR MESSAGE in request: POST some.domain.com/path "The request body"`);
      }
      expect(caught).toEqual(true);
    });
  });
});
