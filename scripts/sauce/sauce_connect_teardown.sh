#!/bin/bash

set -e -o pipefail


echo "Shutting down Sauce Connect tunnel"
killall sc
