#!/bin/sh -e

MONGO_URL=mongodb://localhost:27017/udpnode ROOT_URL=http://127.0.0.1 MAIL_URL=NULL PORT=3000 node /home/pi/work/udpnode/bundle/main.js &

