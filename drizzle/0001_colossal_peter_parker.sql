CREATE TABLE "language" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nativeName" text NOT NULL,
	"sortOrder" integer DEFAULT 100 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_genre" (
	"userId" text NOT NULL,
	"genre" text NOT NULL,
	CONSTRAINT "user_genre_userId_genre_pk" PRIMARY KEY("userId","genre")
);
--> statement-breakpoint
CREATE TABLE "user_language" (
	"userId" text NOT NULL,
	"languageCode" text NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_language_userId_languageCode_pk" PRIMARY KEY("userId","languageCode")
);
--> statement-breakpoint
CREATE TABLE "user_mood" (
	"userId" text NOT NULL,
	"mood" text NOT NULL,
	CONSTRAINT "user_mood_userId_mood_pk" PRIMARY KEY("userId","mood")
);
--> statement-breakpoint
CREATE TABLE "user_preference" (
	"userId" text PRIMARY KEY NOT NULL,
	"country" text,
	"onboardedAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_genre" ADD CONSTRAINT "user_genre_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language" ADD CONSTRAINT "user_language_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language" ADD CONSTRAINT "user_language_languageCode_language_code_fk" FOREIGN KEY ("languageCode") REFERENCES "public"."language"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mood" ADD CONSTRAINT "user_mood_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favorite_user_created_idx" ON "favorite" USING btree ("userId","createdAt");