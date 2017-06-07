#!/bin/bash

declare -A limitUncompressed
limitUncompressed=(["0"]=16000 ["inline"]=1600 ["main"]=360000 ["polyfills"]=40000 ["vendor"]=520000)
declare -A limitGzip7
limitGzip7=(["0"]=7000 ["inline"]=1000 ["main"]=60000 ["polyfills"]=13000 ["vendor"]=120000)
declare -A limitGzip9
limitGzip9=(["0"]=7000 ["inline"]=1000 ["main"]=60000 ["polyfills"]=13000 ["vendor"]=120000)
