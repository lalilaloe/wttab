# make sure wttab is installed on windows: 
npm i -g .
# for testing docs see: https://powershellmagazine.com/2014/03/27/testing-your-powershell-scripts-with-pester-assertions-and-more/

#TODO:
Fix powershell and cmd wttab -t 'test case' npm run script`; split-pane echo test --debug
wttab --color \#009999,f59218 echo test1`; echo test2 --debug
/bin/bash: -c: line 0: unexpected EOF while looking for matching ``' '

function Execute { 
    Param (
         [Parameter(Mandatory=$true, Position=0)]
         [string] $Command,
         [Parameter(Mandatory=$false, Position=1)]
         [ValidatePattern('wsl|cmd')]
         [string] $System = ""
    )
    if($System -eq "wsl"){
        $output = & wsl.exe bash -c $Command 2>&1
    } elseif($System -eq "cmd") {
        $output = & cmd.exe /c $Command 2>&1
    } else {
        $output = & powershell.exe -c $Command 2>&1
    }
    $stderr = $output | ?{ $_ -is [System.Management.Automation.ErrorRecord] }
    $stdout = $output | ?{ $_ -isnot [System.Management.Automation.ErrorRecord] }

    return (@{
        stdout = $stdout
        stderr = $stderr
    })
}

Describe 'Powershell (powershell.exe -c)' {
     Context 'Runs help command'    {
        $output = Execute "wttab"
        
        It 'Shows wttab Help'  {
            $output."stderr" | Should BeNullOrEmpty
            $output."stdout" -eq "Usage: index [options] [cmd...]" | Should Be $true
        }
    }

    Context 'Runs single command'    {
        $output = Execute "wttab -t 'test` case' npm run script" 
        # TODO: Figure out why ` escaping space is needed here and `"test case`" does not work for powershell and wsl, but is needed for cmd

        It 'Executes succesfully'  {
            $output."stderr" | Should BeNullOrEmpty
            $output."stdout" | Should BeNullOrEmpty
            (Get-Process).ProcessName | %{ if($_ -imatch 'WindowsTerminal') { $_ | Should Be $true } }
        }
    }

    Context 'Runs Multitple command'    {
        $output = Execute "wttab --color \#009999,f59218 echo test1`; echo test2 --debug" 

        It 'Executes succesfully'  {
            $output."stderr" | Should BeNullOrEmpty
            $output."stdout" | Should BeNullOrEmpty
            (Get-Process).ProcessName | %{ if($_ -imatch 'WindowsTerminal') { $_ | Should Be $true } }
        }
    }
}

Describe 'Command Prompt (cmd.exe /c)' {
     Context 'Runs help command'    {
        $output = Execute "wttab" "cmd"
        
        It 'Shows wttab Help'  {
            $output."stderr" | Should BeNullOrEmpty
            $output."stdout" -eq "Usage: index [options] [cmd...]" | Should Be $true
        }
    }

    Context 'Runs single command'    {
        $output = Execute "wttab -t `"test case`" npm run script" "cmd"

        It 'Executes succesfully'  {
            $output."stderr" | Should BeNullOrEmpty
            $output."stdout" | Should BeNullOrEmpty
            (Get-Process).ProcessName | %{ if($_ -imatch 'WindowsTerminal') { $_ | Should Be $true } }
        }
    }
}

Describe 'WSL (wsl.exe bash -c)' {
     Context 'Runs help command'    {
        $output = Execute "wttab" "wsl"
        
        It 'Shows wttab Help'  {
            $output."stderr" | Should BeNullOrEmpty
            $output."stdout" -eq "Usage: wttab [options] [cmd...]" | Should Be $true
        }
    }

    Context 'Runs single command'    {
        $output = Execute "wttab -t 'test case' npm run script" "wsl"

        It 'Executes succesfully'  {
            $output."stderr" | Should BeNullOrEmpty
            $output."stdout" | Should BeNullOrEmpty
            (Get-Process).ProcessName | %{ if($_ -imatch 'WindowsTerminal') { $_ | Should Be $true } }
        }
    }
}
