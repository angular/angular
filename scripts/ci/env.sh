#!/usr/bin/env bash

# because this script is being source-ed via .travis.yaml,
# we need to restore the original options so that that we don't interfere with
# travis' internals
readonly ORIGINAL_SHELL_OPTIONS=$(set +o)

# this script is extra noisy and used in many places during the build so we suppress the trace with +x to reduce the noise
set -u -e -o pipefail

# sets and optionally prints environmental variable
# usage: setEnvVar variableName variableValue
function  setEnvVar() {
  local name=$1
  local value=$2

  if [[ ${print} == "print" ]]; then
    echo ${name}=${value}
  fi
  export ${name}="${value}"
}

# use BASH_SOURCE so that we get the right path when this script is called AND source-d
readonly thisDir=$(cd $(dirname ${BASH_SOURCE[0]}); pwd)
readonly print=${1:-}

# print bash version just so that we know what is running all the scripts
if [[ ${print} == "print" ]]; then
  bash --version
fi


#######################
#    CUSTOM GLOBALS   #
#######################

setEnvVar NODE_VERSION 10.9.0
setEnvVar YARN_VERSION 1.9.2
setEnvVar CHROMIUM_VERSION 561733  # Chrome 68 linux stable, see https://www.chromium.org/developers/calendar
setEnvVar CHROMEDRIVER_VERSION_ARG "--versions.chrome 2.41"
setEnvVar SAUCE_CONNECT_VERSION 4.4.9
setEnvVar ANGULAR_CLI_VERSION 1.6.3
setEnvVar CI_AIO_MIN_PWA_SCORE 95
setEnvVar CI_BRANCH $TRAVIS_BRANCH
setEnvVar CI_COMMIT $TRAVIS_COMMIT
setEnvVar CI_COMMIT_RANGE $TRAVIS_COMMIT_RANGE
setEnvVar CI_PULL_REQUEST $TRAVIS_PULL_REQUEST
setEnvVar PROJECT_ROOT $(cd ${thisDir}/../..; pwd)

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
  if [ "${CI_PULL_REQUEST}" = "false" ] && [ "${CI_BRANCH}" = "master" ]; then
    setEnvVar SAUCE_USERNAME angular2-ci
    # Not using use `setEnvVar` so that we don't print the key.
    export SAUCE_ACCESS_KEY=693ebc16208a-0b5b-1614-8d66-a2662f4e
  else
    setEnvVar SAUCE_USERNAME angular-ci
    # Not using use `setEnvVar` so that we don't print the key.
    export SAUCE_ACCESS_KEY=9b988f434ff8-fbca-8aa4-4ae3-35442987
  fi

  setEnvVar BROWSER_STACK_USERNAME angularteam1
  # not using use setEnvVar so that we don't print the key
  export BROWSER_STACK_ACCESS_KEY=CaXMeMHD9pr5PHg8N7Jq
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

eval "${ORIGINAL_SHELL_OPTIONS}"
