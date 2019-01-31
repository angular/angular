#!/bin/sh

set -u -e

# Setup and start Sauce Connect for your CircleCI build
# This script requires your CircleCI environment to include the following env variables:
# SAUCE_USERNAME
# SAUCE_ACCESS_KEY
# SAUCE_CONNECT_READY_FILE

CONNECT_URL="https://saucelabs.com/downloads/sc-${SAUCE_CONNECT_VERSION}-linux.tar.gz"
CONNECT_DIR="/tmp/sauce-connect"
CONNECT_DOWNLOAD="sc-latest-linux.tar.gz"

# We don't want to create a log file because sauceconnect always logs in verbose mode
CONNECT_LOG="/dev/null"

# Even though the stdout of sauceconnect is not very verbose, we don't want to log this
CONNECT_STDOUT="/dev/null"

# Get Sauce Connect and start it
mkdir -p $CONNECT_DIR
cd $CONNECT_DIR
curl $CONNECT_URL -o $CONNECT_DOWNLOAD 2> /dev/null 1> /dev/null
mkdir sauce-connect
tar --extract --file=$CONNECT_DOWNLOAD --strip-components=1 --directory=sauce-connect > /dev/null
rm $CONNECT_DOWNLOAD

mkdir -p $(dirname ${SAUCE_CONNECT_READY_FILE})

echo "Starting Sauce Connect"
./sauce-connect/bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY --readyfile $SAUCE_CONNECT_READY_FILE