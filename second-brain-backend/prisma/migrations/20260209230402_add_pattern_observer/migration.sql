-- CreateTable
CREATE TABLE "PatternRun" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "totalNotes" INTEGER NOT NULL DEFAULT 0,
    "themesFound" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PatternRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatternInsight" (
    "id" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "insight" TEXT NOT NULL,
    "relatedNoteIds" TEXT[],
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runId" TEXT NOT NULL,

    CONSTRAINT "PatternInsight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PatternInsight" ADD CONSTRAINT "PatternInsight_runId_fkey" FOREIGN KEY ("runId") REFERENCES "PatternRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
