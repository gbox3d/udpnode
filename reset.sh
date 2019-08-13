#!/bin/sh -e

npx nodemcu-tool --connection-delay 500 -p $1 remove init.lua