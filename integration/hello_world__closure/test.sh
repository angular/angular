set -xe

./node_modules/.bin/ngc
./bundle.sh

yarn run serve&
serve_PID=$!

yarn run protractor

kill serve_PID > /dev/null 2>&1