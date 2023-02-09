# make sure wttab is installed on windows: 
npm i -g .
# for testing docs see: https://powershellmagazine.com/2014/03/27/testing-your-powershell-scripts-with-pester-assertions-and-more/
Describe 'Run command' {
     Context 'Runs help command'    {
        $output = & wttab 2>&1
        $stderr = $output | ?{ $_ -is [System.Management.Automation.ErrorRecord] }
        $stdout = $output | ?{ $_ -isnot [System.Management.Automation.ErrorRecord] }
        
        It 'Shows wttab Help'  {
            $stderr | Should BeNullOrEmpty
            $stdout -eq "Usage: index [options] [cmd...]" | Should Be $true
        }
    }

    Context 'Runs single command'    {
        $output = & wttab -t 'test case' npm run script 2>&1
        $stderr = $output | ?{ $_ -is [System.Management.Automation.ErrorRecord] }
        $stdout = $output | ?{ $_ -isnot [System.Management.Automation.ErrorRecord] }
        #test one
        It 'Executes succesfully'  {
            $stderr | Should BeNullOrEmpty
            $stdout | Should BeNullOrEmpty
            (Get-Process).ProcessName | %{ if($_ -imatch 'WindowsTerminal') { $_ | Should Be $true } }
        }
    }
}
