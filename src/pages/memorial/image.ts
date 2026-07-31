/* Recorte de foto no navegador: center-crop 4:5 + redimensiona, devolve JPEG data URL.
 * Antecipa parte do tratamento de imagem (recorte/redimensionamento) sem backend.
 * HEIC e casos difíceis de EXIF ficam para o Cloudflare Images no próximo passo. */

const RATIO = 4 / 5 // largura / altura

async function carregar(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap aplica a orientação EXIF automaticamente quando suportado.
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, {
        imageOrientation: 'from-image',
      } as ImageBitmapOptions)
    } catch {
      // cai para o fallback abaixo
    }
  }
  return await new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem.'))
    }
    img.src = url
  })
}

/** Recorta a foto em 4:5 (centralizado) e limita a altura a `maxH`px. */
export async function recortar45(file: File, maxH = 1000): Promise<string> {
  const src = await carregar(file)
  const sw = 'width' in src ? src.width : (src as HTMLImageElement).naturalWidth
  const sh =
    'height' in src ? src.height : (src as HTMLImageElement).naturalHeight

  // maior retângulo 4:5 que cabe na imagem, centralizado
  let cw = sw
  let ch = cw / RATIO
  if (ch > sh) {
    ch = sh
    cw = ch * RATIO
  }
  const sx = (sw - cw) / 2
  const sy = (sh - ch) / 2

  const outH = Math.min(maxH, Math.round(ch))
  const outW = Math.round(outH * RATIO)

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível.')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src as CanvasImageSource, sx, sy, cw, ch, 0, 0, outW, outH)
  if ('close' in src) (src as ImageBitmap).close()

  return canvas.toDataURL('image/jpeg', 0.85)
}
