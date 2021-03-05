# wttab - Programmatically open Tindows Terminal tab or window

## Install

`npm install wttab`

\* Make sure you have [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701?activetab=pivot:overviewtab) installed

## Usage

The package is mostly in line with [ttab](https://www.npmjs.com/package/ttab) so you can quickly use existing commands/scripts by putting a `w` in front of `ttab`.

```
$ wttab --help

Usage: wttab [options] [cmd...]

Opens a new terminal tab or window on Windows Terminal, from WSL or Windows.

Options:
  -w, --window               Open new tab in new terminal window (default for current
                             version of Windows Terminal)
  -s, --settings <settings>  Assign a settings set (profile).
  -t, --title <title>        Specify title for new tab.
  -q                         Clear the new tab's screen.
  --preview                  Use the preview version of Windows Terminal (allows using a
                             existing terminal since v1.7.572.0)
  -p, --profile [terminal]   Choose a profile to launch
  --color <#hexcode>         set color of tab
  --debug                    Enable debugging, outputs the command executed
  -h, --help                 display help for command
```

## Contributing

Always welcome, if you are planning on adding/changing code please open an issue first. See also [https://github.com/microsoft/terminal](https://github.com/microsoft/terminal) many features are still being added, especially to wt.exe (Windows Terminal Cli).

## Sources & Inspiration

Recent feature of executing commands in an existing Terminal Window [microsoft/terminal/issues/4472](https://github.com/microsoft/terminal/issues/4472)

Commands taken from [Official Windows Terminal docs](https://docs.microsoft.com/nl-nl/windows/terminal/command-line-arguments?tabs=linux)

Inspiration taken from [ttab (Linux)](https://www.npmjs.com/package/ttab)

Ttab has no plans to add support for [other platforms](https://github.com/mklement0/ttab/issues/11)
