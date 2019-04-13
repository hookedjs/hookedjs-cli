#!/usr/bin/env node
// TODO: Call solidarity and/or verify node version on install

const meow = require('meow');
// const fs = require('fs-extra');
// const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const prompt = require('prompt');
const ChangeCase = require('change-case');
const colors = require("colors/safe");


console.log("\n\n***********************************************************************\n");
console.log(colors.rainbow("HookedJS"));
const currentdate = new Date();
console.log("Current Time: " + currentdate.getFullYear() + "." + (currentdate.getMonth() + 1) + "." + currentdate.getDate() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds());
console.log("\n***********************************************************************\n");

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
    --rainbow, -r  Include a rainbow
    --init, -i  Create a new HookedJS project
    --dev, -d  Init HookedJS Contributor Environment
    --watch, -w  Run project in and refresh when files change

  Examples
    $ hookedjs --init
    🌈 unicorns 🌈
    $ hookedjs
    ...

`, {
    flags: {
        init: {
            type: 'boolean',
            alias: 'i'
        },
        project: { // for init
            type: 'string',
            alias: 'p'
        },
        dev: {
            type: 'boolean',
            alias: 'd'
        }
    }
});


/**
 * Consume config and output directories
 */
async function Init(name) {
    const slug = ChangeCase.snakeCase((name));
    console.log(`\nCreating project ${name} in folder ${slug}`);

    if (shell.test('-d', slug) || shell.test('-e', slug)) {
        console.log(colors.red("Error: Destination folder exists"));
        end();
    }

    const tmp = shell.tempdir();
    await shell.exec(`rm -rf /tmp/hookedjs; git clone https://github.com/hookedjs/hookedjs.git ${tmp}/hookedjs`);
    await shell.cp('-r', `${tmp}/hookedjs/boilerplate`, slug,);
    await shell.exec(`cd ${slug}; yarn`);

    console.log(colors.rainbow("\nCongratulations!"));
    console.log(`New Project created in ${slug}. To get start, \`cd ${slug}; yarn watch\``);

    end();
}
function InitWithPrompt() {
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
            Init(name);
        }
    );
}

if (cli.flags['init']) {
    if (cli.flags['project']) Init(cli.flags['project']);
    else InitWithPrompt();
}

// TODO: Verify project is sane
// if (fs.existsSync(cli.flags['config']))
//   var configPath = cli.flags['config'];
// else {
//   console.log("\nConfig file not found at:");
//   console.log(" > " + cli.flags['config']);
//   console.log("Using demo config at:");
//   console.log(" > " + demoConfig + "\n");
//   var configPath = demoConfig;
// }


/**
 * Main
 */

async function end() {
    console.log("\nSTATS")
    console.log("Duration: " + scriptDuration + "s");
    console.log("\n🌈 Done! 🌈\n");
    process.exit(); // The timers will keep the process from exiting, so force exit.
};


async function dev() {
    console.log("\nRunning in Dev Mode.");
    shell.exec("yarn dev", {cwd: __dirname});
    end();
}

if (cli.flags['dev']) {
    dev();
}

// setTimeout(() => {
//   console.log("\nTimeout Reached: Exiting\n");
//   process.exit(1);
// }, 80 * 1000);

