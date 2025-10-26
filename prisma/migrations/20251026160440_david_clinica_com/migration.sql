-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEDICO', 'RECEPCAO');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AGENDADA', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RECEPCAO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "nascimento" TIMESTAMP(3) NOT NULL,
    "sexo" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "convenio" TEXT,
    "carteirinha" TEXT,
    "alergias" TEXT,
    "observacoes" TEXT,
    "arquivado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consulta" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "medicoId" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'AGENDADA',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prontuario" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "consultaId" TEXT,
    "criadoPorId" TEXT NOT NULL,
    "conteudo" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prontuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "prontuarioId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_cpf_key" ON "Paciente"("cpf");

-- CreateIndex
CREATE INDEX "Consulta_medicoId_inicio_idx" ON "Consulta"("medicoId", "inicio");

-- CreateIndex
CREATE INDEX "Consulta_pacienteId_inicio_idx" ON "Consulta"("pacienteId", "inicio");

-- CreateIndex
CREATE UNIQUE INDEX "Prontuario_consultaId_key" ON "Prontuario"("consultaId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prontuario" ADD CONSTRAINT "Prontuario_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prontuario" ADD CONSTRAINT "Prontuario_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prontuario" ADD CONSTRAINT "Prontuario_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_prontuarioId_fkey" FOREIGN KEY ("prontuarioId") REFERENCES "Prontuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
