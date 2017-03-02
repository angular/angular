#!/usr/bin/env bash

# If the previous commands in the `script` section of .travis.yaml failed, then abort.
# The variable is not set in early stages of the build, so we default to 0 there.
# https://docs.travis-ci.com/user/environment-variables/
if [[ ${TRAVIS_TEST_RESULT=0} == 1 ]]; then
  exit 1;
fi


# set wasBashSetXOn using the current "set -x" mode state, so that we can restore it at the end
[[ "${-//[^x]/}" = "x" ]] && wasBashSetXOn=1 || wasBashSetXOn=0

# this script is extra noisy and used in many places during the build so we suppress the trace with +x to reduce the noise
set +x -u -e -o pipefail

# sets and optionally prints environmental variable
# usage: setEnvVar variableName variableValue
function  setEnvVar() {
  local name=$1
  local value=$2

  if [[ ${print} == "print" ]]; then
    echo ${name}=${value}
  fi
  export ${name}=${value}
}


# strip leading "./"
currentFileName=${0#./}
currentWorkingDirectory=`pwd`
#cd ${currentWorkingDirectory%currentFileName}
readonly print=${1:-}
# TODO(i): this won't work locally
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/_travis_fold.sh


#######################
#    CUSTOM GLOBALS   #
#######################

setEnvVar NODE_VERSION 6.9.5
setEnvVar NPM_VERSION 3.10.7 # do not upgrade to >3.10.8 unless https://github.com/npm/npm/issues/14042 is resolved
setEnvVar YARN_VERSION 0.21.3
setEnvVar CHROMIUM_VERSION 433059 # Chrome 53 linux stable, see https://www.chromium.org/developers/calendar
setEnvVar SAUCE_CONNECT_VERSION 4.3.11
# TODO(i): this won't work locally
setEnvVar PROJECT_ROOT ${TRAVIS_BUILD_DIR} # all source includes above for helper files in this env.sh script (e.g. _travis_fold.sh) duplicate this setting, update those if you change it here

if [[ ${TRAVIS:-} ]]; then
  case ${CI_MODE} in
    js)
      setEnvVar KARMA_JS_BROWSERS ChromeNoSandbox
      ;;
    saucelabs_required)
      setEnvVar KARMA_JS_BROWSERS `node -e "console.log(require('/home/travis/build/angular/angular/browser-providers.conf').sauceAliases.CI_REQUIRED.join(','))"`
      ;;
    browserstack_required)
      setEnvVar KARMA_JS_BROWSERS `node -e "console.log(require('/home/travis/build/angular/angular/browser-providers.conf').browserstackAliases.CI_REQUIRED.join(','))"`
      ;;
    saucelabs_optional)
      setEnvVar KARMA_JS_BROWSERS `node -e "console.log(require('/home/travis/build/angular/angular/browser-providers.conf').sauceAliases.CI_OPTIONAL.join(','))"`
      ;;
    browserstack_optional)
      setEnvVar KARMA_JS_BROWSERS `node -e "console.log(require('/home/travis/build/angular/angular/browser-providers.conf').browserstackAliases.CI_OPTIONAL.join(','))"`
      ;;
  esac
else
  setEnvVar KARMA_JS_BROWSERS Chrome
fi


if [[ ${TRAVIS:-} ]]; then
  # used by xvfb that is used by Chromium
  setEnvVar DISPLAY :99.0

  # Use newer version of GCC to that is required to compile native npm modules for Node v4+ on Ubuntu Precise
  # more info: https://docs.travis-ci.com/user/languages/javascript-with-nodejs#Node.js-v4-(or-io.js-v3)-compiler-requirements
  setEnvVar CXX g++-4.8

  # Used by karma and karma-chrome-launcher
  # In order to have a meaningful SauceLabs badge on the repo page,
  # the angular2-ci account is used only when pushing commits to master;
  # in all other cases, the regular angular-ci account is used.
  if [ "${TRAVIS_PULL_REQUEST}" = "false" ] && [ "${TRAVIS_BRANCH}" = "master" ]; then
    setEnvVar SAUCE_USERNAME angular2-ci
    # don't print the key
    export SAUCE_ACCESS_KEY=693ebc16208a-0b5b-1614-8d66-a2662f4e
  else
    setEnvVar SAUCE_USERNAME angular-ci
    # don't print the key
    export SAUCE_ACCESS_KEY=9b988f434ff8-fbca-8aa4-4ae3-35442987
  fi

  setEnvVar BROWSER_STACK_USERNAME angularteam1
  export BROWSER_STACK_ACCESS_KEY=BWCd4SynLzdDcv8xtzsB
  setEnvVar CHROME_BIN ${HOME}/.chrome/chromium/chrome-linux/chrome
  setEnvVar BROWSER_PROVIDER_READY_FILE /tmp/angular-build/browser-provider-tunnel-init.lock
fi



#######################
# PREEXISTING GLOBALS #
#######################

# Prepend `~/.yarn/bin` to the PATH
setEnvVar PATH $HOME/.yarn/bin:$PATH

# Append dist/all to the NODE_PATH so that cjs module resolver finds find the packages that use
# absolute module ids (e.g. @angular/core)
setEnvVar NODE_PATH ${NODE_PATH:-}:${PROJECT_ROOT}/dist/all:${PROJECT_ROOT}/dist/tools
setEnvVar LOGS_DIR /tmp/angular-build/logs

# strip leading "/home/travis/build/angular/angular/" or "./" path. Could this be done in one shot?
CURRENT_SHELL_SOURCE_FILE=${BASH_SOURCE#${PROJECT_ROOT}/}
export CURRENT_SHELL_SOURCE_FILE=${CURRENT_SHELL_SOURCE_FILE#./}
# Prefix xtrace output with file name/line and optionally function name
# http://wiki.bash-hackers.org/scripting/debuggingtips#making_xtrace_more_useful
# TODO(i): I couldn't figure out how to set this via `setEnvVar` so I just set it manually
export PS4='+(${CURRENT_SHELL_SOURCE_FILE}:${LINENO}): ${FUNCNAME[0]:+${FUNCNAME[0]}(): }'
if [[ ${print} == "print" ]]; then
  echo PS4=${PS4}
fi

# restore set -x mode
if [[ wasBashSetXOn == 1 ]]; then
  set -x
fi
