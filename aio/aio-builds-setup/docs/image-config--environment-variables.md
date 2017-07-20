# Image config - Environment variables


Below is a list of environment variables that can be configured when creating the docker image (as
described [here](vm-setup--create-docker-image.md)). An up-to-date list of the configurable
environment variables and their default values can be found in the
[Dockerfile](../dockerbuild/Dockerfile).

**Note:**
Each variable has a `TEST_` prefixed counterpart, which is used for testing purposes. In most cases
you don't need to specify values for those.

- `AIO_BUILDS_DIR`:
  The directory (inside the container) where the uploaded build artifacts are kept.

- `AIO_DOMAIN_NAME`:
  The domain name of the server.

- `AIO_GITHUB_ORGANIZATION`:
  The GitHub organization whose teams arew whitelisted for accepting uploads.
  See also `AIO_GITHUB_TEAM_SLUGS`.

- `AIO_GITHUB_TEAM_SLUGS`:
  A comma-separated list of teams, whose authors are allowed to upload PRs.
  See also `AIO_GITHUB_ORGANIZATION`.

- `AIO_NGINX_HOSTNAME`:
  The internal hostname for accessing the nginx server. This is mostly used for performing a
  periodic health-check.

- `AIO_NGINX_PORT_HTTP`:
  The port number on which nginx listens for HTTP connections. This should be mapped to the
  corresponding port on the host VM (as described [here](vm-setup--start-docker-container.md)).

- `AIO_NGINX_PORT_HTTPS`:
  The port number on which nginx listens for HTTPS connections. This should be mapped to the
  corresponding port on the host VM (as described [here](vm-setup--start-docker-container.md)).

- `AIO_REPO_SLUG`:
  The repository slug (in the form `<user>/<repo>`) for which PRs will be uploaded.

- `AIO_UPLOAD_HOSTNAME`:
  The internal hostname for accessing the Node.js upload-server. This is used by nginx for
  delegating upload requests and also for performing a periodic health-check.

- `AIO_UPLOAD_MAX_SIZE`:
  The maximum allowed size for the uploaded gzip archive containing the build artifacts. Files
  larger than this will be rejected.

- `AIO_UPLOAD_PORT`:
  The port number on which the Node.js upload-server listens for HTTP connections. This is used by
  nginx for delegating upload requests and also for performing a periodic health-check.
