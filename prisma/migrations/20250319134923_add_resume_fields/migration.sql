-- AlterTable
ALTER TABLE "Export" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'PDF';

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "achievements" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "certifications" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "customSections" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "education" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "experiences" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "font" TEXT NOT NULL DEFAULT 'Inter',
ADD COLUMN     "guestToken" TEXT,
ADD COLUMN     "interests" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "languages" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "projects" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "publications" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "references" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "skills" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "volunteer" JSONB[] DEFAULT ARRAY[]::JSONB[];
