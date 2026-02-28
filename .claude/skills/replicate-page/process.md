# Processo de Replicacao de Pagina

Documentacao detalhada do pipeline de replicacao visual usado neste projeto.

## Visao Geral

O processo replica paginas web a partir de screenshots, usando um pipeline de 4 fases
com subagentes especializados. A chave e **nunca hardcodar valores visuais** — tudo
passa por um design system intermediario com CSS custom properties.

## Por que este processo funciona

1. **Design System como contrato**: tokens CSS sao a interface entre design e codigo
2. **Dark mode gratis**: tokens semanticos com variantes light/dark
3. **Consistencia**: componentes consomem tokens, nao valores magicos
4. **Manutenibilidade**: mudar uma cor no token atualiza toda a pagina

## Fluxo

```
Screenshots ─── Fase 1 ──► Design System (tokens CSS)
    │                           │
    │                           ▼
    └───────── Fase 2 ──► Plano (estrutura + dados)
                                │
                                ▼
                   Fase 3 ──► Implementacao (page.tsx)
                                │
                                ▼
                   Fase 4 ──► Verificacao Visual
                                │
                            ┌───┴───┐
                            │       │
                         APROVADO  CORRIGIR ──► volta Fase 3
```

## Fase 1: Extracao de Design System

### O que extrair dos screenshots

1. **Paleta de cores primitivas**
   - Backgrounds (primario, secundario, terciario)
   - Textos (primario, secundario, terciario)
   - Bordas (primaria, secundaria, sutil)
   - Acentos (destaque, links, icones)

2. **Tipografia**
   - Font families (serif para titulos, sans para body, mono para codigo)
   - Font sizes (display, headings, body, small, xs)
   - Font weights (regular, medium, semibold, bold)

3. **Espacamento e radii**
   - Border radius (small, medium, pill)
   - Padding patterns

4. **Componentes**
   - Botoes (estilo, padding, borda)
   - Badges (pills, tags)
   - Cards/surfaces
   - Tabelas
   - Headers

### Estrutura dos tokens

```css
:root {
  /* Primitivos — nunca usados diretamente em componentes */
  --sf-white: #ffffff;
  --sf-gray-100: #f5f5f5;
  /* ... */

  /* Semanticos — usados nos componentes */
  --color-bg-primary: var(--sf-white);
  --color-text-primary: var(--sf-gray-900);
  /* ... */
}

[data-theme="dark"] {
  --color-bg-primary: var(--sf-gray-950);
  --color-text-primary: var(--sf-gray-100);
  /* ... */
}
```

### Resultado esperado
- `app/globals.css` com tokens primitivos + semanticos + dark mode
- `app/design-system/page.tsx` com documentacao visual dos tokens
- `app/design-system/components/theme-toggle.tsx` com toggle system/light/dark

## Fase 2: Planejamento

### O que analisar

1. **Secoes da pagina**: hero, header, content, tables, CTAs, footer
2. **Dados reais**: extrair textos, numeros, nomes dos screenshots
3. **Hierarquia**: qual componente contem qual
4. **Links**: URLs externas visiveis
5. **Comportamentos**: sticky headers, scroll effects

### Formato do plano

```markdown
## Estrutura
1. Sticky Header — glass-morphism, logo + botao + toggle
2. Hero — titulo serif 72px, definicoes, creditos
3. Leaderboard — tabela com N linhas
4. CTA Banner — chamada + botao

## Dados
| # | Nome | Descricao | ... |

## Tokens por secao
- Header: bg-glass, border-subtle, surface-elevated
- Hero: text-primary (titulo), text-secondary (subtitulo)
```

## Fase 3: Implementacao

### Regras de ouro

1. **Cores**: `var(--color-token)` — NUNCA `#hex` ou `rgb()`
2. **Fontes**: definir stacks como constantes JS, usar var() para custom fonts
3. **Componentes client**: apenas onde necessario (ThemeToggle). Pagina pode ser server component
4. **Inline styles**: seguir padrao do design-system para consistencia com tokens
5. **Build**: `npm run build` deve passar

### Checklist

- [ ] Todas as secoes do plano implementadas
- [ ] Todos os dados reais inseridos
- [ ] Dark mode funcional
- [ ] ThemeToggle integrado
- [ ] Layout responsivo basico (overflow-x em tabelas)
- [ ] Build sem erros

## Fase 4: Verificacao Visual

### Processo

1. Dev server rodando
2. Screenshot em light mode (full page)
3. Screenshot em dark mode (full page)
4. Comparacao com referencia:
   - Layout e proporcoes
   - Cores e contraste
   - Tipografia e pesos
   - Espacamentos
   - Dados corretos

### Criterios de aprovacao

- Estrutura fiel (mesmas secoes, mesma ordem)
- Cores compativeis (tokens corretos, dark mode funcional)
- Tipografia correta (serif/sans/mono nos lugares certos)
- Dados corretos (textos, numeros, nomes)

## Subagentes

| Subagente | Funcao | Model | Tools |
|---|---|---|---|
| ds-extractor | Extrai tokens de screenshots | opus | Read, Write, Edit, Glob |
| page-planner | Planeja estrutura da pagina | opus | Read, Glob, Grep |
| page-builder | Implementa o codigo | opus | Read, Write, Edit, Glob, Grep, Bash |
| visual-verifier | Compara screenshots | sonnet | Read, Glob, Bash, MCP chrome-devtools |

## Exemplo Real: slopforks.com

Este processo foi usado para replicar a home do slopforks.com neste repositorio.

### Resultado
- **Design System**: 14 cores primitivas, 14 tokens semanticos, 3 font stacks, 3 radii
- **Componentes**: ThemeToggle, sticky header, language badges, star counts, fork badges
- **Pagina**: hero com definicao, leaderboard com 11 projetos, CTA banner
- **Dark mode**: funcional via `[data-theme="dark"]`
- **Build**: passa sem erros
