#!/bin/bash
if [ $EUID != 0 ]; then
    sudo "$0" "$@"
    exit $?
fi

while true ; do
  echo $(date) scan
  /System/Library/PrivateFrameworks/Apple80211.framework/Versions/A/Resources/airport -s >> ap.txt
  sleep 2
done
