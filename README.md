# wttab - Programmatically open Windows Terminal tab or window

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
  -w, --window [window-id]   Target new tab in new terminal window, use 0 for same window (default -1, same window)
  -s, --settings <settings>  Assign a settings set (profile).
  -t, --title <title>        Specify title for new tab.
  -q                         Clear the new tab's screen.
  --preview                  Target the preview version of Windows Terminal
  -p, --profile [terminal]   Choose a profile to launch
  --color <#hexcode>         set color of tab
  --debug                    Enable debugging, outputs the command executed
  -h, --help                 display help for command
```

Examples
```bash
# Open a new tab in an existing or new terminal window.
wttab echo test

# Open a new tab in a new terminal window.
wttab -w 0 echo test

# Open a new tab and execute the specified command before showing the prompt.
wttab ls -l "$HOME/Library/Application Support"
```

### Powershell limitations

Unfortunately, PowerShell also uses ; as a command separator. To work around this, you can use the following (`\`;` or `--%`) to run multiple commands (source)[https://learn.microsoft.com/nl-nl/windows/terminal/command-line-arguments?tabs=linux#examples-of-multiple-commands-from-powershell]
```powershell
wttab --color '#009999,f59218' dir`; echo test
wttab --% --color '#009999,f59218' dir; echo test
```

In PowerShell, you need to enclose arguments that contain spaces or other special characters in double quotes. This is because PowerShell treats space as a command separator by default (source)[https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-7.3]. So instead of `wttab -t 'window title' npm run script` run:

```powershell
wttab -t "window title" npm run script
```

### Advanced

```bash
# Open a new tab in a targeted terminal window.
wttab -w foo echo test
```

## Contributing

Always welcome, if you are planning on adding/changing code please open an issue first. See also [https://github.com/microsoft/terminal](https://github.com/microsoft/terminal) many features are still being added, especially to wt.exe (Windows Terminal Cli).

## Sources & Inspiration

Recent feature of executing commands in an existing Terminal Window [microsoft/terminal/issues/4472](https://github.com/microsoft/terminal/issues/4472)

Commands taken from [Official Windows Terminal docs](https://docs.microsoft.com/nl-nl/windows/terminal/command-line-arguments?tabs=linux)

Inspiration taken from [ttab (macOS/Linux)](https://www.npmjs.com/package/ttab)

Ttab has no plans to add support for [other platforms](https://github.com/mklement0/ttab/issues/11)
