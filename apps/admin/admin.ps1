param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "logs")]
    [string]$Action = "status"
)

$adminDir = "C:\Users\msiguenza\Desktop\Mototaxiapp\apps\admin"
$logFile = "$adminDir\vite.log"
$errFile = "$adminDir\vite.err.log"
$pidFile = "$adminDir\vite.pid"
$url = "http://localhost:5173"

function Get-ViteProcess {
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -match "vite" -or (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine -match "vite"
    }
    return $processes
}

function Start-Vite {
    if (Get-ViteProcess) {
        Write-Output "Vite ya está corriendo en $url"
        return
    }
    Write-Output "Iniciando Vite dev server..."
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "powershell"
    $psi.Arguments = "-NoProfile -WindowStyle Hidden -Command `"cd '$adminDir'; pnpm run dev 2>&1 >> '$logFile'`""
    $psi.WorkingDirectory = $adminDir
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $p = [System.Diagnostics.Process]::Start($psi)
    $p.Id | Out-File -FilePath $pidFile -Encoding ascii
    Start-Sleep -Seconds 4
    if (Get-ViteProcess) {
        Write-Output "✅ Vite corriendo en $url"
    } else {
        Write-Output "❌ Error al iniciar. Revisa: $logFile"
    }
}

function Stop-Vite {
    $procs = Get-ViteProcess
    if (-not $procs) {
        Write-Output "Vite no está corriendo"
        return
    }
    $procs | Stop-Process -Force -ErrorAction SilentlyContinue
    if (Test-Path $pidFile) { Remove-Item $pidFile -Force }
    Write-Output "✅ Vite detenido"
}

function Get-Status {
    $procs = Get-ViteProcess
    if (-not $procs) {
        Write-Output "❌ Vite: DETENIDO"
        return $false
    }
    try {
        $r = Invoke-WebRequest -Uri "$url/src/main.tsx" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Output "✅ Vite: CORRIENDO en $url ($($r.StatusCode) OK)"
        return $true
    } catch {
        Write-Output "⚠️ Vite: PROCESO VIVO pero no responde en $url"
        return $false
    }
}

function Show-Logs {
    if (Test-Path $logFile) {
        Write-Output "=== Últimas líneas de vite.log ==="
        Get-Content $logFile -Tail 20
    } else {
        Write-Output "No hay logs aún"
    }
}

switch ($Action) {
    "start" { Start-Vite }
    "stop"  { Stop-Vite }
    "restart" { Stop-Vite; Start-Sleep 2; Start-Vite }
    "status" { Get-Status }
    "logs"  { Show-Logs }
}
