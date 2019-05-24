FROM circleci/node:10.9.0-browsers

USER root

###
# Bazel install
# See https://bazel.build/versions/master/docs/install-ubuntu.html#using-bazel-custom-apt-repository-recommended
# Note, only the latest release is available, see https://github.com/bazelbuild/bazel/issues/4947
RUN BAZEL_VERSION="0.18.0" \
 && wget -q -O - https://bazel.build/bazel-release.pub.gpg | apt-key add - \
 && echo "deb [arch=amd64] http://storage.googleapis.com/bazel-apt stable jdk1.8" > /etc/apt/sources.list.d/bazel.list \
 && apt-get update \
 && apt-get install -y bazel=$BAZEL_VERSION \
 && rm -rf /var/lib/apt/lists/*

###
# Brotli compression
# Not available on backports so we have to pull from Debian 9
# See https://packages.debian.org/search?keywords=brotli
RUN echo "deb http://deb.debian.org/debian stretch main contrib" > /etc/apt/sources.list.d/stretch.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends brotli/stretch

###
# Buildifier
# TODO(alexeagle): remove this when all users use their locally built buildifier
# BUILD file formatter
# 'bazel clean --expunge' conserves size of the image
RUN git clone https://github.com/bazelbuild/buildtools.git \
 && (cd buildtools \
  && bazel build //buildifier \
  && cp bazel-bin/buildifier/linux_amd64_stripped/buildifier /usr/local/bin/ \
  && bazel clean --expunge \
  ) && rm -rf buildtools

###
# Skylint
# TODO(alexeagle): remove this when all users use their locally built skylint
# .bzl file linter
# Follows readme at https://github.com/bazelbuild/bazel/blob/master/site/docs/skylark/skylint.md#building-the-linter
# 'bazel clean --expunge' conserves size of the image
RUN git clone https://github.com/bazelbuild/bazel.git \
 && (cd bazel \
  && bazel build //src/tools/skylark/java/com/google/devtools/skylark/skylint:Skylint_deploy.jar \
  && cp bazel-bin/src/tools/skylark/java/com/google/devtools/skylark/skylint/Skylint_deploy.jar /usr/local/bin \
  && bazel clean --expunge \
  ) && rm -rf bazel

USER circleci

###
# Fix up npm global installation
# See https://docs.npmjs.com/getting-started/fixing-npm-permissions
RUN mkdir ~/.npm-global \
 && npm config set prefix '~/.npm-global' \
 && echo "export PATH=~/.npm-global/bin:$PATH" >> ~/.profile

###
# This version of ChromeDriver works with the Chrome version included
# in the circleci/*-browsers base image above.
# This variable is intended to be used by passing it as an argument to
# "postinstall": "webdriver-manager update ..."
ENV CHROMEDRIVER_VERSION_ARG "--versions.chrome 2.41"

WORKDIR /home/circleci
ENTRYPOINT ["/bin/bash", "--login"]
