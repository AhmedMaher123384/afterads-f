 = 'd:\download\AhmedMaher\afterads-f\src\pages\dashboard\Dashboard.tsx'
 = Get-Content -Raw -Path 
 = '(?s)\r?\n\s*\{\/\*.*?(\r?\n\s*\)\})'
 = [regex]::Replace(, , '')
Set-Content -Path  -Value 
Write-Output 'Done'
