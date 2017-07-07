#!/bin/bash

set -u -e -o pipefail

declare -A limitUncompressed
limitUncompressed=(["inline"]=1600 ["main"]=600000 ["polyfills"]=35000)
declare -A limitGzip7
limitGzip7=(["inline"]=1000 ["main"]=140000 ["polyfills"]=12500)
declare -A limitGzip9
limitGzip9=(["inline"]=1000 ["main"]=140000 ["polyfills"]=12500)
