#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verifica_memorial.py — conferência determinística de uma página de memorial
do produto Óbitos contra as decisões fechadas do SAAS-FUNERARIAS/DECISOES.md.

Uso:
    python3 verifica_memorial.py <pagina.html> [--referencia memorial-v5.html] [--json]

Saída: uma linha por achado, no formato
    arquivo:linha  [NIVEL]  regra — o que foi encontrado → o que a decisão manda

Níveis:
    BLOQUEIA  contraria decisão fechada. Não publica.
    CORRIGE   bug ou acessibilidade já registrados; não é escolha de linha.
    AVISA     toca item que está EM ABERTO — não decidir sozinho, levar ao Felipe.

Código de saída: 1 se houver qualquer BLOQUEIA, senão 0.
Sem dependências externas (stdlib apenas).
"""

import argparse
import json
import re
import sys

# ---------------------------------------------------------------- utilidades

MESES = "janeiro|fevereiro|mar[çc]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro"
DATA_COMPLETA = re.compile(
    r"(\b\d{1,2}\s+de\s+(?:%s)\s+de\s+\d{4}\b|\b\d{1,2}/\d{1,2}/\d{4}\b)" % MESES,
    re.IGNORECASE,
)
PALETA_VIVA = {"#faf8f3", "#f7f7f6"}


def carregar(caminho):
    """Lê o arquivo e devolve (linhas_originais, linhas_sem_comentario).

    Comentários HTML são apagados preservando as quebras de linha, para que o
    número da linha reportado continue batendo com o arquivo real. Isso importa:
    a v5 explica em comentário por que o contador de visitas não existe — sem
    isso, a própria referência seria acusada.
    """
    with open(caminho, "r", encoding="utf-8", errors="replace") as fh:
        bruto = fh.read()

    def branquear(m):
        return re.sub(r"[^\n]", " ", m.group(0))

    limpo = re.sub(r"<!--.*?-->", branquear, bruto, flags=re.DOTALL)
    return bruto.splitlines(), limpo.splitlines()


def faixa(linhas, abre, fecha):
    """Índices (1-based) das linhas entre <tag ...> e </tag>. Devolve set()."""
    dentro, marcadas = False, set()
    ra, rf = re.compile(abre, re.I), re.compile(fecha, re.I)
    for i, linha in enumerate(linhas, 1):
        if ra.search(linha):
            dentro = True
        if dentro:
            marcadas.add(i)
        if rf.search(linha):
            dentro = False
    return marcadas


class Relatorio:
    def __init__(self, arquivo):
        self.arquivo = arquivo
        self.achados = []

    def add(self, nivel, linha, regra, encontrado, esperado):
        self.achados.append(
            {
                "arquivo": self.arquivo,
                "linha": linha,
                "nivel": nivel,
                "regra": regra,
                "encontrado": encontrado.strip()[:150],
                "esperado": esperado,
            }
        )

    def bloqueios(self):
        return [a for a in self.achados if a["nivel"] == "BLOQUEIA"]


# ------------------------------------------------------------------- checagens


def checar(caminho, referencia=None):
    orig, linhas = carregar(caminho)
    rel = Relatorio(caminho)
    texto = "\n".join(linhas)

    no_footer = faixa(linhas, r"<footer\b", r"</footer>")
    no_header = faixa(linhas, r"<header\b", r"</header>")

    # ---- 1. telefone só no rodapé (despoluição, 12/08)
    for i, l in enumerate(linhas, 1):
        for m in re.finditer(r'href="tel:[^"]*"', l, re.I):
            if i not in no_footer:
                rel.add(
                    "BLOQUEIA", i, "telefone fora do rodapé", m.group(0),
                    "o único tel: da página fica no <footer> (v5 §2)",
                )

    # ---- 2. nav de navegação (cabeçalho/corpo). O <nav> de ação única da v5 passa.
    for i, l in enumerate(linhas, 1):
        if re.search(r"<nav\b", l, re.I):
            bloco = "\n".join(linhas[i - 1 : i + 15])
            fim = bloco.lower().find("</nav>")
            bloco = bloco[: fim if fim > 0 else len(bloco)]
            destinos = len(re.findall(r"<a\b", bloco, re.I))
            if destinos > 1 or re.search(r"tel:", bloco, re.I):
                rel.add(
                    "BLOQUEIA", i, "nav de navegação na página",
                    "%d destino(s) no <nav>" % destinos,
                    "memorial não navega: só o botão único de homenagem (v5 §2)",
                )

    # ---- 3. barra Ligar+WhatsApp (o par persistente, não um link de correção
    #        nem um botão de compartilhar: só o par tel:+WhatsApp vizinhos)
    for i, l in enumerate(linhas, 1):
        if not re.search(r"(wa\.me|api\.whatsapp)", l, re.I) or i in no_footer:
            continue
        vizinhanca = "\n".join(linhas[max(0, i - 3) : i + 2])
        if re.search(r"href=\"tel:", vizinhanca, re.I):
            rel.add(
                "BLOQUEIA", i, "par Ligar+WhatsApp fora do rodapé", l,
                "a barra inferior Ligar+WhatsApp foi removida; no lugar, um botão de homenagem",
            )

    # ---- 4. barra utilitária acima do cabeçalho
    ini_body = next((i for i, l in enumerate(linhas, 1) if re.search(r"<body\b", l, re.I)), None)
    ini_header = next((i for i, l in enumerate(linhas, 1) if re.search(r"<header\b", l, re.I)), None)
    if ini_body and ini_header and ini_header > ini_body:
        for i in range(ini_body, ini_header):
            if re.search(r"<a\b", linhas[i - 1], re.I) and not re.search(
                r"skip|pular", linhas[i - 1], re.I
            ):
                rel.add(
                    "BLOQUEIA", i, "barra utilitária acima do cabeçalho", linhas[i - 1],
                    "a barra 'Publicado pela… · cidade · cidade' foi removida (v5 §2)",
                )

    # ---- 5. cabeçalho só com o nome da funerária
    for i in sorted(no_header):
        l = linhas[i - 1]
        if re.search(r"<p\b", l, re.I) or re.search(r'class="[^"]*(sub|tagline|slogan)', l, re.I):
            rel.add(
                "BLOQUEIA", i, "subtítulo no cabeçalho", l,
                "cabeçalho tem só o nome da funerária (v5 §2)",
            )

    # ---- 6. data de nascimento completa na tela
    for i, l in enumerate(linhas, 1):
        datas = DATA_COMPLETA.findall(l)
        if not datas:
            continue
        contexto = re.sub(r"<[^>]+>", " ", l)
        if re.search(r"nasc", contexto, re.I):
            rel.add(
                "BLOQUEIA", i, "data de nascimento completa na tela", datas[0],
                "nascimento é SÓ O ANO na tela e no schema (vetor de fraude, 12/08)",
            )
        elif len(datas) >= 2 and re.search(r"[–—-]", contexto):
            rel.add(
                "BLOQUEIA", i, "par nascimento–falecimento com data completa",
                " … ".join(datas[:2]),
                "só o ano no nascimento; data completa apenas no falecimento",
            )

    # ---- 7. birthDate no JSON-LD
    for i, l in enumerate(linhas, 1):
        for m in re.finditer(r'"birthDate"\s*:\s*"([^"]*)"', l):
            if not re.fullmatch(r"\d{4}", m.group(1)):
                rel.add(
                    "BLOQUEIA", i, "birthDate completo no JSON-LD", m.group(0),
                    '"birthDate":"AAAA" — o ano, nada além',
                )

    # ---- 8. contador público de visitas (número colado à palavra, não a
    #        palavra "visitante" solta numa nota de design)
    contagem_visita = re.compile(
        r"(\b\d[\d.,]*\b[^.\n]{0,25}\b(?:visitas?|visitou|visitaram|visualiza\w*)\b)"
        r"|(\b(?:visitas?|visitou|visitaram|visualiza\w*)\b[^.\n]{0,25}\b\d[\d.,]*\b)",
        re.IGNORECASE,
    )
    for i, l in enumerate(linhas, 1):
        visivel = re.sub(r"<[^>]+>", " ", l)
        if contagem_visita.search(visivel):
            rel.add(
                "BLOQUEIA", i, "contador de visitas na página pública", visivel,
                "visitas é métrica da funerária, não da página (12/08)",
            )

    # ---- 9. contador visível em zero
    for i, l in enumerate(linhas, 1):
        visivel = re.sub(r"<[^>]+>", " ", l)
        if re.search(r"\b0\b\s*(vela|homenagem|homenagens|mensage)", visivel, re.I):
            rel.add(
                "BLOQUEIA", i, "contador zerado exposto", visivel,
                "contador só existe a partir de 1 — zero comunica abandono (v5 §8)",
            )

    # ---- 10. dois modos por fim_servicos
    if not re.search(r"fim_?servicos", texto, re.I):
        rel.add(
            "BLOQUEIA", 0, "sem os dois modos (aviso/memorial)", "nenhuma menção a fim_servicos",
            "mesma URL em dois estados por fim_servicos; sem JS fica em modo aviso",
        )

    # ---- 11. vela como ação independente
    formularios = [
        (i, m.group(0))
        for i, l in enumerate(linhas, 1)
        for m in re.finditer(r"<form[^>]*", l, re.I)
    ]
    tem_form_vela = any(re.search(r"vela", f, re.I) for _, f in formularios)
    if not tem_form_vela:
        rel.add(
            "BLOQUEIA", formularios[0][0] if formularios else 0,
            "vela não é ação independente",
            "%d formulário(s), nenhum de vela" % len(formularios),
            "vela e mensagem são formulários irmãos, ambos gravados e no mural (12/08)",
        )

    # ---- 12. seção 'Outras despedidas' e breadcrumb visível
    for i, l in enumerate(linhas, 1):
        if re.search(r"outras despedidas", l, re.I) and not re.search(r"<footer|ver todas", l, re.I):
            rel.add(
                "BLOQUEIA", i, "seção 'Outras despedidas da cidade'", l,
                "removida na despoluição; a ponte é UMA linha no rodapé (v5 §3)",
            )
        if re.search(r'(class|aria-label)="[^"]*breadcrumb', l, re.I):
            rel.add(
                "BLOQUEIA", i, "breadcrumb visível", l,
                "breadcrumb saiu na despoluição; BreadcrumbList no JSON-LD continua valendo",
            )

    # ---- 13. handler órfão (o bug real da v5, L584/548)
    ids = set(re.findall(r'id="([^"]+)"', texto))
    for i, l in enumerate(linhas, 1):
        for m in re.finditer(r"getElementById\(\s*['\"]([^'\"]+)['\"]\s*\)", l):
            if m.group(1) not in ids:
                rel.add(
                    "CORRIGE", i, "handler órfão quebra o script",
                    "getElementById('%s') sem elemento correspondente" % m.group(1),
                    "TypeError interrompe o bloco — o visor da galeria não inicializa",
                )

    # ---- 14. acessibilidade (itens medidos na comparação de 13/08)
    if not re.search(r"(skip-link|pular para|ir para o conte)", texto, re.I):
        rel.add("CORRIGE", 0, "sem skip-link", "nenhum link de salto", "skip-link no topo do body")
    if not re.search(r"aria-live", texto, re.I):
        rel.add("CORRIGE", 0, "sem aria-live", "formulário sem região viva",
                "aria-live no retorno do formulário")
    if not re.search(r"<label[^>]+for=", texto, re.I):
        rel.add("CORRIGE", 0, "sem <label for> real", "só placeholder/aria-label",
                "<label for> em cada campo")

    # ---- 15. og: e canonical (o item que já regrediu uma vez)
    if not re.search(r'rel="canonical"', texto, re.I):
        rel.add("BLOQUEIA", 0, "sem canonical", "nenhum rel=canonical",
                "espelho aponta canonical para obitos.com.br (Modelo A, 11/08)")
    else:
        m = re.search(r'rel="canonical"[^>]*href="([^"]+)"', texto, re.I) or re.search(
            r'href="([^"]+)"[^>]*rel="canonical"', texto, re.I
        )
        if m and "obitos.com.br" not in m.group(1):
            rel.add("BLOQUEIA", 0, "canonical fora do guarda-chuva", m.group(1),
                    "canonical do espelho aponta para obitos.com.br")
    for prop in ("og:title", "og:image", "og:url"):
        if prop not in texto:
            rel.add("BLOQUEIA", 0, "sem %s" % prop, "ausente",
                    "og: por memorial — o card sem nome/foto já circulou por 2 semanas")

    # ---- 16. paleta e fonte (itens EM ABERTO: avisar, nunca decidir)
    cores = {c.lower() for c in re.findall(r"#(?:[0-9a-fA-F]{6})", texto)}
    fora = {c for c in cores if c in {"#fbfbf8"}} | (
        {c for c in cores if c in {"#faf8f3", "#f7f7f6"}} - PALETA_VIVA
    )
    if "#fbfbf8" in cores:
        rel.add("AVISA", 0, "paleta fora das duas linhas vivas", "#FBFBF8",
                "decisão de paleta está EM ABERTO (#FAF8F3 × #F7F7F6) — levar ao Felipe")
    if re.search(r"Newsreader", texto):
        rel.add("AVISA", 0, "terceira fonte", "Newsreader",
                "vira token oficial ou sai — decisão EM ABERTO (v5 §7.10)")

    # ---- 17. ordem das seções contra a referência
    def ordem(ls):
        saida = []
        for l in ls:
            for m in re.finditer(r'<section[^>]*id="([^"]+)"', l, re.I):
                saida.append(m.group(1))
        return saida

    if referencia:
        _, ref_linhas = carregar(referencia)
        a, b = ordem(ref_linhas), ordem(linhas)
        comuns_ref = [s for s in a if s in b]
        comuns_cand = [s for s in b if s in a]
        if len(comuns_ref) < 2:
            rel.add(
                "AVISA", 0, "ordem de seções não pôde ser comparada",
                "ids da referência (%s) não coincidem com os da página (%s)"
                % (", ".join(a) or "—", ", ".join(b) or "—"),
                "conferir a ordem no olho contra a referência — a máquina não cobriu este item",
            )
        elif comuns_ref != comuns_cand:
            rel.add(
                "BLOQUEIA", 0, "ordem de seções fora da canônica",
                " → ".join(comuns_cand),
                "ordem da referência: " + " → ".join(comuns_ref),
            )

    return rel


# ------------------------------------------------------------------------ cli


def main():
    p = argparse.ArgumentParser(description="Confere uma página de memorial contra as decisões fechadas.")
    p.add_argument("pagina")
    p.add_argument("--referencia", help="memorial-v5.html (para conferir a ordem das seções)")
    p.add_argument("--json", action="store_true")
    args = p.parse_args()

    rel = checar(args.pagina, args.referencia)

    if args.json:
        print(json.dumps(rel.achados, ensure_ascii=False, indent=2))
    else:
        ordem_nivel = {"BLOQUEIA": 0, "CORRIGE": 1, "AVISA": 2}
        for a in sorted(rel.achados, key=lambda x: (ordem_nivel[x["nivel"]], x["linha"])):
            local = "%s:%s" % (a["arquivo"], a["linha"] or "-")
            print("%s  [%s]  %s — %s → %s" % (local, a["nivel"], a["regra"], a["encontrado"], a["esperado"]))
        b = len(rel.bloqueios())
        c = len([x for x in rel.achados if x["nivel"] == "CORRIGE"])
        v = len([x for x in rel.achados if x["nivel"] == "AVISA"])
        print("\n%d BLOQUEIA · %d CORRIGE · %d AVISA" % (b, c, v))
        print("PUBLICA" if b == 0 else "NÃO PUBLICA — %d bloqueio(s)" % b)

    return 1 if rel.bloqueios() else 0


if __name__ == "__main__":
    sys.exit(main())
