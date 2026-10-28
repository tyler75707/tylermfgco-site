# serve.ps1 - preview the site locally at http://localhost:5180/ (Ctrl+C to stop).
#   powershell -ExecutionPolicy Bypass -File serve.ps1
# Serves this folder the way GitHub Pages does: /about/ -> about/index.html, unknown paths -> 404.html.

param([int]$Port = 5180)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path $PSScriptRoot).Path
$types = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'; '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp'; '.gif' = 'image/gif'; '.ico' = 'image/x-icon'; '.txt' = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Previewing $Root at http://localhost:$Port/  (Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $res = $ctx.Response
    try {
      $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      $full = [IO.Path]::GetFullPath((Join-Path $Root $path.TrimStart('/')))
      $status = 200
      if (-not $full.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) { $full = $null }
      elseif (Test-Path $full -PathType Container) {
        if (-not $path.EndsWith('/')) { $res.Redirect($path + '/'); continue }
        $full = Join-Path $full 'index.html'
      }
      if (-not $full -or -not (Test-Path $full -PathType Leaf)) { $full = Join-Path $Root '404.html'; $status = 404 }
      $bytes = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $res.StatusCode = $status
      $res.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
      $res.Headers['Cache-Control'] = 'no-store'
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host "$status $path"
    } catch {
      $res.StatusCode = 500
    } finally {
      $res.Close()
    }
  }
} finally {
  $listener.Stop()
}
