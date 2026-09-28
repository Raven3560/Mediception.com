$port = 4173
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrWhiteSpace($root)) { $root = $PSScriptRoot }
if ([string]::IsNullOrWhiteSpace($root)) { $root = (Get-Location).Path }

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
$types = @{
  '.html'  = 'text/html; charset=utf-8'
  '.css'   = 'text/css; charset=utf-8'
  '.js'    = 'text/javascript; charset=utf-8'
  '.svg'   = 'image/svg+xml'
  '.png'   = 'image/png'
  '.jpg'   = 'image/jpeg'
  '.jpeg'  = 'image/jpeg'
  '.webp'  = 'image/webp'
  '.ico'   = 'image/x-icon'
  '.json'  = 'application/json; charset=utf-8'
  '.woff2' = 'font/woff2'
  '.woff'  = 'font/woff'
  '.ttf'   = 'font/ttf'
}

$listener.Start()
Write-Host "Mediception website running at: http://localhost:$port"
Write-Host "Serving files from: $root"
Write-Host "Press Ctrl+C to stop."

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = New-Object System.IO.StreamReader($stream)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        continue
      }
      while (($header = $reader.ReadLine()) -ne $null -and $header -ne '') { }

      $path = '/'
      if ($requestLine -match '^GET\s+([^\s]+)') { $path = $Matches[1] }
      $path = ([System.Uri]::UnescapeDataString($path.Split('?')[0])).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($path)) { $path = 'index.html' }
      $file = Join-Path $root ($path -replace '/', '\')

      if (-not (Test-Path -LiteralPath $file -PathType Leaf) -and (Test-Path -LiteralPath "$file.html" -PathType Leaf)) {
        $file = "$file.html"
      }

      if (Test-Path -LiteralPath $file -PathType Leaf) {
        $status = '200 OK'
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $extension = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
        $contentType = if ($types.ContainsKey($extension)) { $types[$extension] } else { 'application/octet-stream' }
      }
      else {
        $status = '404 Not Found'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes('Not found')
        $contentType = 'text/plain; charset=utf-8'
      }

      $headerText = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerText)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      $stream.Write($bytes, 0, $bytes.Length)
      $stream.Flush()
    }
    catch {
      # Ignore client disconnects / network errors
    }
    finally {
      if ($reader) { $reader.Dispose() }
      $client.Close()
    }
  }
}
finally {
  $listener.Stop()
}
