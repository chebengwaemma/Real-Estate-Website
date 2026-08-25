-- Promote sheikhsayeed0002@gmail.com to admin
-- Supabase → SQL Editor → Run

-- Ensure Auth user exists first (Authentication → Users → Add user if needed)

insert into public.profiles (id, email, role)
select id, coalesce(email, ''), 'admin'
from auth.users
where lower(email) = lower('sheikhsayeed0002@gmail.com')
on conflict (id) do update
set email = excluded.email,
    role = 'admin';

select u.email, p.role, p.id
from auth.users u
join public.profiles p on p.id = u.id
where lower(u.email) = lower('sheikhsayeed0002@gmail.com');
