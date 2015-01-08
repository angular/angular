#!/bin/bash
set -e

if [[ $PERF_BROWSERS =~ .*Android.* || $E2E_BROWSERS =~ .*Android.* ]]
then
  adb usb
  adb wait-for-device devices
  adb reverse tcp:8001 tcp:8001
  adb reverse tcp:8002 tcp:8002
fi
