CREATE TABLE "websocket_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"channel_id" varchar(255) NOT NULL,
	"auth_token" varchar(512) NOT NULL
);
