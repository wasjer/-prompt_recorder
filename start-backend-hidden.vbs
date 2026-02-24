Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -File ""D:\garage\-prompt_recorder\-prompt_recorder\start-backend.ps1""", 0, False
Set WshShell = Nothing
