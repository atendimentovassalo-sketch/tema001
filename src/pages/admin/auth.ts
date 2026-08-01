/* Sessão do admin no front: consulta /api/auth/eu. */
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export interface UsuarioAuth {
  nome: string
  email: string
  papel: string
}

interface EuResp {
  autenticado: boolean
  usuario?: UsuarioAuth
}

export interface EstadoSessao {
  carregando: boolean
  usuario: UsuarioAuth | null
}

export function useSessao(): EstadoSessao {
  const [estado, setEstado] = useState<EstadoSessao>({
    carregando: true,
    usuario: null,
  })
  useEffect(() => {
    let vivo = true
    api
      .get<EuResp>('/api/auth/eu')
      .then((r) => {
        if (vivo)
          setEstado({ carregando: false, usuario: r.autenticado ? r.usuario! : null })
      })
      .catch(() => {
        if (vivo) setEstado({ carregando: false, usuario: null })
      })
    return () => {
      vivo = false
    }
  }, [])
  return estado
}
