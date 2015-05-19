VERSION="1.17"
ADD_ON_SDK_DOWNLOAD="https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/addon-sdk-$VERSION.tar.gz"
ADD_ON_SDK_TAR="./addon-sdk-$VERSION.tar.gz"
ADD_ON_SDK_FOLDER="./addon-sdk-$VERSION"

if [[ ! -d "$ADD_ON_SDK_FOLDER" ]]; then
  echo "Downloading Add-on SDK"
  curl -s -o "$ADD_ON_SDK_TAR" "$ADD_ON_SDK_DOWNLOAD"
  tar -xf "$ADD_ON_SDK_TAR"
fi

cd "$ADD_ON_SDK_FOLDER"
source bin/activate

cd -
cfx xpi
