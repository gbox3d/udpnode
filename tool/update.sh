#!/bin/sh -e

tar -xvf bundle.tar
(cd bundle/programs/server && npm install)
(cd bundle/programs/server && npm audit fix)
(cd bundle/ && chmod 700 run_deploy.sh)
echo "update done!"
