# sedi makes sed work on both OSX & Linux
# See https://stackoverflow.com/questions/2320564/i-need-my-sed-i-command-for-in-place-editing-to-work-with-both-gnu-sed-and-bsd
sedi () {
    sed --version >/dev/null 2>&1 && sed -i -- "$@" || sed -i "" "$@"
}

sedi "s#packages-dist:#file://$PWD/../../dist/packages-dist/#" src/package.json
