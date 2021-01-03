import * as express from 'express';
import {PreviewServerError} from './preview-error';

/**
 * Update the response to report that an error has occurred.
 * @param res The response to configure as an error.
 * @param err The error that needs to be reported.
 */
export async function respondWithError(res: express.Response, err: any): Promise<void> {
  if (!(err instanceof PreviewServerError)) {
    err = new PreviewServerError(500, String((err && err.message) || err));
  }

  res.status(err.status);
  return new Promise(resolve => res.end(err.message, resolve));
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
  throw new PreviewServerError(status, message);
}
