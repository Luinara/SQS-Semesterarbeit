UPDATE "tasks"
SET "feed_points" = 10
WHERE "title" IN ('Wasser trinken', 'Drink water');

UPDATE "tasks"
SET "feed_points" = 20
WHERE "title" IN ('30 Minuten lernen', 'Sport erledigen', 'Complete one study session');

UPDATE "tasks"
SET "feed_points" = 15
WHERE "title" IN ('Workspace aufraeumen', 'Clean workspace');

UPDATE "tasks"
SET "feed_points" = 10
WHERE "title" = '10 Seiten lesen';
