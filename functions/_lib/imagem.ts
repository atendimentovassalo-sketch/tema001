/* Detecção de tipo de imagem pelos PRIMEIROS BYTES do arquivo.
 *
 * Cabeçalho `content-type` é texto que quem envia escreve; assinatura binária é
 * o que o arquivo realmente é. Sem esta checagem, o R2 vira hospedagem anônima
 * de qualquer coisa desde que o remetente minta o cabeçalho.
 *
 * Recusa SVG de propósito: é XML, executa script, e servido do nosso domínio
 * rodaria com a nossa origem.
 */
export interface TipoImagem {
  mime: string
  ext: string
}

export function tipoRealDaImagem(buf: ArrayBuffer): TipoImagem | null {
  const b = new Uint8Array(buf)
  if (b.length < 12) return null

  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)
    return { mime: 'image/jpeg', ext: 'jpg' }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  )
    return { mime: 'image/png', ext: 'png' }

  // WebP: "RIFF" .... "WEBP"
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  )
    return { mime: 'image/webp', ext: 'webp' }

  return null
}
