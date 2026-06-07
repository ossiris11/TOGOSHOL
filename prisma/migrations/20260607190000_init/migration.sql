-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "badge" TEXT NOT NULL DEFAULT 'В наличии',
    "badgeType" TEXT NOT NULL DEFAULT 'available',
    "price" INTEGER NOT NULL DEFAULT 0,
    "priceText" TEXT NOT NULL,
    "oldPrice" INTEGER,
    "imageUrl" TEXT,
    "galleryJson" TEXT NOT NULL DEFAULT '[]',
    "cpu" TEXT NOT NULL DEFAULT '',
    "gpu" TEXT NOT NULL DEFAULT '',
    "ram" TEXT NOT NULL DEFAULT '',
    "storage" TEXT NOT NULL DEFAULT '',
    "psu" TEXT NOT NULL DEFAULT '',
    "cooling" TEXT NOT NULL DEFAULT '',
    "caseName" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "shortDescription" TEXT NOT NULL DEFAULT '',
    "specsJson" TEXT NOT NULL DEFAULT '[]',
    "productClass" TEXT NOT NULL DEFAULT 'custom',
    "scenario" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 1000,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "heroSlot" INTEGER,
    "featuredSlot" INTEGER,
    "sourceType" TEXT NOT NULL DEFAULT 'manual',
    "externalId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "CustomerRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'new',
    "source" TEXT NOT NULL DEFAULT 'contact',
    "name" TEXT NOT NULL DEFAULT '',
    "contact" TEXT NOT NULL,
    "contactType" TEXT NOT NULL DEFAULT 'unknown',
    "message" TEXT NOT NULL DEFAULT '',
    "budget" INTEGER,
    "game" TEXT,
    "resolution" TEXT,
    "partsCondition" TEXT,
    "ram" TEXT,
    "storage" TEXT,
    "productId" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "pagePath" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomerRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "authorName" TEXT NOT NULL,
    "authorLink" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "externalUrl" TEXT,
    "externalId" TEXT,
    "productId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 1000,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    "deletedAt" DATETIME,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetricEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "pagePath" TEXT,
    "productId" TEXT,
    "requestId" TEXT,
    "metaJson" TEXT NOT NULL DEFAULT '{}',
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MetricEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageBlock" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "userAgent" TEXT
);

-- CreateTable
CREATE TABLE "AdminSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ComponentOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL DEFAULT 0,
    "wattage" INTEGER NOT NULL DEFAULT 0,
    "tagsJson" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'available',
    "sortOrder" INTEGER NOT NULL DEFAULT 1000,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "targetId" TEXT,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "sessionId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_status_deletedAt_sortOrder_idx" ON "Product"("status", "deletedAt", "sortOrder");

-- CreateIndex
CREATE INDEX "Product_isFeatured_featuredSlot_idx" ON "Product"("isFeatured", "featuredSlot");

-- CreateIndex
CREATE INDEX "CustomerRequest_status_createdAt_idx" ON "CustomerRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerRequest_productId_idx" ON "CustomerRequest"("productId");

-- CreateIndex
CREATE INDEX "Review_status_sortOrder_idx" ON "Review"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "MetricEvent_type_createdAt_idx" ON "MetricEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "MetricEvent_productId_idx" ON "MetricEvent"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE INDEX "ComponentOption_category_status_sortOrder_idx" ON "ComponentOption"("category", "status", "sortOrder");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_target_createdAt_idx" ON "AuditLog"("target", "createdAt");

