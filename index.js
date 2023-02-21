#!/usr/bin/env node
import { Command } from "commander";
import { execute } from "./execution.js"
import { processCommands, splitCommands, isMultiCommand } from "./commands.js"
import { wtSettings, getProfileCommand } from "./windowsTerminal.js"

String.prototype.decapitalize = function () {
  return this.charAt(0).toLowerCase() + this.slice(1);
};

function availableProfiles() {
  return settings.profiles.list.map((p) => `${p.name} (${getProfileCommand(p)})`);
}

function getProfileByOption(profile) {
  return settings.profiles.list.find((p) => p.name === profile || getProfileCommand(p) === profile);
}

function getDefaultProfile() {
  return settings.profiles.list.find((p) => p.guid === settings.defaultProfile);
}

const settings = wtSettings();

const program = new Command();
program
  .description("Opens a new terminal tab or window on Windows Terminal, from WSL or Windows.")
  .arguments("[cmd...]")
  .option("-w, --window <window-id>", "Target new tab in new terminal window, use 0 for same window", -1)
  .option("-s, --settings <settings>", "Assign a settings set (profile).")
  .option("-t, --title <title>", "Specify title for new tab.")
  .option("-q [before]", "Clear the new tab's screen. default (after)")
  .option("-d <dir>", "Specify working directory; -d '' disables inheriting the current dir.", process.cwd())
  // Windows Terminal specific options
  .option("--preview", "Target the preview version of Windows Terminal")
  .option(
    "-p, --profile [terminal]",
    `Choose a profile to launch 
                           Available profiles:
                            - ${availableProfiles().join("\n                            - ")}`
  )
  .option("--color <hexcode>", "set color of tab (use \# for hex or between '')")
  // Debug executed wt command for issues
  .option("--debug", "Enable debugging, outputs the wt command executed")
  .allowUnknownOption('--%')
  .action((cmd, options, command) => {
    // Check for the presence of a profile and display available profiles if necessary.
    if (options.profile && typeof options.profile !== "string") {
      console.log(`Available profiles1:\n  - ${availableProfiles().join("\n  - ")}`);
    }
    // Otherwise, process the provided command(s) and options.
    else if (process.argv.slice(2).length) {
      // If a profile is specified, retrieve its name and command.
      if (options.profile) options.profile = getProfileByOption(options.profile);
      // If no profile is specified, use the default profile.
      if (!options.profile) options.profile = getDefaultProfile();
      // Determine the terminal executable to use based on the selected profile.
      options.terminal = getProfileCommand(options.profile);
      // Join the command arguments into a single string if necessary.
      if (Array.isArray(cmd)) {
        cmd = cmd.join(" ");
      }
      // If the command is a multi-command, split it into individual commands and process each one.
      if (isMultiCommand(cmd)) {
        const commands = splitCommands(cmd);
        const processedCommands = processCommands(commands, options);
        execute(processedCommands, options);
      }
      // Otherwise, process the command as a single command.
      else {
        execute(processCommands([cmd], options), options);
      }
    }
    // If no arguments were provided, display the program's help message.
    else {
      program.help();
    }
  });


program.parse(process.argv);
