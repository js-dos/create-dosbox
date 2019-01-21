#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const fsextra = require("fs-extra");
const readline = require('readline');
const replace = require('replace-in-file');
const AdmZip = require("adm-zip");

const target = process.argv[2];
const archive = process.argv[3];

if (!target) {
    console.error("Target directory is not set!");
    console.log("--")
    console.log("Usage:");
    console.log("\tnpx create-dosbox my-app [archive.zip]");
    console.log("\tcd my-app");
    console.log("\tnpm install");
    console.log("\tnpm start");
    process.exit(-1);
}

if (fs.existsSync(target)) {
    console.error("Path '" + target + "' already exists, exiting...");
    process.exit(-2);
}

if (archive && !fs.existsSync(archive)) {
    console.error("Archive '" + archive + "' does not exists, exiting...");
    process.exit(-3);
}

try {
    fs.mkdirSync(target)
} catch (err) {
    if (err.code !== 'EEXIST') throw err
}

const root = path.join(__dirname, "..");
const jsdos = path.join(root, "node_modules", "js-dos");
const indexHtml = path.join(target, "public", "index.html")

fsextra.copySync(path.join(jsdos, "docs"), path.join(target, "docs"));
fsextra.copySync(path.join(jsdos, "js-dos.js"), path.join(target, "public", "js-dos.js"));
fsextra.copySync(path.join(jsdos, "js-dos.js.map"), path.join(target, "public", "js-dos.js.map"));
fsextra.copySync(path.join(jsdos, "wdosbox.wasm.js"), path.join(target, "public", "wdosbox.wasm.js"));
fsextra.copySync(path.join(jsdos, "wdosbox.js"), path.join(target, "public", "wdosbox.js"));
fsextra.copySync(path.join(jsdos, "wdosbox.js.symbols"), path.join(target, "public", "wdosbox.js.symbols"));
fsextra.copySync(path.join(root, "tasks", "index.template.html"), indexHtml);
fsextra.copySync(path.join(root, "tasks", "package.template.json"), path.join(target, "package.json"));

const ready = () => {
    console.log("--");
    console.log("Ready. To run in browser:");
    console.log("\tcd " + target);
    console.log("\tnpm install");
    console.log("\tnpm start");
    console.log("--");
    console.log("\topen 127.0.0.1:8080 in browser")
}

if (archive) {
    const basename = path.basename(archive);
    const targetArchive = path.join(target, "public", basename);
    const executables = [];
    fsextra.copySync(archive, targetArchive);

    new AdmZip(targetArchive).getEntries().forEach(function(zipEntry) {
        const entryName = zipEntry.entryName;
        const lowered = entryName.toLowerCase();
        if (lowered.endsWith(".exe") || lowered.endsWith(".com") || lowered.endsWith(".bat")) {
            executables.push(entryName);
        }
    });

    if (executables.length == 0) {
        console.error("Can't find executable in archive " + archive);
        exit(-4);
    }

    const onExecutableSelected = (index) => {
        if (isNaN(index) || index >= executables.length || index < 0) {
            console.error("Executable did not selected, exiting...");
            process.exit(-5);
        }
        console.log("Using '" + executables[index] + "'...");

        replace({
            files: indexHtml,
            from: ["digger.zip", "DIGGER.COM"],
            to: [basename, executables[index].replace(/\//g, "\\\\")]
        }, ready);
    }

    if (executables.length > 1) {
        console.log("Please select executable: ");
        for (let i = 0; i < executables.length; ++i) {
            console.log((i+1) + ". " + executables[i]);
        }

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });

        rl.on('line', function(line){
            rl.close();
            onExecutableSelected(parseInt(line) - 1);
        });
    } else {
        onExecutableSelected(0);
    }
} else {
    fsextra.copySync(path.join(jsdos, "test", "digger.zip"), path.join(target, "public", "digger.zip"));
    ready();
}
