import type { Memorial } from './types'

/* Rascunho da nova nota, passado do formulário para a prévia via sessionStorage.
 * (Sem backend ainda; some ao fechar a aba, o que é adequado para uma prévia.) */

const KEY = 'memorial:rascunho'

export function saveDraft(m: Memorial): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(m))
  } catch {
    // sessionStorage indisponível (modo privado antigo): a prévia só não persiste.
  }
}

export function loadDraft(): Memorial | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Memorial) : null
  } catch {
    return null
  }
}
