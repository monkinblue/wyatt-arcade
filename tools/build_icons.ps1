Add-Type -AssemblyName System.Drawing

function Color([int]$r, [int]$g, [int]$b) {
  return [System.Drawing.Color]::FromArgb(255, $r, $g, $b)
}

$n = 32
$bmp = New-Object System.Drawing.Bitmap $n, $n
$SKY = Color 36 28 84
$SKYB = Color 54 96 176
$NIGHT = Color 18 16 52
$MOON = Color 255 236 186
$GOLD = Color 255 204 84
$GOLDD = Color 214 132 42
$STALK = Color 24 112 58
$STALKL = Color 118 196 86
$LEAF = Color 52 168 74
$LEAFd = Color 24 112 58
$GRASS = Color 42 138 62
$GRASSD = Color 28 104 48
$CREAM = Color 244 224 190
$WOOD = Color 104 64 34
$ROOF = Color 176 64 52
$ROOFD = Color 128 42 40
$BRICK = Color 132 58 48
$WHITE = Color 248 246 255
$BEAN = Color 255 214 96
$STAR = Color 255 244 210
$PAD = Color 26 16 60

function Put($x, $y, $color) {
  if ($x -ge 0 -and $y -ge 0 -and $x -lt 32 -and $y -lt 32) {
    $script:bmp.SetPixel($x, $y, $color)
  }
}
function FillRect($x, $y, $w, $h, $color) {
  for ($yy = $y; $yy -lt ($y + $h); $yy++) {
    for ($xx = $x; $xx -lt ($x + $w); $xx++) { Put $xx $yy $color }
  }
}
function Disc($cx, $cy, $r, $color) {
  for ($yy = ($cy - $r); $yy -le ($cy + $r); $yy++) {
    for ($xx = ($cx - $r); $xx -le ($cx + $r); $xx++) {
      $dx = $xx - $cx
      $dy = $yy - $cy
      if (($dx * $dx + $dy * $dy) -le ($r * $r)) { Put $xx $yy $color }
    }
  }
}

for ($y = 0; $y -lt $n; $y++) {
  for ($x = 0; $x -lt $n; $x++) {
    if ($y -lt 22) {
      if ($y -lt 11 -and ((($x * 3 + $y) % 7) -eq 0)) { Put $x $y $NIGHT }
      elseif ((($x + $y) % 2) -eq 0) { Put $x $y $SKY }
      else { Put $x $y $SKYB }
    } elseif ((($x + $y) % 2) -eq 0) {
      Put $x $y $GRASS
    } else {
      Put $x $y $GRASSD
    }
  }
}

Put 4 4 $STAR
Put 11 7 $STAR
Put 20 3 $STAR
Put 27 5 $STAR
Disc 24 6 4 $MOON
Put 23 5 $WHITE

FillRect 2 14 11 9 $CREAM
FillRect 2 14 11 1 $WOOD
FillRect 2 18 11 1 $WOOD
FillRect 2 14 1 9 $WOOD
FillRect 12 14 1 9 $WOOD
FillRect 1 12 13 2 $ROOF
FillRect 2 11 11 1 $ROOFD
FillRect 4 10 7 1 $ROOF
FillRect 9 8 3 6 $BRICK
FillRect 4 16 3 3 $SKYB
FillRect 6 20 3 3 $WOOD

for ($i = 0; $i -lt 16; $i++) {
  $y = 23 - $i
  $wave = [int]([Math]::Sin($i * 0.55) * 4)
  $x = 16 + $wave
  Put $x $y $STALK
  Put ($x + 1) $y $STALKL
  Put ($x + 2) $y $STALK
  if (($i % 4) -eq 0) {
    $dir = 1
    if (($i % 8) -ne 0) { $dir = -1 }
    FillRect ($x + (2 * $dir)) ($y - 1) 3 2 $LEAF
    Put ($x + (3 * $dir)) ($y - 2) $LEAFd
  }
}

Disc 26 21 2 $BEAN
Put 26 21 $GOLD
Put 25 21 $GOLDD
Disc 29 20 1 $GOLD

function Save-Scaled($source, $factor, $path) {
  $dw = $source.Width * $factor
  $dh = $source.Height * $factor
  $big = New-Object System.Drawing.Bitmap $dw, $dh
  $gfx = [System.Drawing.Graphics]::FromImage($big)
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $dest = New-Object System.Drawing.Rectangle 0, 0, $dw, $dh
  $src = New-Object System.Drawing.Rectangle 0, 0, $source.Width, $source.Height
  $gfx.DrawImage($source, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
  $gfx.Dispose()
  $big.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $big.Dispose()
}

function Save-Maskable($source, $size, $artScale, $path, $pad) {
  $big = New-Object System.Drawing.Bitmap $size, $size
  $gfx = [System.Drawing.Graphics]::FromImage($big)
  $gfx.Clear($pad)
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $aw = $source.Width * $artScale
  $ah = $source.Height * $artScale
  $ox = [int](($size - $aw) / 2)
  $oy = [int](($size - $ah) / 2)
  $dest = New-Object System.Drawing.Rectangle $ox, $oy, $aw, $ah
  $src = New-Object System.Drawing.Rectangle 0, 0, $source.Width, $source.Height
  $gfx.DrawImage($source, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
  $gfx.Dispose()
  $big.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $big.Dispose()
}

$out = Join-Path (Split-Path $PSScriptRoot -Parent) "icons"
New-Item -ItemType Directory -Force -Path $out | Out-Null
Save-Scaled $bmp 6 (Join-Path $out "icon-192.png")
Save-Scaled $bmp 16 (Join-Path $out "icon-512.png")
Save-Maskable $bmp 192 4 (Join-Path $out "icon-maskable-192.png") $PAD
Save-Maskable $bmp 512 12 (Join-Path $out "icon-maskable-512.png") $PAD

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">')
for ($y = 0; $y -lt 32; $y++) {
  $x = 0
  while ($x -lt 32) {
    $color = $bmp.GetPixel($x, $y)
    $x2 = $x + 1
    while ($x2 -lt 32) {
      $next = $bmp.GetPixel($x2, $y)
      if ($next.ToArgb() -ne $color.ToArgb()) { break }
      $x2++
    }
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $color.R, $color.G, $color.B
    [void]$sb.AppendLine(('<rect x="{0}" y="{1}" width="{2}" height="1" fill="{3}"/>' -f $x, $y, ($x2 - $x), $hex))
    $x = $x2
  }
}
[void]$sb.AppendLine('</svg>')
[System.IO.File]::WriteAllText((Join-Path $out "icon.svg"), $sb.ToString())
$bmp.Dispose()
Get-ChildItem $out | Select-Object Name, Length | Format-Table -AutoSize
