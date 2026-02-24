# Clear all prompts - Simple version
$stats = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/stats/summary"
Write-Host "Current prompts: $($stats.total)" -ForegroundColor Cyan

$confirm = Read-Host "Delete all? (yes/no)"
if ($confirm -eq 'yes') {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/all" -Method Delete
    Write-Host "Deleted: $($result.deletedCount) prompts" -ForegroundColor Green
} else {
    Write-Host "Cancelled" -ForegroundColor Yellow
}
