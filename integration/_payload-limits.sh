#!/bin/bash

set -u -e -o pipefail

declare -A payloadLimits
payloadLimits["hello_world__closure", "uncompressed", "bundle"]=106000
payloadLimits["hello_world__closure", "gzip7", "bundle"]=35000
payloadLimits["hello_world__closure", "gzip9", "bundle"]=35000

payloadLimits["cli-hello-world", "uncompressed", "inline"]=1500
payloadLimits["cli-hello-world", "uncompressed", "main"]=183000
payloadLimits["cli-hello-world", "uncompressed", "polyfills"]=63000
payloadLimits["cli-hello-world", "gzip7", "inline"]=900
payloadLimits["cli-hello-world", "gzip7", "main"]=48000
payloadLimits["cli-hello-world", "gzip7", "polyfills"]=21000
payloadLimits["cli-hello-world", "gzip9", "inline"]=900
payloadLimits["cli-hello-world", "gzip9", "main"]=48000
payloadLimits["cli-hello-world", "gzip9", "polyfills"]=21000

