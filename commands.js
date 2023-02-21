import { wtArguments } from "./windowsTerminal.js"
import { convertWindowsPathToWslPath } from "./filesystem.js"
/**
 * Construct the full command to be executed, given a command string and an options object.
 * @param {string} command - The command string to execute.
 * @param {Object} options - An object containing arguments for the command.
 * @returns {string} The full command to execute.
 */
export function getFullCommand(command, options) {
    // If the selected terminal is Command Prompt, use a trick to continue using
    // the terminal and keep the command visible.
    if (options.terminal === "cmd") {
        if (options.q === "before") {
            // Do not use this trick on user request.
            command = `cmd /k "${command}"`;
        } else {
            command = `cmd /k "ECHO=${command}|cmd && ${clearAfter(options) ? "cls" : "cmd>nul"}"`;
        }
    }
    // If the selected terminal is PowerShell, use the same trick as for
    // Command Prompt, but with PowerShell commands.
    if (options.terminal === "powershell") {
        if (options.q === "before") {
            // Do not use this trick on user request.
            command = `powershell -noexit "${command}"`;
        } else {
            command = `powershell -noexit "Write-Output '${command}'|powershell -noexit\\;${clearAfter(options) ? "clear" : "powershell | out-null"} "`;
        }
    }
    // If the selected terminal is WSL, modify the command as necessary to
    // make it compatible with WSL and use an equivalent trick to keep the
    // command visible.
    if (options.terminal === "wsl") {
        if (options.d.match(/[:\\]/)) {
            options.d = convertWindowsPathToWslPath(options.d);
        }
        if (options.q === "before") {
            command = `bash -c "cd ${options.d} && ${command} && exec bash 2>&1\"`;
        } else {
            command = `bash -c "cd ${options.d} && echo ${command} && ${command}\\;${clearAfter(options) ? "clear\\;" : ""} exec bash 2>&1\"`;
        }
    }

    return command;
}


function clearAfter(options) {
    return options.q && options.q !== "before";
}

/**
 * Checks whether a set of individual commands contains semicolons inside quotes.
 * @param {string[]} commands - An array of individual commands to validate.
 * @returns {boolean} True if the commands contain semicolons inside quotes, false otherwise.
 */
export function quotesContainSemicolon(cmd) {
    const commands = splitCommands(cmd);
    return commands.some(command => command.match(/"(.*?)"/)?.some(arg => arg.includes(";")));
}

/**
 * Processes a set of individual commands by parsing each one, constructing a new command string, and logging it to the console.
 * @param {string[]} commands - An array of individual commands to process.
 * @param {Object} options - An object containing arguments for the command.
 * @returns {Array} An Array containing the processed commands.
 */
export function processCommands(commands, options) {
    const tabTitles = options.title?.split(',');
    const tabColors = options.color?.split(',');
    if (options.debug) console.debug(`DEBUG: Input ${commands.length} commands;\n`, commands);
    const processedCommands = commands.map((command, i) => {
        let wtCommand = "new-tab";
        const commandMatch = command.match(/(new-tab|split-pane|focus-tab|move-focus)(.*)/);
        if (commandMatch) {
            wtCommand = commandMatch[1];
            command = commandMatch[2].trim();
        }
        if (tabTitles) {
            options.title = tabTitles[i];
        }
        if (tabColors) {
            options.color = tabColors[i];
        }
        return `${wtCommand} ${wtArguments(options)} ` + getFullCommand(command, options);
    });
    return processedCommands
}

/**
 * Checks whether a multi-command is valid by verifying that it is an array or does not contain semicolons inside quotes.
 * @param {string} cmd - The multi-command string to validate.
 * @returns {boolean} True if the multi-command is valid, false otherwise.
 */
export function isMultiCommand(cmd) {
    return Array.isArray(cmd) || !quotesContainSemicolon(cmd);
}

/**
 * Splits a multi-command string into individual commands using a regular expression.
 * @param {string} cmd - The multi-command string to split.
 * @returns {string[]} An array of individual commands.
 */
export function splitCommands(cmd) {
    const commands = cmd.match(/(?:[^;"\s]+(?:\s+[^;"\s]+)*|"[^"]*")+/g); return commands || [];
}
