#!/usr/bin/env node
// TODO: Call solidarity and/or verify node version on install

const meow = require('meow');
// const fs = require('fs-extra');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
// import * as shell from "shelljs";
const prompt = require('prompt');
const ChangeCase = require('change-case');
const colors = require("colors/safe");

/**
 * Timer
 */
let scriptDuration = 0;
setInterval(() => {
    scriptDuration++;
}, 1000);


/**
 * CLI Handling
 */

const cli = meow(`
  Usage
    $ hookedjs [options]

  Options
    --help, -h  Show usage
    --rainbow, -r  Include a rainbow
    --create, -c  Create a new HookedJS project
    --create-dev, -d  Init HookedJS Contributor Environment
    --watch, -w  Run project in and refresh when files change

  Examples
    $ hookedjs --init
    🌈 unicorns 🌈
    $ hookedjs
    ...

`, {
    flags: {
        help: {
            type: 'boolean',
            alias: 'h'
        },
        version: {
            type: 'boolean',
            alias: 'v'
        },
        create: {
            type: 'boolean',
            alias: 'c'
        },
        project: { // for create
            type: 'string',
            alias: 'p'
        },
        "create-dev": {
            type: 'boolean',
            alias: 'd'
        },
        watch: {
            type: 'boolean',
            alias: 'w'
        }
    }
});


function printHeader() {
    console.log("\n\n***********************************************************************\n");
    console.log(colors.rainbow("HookedJS"));
    const currentdate = new Date();
    console.log("Current Time: " + currentdate.getFullYear() + "." + (currentdate.getMonth() + 1) + "." + currentdate.getDate() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds());
    console.log("\n***********************************************************************\n");
}

async function end() {
    // console.log("\nSTATS")
    // console.log("Duration: " + scriptDuration + "s");
    console.log("\n🌈 Done! 🌈\n");
    process.exit(); // The timers will keep the process from exiting, so force exit.
}

/**
 * Consume config and output directories
 */
async function Create(name) {
    const slug = ChangeCase.snakeCase((name));
    console.log(`\nCreating project ${name} in folder ${slug}`);

    if (shell.test('-d', slug) || shell.test('-e', slug)) {
        console.log(colors.red("Error: Destination folder exists"));
        end();
    }

    await shell.mkdir(slug);
    await shell.cd(slug);
    await shell.exec(`npm init --yes`, {silent:true});
    await shell.exec(`yarn add hookedjs`, {silent:true});
    await shell.exec(`rsync -r node_modules/hookedjs/boilerplate/ .`); // use rsync b/c it will also copy hiddens

    // Reset the package.json meta
    let packageJson = await JSON.parse(fs.readFileSync("./package.json"));
    packageJson.name = ChangeCase.paramCase(name);
    packageJson.author = ChangeCase.paramCase(name);
    packageJson.description = "A project started with HookedJS";
    packageJson.version = "0.0.1";
    fs.writeFileSync("package.json", JSON.stringify(packageJson, ls));

    await shell.exec(`yarn install`, {silent:true});


    console.log(colors.rainbow("\nCongratulations!"));
    console.log(`New Project created in ${slug}. To get start, \`cd ${slug}; yarn dev\``);

    end();
}
function CreateWithPrompt() {
    prompt.start();
    prompt.message = colors.red("Question!");
    prompt.get(
        {
            properties: {
                name: {
                    description: colors.blue("What should we name your project?")
                }
            }
        }, function (err, {name}) {
            Create(name);
        }
    );
}


/**
 * Consume config and output directories
 */
async function CreateDev(name, gitRepo) {
    const slug = ChangeCase.snakeCase((name));
    console.log(`\nCreating project ${name} in folder ${slug}`);

    if (shell.test('-d', slug) || shell.test('-e', slug)) {
        console.log(colors.red("Error: Destination folder exists"));
        end();
    }

    await shell.exec(`git clone ${gitRepo} ${slug}`);
    await shell.cd(slug);
    await shell.exec(`yarn`);
    await shell.exec(`yarn`, {cwd: "boilerplate"});
    await shell.exec(`rm project && ln -s boilerplate project`);
    await shell.exec(`rm -rf hookedjs && ln -s ../../ hookedjs`, {cwd: "boilerplate/node_modules"});

    console.log(colors.rainbow("\nCongratulations!"));
    console.log(`New Project created in ${slug}. To get start, \`cd ${slug}/boilerplate; yarn dev\``);

    end();
}
function CreateDevWithPrompt() {
    prompt.start();
    prompt.message = colors.red("Question!");
    prompt.get(
        {
            properties: {
                name: {
                    description: colors.blue("Install to what folder? (hookedjs_dev)"),
                    required: false,
                    default: "hookedjs_dev",
                },
                gitRepo: {
                    description: colors.blue("Using which git url? (git@github.com:hookedjs/hookedjs.git)"),
                    required: false,
                    default: "git@github.com:hookedjs/hookedjs.git",
                }
            }
        }, function (err, {name, gitRepo}) {
            CreateDev(name, gitRepo);
        }
    );
}

async function dev() {
    console.log("\nRunning in Dev Mode.");
    await shell.exec("yarn dev", {cwd: "node_modules/hookedjs"});
}


if (cli.flags['version']) {
    cli.showVersion();
}
else if (cli.flags['help']) {
    cli.showHelp();
}
else if (cli.flags['create']) {
    printHeader();
    if (cli.flags['project']) Create(cli.flags['project']);
    else CreateWithPrompt();
}
else if (cli.flags['createDev']) {
    printHeader();
    CreateDevWithPrompt();
}
else if (cli.flags['watch']) {
    printHeader();
    dev();
}
else {
    cli.showHelp();
}


// setTimeout(() => {
//   console.log("\nTimeout Reached: Exiting\n");
//   process.exit(1);
// }, 80 * 1000);

