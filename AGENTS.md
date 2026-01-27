# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

GEO Nexus is an **AI Search Optimization Operations Platform** for Generative Engine Optimization (GEO). It helps brands monitor and optimize their presence in AI search engines like ChatGPT, Kimi, and Wenxin.

**Tech Stack**: Next.js 14 (App Router), TypeScript 5.x, Tailwind CSS, shadcn/ui, Zustand (state), LocalStorage (persistence), Dify (AI engine)

## Development Commands

### Essential Commands
```bash
# Start development server (default port: 3000)
npm run dev

# Build production bundle
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Adding UI Components
```bash
# Add shadcn/ui component
npx shadcn@latest add [component-name]
```

### Environment Setup
Required `.env.local` file:
```bash
DIFY_API_KEY=app-xxxxxxxxxxxxxxxx
DIFY_API_BASE_URL=https://api.dify.ai/v1  # Optional
DATABASE_URL=prisma+postgres://...         # For future DB migration
```

## Architecture Principles

### Unified AI API Pattern
**All AI features route through a single Dify application** using `task_type` parameter for routing:

- **API Route**: `/api/dify` (POST only)
- **Client**: `src/lib/dify-client.ts`
- **Request Pattern**:
  ```typescript
  {
    task_type: string,          // Routes to different workflows
    inputs: Record<string, string>,
    query?: string,             // Required for Chat mode
    user: string,
    response_mode: "streaming" | "blocking"
  }
  ```

**Task Type Routing**:
- `diagnosis_*` → Chat mode (multi-turn conversations)
- `content_*` → Completion mode (single generation)
- `monitor_search` → Chat mode

### State Management Pattern
**Zustand stores with LocalStorage persistence** - no database currently:

```typescript
// All stores follow this pattern:
create<State>()(
  persist(
    (set) => ({ /* state and actions */ }),
    { name: "geo-nexus-[module]" }
  )
)
```

**Store Files**:
- `src/store/useProductStore.ts` - Products
- `src/store/useCompetitorStore.ts` - Competitors  
- `src/store/useQueryStore.ts` - Monitor queries
- `src/store/useMonitorStore.ts` - Monitor tasks & results
- `src/store/useDiagnosisStore.ts` - Diagnosis history
- `src/store/useContentStore.ts` - Content generation history
- `src/store/useTaskStore.ts` - Workflow tasks (Kanban)
- `src/store/useSettingsStore.ts` - System settings

### SSR Hydration Pattern
**All pages check mount state** before rendering store data:
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <LoadingSkeleton />;
```

### Streaming Response Pattern
**All AI interactions use Server-Sent Events (SSE)**:
- Frontend: `sendDifyRequest()` with callbacks (`onMessage`, `onComplete`, `onError`)
- Backend: `/api/dify/route.ts` proxies to Dify and streams back
- Parse SSE events starting with `data: ` prefix

## Project Structure Deep Dive

### Module Architecture
```
src/
├── app/                          # Next.js App Router pages
│   ├── api/dify/route.ts        # **SINGLE API ENDPOINT** for all AI
│   ├── page.tsx                 # Dashboard (Alt+1)
│   ├── product-manager/         # Product CRUD (Alt+2)
│   ├── competitors/             # Competitor management (Alt+3)
│   ├── geo-diagnosis/           # GEO diagnosis (Alt+4)
│   ├── ai-monitor/              # AI ranking monitor (Alt+5)
│   ├── content-factory/         # Content generation (Alt+6)
│   ├── workflow/                # Kanban tasks (Alt+7)
│   ├── settings/                # System settings (Alt+8)
│   ├── query-library/           # Monitor question library
│   └── report/                  # Monitor reports
│
├── components/
│   ├── layout/Sidebar.tsx       # Responsive sidebar with mobile support
│   ├── charts/                  # Recharts visualizations
│   │   ├── GeoRadar.tsx        # Multi-dimensional GEO scores
│   │   ├── RankingTrend.tsx    # Time-series ranking chart
│   │   └── GeoHealthScore.tsx  # Circular health gauge
│   ├── workflow/KanbanBoard.tsx # Drag-and-drop task board
│   ├── providers/KeyboardProvider.tsx  # Global hotkeys
│   └── ui/                      # shadcn/ui base components
│
├── hooks/
│   ├── useMonitorExecution.ts   # **Complex AI monitor orchestration**
│   └── useKeyboardShortcuts.ts  # Global keyboard navigation
│
├── lib/
│   ├── dify-client.ts           # **Core AI API client**
│   ├── export-utils.ts          # CSV export utilities
│   └── utils.ts                 # Tailwind cn() helper
│
├── store/                       # All Zustand stores (see above)
└── types/                       # TypeScript definitions
    ├── monitor.ts               # AI models config & types
    └── *.ts                     # Other domain types
```

### Critical Implementation Details

#### 1. AI Monitor Execution Flow
**File**: `src/hooks/useMonitorExecution.ts`

This hook orchestrates **complex multi-model AI monitoring**:
- Executes tasks sequentially across multiple AI models
- Parses AI responses to extract brand mentions, rankings, sentiment
- Supports batch execution with progress tracking
- Uses heuristic pattern matching for ranking extraction
- Implements rate limiting (500ms delay between models)

**Key function**: `parseAIResponse()` - extracts structured data from free-form AI text

#### 2. Dify API Client
**File**: `src/lib/dify-client.ts`

Features:
- SSE stream parser with buffer management
- Convenience methods: `sendDiagnosis()`, `generateContent()`, `monitorSearch()`
- React-friendly `createStreamHandler()` for state updates
- Backward-compatible deprecated methods

#### 3. API Route Proxy
**File**: `src/app/api/dify/route.ts`

- Determines Chat vs Completion mode based on `task_type` prefix
- Injects `task_type` into `inputs` for Dify workflow routing
- Streams responses back to client
- Error handling with detailed logging

## Common Development Workflows

### Adding a New AI Task Type

1. **Define task type** in `src/lib/dify-client.ts`:
   ```typescript
   export type TaskType = 
     | "existing_types"
     | "new_task_type";  // Add here
   ```

2. **Update route logic** in `src/app/api/dify/route.ts`:
   ```typescript
   function getAppType(taskType: string): AppType {
     if (taskType.startsWith("new_prefix_")) return "chat";
     // ...
   }
   ```

3. **Configure Dify workflow** with conditional branch on `task_type`

4. **Add UI** in appropriate module page

### Adding a New Module

1. Create route folder: `src/app/[module-name]/page.tsx`
2. Define types: `src/types/[module].ts`
3. Create store: `src/store/use[Module]Store.ts` with persist middleware
4. Update sidebar: `src/components/layout/Sidebar.tsx` (add navigation item)
5. Add keyboard shortcut in `src/hooks/useKeyboardShortcuts.ts`

### Working with LocalStorage Data

**Viewing data**:
```javascript
// Browser console
Object.keys(localStorage)
  .filter(k => k.startsWith('geo-nexus'))
  .forEach(k => console.log(k, localStorage.getItem(k)));
```

**Clearing data**:
```javascript
// Use Settings page UI, or console:
Object.keys(localStorage)
  .filter(k => k.startsWith('geo-nexus'))
  .forEach(k => localStorage.removeItem(k));
location.reload();
```

## Important Constraints

### Data Persistence
- **NO database integration yet** - all data in LocalStorage (5MB browser limit)
- Prisma schema exists (`prisma/schema.prisma`) but not connected
- LocalStorage keys prefixed with `geo-nexus-`
- Data can be exported as CSV via Settings page

### Dify Integration
- **Single Dify app** handles all AI tasks via `task_type` routing
- Must configure conditional branches in Dify workflow UI
- API Key stored server-side in `.env.local`
- All AI calls are streaming (SSE) by default

### TypeScript Configuration
- Path alias: `@/*` maps to `src/*`
- Strict mode enabled
- Prisma client output: `src/generated/prisma` (not used yet)

### Styling Conventions
- Tailwind CSS with slate color palette
- shadcn/ui components (no custom CSS files)
- Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- Mobile sidebar hides automatically, shows hamburger menu

## Keyboard Shortcuts Reference

Global navigation (defined in `src/hooks/useKeyboardShortcuts.ts`):
- `Alt+1` → Dashboard
- `Alt+2` → Product Manager  
- `Alt+3` → Competitors
- `Alt+4` → GEO Diagnosis
- `Alt+5` → AI Monitor
- `Alt+6` → Content Factory
- `Alt+7` → Workflow
- `Alt+8` → Settings
- `?` → Show keyboard shortcuts help dialog

## Testing & Validation

**No test suite exists yet** - validation done manually:
- Start dev server and test in browser
- Check browser console for errors
- Verify LocalStorage updates in DevTools → Application → Local Storage
- Test AI features with valid `DIFY_API_KEY`

**Linting**:
```bash
npm run lint
```

## Future Migration Notes

**Phase 2 planning** (see `PRD_PHASE2.md`):
- Migration from LocalStorage → PostgreSQL
- User authentication system
- Scheduled monitoring (cron jobs)
- API platform for third-party integrations

When migrating to database:
- Prisma schema already scaffolded
- Store files will need adapter layer
- Keep LocalStorage as cache layer
- Implement data migration script

## Troubleshooting

### Common Issues

**"DIFY_API_KEY is not configured"**:
- Ensure `.env.local` exists with `DIFY_API_KEY=app-...`
- Restart dev server after adding env vars

**LocalStorage full error**:
- Export data via Settings page
- Clear old monitor task results
- Consider archiving historical data

**Hydration mismatch errors**:
- Check for `mounted` state guard in page components
- Don't render store data during SSR

**Stream not working**:
- Verify Dify API endpoint is correct
- Check browser console for SSE connection errors
- Ensure response_mode is "streaming"

### Debug Tips

**Enable API logging**:
Check console logs in `/api/dify/route.ts` - logs task_type and endpoint

**Inspect SSE stream**:
Open Network tab → Filter by "dify" → Check Response tab for SSE events

**Monitor state changes**:
```typescript
// Add to any component
useEffect(() => {
  console.log('Store state:', store.getState());
}, [store]);
```

## Documentation Files

- `README.md` - Project overview and quick start
- `ARCHITECTURE.md` - Detailed technical architecture (33KB, comprehensive)
- `DIFY_CONFIG.md` - Dify workflow configuration guide
- `DEV_NOTES.md` - Development history and changelog
- `PRD_PHASE2.md` - Phase 2 requirements planning
- `IMPLEMENTATION_PLAN.md` - Feature implementation roadmap
