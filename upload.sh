#!/bin/sh -e

#/dev/tty.wchusbserial14110
#/dev/tty.usbserial
#일부 위모스 칩에서 발생하는 커넥션 관련에러는 --connection-delay 옵션으로 딜래이를 주면 에러가 발생하지않는다.

npx nodemcu-tool   --connection-delay 500 -p $1 upload ./core/boot.lua ./core/init.lua ./core/config.json 