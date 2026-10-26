# TIAKI PORT MAP

| Service | Host Port | Container Port | Status |
|---|---:|---:|---|
| PostgreSQL | 15441 | 5432 | ACTIVE |
| Redis | 6385 | 6379 | ACTIVE |
| Go API | 8093 | 8093 | RESERVED |
| AI | 8011 | 8011 | RESERVED |
| Admin Web | 3010 | 3010 | RESERVED |
| Operations Web | 3011 | 3011 | RESERVED |
| Auditor Web | 3012 | 3012 | RESERVED |
| Public Verification | 3013 | 3013 | RESERVED |
| MinIO API | 9010 | 9000 | RESERVED |
| MinIO Console | 9011 | 9001 | RESERVED |

TIAKI is isolated from other known projects.

Do NOT use:
15432 - Pasar Ternak
15433 - CSYers
15434 - Borneo Sentinel
15435 - MBG

Known application ports:
3000 - AI Hospitality Landing
3001 - AI Hospitality Admin
3002 - MBG Admin
8080 - other project
8081 - CSYers
8082 - MBG
8002 - MBG AI

TIAKI:
15441 / 6385 / 8093 / 8011 / 3010-3013 / 9010-9011
