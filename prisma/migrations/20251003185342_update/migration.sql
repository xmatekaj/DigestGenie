-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "google_id" TEXT,
    "password_hash" TEXT,
    "system_email" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_2fa" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "backup_codes" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_2fa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sender_email" TEXT,
    "sender_domain" TEXT,
    "website_url" TEXT,
    "logo_url" TEXT,
    "frequency" TEXT,
    "is_predefined" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_newsletter_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "newsletter_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "custom_category" TEXT,
    "ai_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ai_summary_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ai_categorization_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ai_interest_filtering" BOOLEAN NOT NULL DEFAULT false,
    "display_preference" JSONB NOT NULL DEFAULT '{"type": "full", "showImages": true}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_processing" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "processing_status" TEXT NOT NULL DEFAULT 'pending',
    "last_processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_processing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_articles" (
    "id" TEXT NOT NULL,
    "newsletter_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "excerpt" TEXT,
    "url" TEXT,
    "image_url" TEXT,
    "ai_summary" TEXT,
    "ai_category" TEXT,
    "ai_interest_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ai_generated_thumbnail" TEXT,
    "published_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_saved" BOOLEAN NOT NULL DEFAULT false,
    "source_email_id" TEXT,
    "source_subject" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_categories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "icon" TEXT NOT NULL DEFAULT 'folder',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_category_assignments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "newsletter_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_category_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "global_ai_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ai_summary_length" TEXT NOT NULL DEFAULT 'medium',
    "ai_interest_threshold" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "digest_frequency" TEXT NOT NULL DEFAULT 'daily',
    "digest_time" TEXT NOT NULL DEFAULT '08:00:00',
    "digest_timezone" TEXT NOT NULL DEFAULT 'UTC',
    "default_view" TEXT NOT NULL DEFAULT 'cards',
    "articles_per_page" INTEGER NOT NULL DEFAULT 20,
    "show_read_articles" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "price_monthly" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price_yearly" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_newsletters" INTEGER NOT NULL DEFAULT 3,
    "max_articles_per_month" INTEGER NOT NULL DEFAULT 1000,
    "max_saved_articles" INTEGER NOT NULL DEFAULT 100,
    "max_categories" INTEGER NOT NULL DEFAULT 5,
    "ai_summaries_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ai_thumbnails_enabled" BOOLEAN NOT NULL DEFAULT false,
    "ai_interest_scoring_enabled" BOOLEAN NOT NULL DEFAULT true,
    "custom_categories_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_digest_enabled" BOOLEAN NOT NULL DEFAULT true,
    "advanced_filtering_enabled" BOOLEAN NOT NULL DEFAULT false,
    "api_access_enabled" BOOLEAN NOT NULL DEFAULT false,
    "priority_support_enabled" BOOLEAN NOT NULL DEFAULT false,
    "white_label_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "billing_cycle" TEXT NOT NULL DEFAULT 'monthly',
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "trial_start" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "stripe_subscription_id" TEXT,
    "stripe_customer_id" TEXT,
    "newsletters_count" INTEGER NOT NULL DEFAULT 0,
    "articles_this_month" INTEGER NOT NULL DEFAULT 0,
    "saved_articles_count" INTEGER NOT NULL DEFAULT 0,
    "categories_count" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB,
    "quota_consumed" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "rollout_percentage" INTEGER NOT NULL DEFAULT 0,
    "target_users" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processing_jobs" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL,
    "error" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processing_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_emails" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message_id" TEXT,
    "sender" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "received_date" TIMESTAMP(3) NOT NULL,
    "raw_content" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raw_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_system_email_key" ON "users"("system_email");

-- CreateIndex
CREATE UNIQUE INDEX "user_newsletter_subscriptions_user_id_newsletter_id_key" ON "user_newsletter_subscriptions"("user_id", "newsletter_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_categories_user_id_name_key" ON "user_categories"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_category_assignments_user_id_newsletter_id_categ_key" ON "newsletter_category_assignments"("user_id", "newsletter_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_user_id_key" ON "user_subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_stripe_subscription_id_key" ON "user_subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_name_key" ON "feature_flags"("name");

-- AddForeignKey
ALTER TABLE "user_2fa" ADD CONSTRAINT "user_2fa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_newsletter_subscriptions" ADD CONSTRAINT "user_newsletter_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_newsletter_subscriptions" ADD CONSTRAINT "user_newsletter_subscriptions_newsletter_id_fkey" FOREIGN KEY ("newsletter_id") REFERENCES "newsletters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_processing" ADD CONSTRAINT "email_processing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_articles" ADD CONSTRAINT "newsletter_articles_newsletter_id_fkey" FOREIGN KEY ("newsletter_id") REFERENCES "newsletters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_articles" ADD CONSTRAINT "newsletter_articles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_categories" ADD CONSTRAINT "user_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_category_assignments" ADD CONSTRAINT "newsletter_category_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_category_assignments" ADD CONSTRAINT "newsletter_category_assignments_newsletter_id_fkey" FOREIGN KEY ("newsletter_id") REFERENCES "newsletters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_category_assignments" ADD CONSTRAINT "newsletter_category_assignments_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "user_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_emails" ADD CONSTRAINT "raw_emails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
