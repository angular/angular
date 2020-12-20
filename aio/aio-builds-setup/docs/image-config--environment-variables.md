# Image config - Environment variables


Below is a list of environment variables that can be configured when creating the docker image (as
described [here](vm-setup--create-docker-image.md)). An up-to-date list of the configurable
environment variables and their default values can be found in the
[Dockerfile](../dockerbuild/Dockerfile).

**Note:**
Each variable has a `TEST_` prefixed counterpart, which is used for testing purposes. In most cases
you don't need to specify values for those.

- `AIO_ARTIFACT_PATH`:
  The path used to identify the AIO build artifact on the CircleCI servers. This should be equal to
  the path given in the `.circleci/config.yml` file for the
  `aio_preview->steps->store_artifacts->destination` key.

- `AIO_BUILDS_DIR`:
  The directory (inside the container) where the hosted build artifacts are kept.

- `AIO_DOMAIN_NAME`:
  The domain name of the server.

- `AIO_GITHUB_ORGANIZATION`:
  The GitHub organization whose teams are trusted for accepting build artifacts.
  See also `AIO_GITHUB_TEAM_SLUGS`.

- `AIO_GITHUB_REPO`:
  The Github repository for which PRs will be hosted.

- `AIO_GITHUB_TEAM_SLUGS`:
  A comma-separated list of teams, whose authors are allowed to preview PRs.
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

- `AIO_SIGNIFICANT_FILES_PATTERN`:
  The RegExp that determines whether a changed file indicates that a new preview needs to
  be deployed. For example, if there is a changed file in the `/packages` directory then
  some of the API docs might have changed, so we need to create a new preview.

- `AIO_TRUSTED_PR_LABEL`:
  The PR whose presence indicates the PR has been manually verified and is allowed to have its
  build artifacts publicly served. This is useful for enabling previews for any PR (not only those
  from trusted authors).

- `AIO_PREVIEW_SERVER_HOSTNAME`:
  The internal hostname for accessing the Node.js preview-server. This is used by nginx for
  delegating web-hook requests and also for performing a periodic health-check.

- `AIO_ARTIFACT_MAX_SIZE`:
  The maximum allowed size for the gzip archive containing the build artifacts.
  Files larger than this will be rejected.

- `AIO_PREVIEW_SERVER_PORT`:
  The port number on which the Node.js preview-server listens for HTTP connections. This is used by
  nginx for delegating web-hook requests and also for performing a periodic health-check.
