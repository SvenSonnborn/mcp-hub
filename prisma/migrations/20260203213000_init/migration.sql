-- CreateTable
CREATE TABLE "MCPServer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "installUrl" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "configSchema" JSONB DEFAULT '{}',
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MCPServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MCPInstallation" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "config" JSONB DEFAULT '{}',
    "port" INTEGER,
    "pid" INTEGER,
    "lastPing" TIMESTAMP(3),
    "isHealthy" BOOLEAN NOT NULL DEFAULT false,
    "errorLog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MCPInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MCPServer_name_key" ON "MCPServer"("name");

-- AddForeignKey
ALTER TABLE "MCPInstallation" ADD CONSTRAINT "MCPInstallation_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "MCPServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
