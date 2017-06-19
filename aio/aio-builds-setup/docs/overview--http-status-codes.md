# Overview - HTTP Status Codes


This is a list of all the possible HTTP status codes returned by the nginx anf upload servers, along
with a bried explanation of what they mean:


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


## `https://ngbuilds.io/create-build/<pr>/<sha>`

- **201 (Created)**:
  Build deployed successfully and is publicly available.

- **202 (Accepted)**:
  Build not automatically verifiable. Stored for later deployment (after re-verification).

- **400 (Bad Request)**:
  No payload.

- **401 (Unauthorized)**:
  No `AUTHORIZATION` header.

- **403 (Forbidden)**:
  Unable to verify build (e.g. invalid JWT token, or unable to talk to 3rd-party APIs, etc).

- **404 (Not Found)**:
  Tried to change PR visibility but the source directory did not exist.
  (Currently, this can only happen as a rare race condition during build deployment.)

- **405 (Method Not Allowed)**:
  Request method other than POST.

- **409 (Conflict)**:
  Request to overwrite existing directory (e.g. deploy existing build or change PR visibility when
  the destination directory does already exist).

- **413 (Payload Too Large)**:
  Payload larger than size specified in `AIO_UPLOAD_MAX_SIZE`.


## `https://*.ngbuilds.io/*`

- **404 (Not Found)**:
  Request not matched by the above rules.

- **500 (Internal Server Error)**:
  Error while processing a request matched by the above rules.
