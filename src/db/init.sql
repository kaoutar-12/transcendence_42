DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'djangodb'
   ) THEN
      CREATE DATABASE djangodb;
   END IF;
END
$do$;