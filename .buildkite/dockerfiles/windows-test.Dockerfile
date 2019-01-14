# Use a cached image base if provided, otherwise use the base environment.
# gcr.io/internal-200822 is the Google Cloud container registry for Angular tooling.
# angular-windows-env is the base Windows environment image.
ARG FROM_IMG=gcr.io/internal-200822/angular-windows-env
FROM $FROM_IMG
WORKDIR /src

# Copy node_modules install files before the other files.
# This allows docker to cache these steps even if source files change.
COPY ./package.json /src/package.json
COPY ./yarn.lock /src/yarn.lock
COPY ./tools/yarn/check-yarn.js /src/tools/yarn/check-yarn.js
COPY ./tools/postinstall-patches.js /src/tools/postinstall-patches.js
RUN yarn install --frozen-lockfile --non-interactive --network-timeout 100000

# Copy remaining files and update to commit.
COPY ./ /src
ARG COMMIT_SHA
RUN git fetch -v origin %COMMIT_SHA%
RUN git checkout -f %COMMIT_SHA%

# Setup.
COPY .circleci/bazel.rc /etc/bazel.bazelrc

# Run tests.
RUN yarn bazel test //tools/ts-api-guardian:all --noshow_progress
