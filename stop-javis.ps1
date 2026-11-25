# Dung TTTOS cua DUNG thu muc nay. Khong dung dong lenh "server\main.py" de nhan dien nua: may cai
# ca Javis lan TTTOS thi hai ban chay cung mot dong lenh, giet theo dong lenh la tat nham ban kia.
# Nhan dien bang: (1) python launcher co duong dan exe nam trong .venv CUA THU MUC NAY, kem cac
# tien trinh con cua no; (2) tien trinh dang giu DUNG cong cua ban nay (JAVIS_PORT trong .env).
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = $env:JAVIS_PORT
$envFile = Join-Path $Root ".env"
if (-not $port -and (Test-Path $envFile)) {
  $m = Select-String -Path $envFile -Pattern '^\s*JAVIS_PORT\s*=\s*"?(\d+)' | Select-Object -Last 1
  if ($m) { $port = $m.Matches[0].Groups[1].Value }
}
if (-not $port) { $port = "7777" }
$venv = (Join-Path $Root ".venv").ToLower()
$killed = $false
$all = @(Get-CimInstance Win32_Process -Filter "Name='python.exe'" -ErrorAction SilentlyContinue)
$mine = @($all | Where-Object { $_.ExecutablePath -and $_.ExecutablePath.ToLower().StartsWith($venv) -and $_.CommandLine -like '*main.py*' })
$ids = @($mine | ForEach-Object { $_.ProcessId })
$kids = @($all | Where-Object { $ids -contains $_.ParentProcessId })
foreach ($p in ($kids + $mine)) {
  Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  Write-Host "  - Da tat python PID $($p.ProcessId)"
  $killed = $true
}
Get-NetTCPConnection -LocalPort ([int]$port) -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
  $own = Get-CimInstance Win32_Process -Filter "ProcessId=$($_.OwningProcess)" -ErrorAction SilentlyContinue
  if ($own -and $own.Name -eq 'python.exe') {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  - Da tat PID $($_.OwningProcess) (giu cong $port)"
    $killed = $true
  } elseif ($own) {
    Write-Host "  ! Cong $port dang bi $($own.Name) (PID $($_.OwningProcess)) giu - khong tat. Doi JAVIS_PORT trong .env."
  }
}
if (-not $killed) { Write-Host '  (Khong thay server nao dang chay)' }
exit 0
