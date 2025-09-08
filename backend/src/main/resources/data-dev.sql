-- Always insert or upsert demo user in dev profile
INSERT INTO app_user (
        id,
        email,
        display_name,
        password_hash,
        created_at
    )
VALUES (
        gen_random_uuid(),
        'demo@local',
        'Demo User',
        'x',
        now()
    ) ON CONFLICT (email) DO NOTHING;