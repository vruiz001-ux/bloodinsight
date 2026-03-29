# Lessons Learned

<!-- Format: [date] | what went wrong | rule to avoid it -->
- [2026-03-29] | Prisma v7 "client" engine requires a driver adapter — `new PrismaClient()` with no args fails | Always pass `adapter` option (e.g. `PrismaBetterSqlite3`) to PrismaClient in v7. Class name is `PrismaBetterSqlite3` (lowercase "ql"), not `PrismaBetterSQLite3`.
