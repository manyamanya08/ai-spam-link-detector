<#
    SpamGuard AI - Local Web Server (PowerShell Native)
    No Node.js or Python required! Uses .NET HttpListener.
#>

$port = 8080
$prefix = "http://localhost:$port/"
$folder = $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   SpamGuard AI Local Server starting on $prefix" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "Server running at: $prefix" -ForegroundColor Yellow
    Write-Host "Opening browser..." -ForegroundColor Gray
    Start-Process $prefix

    Write-Host "Press Ctrl+C to stop the server." -ForegroundColor DarkGray

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or [string]::IsNullOrEmpty($urlPath)) {
            $urlPath = "/spam-link-detection.html"
        }

        $filePath = Join-Path $folder ($urlPath.TrimStart('/') -replace '/', '\')

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
