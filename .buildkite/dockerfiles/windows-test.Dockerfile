# Use the a previous image as source.
# gcr.io/internal-200822 is the Google Cloud container registry for Angular tooling.
FROM gcr.io/internal-200822/angular-windows:master
WORKDIR /src

# Copy package.json and yarn.lock before the other files.
# This allows docker to cache these steps even if source files change.
COPY ./package.json /src/package.json
COPY ./yarn.lock /src/yarn.lock
RUN yarn install --frozen-lockfile --non-interactive --network-timeout 100000

# Update image git repo.
ARG COMMIT_SHA
RUN git fetch -v origin %COMMIT_SHA%
RUN git checkout -f %COMMIT_SHA%

# Setup.
COPY .circleci/bazel.rc /etc/bazel.bazelrc

# Run tests.
RUN yarn bazel test //tools/ts-api-guardian:all --noshow_progress
