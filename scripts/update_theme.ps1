# PowerShell script to replace purple/violet Tailwind classes with green equivalents
# Run from the project root.

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# Define replacement pairs (pattern, replacement)
$replacements = @(
    @{Pattern = 'bg-violet-100'; Replacement = 'bg-green-100'}
    @{Pattern = 'bg-violet-50'; Replacement = 'bg-green-50'}
    @{Pattern = 'bg-violet-600'; Replacement = 'bg-green-600'}
    @{Pattern = 'bg-violet-200'; Replacement = 'bg-green-200'}
    @{Pattern = 'bg-violet-300'; Replacement = 'bg-green-300'}
    @{Pattern = 'bg-violet-400'; Replacement = 'bg-green-400'}
    @{Pattern = 'bg-purple-100'; Replacement = 'bg-green-100'}
    @{Pattern = 'bg-purple-50'; Replacement = 'bg-green-50'}
    @{Pattern = 'bg-purple-400'; Replacement = 'bg-green-400'}
    @{Pattern = 'bg-purple-600'; Replacement = 'bg-green-600'}
    @{Pattern = 'bg-purple-200'; Replacement = 'bg-green-200'}
    @{Pattern = 'bg-purple-300'; Replacement = 'bg-green-300'}
    @{Pattern = 'border-violet-200'; Replacement = 'border-green-200'}
    @{Pattern = 'border-violet-300'; Replacement = 'border-green-300'}
    @{Pattern = 'border-violet-600'; Replacement = 'border-green-600'}
    @{Pattern = 'border-purple-200'; Replacement = 'border-green-200'}
    @{Pattern = 'border-purple-600'; Replacement = 'border-green-600'}
    @{Pattern = 'text-violet-600'; Replacement = 'text-green-600'}
    @{Pattern = 'text-violet-700'; Replacement = 'text-green-700'}
    @{Pattern = 'text-violet-500'; Replacement = 'text-green-500'}
    @{Pattern = 'text-violet-300'; Replacement = 'text-green-300'}
    @{Pattern = 'text-purple-600'; Replacement = 'text-green-600'}
    @{Pattern = 'violet-'; Replacement = 'green-'}
    @{Pattern = 'purple-'; Replacement = 'green-'}
    @{Pattern = 'from-violet-600'; Replacement = 'from-green-600'}
    @{Pattern = 'bg-white'; Replacement = 'bg-black'}
    @{Pattern = 'text-white'; Replacement = 'text-gray-200'}
    @{Pattern = 'border-white'; Replacement = 'border-gray-200'}
    @{Pattern = 'to-purple-400'; Replacement = 'to-green-400'}
    @{Pattern = 'to-purple-600'; Replacement = 'to-green-600'}
    @{Pattern = 'selection:bg-violet-100'; Replacement = 'selection:bg-green-100'}
    @{Pattern = 'selection:text-violet-900'; Replacement = 'selection:text-green-900'}
    @{Pattern = 'selection:bg-purple-100'; Replacement = 'selection:bg-green-100'}
    @{Pattern = 'selection:text-purple-900'; Replacement = 'selection:text-green-900'}
)

# Get all files with relevant extensions
$files = Get-ChildItem -Path $projectRoot -Recurse -Include *.tsx,*.ts,*.js,*.jsx -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    foreach ($pair in $replacements) {
        $content = $content -replace $pair.Pattern, $pair.Replacement
    }
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -Encoding utf8
        Write-Host "Updated $($file.FullName)"
    }
}

Write-Host "Theme update complete."
