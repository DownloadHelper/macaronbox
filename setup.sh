#!/bin/bash

echo "Creating technical user $(blue macaronbox)"
sudo adduser -d macaronbox
sudo usermod -s /sbin/nologin macaronbox
echo "$(check_mark) $(blue macaronbox) user created"

echo "npm install for front part"
npm install ./macaronbox-client
npm run build:prod ./macaronbox-client
echo "$(check_mark) npm install for front part finished"

echo "npm install for server part"
npm install ./server
echo "$(check_mark) npm install for server part finished"

echo "Create default config..."
npm cp ./server/config.template.js ./server/config.js
echo "$(check_mark) $(blue server/config.js) default config created"

echo "Change owner of macaronbox folder..."
sudo chown -R macaronbox:macaronbox ../macaronbox
echo "$(check_mark) $(blue macaronbox) folder is now owned by $(blue macaronbox) user"