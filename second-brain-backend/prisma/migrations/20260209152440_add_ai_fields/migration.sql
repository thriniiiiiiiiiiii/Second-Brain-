-- AlterTable
ALTER TABLE "Knowledge" ADD COLUMN     "summary" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'note';
