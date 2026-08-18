#!/usr/bin/env bash
# Sobe para a main e SÓ retorna quando o conteúdo novo estiver realmente sendo
# servido no domínio da cliente.
#
# POR QUE ESTE SCRIPT EXISTE
# --------------------------
# Em 18/08/2026 quatro diagnósticos errados nasceram do mesmo engano: o
# deployment aparece como "Active" na listagem do wrangler ANTES de o domínio
# passar a servir o conteúdo novo. Quem testa nessa janela conclui que a
# correção falhou — e sai "consertando" o que já estava certo.
#
# MEDIDO no deploy f46e61b (18/08/2026, tema001):
#   push -> "Active" na listagem ......... 24 s
#   push -> conteúdo SERVIDO no domínio .. 57 s
#   defasagem "Active" -> servido ........ 33 s
#
# Por isso o script não confia na listagem: ele espera o BUNDLE SERVIDO mudar.
# Isso é independente do que mudou no código — não exige marcador no fonte.
#
# Uso:  scripts/deploy-verificado.sh [branch-local]
set -euo pipefail

BRANCH="${1:-HEAD}"
DOMINIO="${DOMINIO:-https://funerariacatanduvas.com.br}"
PAGINA="${PAGINA:-/admin/login}"
# Margem depois de detectar a troca: o CDN tem vários nós, e o primeiro a
# responder novo não garante que todos já respondem. 2 min cobre o observado
# com folga larga.
MARGEM="${MARGEM:-120}"
LIMITE="${LIMITE:-600}"

hash_servido() {
  curl -s --max-time 20 "$DOMINIO$PAGINA?cb=$RANDOM" \
    | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' | head -1
}

ANTES="$(hash_servido)"
echo "bundle servido agora: ${ANTES:-<nenhum>}"

INICIO=$(date +%s)
git push origin "$BRANCH:main"
echo "push feito — aguardando o domínio servir o bundle novo…"

while :; do
  AGORA="$(hash_servido)"
  DECORRIDO=$(( $(date +%s) - INICIO ))
  if [ -n "$AGORA" ] && [ "$AGORA" != "$ANTES" ]; then
    echo "bundle novo servido: $AGORA  (${DECORRIDO}s após o push)"
    break
  fi
  if [ "$DECORRIDO" -gt "$LIMITE" ]; then
    echo "ATENÇÃO: passou de ${LIMITE}s sem trocar o bundle." >&2
    echo "Pode ser build falhando no Pages, ou mudança que não altera o bundle" >&2
    echo "(só backend/Functions). Conferir antes de concluir qualquer coisa." >&2
    exit 1
  fi
done

echo "margem de ${MARGEM}s para os demais nós do CDN…"
sleep "$MARGEM"
echo "pronto: pode verificar."
