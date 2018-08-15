# Overview - HTTP Status Codes


This is a list of all the possible HTTP status codes returned by the nginx and preview servers,
along with a brief explanation of what they mean:


## `http://*.ngbuilds.io/*`

- **307 (Temporary Redirect)**:
  All non-HTTPS requests. 308 (Permanent Redirect) would be more appropriate, but is not supported
  by all agents (e.g. cURL).


## `https://pr<pr>-<sha>.ngbuilds.io/*`

- **200 (OK)**:
  File was found or URL was rewritten to `/index.html` (i.e. all paths that have no `.` in final
  segment).

- **403 (Forbidden)**:
  Trying to access a sub-directory.

- **404 (Not Found)**:
  File not found.


## `https://ngbuilds.io/can-have-public-preview/<pr>`

- **200 (OK)**:
  Whether the PR can have a public preview (based on its author, label, changed files).
  _Response type:_ JSON
  _Response format:_
  ```ts
  {
    canHavePublicPreview: boolean,
    reason: string | null,
  }
  ```

- **405 (Method Not Allowed)**:
  Request method other than GET.


## `https://ngbuilds.io/circle-build`

- **201 (Created)**:
  Build deployed successfully and is publicly available.

- **202 (Accepted)**:
  Build not automatically verifiable. Stored for later deployment (after re-verification).

- **204 (No Content)**:
  Build was not successful, so no further action is being taken.

- **400 (Bad Request)**:
  Invalid payload.

- **403 (Forbidden)**:
  Unable to talk to 3rd-party APIs.

- **405 (Method Not Allowed)**:
  Request method other than POST.

- **409 (Conflict)**:
  Request to overwrite existing (public or non-public) directory (e.g. deploy existing build or
  change PR visibility when the destination directory does already exist).


## `https://ngbuilds.io/health-check`

- **200 (OK)**:
  The server is healthy (i.e. up and running and processing requests).


## `https://ngbuilds.io/pr-updated`

- **200 (OK)**:
  Request processed successfully. Processing may or may not have resulted in further actions.

- **400 (Bad Request)**:
  No payload or no `number` field in payload.

- **405 (Method Not Allowed)**:
  Request method other than POST.

- **409 (Conflict)**:
  Request to overwrite existing (public or non-public) directory (i.e. directories for both
  visibilities exist).
  (Normally, this should not happen.)


## `https://*.ngbuilds.io/*`

- **404 (Not Found)**:
  Request not matched by the above rules.

- **500 (Internal Server Error)**:
  Error while processing a request matched by the above rules.
