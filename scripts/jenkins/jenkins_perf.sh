set -e

export NVM_DIR="/Users/Shared/jenkins/nvm"
. "$NVM_DIR/nvm.sh"  # This loads nvm
export ANDROID_SDK="/Users/Shared/jenkins/android-sdk"
export PATH+=":$ANDROID_SDK/tools:$ANDROID_SDK/platform-tools"
export PATH+=":/usr/local/git/bin"

export DART_CHANNEL=dev
export ARCH=macos-ia32
# TODO export PERF_BROWSERS=ChromeAndroid,SafariIos
export PERF_BROWSERS=SafariIos
export CLOUD_SECRET_PATH="/Users/Shared/jenkins/keys/perf-cloud-secret"
export GIT_SHA=$(git rev-parse HEAD)

# This is fixed as Jenkins is running on the host
# that also hosts the wifi
export CIHOSTADDRESS=192.168.2.1

nvm use 0.10

# TODO ./scripts/ci/init_android.sh
./scripts/ci/install_dart.sh ${DART_CHANNEL} ${ARCH}
./scripts/ci/install_ios_driver.sh
# use newest npm because of errors during npm install like
# npm ERR! EEXIST, open '/Users/Shared/Jenkins/.npm/e4d0eb16-adable-stream-1-1-13-package-tgz.lock'
npm install -g npm@2.6
npm install
./scripts/ci/build_js.sh
# TODO ./scripts/ci/build_dart.sh
./scripts/ci/test_perf.sh
