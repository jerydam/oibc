insert into roles (name, description, permissions) values
 ('super_admin','Full access', '{"*"}'),
 ('pastor','Leadership', '{"members:read","birthdays:manage","audit:read"}'),
 ('secretary','Membership & records', '{"members:read","members:read_sensitive","members:write","birthdays:manage","photos:review","registrations:review"}'),
 ('birthday_coordinator','Birthday care', '{"members:read","birthdays:manage"}'),
 ('media_team','Media', '{"members:read","photos:review"}'),
 ('member','Church member','{}')
on conflict (name) do nothing;

insert into website_settings (key, value) values
 ('church_name', '"Your Church Name"'),
 ('tagline', '"A family growing together in faith, love, and service."'),
 ('service_times', '"Sundays 9:00 AM · Bible Study Wednesdays 6:00 PM"'),
 ('address', '"Church address here"'),
 ('timezone', '"Africa/Lagos"'),
 ('leap_day_rule', '"feb28"'),
 ('photo_policy', '"approval"')
on conflict (key) do nothing;

insert into departments (name) values
 ('Choir'),('Ushering'),('Media and Technical'),('Youth Fellowship'),("Children's Church"),
 ('Evangelism'),('Welfare'),('Prayer Team'),('Bible Study'),("Men's Fellowship"),("Women's Fellowship")
on conflict (name) do nothing;
