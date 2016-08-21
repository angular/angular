#!/usr/bin/env bash

set -ex -o pipefail

echo 'travis_fold:start:INSTALL'

# Setup environment
cd `dirname $0`
INSTALL_PHASE=1
source ./env.sh
cd ../..

mkdir -p ${LOGS_DIR}


# Install bazel
echo 'travis_fold:start:install.bazel'
(
  set -ex -o pipefail
  CHECKSUM="97dd53414e12da1c9a8a23911ebe732b4b278295ed6b226a5ddee4cd6775a01b  bazel-installer.sh"

  mkdir -p "${HOME}/bazel-cache"
  cd "${HOME}/bazel-cache"

  # Validate cache or download the installer
  if sha256sum -c <(echo "$CHECKSUM"); then
    echo "bazel installer cache looks good!"
  else
    wget https://github.com/bazelbuild/bazel/releases/download/0.3.1/bazel-0.3.1-installer-linux-x86_64.sh -O bazel-installer.sh
    sha256sum -c <(echo "$CHECKSUM")
    chmod +x bazel-installer.sh
  fi
  ./bazel-installer.sh --user
  export PATH="${PATH}:${HOME}/bin"
)
echo 'travis_fold:end:install.bazel'


# Install node
echo 'travis_fold:start:install.node'
# Make nvm less noisy
set +x
echo "nvm install ${NODE_VERSION}"
nvm install ${NODE_VERSION}
echo "nvm alias default ${NODE_VERSION}"
nvm alias default ${NODE_VERSION}
set -x
echo 'travis_fold:end:install.node'


# Install version of npm that we are locked against
echo 'travis_fold:start:install.npm'
npm install -g npm@${NPM_VERSION}
echo 'travis_fold:end:install.npm'


# Install all npm dependencies according to shrinkwrap.json
echo 'travis_fold:start:install.node_modules'
node tools/npm/check-node-modules --purge || npm install
echo 'travis_fold:end:install.node_modules'


# Install Chromium
echo 'travis_fold:start:install.chromium'
if [[ ${CI_MODE} == "js" || ${CI_MODE} == "e2e" ]]; then
  ./scripts/ci/install_chromium.sh
fi
echo 'travis_fold:end:install.chromium'

# Install Sauce Connect
echo 'travis_fold:start:install.sauceConnect'
if [[ ${TRAVIS}] && (${CI_MODE} == "saucelabs_required" || ${CI_MODE} == "saucelabs_optional") ]]; then
  ./scripts/sauce/sauce_connect_setup.sh
fi
echo 'travis_fold:end:install.sauceConnect'


# Install BrowserStack Tunnel
echo 'travis_fold:start:install.browserstack'
if [[ ${TRAVIS} && (${CI_MODE} == "browserstack_required" || ${CI_MODE} == "browserstack_optional") ]]; then
  ./scripts/browserstack/start_tunnel.sh
fi
echo 'travis_fold:end:install.browserstack'


# node tools/chromedriverpatch.js
$(npm bin)/webdriver-manager update

# TODO: install bower packages
# bower install

echo 'travis_fold:end:INSTALL'
