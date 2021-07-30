#!/usr/bin/env node
const fs = require("fs-extra");
const inquirer = require("inquirer");
const { join } = require("path");
const fuzzysort = require("fuzzysort");
const Downloader = require("nodejs-file-downloader");

const root = join(__dirname, "..");
const tasks = join(root, "tasks");
const jsdos = join(tasks, "js-dos");
const indexJson = join(tasks, "index.json");
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
	console.error("Target directory already exists. Exiting...");
	process.exit(-1);
}

const index = JSON.parse(fs.readFileSync(indexJson));

inquirer
	.prompt([{
		type: "input",
		name: "query",
		message: "Enter title of the game to search (e.g. Digger)"
	}])
	.then((answers) => {
		const { query } = answers;
		const results = fuzzysort.go(query || "digger", index, { key: "k" });
		if (results.length === 0) {
			console.log("Not found any game with this title. Exiting...");
			process.exit(-1);
		}
		inquirer.prompt([{
			type: "list",
			name: "game",
			message: "Please select the game from list",
			choices: results.slice(0, 10).map(r => r.target)
		}])
			.then((answers) => {
				const { game } = answers;
				let url = "";
				for (const next of results) {
					if (next.target === game) {
						url = next.obj.v;
						break;
					}
				}

				if (!url) {
					console.error("Unexpected error - bundle url not found");
					process.exit(-2);
				}

				generate(url);
			})
			.catch(console.error)
	})
	.catch(console.error);

async function generate(url) {
	const site = join(target, "_site");
	const siteJsDos = join(site, "js-dos");
	fs.ensureDirSync(site);
	fs.ensureDirSync(jsdos);

	console.log("Downloading bundle");
	const downloader = new Downloader({
		url: url,
		directory: site,
		onProgress: function (percentage, chunk, remainingSize) {
			console.log("Downloading bundle %:", percentage, " remaining bytes:", remainingSize);
		},
		filename: "bundle.jsdos",
	})

	try {
		await downloader.download();
	} catch (error) {
		console.log(error);
		fs.removeSync(target);
		process.exit(-3);
	}

	console.log("Creating web-site", jsdos, siteJsDos);
	fs.copySync(join(tasks, "index.template.html"), join(site, "index.html"));
	fs.copySync(join(tasks, "package.template.json"), join(target, "package.json"));

	console.log("Well done...\n\n");
	console.log("Execute following commands to start local server:");
	console.log("cd", target);
	console.log("npm install");
	console.log("npm run start");
	console.log("--");
	console.log("Then open localhost:8080 in browser");
}