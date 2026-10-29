$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$markPath = Join-Path $projectRoot 'assets/splash-mark.png'
$previewPath = Join-Path $projectRoot 'artifacts/splash-preview.png'

# Code-owned vector geometry, rendered at 4x the display size. No app icon is replaced.
$mark = [System.Drawing.Bitmap]::new(512, 512)
$graphics = [System.Drawing.Graphics]::FromImage($mark)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)
$white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$coral = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#FF7E5F'))
$pen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, 18)
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$path = [System.Drawing.Drawing2D.GraphicsPath]::new()
$path.AddLines([System.Drawing.PointF[]]@(
  [System.Drawing.PointF]::new(66, 150),
  [System.Drawing.PointF]::new(118, 150),
  [System.Drawing.PointF]::new(166, 346),
  [System.Drawing.PointF]::new(366, 346),
  [System.Drawing.PointF]::new(412, 204),
  [System.Drawing.PointF]::new(132, 204)
))
$graphics.DrawPath($pen, $path)
$graphics.DrawLine($pen, 147, 252, 396, 252)
$graphics.DrawLine($pen, 159, 300, 381, 300)
$graphics.DrawLine($pen, 226, 208, 242, 342)
$graphics.DrawLine($pen, 316, 208, 308, 342)
$graphics.DrawEllipse($pen, 172, 382, 38, 38)
$graphics.DrawEllipse($pen, 324, 382, 38, 38)
$graphics.FillEllipse($coral, 318, 62, 132, 132)
$graphics.DrawLine($pen, 384, 102, 384, 154)
$graphics.DrawLine($pen, 358, 128, 410, 128)
$mark.Save($markPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Reviewable portrait preview, matching the app's loading composition.
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $previewPath) | Out-Null
$preview = [System.Drawing.Bitmap]::new(1080, 2160)
$canvas = [System.Drawing.Graphics]::FromImage($preview)
$canvas.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$canvas.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$canvas.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$canvas.Clear([System.Drawing.ColorTranslator]::FromHtml('#1B3B5F'))
$canvas.DrawImage($mark, 348, 690, 384, 384)
$fonts = [System.Drawing.Text.PrivateFontCollection]::new()
$fonts.AddFontFile((Join-Path $projectRoot 'assets/fonts/OpenSans-Semibold.ttf'))
$titleFont = [System.Drawing.Font]::new($fonts.Families[0], 84, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$taglineFont = [System.Drawing.Font]::new('Segoe UI', 38, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$center = [System.Drawing.StringFormat]::new()
$center.Alignment = [System.Drawing.StringAlignment]::Center
$center.LineAlignment = [System.Drawing.StringAlignment]::Center
$title = 'MesCourses'
$titleSize = $canvas.MeasureString($title, $titleFont)
$plusSize = $canvas.MeasureString('+', $titleFont)
$left = (1080 - $titleSize.Width - $plusSize.Width + 12) / 2
$canvas.DrawString($title, $titleFont, $white, $left, 1120)
$canvas.DrawString('+', $titleFont, $coral, $left + $titleSize.Width - 12, 1120)
$canvas.DrawString('Vos courses, tout simplement.', $taglineFont, $white, [System.Drawing.RectangleF]::new(60, 1260, 960, 90), $center)
$canvas.FillEllipse($coral, 526, 1430, 28, 28)
$preview.Save($previewPath, [System.Drawing.Imaging.ImageFormat]::Png)

$center.Dispose()
$taglineFont.Dispose()
$titleFont.Dispose()
$fonts.Dispose()
$canvas.Dispose()
$preview.Dispose()
$path.Dispose()
$pen.Dispose()
$coral.Dispose()
$white.Dispose()
$graphics.Dispose()
$mark.Dispose()
Write-Output 'Generated assets/splash-mark.png and artifacts/splash-preview.png'
