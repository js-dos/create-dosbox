#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const fsextra = require('fs-extra');

const target = process.argv[2];

if (!target) {
    console.error("Target directory is not set!");
    console.log("--")
    console.log("Usage:");
    console.log("\tnpx create-dosbox my-app");
    console.log("\tcd my-app");
    console.log("\tnpm install");
    console.log("\tnpm start");
    process.exit(-1);
}

if (fs.existsSync(target)) {
    console.error("Path '" + target + "' already exists, exiting...");
    process.exit(-2);
}

try {
    fs.mkdirSync(target)
} catch (err) {
    if (err.code !== 'EEXIST') throw err
}

const root = path.join(__dirname, "..");
const jsdos = path.join(root, "node_modules", "js-dos");


fsextra.copySync(path.join(jsdos, "docs"), path.join(target, "docs"));
fsextra.copySync(path.join(jsdos, "js-dos.js"), path.join(target, "public", "js-dos.js"));
fsextra.copySync(path.join(jsdos, "js-dos.js.map"), path.join(target, "public", "js-dos.js.map"));
fsextra.copySync(path.join(jsdos, "wdosbox.wasm.js"), path.join(target, "public", "wdosbox.wasm.js"));
fsextra.copySync(path.join(jsdos, "wdosbox.js"), path.join(target, "public", "wdosbox.js"));
fsextra.copySync(path.join(jsdos, "wdosbox.js.symbols"), path.join(target, "public", "wdosbox.js.symbols"));
fsextra.copySync(path.join(jsdos, "test", "digger.zip"), path.join(target, "public", "digger.zip"));
fsextra.copySync(path.join(root, "tasks", "index.template.html"), path.join(target, "public", "index.html"));
fsextra.copySync(path.join(root, "tasks", "package.template.json"), path.join(target, "package.json"));

console.log("Ready. To run in browser:");
console.log("\tcd " + target);
console.log("\tnpm install");
console.log("\tnpm start");
console.log("--");
console.log("\topen 127.0.0.1:8080 in browser")
