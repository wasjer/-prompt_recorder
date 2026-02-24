Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -File ""D:\garage\-prompt_recorder\-prompt_recorder\start-all.ps1""", 0, False
Set WshShell = Nothing
