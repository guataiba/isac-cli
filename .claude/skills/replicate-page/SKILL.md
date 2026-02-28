---
name: replicate-page
description: Replica uma pagina web a partir de screenshots de referencia. Orquestra subagentes especializados para extrair design system, planejar, implementar e verificar visualmente. Use quando precisar clonar/replicar uma interface.
disable-model-invocation: true
argument-hint: [screenshot-dir]
---

# Pipeline de Replicacao de Pagina

Voce e um orquestrador que coordena subagentes especializados para replicar uma pagina web a partir de screenshots de referencia.

Para documentacao detalhada do processo, consulte [process.md](process.md).

## Entrada

- `$ARGUMENTS`: diretorio com screenshots de referencia (default: `.claude/screenshots/`)
- O diretorio deve conter screenshots PNG/JPG da pagina alvo

## Pre-requisitos

Antes de iniciar, verifique:
1. Screenshots existem no diretorio fornecido
2. Projeto Next.js esta configurado (package.json com next)
3. `app/globals.css` existe

## Pipeline de 4 Fases

Execute as fases **sequencialmente**. Cada fase depende da anterior.

---

### Fase 1: Extracao de Design System

Delegue ao subagente **ds-extractor** com o prompt:

> Analise os screenshots em `$ARGUMENTS` e extraia o design system completo.
> Crie:
> 1. CSS custom properties em `app/globals.css` com tokens light/dark
> 2. Pagina de documentacao em `app/design-system/page.tsx`
> 3. Componente ThemeToggle em `app/design-system/components/theme-toggle.tsx`
>
> Use o template em `.claude/skills/replicate-page/templates/design-tokens.css` como referencia.
> Screenshots estao em: `$ARGUMENTS`

**Criterio de sucesso**: `app/globals.css` contem tokens semanticos com variantes light e dark.

---

### Fase 2: Planejamento

Delegue ao subagente **page-planner** com o prompt:

> Analise os screenshots em `$ARGUMENTS` e o design system em `app/globals.css` e `app/design-system/page.tsx`.
> Crie um plano detalhado cobrindo:
> 1. Estrutura de secoes da pagina (hero, header, tabelas, CTAs, footer)
> 2. Dados reais extraidos dos screenshots (textos, numeros, nomes)
> 3. Hierarquia de componentes
> 4. Mapeamento de cada elemento visual para tokens CSS
> 5. Links externos visiveis nos screenshots
>
> Retorne o plano completo como texto estruturado.

**Criterio de sucesso**: plano identifica todas as secoes visiveis nos screenshots com dados concretos.

---

### Fase 3: Implementacao

Delegue ao subagente **page-builder** com o prompt:

> Implemente a pagina em `app/page.tsx` seguindo este plano:
> [INSERIR PLANO DA FASE 2]
>
> Regras obrigatorias:
> - Use APENAS `var(--token)` para cores — NUNCA valores hex/rgb hardcoded
> - Suporte dark mode via `[data-theme="dark"]` (ja configurado no globals.css)
> - Reutilize ThemeToggle de `app/components/theme-toggle.tsx` (copie de design-system se nao existir)
> - Atualize metadata em `app/layout.tsx`
> - Rode `npm run build` ao final para validar
>
> Design system esta em: `app/globals.css`
> Referencia visual: screenshots em `$ARGUMENTS`

**Criterio de sucesso**: `npm run build` passa sem erros.

---

### Fase 4: Verificacao Visual

Delegue ao subagente **visual-verifier** com o prompt:

> Verifique a implementacao comparando com os screenshots de referencia.
> 1. Inicie `npm run dev` se nao estiver rodando
> 2. Navegue para http://localhost:3000
> 3. Capture screenshot da pagina completa em light mode
> 4. Capture screenshot em dark mode
> 5. Compare visualmente com os screenshots em `$ARGUMENTS`
> 6. Liste diferencas encontradas (layout, cores, tipografia, espacamento, dados)
>
> Reporte: APROVADO se fiel, ou lista de correcoes necessarias.

**Criterio de sucesso**: pagina visualmente fiel ao screenshot de referencia em ambos os modos.

---

## Loop de Correcao

Se a Fase 4 reportar problemas:
1. Delegue correcoes ao **page-builder** com a lista de problemas
2. Re-execute a Fase 4
3. Repita ate APROVADO (maximo 3 iteracoes)

## Resultado Final

Ao concluir, resuma:
- Arquivos criados/modificados
- Tokens do design system
- Secoes da pagina implementadas
- Status da verificacao visual
