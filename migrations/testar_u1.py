"""Ensaio do SQL da U1 — o índice cross-tenant.

Monta o schema real (0001-0006) e um cenário que hoje não existe em produção:
DUAS funerárias diferentes na MESMA cidade, com uma nota cada. É exatamente o
caso que o guarda-chuva existe para resolver e que nenhum teste anterior cobriu.

Verifica também a armadilha do `t.*` no JOIN: memorial e tenant têm colunas de
mesmo nome (id, slug, cidade, criado_em). Se o alias estiver errado, o índice
mostra o slug da FUNERÁRIA no lugar do slug da NOTA — link quebrado em todas as
linhas, e o tipo de bug que só aparece com dois tenants.
"""
import sqlite3, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
db = sqlite3.connect(":memory:")
db.row_factory = sqlite3.Row
db.executescript("PRAGMA foreign_keys = ON;")
falhas = []


def rodar(arq):
    with open(os.path.join(BASE, arq), encoding="utf-8") as f:
        db.executescript(f.read())


for f in ("0001_init.sql", "0002_config.sql", "0003_dominio.sql",
          "0004_cidade.sql", "0005_marca.sql", "0006_backfill_cidade.sql"):
    rodar(f)
print("schema 0001-0006 aplicado")

# --- cenário: Foz do Iguaçu com DUAS funerárias concorrentes ---
db.executescript("""
INSERT INTO cidade (id, slug, nome, uf) VALUES ('cid-foz','foz-do-iguacu-pr','Foz do Iguaçu','PR');

INSERT INTO tenant (id, slug, nome, cidade, uf, telefone, whatsapp, cor_marca,
                    cidade_id, logo_url, site_url) VALUES
 ('t-a','modelo-a','Funerária Modelo','Foz do Iguaçu','PR','','5545900000001','#c8a04e',
  'cid-foz','/api/fotos/logo-a.png','https://funerariamodelo.com.br'),
 ('t-b','santa-rita','Funerária Santa Rita','Foz do Iguaçu','PR','','5545900000002','#2f5d50',
  'cid-foz',NULL,NULL);

-- slug de NOTA propositalmente diferente do slug de TENANT, para flagrar troca
INSERT INTO memorial (id, tenant_id, slug, nome_completo, falecimento_iso,
                      nascimento_iso, idade, status, cidade_id) VALUES
 ('mA','t-a','joao-batista-pereira','João Batista Pereira','2026-08-04','1939-01-02',87,'publicado','cid-foz'),
 ('mB','t-b','terezinha-de-almeida','Terezinha de Almeida','2026-08-05','1955-03-10',71,'publicado','cid-foz'),
 ('mC','t-a','rascunho-nao-publicado','Fulano Rascunho','2026-08-06',NULL,NULL,'rascunho','cid-foz');

INSERT INTO evento (id, memorial_id, tipo, local_nome, inicio_iso, horario_confirmado) VALUES
 ('e1','mB','velorio','Capela Central','2026-08-06T14:00:00',1),
 ('e2','mA','velorio','Capela São José','2026-08-05T09:00:00',0);
""")

SQL_INDICE = """
SELECT m.id AS m_id, m.slug AS m_slug, m.nome_completo, m.foto_url,
       m.nascimento_iso, m.falecimento_iso, m.idade, t.*,
       (SELECT MIN(e.inicio_iso) FROM evento e
         WHERE e.memorial_id = m.id AND e.tipo='velorio'
           AND e.horario_confirmado = 1 AND e.inicio_iso IS NOT NULL) AS velorio_inicio
  FROM memorial m JOIN tenant t ON t.id = m.tenant_id
 WHERE m.cidade_id = ? AND m.status='publicado'
 ORDER BY m.falecimento_iso DESC, m.criado_em DESC LIMIT ? OFFSET ?
"""

print("\n== índice de foz-do-iguacu-pr ==")
linhas = db.execute(SQL_INDICE, ("cid-foz", 60, 0)).fetchall()
for r in linhas:
    print(f"  /{r['m_slug']:<24} {r['nome_completo']:<22} -> {r['nome']:<22} "
          f"cor {r['cor_marca']} velório={r['velorio_inicio'] or '-'}")

# 1. cross-tenant de fato
if len(linhas) != 2:
    falhas.append(f"esperava 2 notas publicadas, veio {len(linhas)}")
if {r["nome"] for r in linhas} != {"Funerária Modelo", "Funerária Santa Rita"}:
    falhas.append("as duas funerárias não apareceram no mesmo índice")

# 2. rascunho não vaza
if any(r["m_slug"] == "rascunho-nao-publicado" for r in linhas):
    falhas.append("rascunho apareceu no índice público")

# 3. a armadilha do t.*: m_slug tem que ser o slug da NOTA
if linhas[0]["m_slug"] == linhas[0]["slug"]:
    falhas.append("m_slug colidiu com o slug do tenant")
if {r["m_slug"] for r in linhas} != {"joao-batista-pereira", "terezinha-de-almeida"}:
    falhas.append("slug da nota veio errado (colisão de coluna no JOIN)")
# t.* deve ter sobrescrito `id` com o do tenant — é assim que toFunerariaDTO lê
if {r["id"] for r in linhas} != {"t-a", "t-b"}:
    falhas.append("coluna id não é a do tenant — toFunerariaDTO devolveria id errado")

# 4. ordenação por falecimento decrescente
if [r["m_slug"] for r in linhas] != ["terezinha-de-almeida", "joao-batista-pereira"]:
    falhas.append("ordem não é por falecimento decrescente")

# 5. velório: só horário CONFIRMADO vira selo
por_slug = {r["m_slug"]: r for r in linhas}
if por_slug["terezinha-de-almeida"]["velorio_inicio"] != "2026-08-06T14:00:00":
    falhas.append("velório confirmado não veio")
if por_slug["joao-batista-pereira"]["velorio_inicio"] is not None:
    falhas.append("velório NÃO confirmado virou selo — não pode")

# 6. logo ausente não quebra (fallback monograma)
if por_slug["terezinha-de-almeida"]["logo_url"] is not None:
    falhas.append("logo_url deveria ser NULL para Santa Rita")

print("\n== nota individual: tenant vem da NOTA, não do host ==")
SQL_NOTA = """
SELECT m.*, (SELECT nome FROM tenant WHERE id = m.tenant_id) AS dona
  FROM memorial m JOIN cidade c ON c.id = m.cidade_id
 WHERE c.slug = ? AND m.slug = ? AND m.status='publicado' LIMIT 1
"""
for slug, esperado in (("joao-batista-pereira", "Funerária Modelo"),
                       ("terezinha-de-almeida", "Funerária Santa Rita")):
    r = db.execute(SQL_NOTA, ("foz-do-iguacu-pr", slug)).fetchone()
    print(f"  /{slug} -> {r['dona']}")
    if r["dona"] != esperado:
        falhas.append(f"{slug} devolveu a funerária errada")

r = db.execute(SQL_NOTA, ("foz-do-iguacu-pr", "rascunho-nao-publicado")).fetchone()
print(f"  rascunho acessível por URL direta: {'SIM' if r else 'não'}")
if r:
    falhas.append("rascunho acessível pela rota pública")

print("\n== cidade inexistente ==")
r = db.execute("SELECT id FROM cidade WHERE slug = ?", ("cidade-que-nao-existe",)).fetchone()
print(f"  encontrada: {'SIM' if r else 'não'}  (não = 404 correto)")
if r:
    falhas.append("cidade inexistente resolveu")

print("\n== 'outras notas da cidade' (bloco D4) ==")
outras = db.execute("""
SELECT m.slug AS m_slug, t.nome FROM memorial m
  JOIN cidade c ON c.id = m.cidade_id JOIN tenant t ON t.id = m.tenant_id
 WHERE c.slug=? AND m.slug != ? AND m.status='publicado'
 ORDER BY m.falecimento_iso DESC LIMIT 6""",
 ("foz-do-iguacu-pr", "terezinha-de-almeida")).fetchall()
for o in outras:
    print(f"  {o['m_slug']} ({o['nome']})")
if [o["m_slug"] for o in outras] != ["joao-batista-pereira"]:
    falhas.append("bloco 'outras notas' errado")

print("\n== isolamento: Catanduvas não vê Foz ==")
n = db.execute("""SELECT COUNT(*) FROM memorial m JOIN cidade c ON c.id=m.cidade_id
                  WHERE c.slug='catanduvas-pr' AND m.status='publicado'""").fetchone()[0]
print(f"  notas em catanduvas-pr: {n}  (esperado 0 — o backfill real não roda aqui)")

print("\n" + ("FALHOU: " + "; ".join(falhas) if falhas else "TUDO OK — nenhuma falha."))
sys.exit(1 if falhas else 0)
