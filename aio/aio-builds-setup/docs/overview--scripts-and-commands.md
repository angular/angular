# Overview - Scripts and Commands


This is an overview of the available scripts and commands.


## Scripts
The scripts are located inside `<aio-builds-setup-dir>/scripts/`. The following scripts are
available:

- `create-image.sh`:
  Can be used for creating a preconfigured docker image.
  See [here](vm-setup--create-docker-image.md) for more info.

- `test.sh`:
  Can be used for running the tests for `<aio-builds-setup-dir>/dockerbuild/scripts-js/`. This is
  useful for CI integration. See [here](misc--integrate-with-ci.md) for more info.

- `update-preview-server.sh`:
  Can be used for updating the docker container (and image) based on the latest changes checked out
  from a git repository. See [here](vm-setup--update-docker-container.md) for more info.


## Production Commands
The following commands are available globally from inside the docker container. They are either used
by the container to perform its various operations or can be used ad-hoc, mainly for testing
purposes. Each command is backed by a corresponding script inside
`<aio-builds-setup-dir>/dockerbuild/scripts-sh/`.

- `aio-clean-up`:
  Cleans up the builds directory by removing the artifacts that do not correspond to an open PR.
  _It is run as a daily cronjob._

- `aio-health-check`:
  Runs a basic health-check, verifying that the necessary services are running, the servers are
  responding and there is a working internet connection.
  _It is used periodically by docker for determining the container's health status._

- `aio-init`:
  Initializes the container (mainly by starting the necessary services).
  _It is run (by default) when starting the container._

- `aio-preview-server-prod`:
  Spins up a Node.js preview-server instance.
  _It is used in `aio-init` (see above) during initialization._


## Developer Commands

- `aio-preview-server-test`:
  Spins up a Node.js preview-server instance for tests.
  _It is used in `aio-verify-setup` (see below) for running tests._

- `aio-verify-setup`:
  Runs a suite of e2e-like tests, mainly verifying the correct (inter)operation of nginx and the
  Node.js preview-server.

- `aio-verify-setup-and-log`:
  Runs the `aio-verify-setup` command but also then dumps the logs from the preview server, which
  gives additional useful debugging information. See the [debugging docs](misc--debug-docker-container.md)
  for more info.

- `aio-dev-mode`:
  Links external source files (from the Docker host) to internal source files (in the Docker
  container). This makes it easier to use an IDE to edit files in the host that are then
  tested in the container. See the [debugging docs](misc--debug-docker-container.md) for more info.