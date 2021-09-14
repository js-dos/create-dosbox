#!/bin/sh

npm install --save js-dos@latest
rm -v tasks/js-dos/*
cp -v node_modules/js-dos/dist/* tasks/js-dos