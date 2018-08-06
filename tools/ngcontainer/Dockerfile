FROM circleci/node:8.9.2-browsers

USER root

###
# Java install
# See https://github.com/docker-library/openjdk/blob/415b0cc42d91ef5d70597d8a24d942967728242b/8-jdk/Dockerfile
# see https://bugs.debian.org/775775
# and https://github.com/docker-library/java/issues/19#issuecomment-70546872
RUN JAVA_DEBIAN_VERSION="8u131-b11-1~bpo8+1" \
 && CA_CERTIFICATES_JAVA_VERSION="20161107~bpo8+1" \
 && echo 'deb http://deb.debian.org/debian jessie-backports main' > /etc/apt/sources.list.d/jessie-backports.list \
 && apt-get update \
 && apt-get install -y \
    openjdk-8-jre-headless="$JAVA_DEBIAN_VERSION" \
    ca-certificates-java="$CA_CERTIFICATES_JAVA_VERSION" \
 && rm -rf /var/lib/apt/lists/*

###
# Bazel install
# See https://bazel.build/versions/master/docs/install-ubuntu.html#using-bazel-custom-apt-repository-recommended
RUN BAZEL_VERSION="0.16.0" \
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
ENV CHROMEDRIVER_VERSION_ARG "--versions.chrome 2.33"

WORKDIR /home/circleci
ENTRYPOINT ["/bin/bash", "--login"]
