-- AlterTable
ALTER TABLE "instances" ADD COLUMN     "admin_field_01" TEXT,
ADD COLUMN     "admin_field_02" TEXT,
ADD COLUMN     "business_id" TEXT,
ADD COLUMN     "integration" TEXT,
ADD COLUMN     "is_business" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_disconnect" TIMESTAMP(3),
ADD COLUMN     "last_disconnect_reason" TEXT,
ADD COLUMN     "last_sync_at" TIMESTAMP(3),
ADD COLUMN     "owner" TEXT,
ADD COLUMN     "owner_jid" TEXT,
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "profile_name" TEXT,
ADD COLUMN     "profile_pic_url" TEXT,
ADD COLUMN     "system_name" TEXT;

-- CreateTable
CREATE TABLE "provider_configs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "base_url" TEXT NOT NULL,
    "admin_token" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_configs_provider_base_url_key" ON "provider_configs"("provider", "base_url");
