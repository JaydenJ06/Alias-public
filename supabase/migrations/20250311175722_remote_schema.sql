

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$begin
insert into public.profile (id, display_name, username)
values (new.id, new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username');
return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."channel" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "server_id" "uuid"
);


ALTER TABLE "public"."channel" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."message" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "text" NOT NULL,
    "author_id" "uuid",
    "channel_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "attachment_url" "text"
);


ALTER TABLE "public"."message" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile" (
    "id" "uuid" NOT NULL,
    "display_name" "text",
    "username" "text",
    "avatar_url" "text"
);


ALTER TABLE "public"."profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reaction" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message_id" "uuid" NOT NULL,
    "profile_id" "uuid",
    "reaction" "text",
    "channel_id" "uuid"
);


ALTER TABLE "public"."reaction" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."server" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "server_image_url" "text",
    "server_creator_id" "uuid"
);


ALTER TABLE "public"."server" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."server_membership" (
    "server_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL
);


ALTER TABLE "public"."server_membership" OWNER TO "postgres";


ALTER TABLE ONLY "public"."channel"
    ADD CONSTRAINT "channel_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."message"
    ADD CONSTRAINT "message_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reaction"
    ADD CONSTRAINT "reaction_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."server_membership"
    ADD CONSTRAINT "server_membership_pkey" PRIMARY KEY ("server_id", "profile_id");



ALTER TABLE ONLY "public"."server"
    ADD CONSTRAINT "server_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."channel"
    ADD CONSTRAINT "channel_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "public"."server"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message"
    ADD CONSTRAINT "message_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profile"("id");



ALTER TABLE ONLY "public"."message"
    ADD CONSTRAINT "message_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reaction"
    ADD CONSTRAINT "reaction_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reaction"
    ADD CONSTRAINT "reaction_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reaction"
    ADD CONSTRAINT "reaction_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id");



ALTER TABLE ONLY "public"."server_membership"
    ADD CONSTRAINT "server_membership_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id");



ALTER TABLE ONLY "public"."server_membership"
    ADD CONSTRAINT "server_membership_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "public"."server"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."server"
    ADD CONSTRAINT "server_server_creator_id_fkey" FOREIGN KEY ("server_creator_id") REFERENCES "public"."profile"("id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


CREATE PUBLICATION "supabase_realtime_messages_publication" WITH (publish = 'insert, update, delete, truncate');



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."message";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."reaction";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."channel" TO "anon";
GRANT ALL ON TABLE "public"."channel" TO "authenticated";
GRANT ALL ON TABLE "public"."channel" TO "service_role";



GRANT ALL ON TABLE "public"."message" TO "anon";
GRANT ALL ON TABLE "public"."message" TO "authenticated";
GRANT ALL ON TABLE "public"."message" TO "service_role";



GRANT ALL ON TABLE "public"."profile" TO "anon";
GRANT ALL ON TABLE "public"."profile" TO "authenticated";
GRANT ALL ON TABLE "public"."profile" TO "service_role";



GRANT ALL ON TABLE "public"."reaction" TO "anon";
GRANT ALL ON TABLE "public"."reaction" TO "authenticated";
GRANT ALL ON TABLE "public"."reaction" TO "service_role";



GRANT ALL ON TABLE "public"."server" TO "anon";
GRANT ALL ON TABLE "public"."server" TO "authenticated";
GRANT ALL ON TABLE "public"."server" TO "service_role";



GRANT ALL ON TABLE "public"."server_membership" TO "anon";
GRANT ALL ON TABLE "public"."server_membership" TO "authenticated";
GRANT ALL ON TABLE "public"."server_membership" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
