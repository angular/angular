#!/bin/bash

set -u -e -o pipefail

declare -A payloadLimits
payloadLimits["aio", "uncompressed", "inline"]=1600
payloadLimits["aio", "uncompressed", "main"]=487000
payloadLimits["aio", "uncompressed", "polyfills"]=38000
payloadLimits["aio", "gzip7", "inline"]=1000
payloadLimits["aio", "gzip7", "main"]=120000
payloadLimits["aio", "gzip7", "polyfills"]=11900
payloadLimits["aio", "gzip9", "inline"]=1000
payloadLimits["aio", "gzip9", "main"]=120000
payloadLimits["aio", "gzip9", "polyfills"]=11900
