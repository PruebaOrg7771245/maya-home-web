# docs/

Carpeta de trazabilidad del proyecto: qué cambió, por qué se decidió cada
cosa, y qué queda pendiente. La idea es que cualquier persona (o sesión de
Claude Code nueva) pueda entender el estado del proyecto sin depender de
memoria ni de chats externos.

- [`CHANGELOG.md`](./CHANGELOG.md) — registro cronológico de cambios.
- [`DECISIONS.md`](./DECISIONS.md) — decisiones de arquitectura (ADRs) y su
  razonamiento.
- [`REQUIREMENTS-STOCK.md`](./REQUIREMENTS-STOCK.md) — estado de la
  integración pendiente de stock real (SQL Server) con el encargado externo.

Los agentes en [`.claude/agents/`](../.claude/agents/) leen y actualizan
estos archivos como parte de su trabajo — ver `trazabilidad.md` en esa
carpeta.
