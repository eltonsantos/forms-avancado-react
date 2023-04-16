import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://wxnhdpkyfoziqveztvqm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bmhkcGt5Zm96aXF2ZXp0dnFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MTY2NjA1MSwiZXhwIjoxOTk3MjQyMDUxfQ.c9-Bkd7ZpbYeZe4no3U38DJ9H4U9GQZxPTwI8-UE0ak"
);
