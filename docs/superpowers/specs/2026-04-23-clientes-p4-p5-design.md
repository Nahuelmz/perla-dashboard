# Design Spec — Clientes P4 (Necesitan atención) + P5 (Perla Status Panel)

**Fecha:** 2026-04-23
**Proyecto:** Perla Dashboard (`dashboard_v53`)
**Autor:** Nahuel + Claude
**Status:** Approved, ready for implementation plan

---

## Contexto

Dos tensiones de UX sobre el dashboard Perla:

- **P4 — "Necesitan tu atención":** features de CRM que detectan clientes en riesgo de churn. El spec de Clientes ya define estados `activo · en riesgo · inactivo`, pero falta la forma visual de surface los casos accionables sin convertir Clientes en un tablero de alertas.
- **P5 — "Tu agente Activo":** info sobre qué está haciendo Perla (status, stats del día, actividad reciente). Nahuel quiere tenerlo accesible pero NO como card permanente que ocupe real estate en el Inicio o Clientes.

El principio rector del dashboard es **"Ambient → Urgent"**: por default todo está calmo, solo se vuelve prominente cuando hay acción. Estas dos features tienen que respetarlo.

---

## Decisiones clave

| Tensión | Solución |
|---|---|
| P5 no debe ocupar pantalla permanente | Se accede clickeando el `PerlaWordmark` — el logo ES la puerta al agente |
| P5 necesita lugar en desktop y mobile | Popover (desktop) + bottom sheet (mobile) |
| P4 no debe gritar pero tiene que ser accionable | Sort ambient por default (capa A) + filter chip opcional (capa B) |
| P4 no duplica señal afuera de Clientes | Sin badge en sidebar/bottom nav; si entrás a Clientes te enterás |

---

## P5 — Perla Status Panel

### Componente

**Nuevo:** `src/components/dashboard/PerlaStatusPanel.tsx`

Un solo componente con dos modos de render seleccionados por `window.matchMedia('(max-width: 767px)')`:

- **Desktop:** popover `position: absolute`, ancho `320px`, anchored al wordmark con gap `12px` top. Animation `floatIn` 180ms (keyframe ya existente en `index.css`).
- **Mobile:** bottom sheet full-width, `max-height: 75vh`, altura auto según contenido. Slide-from-bottom 240ms cubic-bezier. Backdrop tap cierra.

### Trigger

Extender `PerlaWordmark` con prop nueva `onWordmarkClick: () => void`. Cuando está presente, tanto el texto "perla" como el dot son clickeables y disparan el mismo handler. `onDotClick` se mantiene por compat con `LoginScreen`.

Mental model: el logo entero ES el agente, clickearlo lo abre.

### Contenido

```
┌──────────────────────────────┐
│ [●] Activo                   │  Header: status pill + dot con pulse si activo
│ perla está respondiendo      │  Subtítulo contextual (T.text3)
├──────────────────────────────┤
│  12       8       94%        │  3 KPIs del día (números grandes DM Serif)
│  turnos   msjs    confirm.   │  Labels uppercase 9.5px letterSpacing .12em
├──────────────────────────────┤
│ Actividad reciente           │  Section label
│ · Confirmó a Sofía · 2h      │
│ · Agendó a Matías · 5h       │  3-4 entries, timestamp JetBrains Mono 11px
│ · Reagendó · ayer            │
├──────────────────────────────┤
│ Configurar agente →          │  Footer link T.text3 → abre BotSettingsModal
└──────────────────────────────┘
```

- Status header es **informativo**, no accionable. No hay toggle pause/resume acá.
- Footer link abre el `BotSettingsModal` existente (no pantalla nueva).

### Data (mock)

Extender `mockData.ts`:

```ts
agentStatus: { state: 'active' | 'paused', since: Date }
agentDailyStats: { turnos: number, mensajes: number, confirmRate: number }
agentActivity: Array<{ id, type, label, timeAgo }>  // top 4
```

Estructura lista para recibir datos vivos en Capa 2.

### Accesibilidad

- `role="dialog"`, `aria-label="Estado del agente Perla"`
- Focus trap mientras está abierto
- `Escape` cierra
- Click afuera cierra (desktop) / backdrop tap (mobile)

### Integración

El state del panel (`open: boolean`) vive en `SalonAdminDashboard.tsx`. El `PerlaWordmark` de la topbar recibe `onWordmarkClick={() => setAgentPanelOpen(true)}`. El `PerlaStatusPanel` se renderiza al top level del dashboard con `open` + `onClose`.

---

## P4 — Necesitan atención en Clientes

### Reglas de estado

Helper puro al lado del `clientStats` useMemo existente en `SalonAdminDashboard.tsx`:

```ts
getClientAttentionState(client, appointments, now): 'activo' | 'en_riesgo' | 'inactivo'
```

| Estado | Regla |
|---|---|
| `activo` | Turno confirmado en los últimos 30 días |
| `en_riesgo` | Último turno entre 31 y 60 días atrás, **O** tiene ≥1 no-show en los últimos 60 días |
| `inactivo` | Sin turnos en más de 60 días, o nunca vino |

Thresholds arbitrarios hasta tener data real — se ajustan después.

**"Necesitan atención" = solo `en_riesgo`.** Los `inactivo` son histórico ambient, no son accionables hoy.

### Capa A — Ambient (default, sin interacción)

**Sort prioritizado:** el `useMemo` de lista ordenada añade `attentionState` como primer criterio:

1. `en_riesgo` primero (accionables)
2. `activo` después
3. `inactivo` al final (ambient, no molestan)
4. Dentro de cada grupo: sort actual (`nextApp` asc → `lastApp` desc → alfabético)

**Tag inline** en cada item de lista, al lado de los tags `vip/frecuente` ya existentes:

```
[ no-show ]    → T.orange sobre rgba(255,148,77,0.08), sin borde. Más específico/urgente que "en riesgo".
[ en riesgo ]  → mismo estilo que no-show, menos específico.
[ inactivo ]   → T.text3 sobre transparente. Ambient.
```

**Jerarquía (solo se muestra un tag por cliente):**

`no-show` > `en riesgo` > `vip` > `frecuente` > `inactivo`

- Un VIP con no-show muestra `no-show` (la urgencia manda sobre el rango).
- Un cliente normal en riesgo muestra `en riesgo`.
- Un VIP sano muestra `vip`.
- Un `inactivo` solo muestra ese tag si no tiene ningún otro — es el menos informativo.

### Capa B — Focus mode (chip opcional)

Nuevo chip al lado de los filtros existentes:

```
Necesitan atención (3)
```

Reglas:

- **Solo aparece si `count > 0`.** Si no hay `en_riesgo`, el chip no existe.
- Estilo: shape igual que los otros chips, `T.orange` en el número, borde sutil `rgba(255,148,77,0.25)`.
- Número en `fontVariantNumeric: 'tabular-nums'`.
- Click: aplica filtro que muestra solo `en_riesgo`. Toggle (segundo click lo saca).
- **Combinable** con filtros de estado (VIP, Frecuente) — lógica AND. "VIP + Necesitan atención" = VIPs por churnear.

### State management

Extender el `filterState` existente en `ClientsScreen`:

```ts
{ status, search, attentionOnly: boolean }  // nuevo campo
```

El filter pipeline se extiende para AND-ear la condición.

### Qué NO hacemos

- ❌ Banner arriba de la lista ("3 clientes en riesgo")
- ❌ Badge numérico en sidebar/bottom nav en Clientes
- ❌ Notificación push / alert modal
- ❌ Pantalla separada de "alertas"

---

## Archivos afectados

| Archivo | Cambios |
|---|---|
| `src/components/dashboard/PerlaWordmark.tsx` | Agregar prop `onWordmarkClick`, hacer texto clickeable |
| `src/components/dashboard/PerlaStatusPanel.tsx` | **Nuevo** — componente popover/sheet con status + KPIs + actividad |
| `src/components/dashboard/index.ts` | Exportar `PerlaStatusPanel` |
| `src/components/generated/mockData.ts` | Agregar `agentStatus`, `agentDailyStats`, `agentActivity`, helper `getClientAttentionState` |
| `src/components/generated/SalonAdminDashboard.tsx` | (1) State `agentPanelOpen`. (2) Cablear `onWordmarkClick` en la topbar. (3) Render `PerlaStatusPanel`. (4) Extender `clientStats` con `attentionState`. (5) Modificar sort de lista Clientes. (6) Agregar tag inline en item. (7) Agregar chip "Necesitan atención" + `attentionOnly` en filterState. |
| `src/index.css` | Agregar keyframe `slideUpSheet` (slide from bottom con opacity fade) + clase `.anim-slide-up-sheet`. `floatIn` ya existe y se reusa para desktop popover. |

---

## Interacciones entre P4 y P5

Ninguna dependencia directa entre features, pero comparten el principio "ambient → urgent" y pueden ser shipeadas independientemente.

**Orden recomendado:**

1. **P5 primero** (Perla popover) — menos riesgo, toca menos código, valida el patrón click-on-logo y el componente popover/sheet (sirve para futuros usos).
2. **P4 después** (Clientes atención) — toca la lógica del `clientStats` y UI de Clientes, más cerca de la logica del negocio.

Cada uno es commit independiente.

---

## Verificación

- **P5 desktop:** click en wordmark → popover aparece anclado, anim `floatIn`. Click afuera cierra. Escape cierra.
- **P5 mobile:** resize a 390px → click wordmark → sheet slide-from-bottom. Backdrop tap cierra. Contenido legible sin scroll horizontal.
- **P4 ambient:** navegar a Clientes con clientes `en_riesgo` presentes → aparecen primero en la lista, tag visible en cada uno.
- **P4 focus:** chip "Necesitan atención (N)" visible si hay casos. Click → lista filtrada. Toggle funciona. Combinable con otros filtros.
- **P4 zero state:** si no hay `en_riesgo`, chip no aparece.
- **Accesibilidad:** tab navigation por popover/sheet OK. Screen reader anuncia role y label.
- **TypeScript:** `npm run build` sin errores.

---

## Fuera de scope (Capa 2)

- Segmentación automática de clientes
- Alertas de churn en tiempo real
- Patrones estacionales
- Data real conectada (todo sigue mock)
- Pause/resume del agente desde el popover (sigue en `BotSettingsModal`)
- Enviar mensajes masivos desde Clientes
