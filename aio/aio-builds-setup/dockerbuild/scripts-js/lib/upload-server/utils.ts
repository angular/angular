import * as express from 'express';
import * as http from 'http';
import {promisify} from 'util';
import {UploadError} from './upload-error';

/**
 * Update the response to report that an error has occurred.
 * @param res The response to configure as an error.
 * @param err The error that needs to be reported.
 */
export async function respondWithError(res: express.Response, err: any) {
  if (!(err instanceof UploadError)) {
    err = new UploadError(500, String((err && err.message) || err));
  }

  const statusText = http.STATUS_CODES[err.status] || '???';
  console.error(`Upload error: ${err.status} - ${statusText}`);
  console.error(err.message);

  res.status(err.status);
  await promisify(res.end.bind(res))(err.message);
}

/**
 * Throw an exception that describes the given error information.
 * @param status The HTTP status code include in the error.
 * @param error The error message to include in the error.
 * @param req The request that triggered this error.
 */
export function throwRequestError(status: number, error: string, req: express.Request): never {
  const message = `${error} in request: ${req.method} ${req.originalUrl}` +
                  (!req.body ? '' : ` ${JSON.stringify(req.body)}`);
  throw new UploadError(status, message);
}
