-- Seed user: admin@example.com / changeme
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
            recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
            created_at, updated_at, confirmation_token, email_change, 
            email_change_token_new, recovery_token
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            user_id,
            'authenticated',
            'authenticated',
            'admin@example.com',
            crypt('changeme', gen_salt('bf')),
            now(),
            NULL,
            now(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );

        INSERT INTO auth.identities (
            provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        )
        VALUES (
            user_id,
            user_id,
            format('{"sub":"%s","email":"%s"}', user_id, 'admin@example.com')::jsonb,
            'email',
            now(),
            now(),
            now()
        );
    END IF;
END $$;
