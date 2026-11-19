:; exec /bin/sh -c "$(sed -n '/^# BEGIN_SH$/,/^# END_SH$/p' "$0")" "$0" "$@"
@echo off
setlocal
set "VIC_SETUP_FILE=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$source = Get-Content -LiteralPath $env:VIC_SETUP_FILE -Raw; $part = ($source -split '# BEGIN_PS\r?\n',2)[1]; $part = ($part -split '# END_PS',2)[0]; & ([scriptblock]::Create($part))"
set "VIC_SETUP_EXIT=%ERRORLEVEL%"
if not "%VIC_SETUP_EXIT%"=="0" pause
exit /b %VIC_SETUP_EXIT%

# BEGIN_SH
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
fail() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }
[ -f package.json ] && [ -f package-lock.json ] || fail 'Keep setup.cmd inside the complete project folder.'
[ -f config/public-config.enc.json ] && [ -f .lab/config.key ] || fail 'Lab config is missing. Ask the organizer for the complete project including the hidden .lab folder.'
local_bin="$PWD/.tools/node/bin"
if [ -x "$local_bin/node" ]; then PATH="$local_bin:$PATH"; export PATH; fi
valid_node() { command -v node >/dev/null 2>&1 && node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)' >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; }
if ! valid_node; then
  command -v curl >/dev/null 2>&1 || fail 'curl is required to download Node.js.'
  case "$(uname -s)" in Darwin) platform=darwin ;; Linux) platform=linux ;; *) fail 'Supported platforms: macOS, Linux, Windows.' ;; esac
  case "$(uname -m)" in arm64|aarch64) arch=arm64 ;; x86_64|amd64) arch=x64 ;; *) fail 'Supported architectures: x64 and arm64.' ;; esac
  command -v tar >/dev/null 2>&1 || fail 'tar is required.'
  mkdir -p .tools
  temp_dir="$(mktemp -d "$PWD/.tools/download.XXXXXX")"
  trap 'rm -rf "$temp_dir"' EXIT HUP INT TERM
  base=https://nodejs.org/dist/latest-v22.x
  printf 'Downloading Node.js 22 for %s-%s...\n' "$platform" "$arch"
  curl --fail --location --show-error --silent --proto '=https' --tlsv1.2 "$base/SHASUMS256.txt" -o "$temp_dir/SHASUMS256.txt"
  archive="$(awk -v suffix="-$platform-$arch.tar.gz" 'length($2)>=length(suffix) && substr($2,length($2)-length(suffix)+1)==suffix {print $2}' "$temp_dir/SHASUMS256.txt")"
  case "$archive" in node-v22.*-"$platform"-"$arch".tar.gz) ;; *) fail 'Cannot identify an official Node.js 22 archive.' ;; esac
  [ "$(printf '%s\n' "$archive" | wc -l | tr -d ' ')" = 1 ] || fail 'Ambiguous Node.js archive.'
  curl --fail --location --show-error --silent --proto '=https' --tlsv1.2 "$base/$archive" -o "$temp_dir/$archive"
  expected="$(awk -v file="$archive" '$2==file {print $1}' "$temp_dir/SHASUMS256.txt")"
  if command -v shasum >/dev/null 2>&1; then
    actual="$(shasum -a 256 "$temp_dir/$archive" | awk '{print $1}')"
  elif command -v sha256sum >/dev/null 2>&1; then
    actual="$(sha256sum "$temp_dir/$archive" | awk '{print $1}')"
  else fail 'shasum or sha256sum is required to verify the download.'; fi
  [ -n "$expected" ] && [ "$actual" = "$expected" ] || fail 'Node.js checksum mismatch. Run setup again.'
  mkdir "$temp_dir/runtime"
  tar -xzf "$temp_dir/$archive" -C "$temp_dir/runtime" --strip-components=1
  "$temp_dir/runtime/bin/node" -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)' || fail 'Downloaded Node.js cannot run on this OS.'
  rm -rf .tools/node
  mv "$temp_dir/runtime" .tools/node
  PATH="$local_bin:$PATH"; export PATH
fi
valid_node || fail 'Node.js >=22 and npm must be available.'
printf 'Using Node %s / npm %s\n' "$(node -v)" "$(npm -v)"
printf 'Installing locked dependencies with npm ci...\n'
npm ci
if ! command -v git >/dev/null 2>&1; then
  printf '\nGit is not installed. Install Git before the Git exercise: https://git-scm.com/downloads\n'
fi
printf '\nReady: open http://localhost:3000\nPress Ctrl+C to stop the server. Run this file again to restart.\n'
npm start
# END_SH

# BEGIN_PS
$ErrorActionPreference = 'Stop'
try {
    Set-Location -LiteralPath (Split-Path -Parent $env:VIC_SETUP_FILE)
    if (!(Test-Path 'package.json') -or !(Test-Path 'package-lock.json')) { throw 'Keep setup.cmd inside the complete project folder.' }
    if (!(Test-Path 'config/public-config.enc.json') -or !(Test-Path '.lab/config.key')) { throw 'Lab config is missing. Ask the organizer for the complete project including .lab.' }
    $localBin = Join-Path (Get-Location) '.tools\node'
    if (Test-Path (Join-Path $localBin 'node.exe')) { $env:PATH = "$localBin;$env:PATH" }
    function Test-Node {
        if (!(Get-Command node.exe -ErrorAction SilentlyContinue) -or !(Get-Command npm.cmd -ErrorAction SilentlyContinue)) { return $false }
        $major = & node.exe -p 'parseInt(process.versions.node)' 2>$null
        return ($LASTEXITCODE -eq 0 -and [int]$major -ge 22)
    }
    if (!(Test-Node)) {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $archName = $env:PROCESSOR_ARCHITECTURE
        if ($env:PROCESSOR_ARCHITEW6432) { $archName = $env:PROCESSOR_ARCHITEW6432 }
        switch ($archName) { 'AMD64' { $arch = 'x64' } 'ARM64' { $arch = 'arm64' } default { throw 'Supported Windows architectures: x64 and arm64.' } }
        New-Item -ItemType Directory -Force '.tools' | Out-Null
        $tempDir = Join-Path (Get-Location) ('.tools\download-' + [guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory $tempDir | Out-Null
        try {
            $base = 'https://nodejs.org/dist/latest-v22.x'
            Write-Host "Downloading Node.js 22 for Windows $arch..."
            $sums = (Invoke-WebRequest -UseBasicParsing "$base/SHASUMS256.txt").Content
            $lines = @($sums -split '\r?\n' | Where-Object { $_ -match "^[a-fA-F0-9]{64}\s+node-v22\.[0-9]+\.[0-9]+-win-$arch\.zip$" })
            if ($lines.Count -ne 1) { throw 'Cannot identify an official Node.js 22 archive.' }
            $parts = $lines[0] -split '\s+'
            $archive = $parts[1]
            $archivePath = Join-Path $tempDir $archive
            Invoke-WebRequest -UseBasicParsing "$base/$archive" -OutFile $archivePath
            if ((Get-FileHash -Algorithm SHA256 -LiteralPath $archivePath).Hash -ne $parts[0]) { throw 'Node.js checksum mismatch. Run setup again.' }
            Expand-Archive -LiteralPath $archivePath -DestinationPath $tempDir
            $extracted = Join-Path $tempDir ($archive -replace '\.zip$', '')
            $downloadedMajor = & (Join-Path $extracted 'node.exe') -p 'parseInt(process.versions.node)'
            if ($LASTEXITCODE -ne 0 -or [int]$downloadedMajor -lt 22) { throw 'Downloaded Node.js cannot run on this OS.' }
            if (Test-Path $localBin) { Remove-Item -LiteralPath $localBin -Recurse -Force }
            Move-Item -LiteralPath $extracted -Destination $localBin
            $env:PATH = "$localBin;$env:PATH"
        } finally { if (Test-Path $tempDir) { Remove-Item -LiteralPath $tempDir -Recurse -Force } }
    }
    if (!(Test-Node)) { throw 'Node.js >=22 and npm must be available.' }
    & node.exe -v
    Write-Host 'Installing locked dependencies with npm ci...'
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'npm ci failed. Check the network and run setup again.' }
    if (!(Get-Command git.exe -ErrorAction SilentlyContinue)) { Write-Host 'Install Git before the Git exercise: https://git-scm.com/downloads' }
    Write-Host 'Ready: open http://localhost:3000. Press Ctrl+C to stop. Run this file again to restart.'
    & npm.cmd start
    exit $LASTEXITCODE
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
# END_PS
