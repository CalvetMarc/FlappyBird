/*
  Warnings:

  - You are about to drop the column `createdAt` on the `GameSession` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `timePlayed` on the `Score` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL
);
INSERT INTO "new_GameSession" ("expiresAt", "id", "seed", "sessionId") SELECT "expiresAt", "id", "seed", "sessionId" FROM "GameSession";
DROP TABLE "GameSession";
ALTER TABLE "new_GameSession" RENAME TO "GameSession";
CREATE UNIQUE INDEX "GameSession_sessionId_key" ON "GameSession"("sessionId");
CREATE TABLE "new_Score" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "serverHash" TEXT NOT NULL
);
INSERT INTO "new_Score" ("id", "playerId", "score", "serverHash") SELECT "id", "playerId", "score", "serverHash" FROM "Score";
DROP TABLE "Score";
ALTER TABLE "new_Score" RENAME TO "Score";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
