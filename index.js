#!/usr/bin/env node
import { execSync, exec } from "child_process";
import fs from "fs";
import stripJsonComments from "strip-json-comments";
import { Command } from "commander";

var isWin = process.platform === "win32";

String.prototype.decapitalize = function () {
  return this.charAt(0).toLowerCase() + this.slice(1);
};

function error(error, stdout, stderr) {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  } else if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  } else if (stdout) {
    console.log(`stdout: ${stdout}`);
    return;
  }
}

function wt(options) {
  let cmd = '"wt.exe" ';
  if (options.preview) {
    // Use Windows Terminal Preview's wt.exe for launch
    let userProfile = execSync(`cmd.exe /c "echo %UserProfile%"`);
    userProfile = userProfile.toString().trim().decapitalize();
    cmd = `\"${userProfile}\\AppData\\Local\\Microsoft\\WindowsApps\\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\\wt.exe\" -w 0 `; // Focus on existing window with -w 0
  }
  return cmd;
}

function wtArguments(options) {
  let wtArgs = [];
  if (options.title) wtArgs.push(`--title "${options.title}"`);
  if (options.profile)
    wtArgs.push(`-p "${getProfileByOption(options.profile).name}"`);
  if (options.dir) wtArgs.push(`-d ${options.dir}`);
  if (options.color) wtArgs.push(`--tabColor "${options.color}"`);
  if (options.d) wtArgs.push(`-d "${options.d}"`);
  return wtArgs.join(" ");
}

function execute(command, options) {
  let fullCommand;
  if (options.profile === "cmd") {
    // Trick to continue using the terminal in Command Prompt
    // 'cmd /k' - prevents autoclosing after running command
    // 'ECHO=commmand|cmd' - echoes the command and executes it in the terminal,
    //    right after executing/echoeing it runs cmd
    // '&& cmd>nul' prevents output of last executed cmd command
    //    on windows an empty line is supressed and on unix the default cmd greeting
    command = `cmd /k "ECHO=${command}|cmd  && ${
      options.q ? "cls" : "cmd>nul"
    }"`;
  }
  if (options.profile === "powershell") {
    // The same trick is used for Powershell
    // Where Write-Output === echo, -noexit === cmd /k, | out-null === >nul
    command = `powershell -noexit "Write-Output ${command}|powershell -noexit\\;${
      options.q ? "clear" : "powershell | out-null"
    } "`;
  }
  if (options.profile === "wsl") {
    command = `bash -c "echo ${command} && ${command}\\;${
      options.q ? "clear\\;" : ""
    } exec bash 2>&1"`;
  }
  if (isWin) {
    fullCommand = `${wt(options)} ${wtArguments(options)} ${command}`;
  } else {
    fullCommand = `cmd.exe /c ${wt(options)} ${wtArguments(
      options
    )} ${command}`; // Launch from unix
  }
  if (options.debug) console.debug("DEBUG: Executing command:\n", fullCommand);
  exec(fullCommand, error);
}

function wtSettings() {
  let wtSettingsObject, wtSettingsFullPath;
  let wtSettingsPath =
    "/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json";
  let localAppData = execSync(`cmd.exe /c "echo %LocalAppData%"`);
  localAppData = localAppData.toString().trim().decapitalize();
  if (isWin) {
    wtSettingsFullPath = localAppData + wtSettingsPath;
  } else {
    localAppData = localAppData.replace(/\\/g, "/").replace(/:/g, ""); // Convert path to unix
    wtSettingsFullPath = "/mnt/" + localAppData + wtSettingsPath;
  }

  try {
    wtSettingsObject = JSON.parse(
      stripJsonComments(fs.readFileSync(wtSettingsFullPath, "utf8"))
    );
  } catch (err) {
    throw Error("Could not read Windows Terminal settings.json", err);
  }

  return wtSettingsObject;
}

function getProfileCommand(profile) {
  if (profile.commandline) {
    return profile.commandline.split(".").shift().decapitalize();
  } else {
    return profile.source.split(".").pop().decapitalize();
  }
}

function availableProfiles() {
  return settings.profiles.list.map(
    (p) => `${p.name} (${getProfileCommand(p)})`
  );
}

function getProfileByOption(profileCommand) {
  return settings.profiles.list.find(
    (p) => getProfileCommand(p) === profileCommand
  );
}

function getDefaultProfile() {
  return settings.profiles.list.find((p) => p.guid === settings.defaultProfile);
}

const settings = wtSettings();

const program = new Command();
program
  .description(
    "Opens a new terminal tab or window on Windows Terminal, from WSL or Windows."
  )
  .arguments("[cmd...]")
  .option(
    "-w, --window",
    "Open new tab in new terminal window (default for current version of Windows Terminal)"
  )
  .option("-s, --settings <settings>", "Assign a settings set (profile).")
  .option("-t, --title <title>", "Specify title for new tab.")
  .option("-q", "Clear the new tab's screen.")
  .option(
    "-d <dir>",
    "Specify working directory; -d '' disables inheriting the current dir.",
    process.cwd()
  )
  // Windows Terminal specific options
  .option(
    "--preview",
    "Use the preview version of Windows Terminal (allows using a existing terminal since v1.7.572.0)"
  )
  .option(
    "-p, --profile [terminal]",
    `Choose a profile to launch 
                           Available profiles:
                            - ${availableProfiles().join(
                              "\n                            - "
                            )}`
  )
  .option("--color <#hexcode>", "set color of tab")
  // First versions specific
  .option("--debug", "Enable debugging, outputs the command executed")
  .action((cmd, options, command) => {
    console.log(cmd);
    if (options.profile && typeof options.profile !== "string") {
      console.log(`Available profiles:
      - ${availableProfiles().join("\n      - ")}`);
    } else if (process.argv.slice(2).length) {
      if (!options.profile)
        options.profile = getProfileCommand(getDefaultProfile());
      execute(cmd, options);
    } else {
      program.help();
    }
  });

program.parse(process.argv);
