#!/bin/sh

set -xe
npm install --save js-dos@latest
rm -rfv tasks/js-dos/*
mkdir tasks/js-dos
cp -v node_modules/js-dos/dist/* tasks/js-dos