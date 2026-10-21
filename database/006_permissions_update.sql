-- Add content:manage and activities:manage to appropriate roles
update roles
set permissions = array(
  select distinct unnest(permissions || '{content:manage,activities:manage}'::text[])
)
where name in ('super_admin', 'secretary', 'media_team', 'pastor');

-- Pastor: add content:manage (for monthly word oversight)
update roles
set permissions = array(
  select distinct unnest(permissions || '{content:manage}'::text[])
)
where name = 'pastor';

-- Secretary gets activities:manage
update roles
set permissions = array(
  select distinct unnest(permissions || '{activities:manage}'::text[])
)
where name = 'secretary';
