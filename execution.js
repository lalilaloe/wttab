import { execSync, exec } from "child_process";
import { isWin, convertWslMountPathToWindowsPath, convertWslPathToWindowsWslPath } from "./filesystem.js"
import { isMultiCommand } from "./commands.js"
import { wtArguments } from "./windowsTerminal.js"

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

export function wt(options) {
    let cmd = 'wt.exe';
    if (options.preview) {
        // Use Windows Terminal Preview's wt.exe for launch
        let userProfile = execSync(`cmd.exe /c "echo %UserProfile%"`);
        userProfile = userProfile.toString().trim().decapitalize();
        cmd = `\"${userProfile}\\AppData\\Local\\Microsoft\\WindowsApps\\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\\wt.exe\"`; // Focus on existing window with -w 0
    }
    if (options.window) {
        cmd += ` -w ${options.window ? options.window : "-1"} `;
    } else {
        // Default open tab in existing Windows Terminal window
        cmd += ` -w 0 `;
    }
    return cmd;
}

/**
 * Execute the given commands in a new terminal window.
 *
 * @param {string[]} commands - An array of command strings to execute.
 * @param {Object} options - An object containing arguments for the command.
 */
export function execute(commands, options) {
    // Determine the appropriate command separator for the current platform.
    const commandSeparator = isWin ? "`;" : "\\\;";

    // Construct the full command to be executed.
    const fullCommand = buildFullCommand(commands, options, commandSeparator);

    // If debug mode is enabled, log the full command to the console.
    if (options.debug) {
        console.debug("DEBUG: Executing command;\n", fullCommand);
    }

    // Execute the command.
    exec(fullCommand, error);
}

/**
 * Construct the full command to be executed, given an array of commands, an options object,
 * and a command separator.
 *
 * @param {string[]} commands - An array of command strings to execute.
 * @param {Object} options - An options object.
 * @param {string} separator - The command separator to use between commands.
 * @returns {string} The full command to execute.
 */
function buildFullCommand(commands, options, separator) {
    let fullCommand;

    if (isWin) {
        fullCommand = `${wt(options)} ${isMultiCommand(commands) ? '' : wtArguments(options)} ${commands.join(` ${separator} `)}`;
    } else {
        if (options.terminal !== "wsl" && options.d.match(/^\/mnt\//)) {
            // Redirect wsl disk mount it's Windows path
            options.d = convertWslMountPathToWindowsPath(options.d);
        } else if (options.terminal !== "wsl" && options.d.match(/^\//)) {
            // Redirect to wsl path in windows
            options.d = convertWslPathToWindowsWslPath(options.d);
        }

        fullCommand = `cmd.exe /c ${wt(options)} ${isMultiCommand(commands) ? '' : wtArguments(options)} ${commands.join(` ${separator} `)}`;
    }

    return fullCommand;
}


