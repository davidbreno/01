-- CreateEnum
CREATE TYPE "ImplantCategory" AS ENUM ('CMI', 'HE', 'HI_TAPA');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RECEITA', 'PRONTUARIO', 'DOCUMENTO_PESSOAL', 'RADIOGRAFIA', 'OUTRO');

-- AlterTable
ALTER TABLE "Consulta"
  ADD COLUMN "lembreteAgendado" TIMESTAMP(3),
  ADD COLUMN "lembreteEnviado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ImplantItem" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "ImplantCategory" NOT NULL,
    "modelo" TEXT NOT NULL,
    "tamanho" TEXT,
    "marca" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "imagemUrl" TEXT,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ImplantItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialItem" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "marca" TEXT,
    "unidade" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MaterialItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRecord" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" "DocumentType" NOT NULL,
    "arquivoUrl" TEXT NOT NULL,
    "arquivoMime" TEXT NOT NULL,
    "pacienteId" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DocumentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnamneseQuestion" (
    "id" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "categoria" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AnamneseQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnamneseResposta" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "resposta" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AnamneseResposta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnamneseResposta_pacienteId_questionId_key" ON "AnamneseResposta"("pacienteId", "questionId");

-- AddForeignKey
ALTER TABLE "DocumentRecord" ADD CONSTRAINT "DocumentRecord_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnamneseResposta" ADD CONSTRAINT "AnamneseResposta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnamneseResposta" ADD CONSTRAINT "AnamneseResposta_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AnamneseQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
