# CHANGELOG — Perla Dashboard

Bitácora cronológica de cambios. Cada entry documenta qué se tocó, qué se decidió, y dónde vivir la info asociada.

---

## Cómo usar este archivo

**Antes de arrancar una feature nueva:**

1. Leer las últimas 3-4 entries.
2. Buscar con ripgrep los archivos que vas a tocar:
   ```
   rg "PerlaWordmark" docs/CHANGELOG.md
   rg "SalonAdminDashboard" docs/CHANGELOG.md
   ```
3. Si detectás overlap con trabajo reciente, coordiná con el otro dev antes del PR.

**Al terminar una feature (en el mismo PR que la feature):**

1. Agregá una entry nueva en el top (formato abajo).
2. Incluí: fecha, short title, commits, areas, files, bullets clave, decisions locked.
3. Si hay spec/plan asociado, linkealo.

**Formato de entry:**

```md
## YYYY-MM-DD — Short title
**Commits:** abc1234, def5678
**Areas:** [pantallas/módulos tocados]
**Files:**
- path/to/file.ts — [qué cambió]
**Changes:**
- Bullet 1
- Bullet 2
**Decisions locked:**
- Decisión 1 (importante para no re-litigar)
**Spec:** docs/superpowers/specs/YYYY-MM-DD-topic.md (si existe)
```

---

## 2026-04-23 — P4 Clientes atención + fix backdrop-filter mobile sheet

**Commits:** `50903fd`
**Areas:** Clientes (lista + filter pipeline), PerlaStatusPanel (mobile render)
**Files:**
- `src/components/generated/mockData.ts` — helper `getClientAttentionState` (reglas 30d/60d/no-shows)
- `src/components/generated/SalonAdminDashboard.tsx` — `ClientsScreen` extendido con sort + tag + chip
- `src/components/dashboard/PerlaStatusPanel.tsx` — portal a document.body para mobile sheet

**Changes:**
- Sort ambient prioriza clientes `en_riesgo` → `activo` → `inactivo`
- Un tag inline por cliente con jerarquía: no-show > en_riesgo > vip > frecuente > inactivo
- Chip "Necesitan atención (N)" solo visible con count > 0, combinable con filtros via AND
- Fix bug: el bottom sheet de `PerlaStatusPanel` se renderizaba detrás de la topbar en mobile porque `backdrop-filter` de la topbar creaba un nuevo containing block para `position: fixed`. Solución: `createPortal(sheet, document.body)`.

**Decisions locked:**
- "Necesitan atención" = solo `en_riesgo` (inactivo es histórico ambient, no accionable)
- Un solo tag por cliente, no apilar
- Sin banner/badge afuera de Clientes — si entrás, te enterás
- Thresholds de estado (30d/60d) son arbitrarios hasta data real, ajustables

**Spec:** `docs/superpowers/specs/2026-04-23-clientes-p4-p5-design.md`
**Plan:** `docs/superpowers/plans/2026-04-23-clientes-p4-p5.md`

---

## 2026-04-23 — P5 Perla Status Panel (popover + bottom sheet)

**Commits:** `2517ac5`
**Areas:** Topbar (wordmark), nuevo componente `PerlaStatusPanel`
**Files:**
- `src/components/dashboard/PerlaStatusPanel.tsx` — **NUEVO**. Popover desktop 320px + bottom sheet mobile
- `src/components/dashboard/PerlaWordmark.tsx` — prop nueva `onWordmarkClick`
- `src/components/dashboard/index.ts` — export
- `src/components/generated/mockData.ts` — `agentStatus`, `agentDailyStats`, `agentActivity`
- `src/components/generated/SalonAdminDashboard.tsx` — cableado en topbar
- `src/index.css` — keyframes `slideUpSheet` + `fadeInBackdrop`

**Changes:**
- Click en el logo "perla•" abre el panel (desktop popover anclado al wordmark / mobile bottom sheet full-width)
- Contenido: status header + 3 KPIs del día + actividad reciente (4 items) + link a `BotSettingsModal`
- Detección viewport vía `window.matchMedia('(max-width: 767px)')`
- Animación `floatIn` 180ms (desktop) / `slideUpSheet` 280ms (mobile)
- Cierre: click afuera / Escape (desktop), backdrop tap / X / grab handle (mobile)

**Decisions locked:**
- "El logo ES la puerta al agente" — click en texto o dot abre el mismo panel
- Panel es informativo, no accionable. Pause/resume vive en `BotSettingsModal` (via footer link)
- Removido `onDotClick={() => setBotSettingsOpen(true)}` del wordmark topbar (competía con `onWordmarkClick`)

---

## 2026-04-23 — Docs: spec + plan P4/P5

**Commits:** `16a2f4a`
**Areas:** Documentación
**Files:**
- `docs/superpowers/specs/2026-04-23-clientes-p4-p5-design.md` — spec con reglas + jerarquía + form factors
- `docs/superpowers/plans/2026-04-23-clientes-p4-p5.md` — plan 10 tasks ejecutables

**Changes:**
- Primer uso de spec-driven development en el proyecto. Framework: superpowers skills (brainstorming → writing-plans → subagent-driven-development).

---

## 2026-04-23 — Rediseño Clientes lista como CRM

**Commits:** `5bc1425`
**Areas:** Clientes
**Files:**
- `src/components/generated/SalonAdminDashboard.tsx` — `ClientsScreen`

**Changes:**
- `clientStats` extendido con `nextApp`, `lastApp`, `confirmedCount`
- Sort por relevancia: con próximo turno → con último turno → alfabético
- Filtro "No leídos" removido (no aplica en CRM, es feature de Mensajes)
- Subtitle contextual por cliente:
  - "Próximo · mañana 11:00 · Coloración" (con próximo turno)
  - "Último hace 3 días · 14 visitas" (con histórico)
  - "Sin turnos aún" (nuevo)
- Helper `formatRelative` para fechas legibles (hoy/mañana/ayer/día de semana)

**Decisions locked:**
- Clientes = CRM (no inbox). Diferenciación explícita con Mensajes.

---

## 2026-04-23 — Polish: design critique fixes

**Commits:** `141420a`
**Areas:** Cross-cutting (Inicio filter, Agenda hero, semanal bars, PendingModal, tooltip)
**Files:**
- `src/components/generated/SalonAdminDashboard.tsx`
- `src/components/dashboard/PerlaWordmark.tsx` — tooltip entrance animation

**Changes:**
- M1 Filter "Pendientes" OFF state: mejor contraste WCAG AA
- M2 Hero Agenda padding reducido: 20/24 → 16/20
- M3 Toggle "Esta semana" segmented control: border + shadow mejorados
- M4 Mini-bars días sin data: track baseline visible (no desaparecen)
- M5 Próximos días formato unificado
- m1 Countdown live en hero ("en 45 min" se actualiza cada 60s)
- m2 ESC cierra `PendingModal`
- m3 Tooltip del dot entrance: translate-y + ease-out 180ms

---

## 2026-04-23 — Sección "Esta semana" en Inicio

**Commits:** `739ac06`
**Areas:** Inicio (nueva sección al final)
**Files:**
- `src/components/generated/SalonAdminDashboard.tsx`

**Changes:**
- Toggle pills turnos ↔ facturación
- Hero number en DM Serif (clamp 36-48px)
- Delta con color semántico (verde/rojo/muted) + icono TrendUp/Down
- Mini bars horizontales por día L-M-M-J-V-S-D (hoy naranja, pasados azul, futuros gris)
- Sub-stats row: métrica secundaria + clientes únicos + no-shows
- Data computada con `useMemo` desde appointments + services
- Comparación vs semana anterior (`startOfWeek` -7 días)

---

## 2026-04-23 — Hub de pendientes + tono calmo

**Commits:** `fd78a18`
**Areas:** Inicio, Agenda, PerlaWordmark (tooltip)
**Files:**
- `src/components/generated/SalonAdminDashboard.tsx`
- `src/components/dashboard/PerlaWordmark.tsx` — prop `dotTooltip`

**Changes:**
- `PendingModal` nuevo: buckets temporales (Hoy/Mañana/Esta semana/Después), acciones por item (Confirmar/Cancelar/Llamar)
- Phone action condicional: desktop copia + toast, mobile `tel:` link nativo
- Agenda toggle "Pendientes (N)" filtra day/week/month
- Inicio más calmo: sacado "X confirmados" redundante, sin pill ámbar prominente
- HERO Agenda sin borderLeft azul ("muy AI")
- Items pending con border completo sutil (mini-card flotante) en lugar de left-border 3px

**Decisions locked:**
- Principio "ambient → urgent" consolidado
- Principio "fondo = atención" aplicado transversalmente

---

## 2026-04-22 — Coherencia visual + regla fondo=atención

**Commits:** `9b1d3a0`
**Areas:** Topbar, Sidebar, Inicio, Agenda, Clientes
**Files:**
- `src/components/generated/SalonAdminDashboard.tsx`

**Changes:**
- **Topbar:** wordmark `perla•` con dot integrado al status del bot (pulse + click), botones uniformes 36×36
- **Sidebar:** 56→68px colapsado, tooltips funcionales
- **Inicio:** greeting alineado con section titles (DM Serif 24px), KPIs conversacionales, próximos turnos sin fondo
- **Agenda:** banner ámbar con pendientes, week/month alignment fixes
- **Clientes:** rediseño con métricas dashboard (turnos/confirmados/no-shows/lifetime)

**Decisions locked:**
- Regla "fondo = atención": lo que tiene fondo requiere acción; el resto es ambiente.

---

## 2026-04-22 — KPI grid layout + glass card redesign

**Commits:** `847fbf9`
**Areas:** Inicio (layout mayor), GlassCard (component), sidebar overlay
**Files:**
- `src/components/generated/SalonAdminDashboard.tsx`
- `src/components/dashboard/GlassCard.tsx`
- `src/index.css`

**Changes:**
- KPI layout 3-col grid: próximo turno (col 1, row-span 2) + 4 metric cards (2×2)
- Agenda del día full-width debajo del grid
- `GlassCard`: background 0.62→0.40 opacity, border teal-tinted `rgba(91,143,166,0.22)`
- `--card-border` token agregado
- Sidebar overlay puro: `main content left: 0` (antes `68px`)
- Cleanup: removidos `hoveredChip`, `chipTooltipData`, `proximoRef`, `agendaHeight`

**Decisions locked:**
- Sidebar = overlay puro, no push layout

---

## 2026-04-21 — Initial commit

**Commits:** `0102d40`
**Changes:** Importación del proyecto base (dashboard_v53 from scaffolded project).

---
