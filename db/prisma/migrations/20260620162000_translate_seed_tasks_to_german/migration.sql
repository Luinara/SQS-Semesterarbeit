-- Translate legacy quest seed tasks to German and keep user progress attached.

DO $$
DECLARE
    mapping text[];
    legacy_task_id integer;
    target_task_id integer;
    task_mappings text[][] := ARRAY[
        ARRAY['Complete one study session', '30 Minuten lernen', 'Schließe eine fokussierte Lerneinheit ab.', '20'],
        ARRAY['Drink water', 'Wasser trinken', 'Trinke genug Wasser über den Tag verteilt.', '10'],
        ARRAY['Clean workspace', 'Arbeitsplatz aufräumen', 'Räume deinen Schreibtisch oder Lernbereich auf.', '15'],
        ARRAY['Arbeitsplatz aufraeumen', 'Arbeitsplatz aufräumen', 'Räume deinen Schreibtisch oder Lernbereich auf.', '15'],
        ARRAY['Workspace aufraeumen', 'Arbeitsplatz aufräumen', 'Räume deinen Schreibtisch oder Lernbereich auf.', '15'],
        ARRAY['Workspace aufräumen', 'Arbeitsplatz aufräumen', 'Räume deinen Schreibtisch oder Lernbereich auf.', '15']
    ];
BEGIN
    FOREACH mapping SLICE 1 IN ARRAY task_mappings LOOP
        SELECT id INTO legacy_task_id FROM "tasks" WHERE "title" = mapping[1];

        IF legacy_task_id IS NULL THEN
            CONTINUE;
        END IF;

        SELECT id INTO target_task_id FROM "tasks" WHERE "title" = mapping[2];

        IF target_task_id IS NULL THEN
            UPDATE "tasks"
            SET
                "title" = mapping[2],
                "description" = mapping[3],
                "feed_points" = mapping[4]::integer
            WHERE id = legacy_task_id;

            CONTINUE;
        END IF;

        DELETE FROM "user_tasks" user_task
        WHERE user_task."task_id" = legacy_task_id
          AND EXISTS (
              SELECT 1
              FROM "user_tasks" duplicate
              WHERE duplicate."user_id" = user_task."user_id"
                AND duplicate."task_id" = target_task_id
          );

        UPDATE "user_tasks"
        SET "task_id" = target_task_id
        WHERE "task_id" = legacy_task_id;

        DELETE FROM "tasks"
        WHERE id = legacy_task_id;

        UPDATE "tasks"
        SET
            "description" = mapping[3],
            "feed_points" = mapping[4]::integer
        WHERE id = target_task_id;
    END LOOP;
END $$;

UPDATE "tasks"
SET
    "description" = 'Schließe eine fokussierte Lerneinheit ab.',
    "feed_points" = 20
WHERE "title" = '30 Minuten lernen';

UPDATE "tasks"
SET
    "description" = 'Trinke genug Wasser über den Tag verteilt.',
    "feed_points" = 10
WHERE "title" = 'Wasser trinken';

UPDATE "tasks"
SET
    "description" = 'Räume deinen Schreibtisch oder Lernbereich auf.',
    "feed_points" = 15
WHERE "title" = 'Arbeitsplatz aufräumen';
