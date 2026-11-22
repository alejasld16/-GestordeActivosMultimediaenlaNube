-- CreateTable
CREATE TABLE "Archivo" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "tipoArchivo" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subidoPor" TEXT,

    CONSTRAINT "Archivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Archivo_publicId_key" ON "Archivo"("publicId");

-- CreateIndex
CREATE INDEX "Archivo_fechaSubida_idx" ON "Archivo"("fechaSubida");

-- CreateIndex
CREATE INDEX "Archivo_tipoArchivo_idx" ON "Archivo"("tipoArchivo");
