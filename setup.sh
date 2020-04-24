#!/bin/bash

echo "Creating technical user macaronbox..."
sudo useradd -r -s /sbin/nologin macaronbox
echo "macaronbox user created"

echo "npm install for front part..."
npm install --prefix ./macaronbox-client
npm run build:prod --prefix ./macaronbox-client
echo "npm install for front part finished"

echo "npm install for server part..."
npm install --prefix ./server
echo "npm install for server part finished"

echo "Create default config..."
cp ./server/config.template.js ./server/config.js
echo "server/config.js default config created"

echo "Change owner of macaronbox folder..."
sudo chown -R macaronbox:macaronbox ../macaronbox
echo "macaronbox folder is now owned by macaronbox user"