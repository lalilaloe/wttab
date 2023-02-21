import { execSync } from "child_process";
import fs from "fs";
import stripJsonComments from "strip-json-comments";
import { isWin } from "./filesystem.js"

export function wtSettings() {
    let wtSettingsObject, wtSettingsFullPath;
    let wtSettingsPath = "/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json";
    let localAppData = execSync(`cmd.exe /c "echo %LocalAppData%"`);
    localAppData = localAppData.toString().trim().decapitalize();
    if (isWin) {
        wtSettingsFullPath = localAppData + wtSettingsPath;
    } else {
        localAppData = localAppData.replace(/\\/g, "/").replace(/:/g, ""); // Convert path to unix
        wtSettingsFullPath = "/mnt/" + localAppData + wtSettingsPath;
    }

    try {
        wtSettingsObject = JSON.parse(stripJsonComments(fs.readFileSync(wtSettingsFullPath, "utf8")));
    } catch (err) {
        throw Error("Could not read Windows Terminal settings.json", err);
    }

    return wtSettingsObject;
}

export function getProfileCommand(profile) {
    if (profile.commandline) {
        return profile.commandline.split(".").shift().decapitalize();
    } else if (profile.source) {
        return profile.source.split(".").pop().decapitalize();
    } else if (profile.name === "Windows PowerShell") {
        return "powershell"
    } else if (profile.name === "Command Prompt") {
        return "cmd"
    }
}

/**
 * Constructs a set of command-line arguments for the `wt` command based on the provided `options` object.
 * @param {Object} options - An object containing optional arguments for the command.
 * @param {string} options.title - The title for the new tab or pane.
 * @param {Object} options.profile - An terminal profile with the name of the profile to use.
 * @param {string} options.color - The tab color for the new tab or pane.
 * @param {string} options.d - The starting directory for the new tab or pane.
 * @param {string} options.terminal - The terminal emulator to use for the command.
 * @returns {string} A string of command-line arguments for the `wt` command.
 */
export function wtArguments(options) {
    let wtArgs = [];
    if (options.title) wtArgs.push(`--title "${options.title}"`);
    if (options.profile) wtArgs.push(`-p "${options.profile.name}"`);
    if (options.color) wtArgs.push(`--tabColor "${options.color[0] === "#" ? options.color : `#${options.color}`}"`);
    if (options.d && options.terminal !== "wsl") wtArgs.push(`-d "${options.d}"`); // Skip for wsl because we use cd <dir...> to avoid access error
    return wtArgs.join(" ");
}