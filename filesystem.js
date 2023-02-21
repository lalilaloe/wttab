import { execSync } from "child_process";
export var isWin = process.platform === "win32";

/**
 * Convert a WSL-style path to a Windows-style path.
 *
 * @param {string} path - The WSL-style path to convert.
 * @returns {string} The Windows-style path.
 */
export function convertWslMountPathToWindowsPath(path) {
    const diskLetter = path.match(/[^\/]*/).shift().toUpperCase();
    const windowsPath = path.replace(/^\/mnt\//, `${diskLetter}:\\`);
    return windowsPath;
}            

/**
 * Convert a Windows-style path to a WSL-style path.
 *
 * @param {string} path - The Windows-style path to convert.
 * @returns {string} The WSL-style path.
 */
export function convertWslPathToWindowsWslPath(path) {
    const currentWslDistroName = execSync(`wsl.exe -l -q --running`).toString().trim();
    const wslPathPrefix = `\\\\wsl$\\${currentWslDistroName}`;
    const wslPath = wslPathPrefix + path.replace(/\\/g, "/");
    return wslPath;
}

/**
 * Converts a Windows path to a WSL path.
 *
 * @param {string} path - The Windows path to convert.
 * @returns {string} The converted WSL path.
 */
export function convertWindowsPathToWslPath(path) {
    const driveLetter = path[0].toLowerCase();
    const pathWithoutDrive = path.slice(2).replace(/\\/g, '/');
    return `/mnt/${driveLetter}/${pathWithoutDrive}`;
}