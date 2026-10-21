/**
 * Mock data for local / preview use — replace API calls to see every page filled.
 * Uses Pravatar for member avatars and Picsum for scene photos.
 */
import type {
  SiteSettings, Celebrant, Activity, MonthlyWord,
  Sermon, Announcement, GalleryAlbum, Department,
  Member, AdminOverview,
} from "./types";

// ── Settings ─────────────────────────────────────────────────

export const MOCK_SETTINGS: SiteSettings = {
  church_name: "Ona-Igbala Baptist Church",
  tagline: "Sanctuary of Praise",
  service_times: "Sunday Worship — 9:00 AM\nBible Study — Wednesday, 6:00 PM\nPrayer Meeting — Friday, 6:30 PM",
  address: "5 Salvation Road, off Agbara-Igbesa Expressway\nOna-Igbala, Lagos State, Nigeria",
  timezone: "Africa/Lagos",
};

// ── Celebrants / Birthdays ────────────────────────────────────

export const MOCK_TODAY_CELEBRANTS: Celebrant[] = [
  { id: "c1", display_name: "Adaeze Okonkwo", photo_path: "https://i.pravatar.cc/150?img=47", department: "Women's Fellowship", date: "1990-10-21", is_today: true },
  { id: "c2", display_name: "Emmanuel Adeyemi", photo_path: "https://i.pravatar.cc/150?img=12", department: "Choir", date: "1985-10-21", is_today: true },
];

export const MOCK_WEEK_CELEBRANTS: Celebrant[] = [
  ...MOCK_TODAY_CELEBRANTS,
  { id: "c3", display_name: "Grace Okeke",     photo_path: "https://i.pravatar.cc/150?img=5",  department: "Youth Dept",         date: "1997-10-22", is_today: false },
  { id: "c4", display_name: "Chukwuemeka Eze", photo_path: "https://i.pravatar.cc/150?img=15", department: "Deacons Board",       date: "1975-10-23", is_today: false },
  { id: "c5", display_name: "Blessing Nwosu",  photo_path: null,                               department: "Children's Church",   date: "2001-10-23", is_today: false },
  { id: "c6", display_name: "Taiwo Olatunji",  photo_path: "https://i.pravatar.cc/150?img=33", department: "Men's Fellowship",    date: "1968-10-25", is_today: false },
  { id: "c7", display_name: "Funmilayo Abiodun",photo_path:"https://i.pravatar.cc/150?img=44", department: "Choir",               date: "1993-10-25", is_today: false },
  { id: "c8", display_name: "Oluwaseun Balogun",photo_path:"https://i.pravatar.cc/150?img=18", department: "Ushers",              date: "1980-10-26", is_today: false },
];

export const MOCK_MONTH_CELEBRANTS: Celebrant[] = [
  ...MOCK_WEEK_CELEBRANTS,
  { id: "c9",  display_name: "Chidinma Obi",      photo_path: "https://i.pravatar.cc/150?img=9",  department: "Women's Fellowship", date: "1995-10-03", is_today: false },
  { id: "c10", display_name: "Rotimi Adesanya",   photo_path: "https://i.pravatar.cc/150?img=20", department: "Youth Dept",         date: "1991-10-05", is_today: false },
  { id: "c11", display_name: "Kelechi Nwachukwu", photo_path: "https://i.pravatar.cc/150?img=55", department: "Choir",              date: "1988-10-07", is_today: false },
  { id: "c12", display_name: "Adeola Fashola",    photo_path: "https://i.pravatar.cc/150?img=29", department: "Deacons Board",      date: "1972-10-10", is_today: false },
  { id: "c13", display_name: "Ngozi Umeh",        photo_path: null,                               department: "Children's Church",  date: "2004-10-12", is_today: false },
  { id: "c14", display_name: "Sunday Adeleke",    photo_path: "https://i.pravatar.cc/150?img=3",  department: "Ushers",             date: "1965-10-15", is_today: false },
  { id: "c15", display_name: "Ifeoma Dike",       photo_path: "https://i.pravatar.cc/150?img=49", department: "Women's Fellowship", date: "1999-10-17", is_today: false },
  { id: "c16", display_name: "Babatunde Ogunleye",photo_path:"https://i.pravatar.cc/150?img=37",  department: "Men's Fellowship",   date: "1977-10-28", is_today: false },
  { id: "c17", display_name: "Amaka Okafor",      photo_path: "https://i.pravatar.cc/150?img=41", department: "Choir",              date: "1994-10-30", is_today: false },
];

// ── Activities ────────────────────────────────────────────────

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "a1", activity_id: "s1", activity_title: "Sunday Morning Worship",
    title: null, category: "Worship Service",
    start_at: "2026-10-25T09:00:00+01:00", end_at: "2026-10-25T11:30:00+01:00",
    venue: "Main Sanctuary", description: "Join us for our regular Sunday morning worship service featuring praise, prayer and the preaching of God's Word.",
    cover_image_path: "https://picsum.photos/seed/worship1/800/450",
    occurrence_status: "published", registration_required: false, registration_deadline: null, department: null,
  },
  {
    id: "a2", activity_id: "s2", activity_title: "Youth Thanksgiving Concert",
    title: "Annual Youth Thanksgiving Concert", category: "Youth Programme",
    start_at: "2026-11-01T05:00:00+01:00", end_at: "2026-11-01T09:00:00+01:00",
    venue: "Church Auditorium", description: "An evening of powerful worship, drama, and testimonies led by the Youth Department. All are welcome.",
    cover_image_path: "https://picsum.photos/seed/youth1/800/450",
    occurrence_status: "published", registration_required: false, registration_deadline: null, department: "Youth Department",
  },
  {
    id: "a3", activity_id: "s3", activity_title: "Ministers & Workers Retreat",
    title: null, category: "Retreat",
    start_at: "2026-11-07T08:00:00+01:00", end_at: "2026-11-09T17:00:00+01:00",
    venue: "ECWA Guest House, Ibadan", description: "A three-day retreat for all church ministers and department leaders. Theme: Strengthening Our Foundations in Ministry.",
    cover_image_path: "https://picsum.photos/seed/retreat1/800/450",
    occurrence_status: "published", registration_required: true, registration_deadline: "2026-10-31T23:59:00+01:00", department: "Church Administration",
  },
  {
    id: "a4", activity_id: "s4", activity_title: "Children's Church Anniversary",
    title: "10th Anniversary Celebration", category: "Anniversary",
    start_at: "2026-11-15T10:00:00+01:00", end_at: "2026-11-15T13:00:00+01:00",
    venue: "Children's Block", description: "Celebrate 10 years of impactful children's ministry. Activities, games, and a special programme for children and families.",
    cover_image_path: "https://picsum.photos/seed/children1/800/450",
    occurrence_status: "published", registration_required: false, registration_deadline: null, department: "Children's Church",
  },
  {
    id: "a5", activity_id: "s5", activity_title: "Bible Study",
    title: null, category: "Bible Study",
    start_at: "2026-10-22T18:00:00+01:00", end_at: "2026-10-22T20:00:00+01:00",
    venue: "Conference Hall", description: "Continuing our series on the Book of Romans: 'The Righteousness of God Revealed'.",
    cover_image_path: null,
    occurrence_status: "published", registration_required: false, registration_deadline: null, department: null,
  },
  {
    id: "a6", activity_id: "s6", activity_title: "Women's Fellowship Meeting",
    title: null, category: "Fellowship",
    start_at: "2026-10-29T10:00:00+01:00", end_at: "2026-10-29T13:00:00+01:00",
    venue: "Fellowship Hall", description: "Monthly meeting for all women of the church. This month's topic: 'The Proverbs 31 Woman in Today's World'.",
    cover_image_path: "https://picsum.photos/seed/women1/800/450",
    occurrence_status: "published", registration_required: false, registration_deadline: null, department: "Women's Fellowship",
  },
  {
    id: "a7", activity_id: "s7", activity_title: "End-of-Year Thanksgiving Service",
    title: null, category: "Special Service",
    start_at: "2026-12-27T09:00:00+01:00", end_at: "2026-12-27T13:00:00+01:00",
    venue: "Main Sanctuary", description: "Annual thanksgiving service to close out the year 2026 in praise and gratitude to God.",
    cover_image_path: "https://picsum.photos/seed/thanksgiving1/800/450",
    occurrence_status: "scheduled", registration_required: false, registration_deadline: null, department: null,
  },
  {
    id: "a8", activity_id: "s8", activity_title: "Choir Practice",
    title: null, category: "Music Ministry",
    start_at: "2026-10-24T17:00:00+01:00", end_at: "2026-10-24T19:00:00+01:00",
    venue: "Choir Room", description: "Regular Saturday rehearsal for the church choir. All choir members are expected to attend.",
    cover_image_path: null,
    occurrence_status: "published", registration_required: false, registration_deadline: null, department: "Choir",
  },
];

// ── Monthly Word ──────────────────────────────────────────────

export const MOCK_CURRENT_MONTHLY_WORD: MonthlyWord = {
  id: "mw1", month: 10, year: 2026,
  title: "Walking in the Newness of the Spirit",
  pastor_name: "Revd. Olawale Adeyemi",
  video_url: "https://www.youtube.com/watch?v=3JZ_D3ELwOA",
  thumbnail_path: "https://picsum.photos/seed/sermon_oct/800/450",
  message_description: "This month we are called to lay aside every hindrance and walk boldly in the newness that God has prepared for us. As we enter the final quarter of the year, let our hearts be fully surrendered to the work of His Spirit within us — renewing our minds, transforming our desires, and aligning our steps with His eternal purposes. The Lord is calling each of us to deeper consecration and greater fruitfulness.",
  prayer_focus: "Our corporate prayer focus this October is on spiritual renewal and a fresh outpouring of the Holy Spirit upon the entire congregation. We ask God to revive what has grown cold, strengthen what is wavering, and ignite a passion for His glory in every heart.",
  scripture_reference: "Romans 8:1–4 — 'There is therefore now no condemnation for those who are in Christ Jesus…'",
  prayer_points: [
    "Pray for a fresh outpouring of the Holy Spirit upon the church and its leadership.",
    "Intercede for members walking through trials — that they would experience God's peace and direction.",
    "Pray for the upcoming Ministers & Workers Retreat — for divine guidance and spiritual refreshment.",
    "Ask God to open hearts of those who are yet to surrender their lives to Christ.",
    "Pray for the Youth Department concert — that it would bring honour to God and draw souls to Him.",
    "Intercede for Nigeria and our local community — for peace, justice, and godly governance.",
  ],
  published_at: "2026-10-01T06:00:00+01:00",
};

export const MOCK_MONTHLY_WORD_ARCHIVE: MonthlyWord[] = [
  MOCK_CURRENT_MONTHLY_WORD,
  {
    id: "mw2", month: 9, year: 2026,
    title: "A Season of Harvest",
    pastor_name: "Revd. Olawale Adeyemi",
    video_url: "https://www.youtube.com/watch?v=3JZ_D3ELwOA",
    thumbnail_path: "https://picsum.photos/seed/sermon_sep/800/450",
    message_description: "September brought us into a season of reaping — both spiritually and in practical life. God's faithfulness is evident in every testimony.",
    prayer_focus: "Focus on gratitude and thanksgiving for God's provision throughout the year.",
    scripture_reference: "Galatians 6:9 —Let us not grow weary in doing good…",
    prayer_points: [
      "Thanksgiving for answered prayers throughout the year.",
      "Pray for continued blessing and fruitfulness for every family.",
      "Intercede for the upcoming Youth Thanksgiving Concert.",
    ],
    published_at: "2026-09-01T06:00:00+01:00",
  },
  {
    id: "mw3", month: 8, year: 2026,
    title: "Rooted and Built Up",
    pastor_name: "Deacon Femi Olusegun",
    video_url: null,
    thumbnail_path: "https://picsum.photos/seed/sermon_aug/800/450",
    message_description: "Our strength in the Lord comes from our rootedness in His Word. This month we returned to the fundamentals of our faith.",
    prayer_focus: "Pray for deeper hunger for the Word of God across the congregation.",
    scripture_reference: "Colossians 2:6–7",
    prayer_points: [
      "Pray for consistent personal devotion among members.",
      "Intercede for families who are struggling spiritually.",
      "Ask God to raise up more teachers and disciplers within the church.",
    ],
    published_at: "2026-08-01T06:00:00+01:00",
  },
  {
    id: "mw4", month: 7, year: 2026,
    title: "The Year of Entering Into Newness",
    pastor_name: "Revd. Olawale Adeyemi",
    video_url: "https://www.youtube.com/watch?v=3JZ_D3ELwOA",
    thumbnail_path: "https://picsum.photos/seed/sermon_jul/800/450",
    message_description: "At mid-year, we paused to recommit ourselves to the theme God gave us for 2026. Newness is not just a word — it is a call to action.",
    prayer_focus: "Pray for the second half of 2026 — for every promise of God to be fulfilled.",
    scripture_reference: "Isaiah 43:19",
    prayer_points: [
      "Pray for spiritual breakthroughs in the second half of 2026.",
      "Intercede for young people making important life decisions.",
    ],
    published_at: "2026-07-01T06:00:00+01:00",
  },
];

// ── Sermons ───────────────────────────────────────────────────

export const MOCK_SERMONS: Sermon[] = [
  {
    id: "sr1", title: "When God Changes Your Name",
    preacher_name: "Revd. Olawale Adeyemi", sermon_date: "2026-10-18",
    scripture_reference: "Genesis 32:24–30", category: "Sunday Sermon",
    description: "A message on transformation, identity, and the power of an encounter with God. God doesn't just change your circumstances — He changes who you are.",
    video_url: "https://www.youtube.com/watch?v=3JZ_D3ELwOA",
    audio_url: null,
    thumbnail_path: "https://picsum.photos/seed/ser1/800/450",
  },
  {
    id: "sr2", title: "The Ministry of Reconciliation",
    preacher_name: "Deacon Femi Olusegun", sermon_date: "2026-10-11",
    scripture_reference: "2 Corinthians 5:17–21", category: "Sunday Sermon",
    description: "God has given the church the ministry and message of reconciliation. We are ambassadors of Christ, called to represent Him in every sphere of life.",
    video_url: "https://www.youtube.com/watch?v=3JZ_D3ELwOA",
    audio_url: null,
    thumbnail_path: "https://picsum.photos/seed/ser2/800/450",
  },
  {
    id: "sr3", title: "Pressing Toward the Mark",
    preacher_name: "Revd. Olawale Adeyemi", sermon_date: "2026-10-04",
    scripture_reference: "Philippians 3:12–14", category: "Sunday Sermon",
    description: "Paul's exhortation to forget what is behind and press toward the goal reminds us that the Christian life is not a spectator sport — it demands active pursuit.",
    video_url: "https://www.youtube.com/watch?v=3JZ_D3ELwOA",
    audio_url: null,
    thumbnail_path: "https://picsum.photos/seed/ser3/800/450",
  },
  {
    id: "sr4", title: "Rooted in Love",
    preacher_name: "Sis. Ngozi Umeh", sermon_date: "2026-09-27",
    scripture_reference: "Ephesians 3:14–19", category: "Sunday Sermon",
    description: "To be rooted and grounded in love is to be anchored in the very character of God. A rich expository message on the breadth, length, height, and depth of Christ's love.",
    video_url: null,
    audio_url: null,
    thumbnail_path: "https://picsum.photos/seed/ser4/800/450",
  },
  {
    id: "sr5", title: "Building on the Right Foundation",
    preacher_name: "Revd. Olawale Adeyemi", sermon_date: "2026-09-20",
    scripture_reference: "Matthew 7:24–27", category: "Sunday Sermon",
    description: "The parable of the wise and foolish builders speaks directly to the choices we make every day. Are we building our lives on the rock of God's Word?",
    video_url: "https://www.youtube.com/watch?v=3JZ_D3ELwOA",
    audio_url: null,
    thumbnail_path: "https://picsum.photos/seed/ser5/800/450",
  },
  {
    id: "sr6", title: "The Power of a Grateful Heart",
    preacher_name: "Deacon Babatunde Ogunleye", sermon_date: "2026-09-13",
    scripture_reference: "Psalm 100", category: "Sunday Sermon",
    description: "Gratitude is not just a feeling — it is a spiritual discipline that transforms our perspective and strengthens our faith. A practical message on cultivating thankfulness.",
    video_url: null,
    audio_url: null,
    thumbnail_path: "https://picsum.photos/seed/ser6/800/450",
  },
];

// ── Announcements ─────────────────────────────────────────────

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "an1",
    title: "Ministers & Workers Retreat — Register Now",
    body: "The annual Ministers and Workers Retreat is scheduled for 7–9 November 2026 at the ECWA Guest House, Ibadan. All department leaders, deacons, and ministers are expected to attend.\n\nThe theme this year is: \"Strengthening Our Foundations in Ministry.\" Please register with the church secretary before 31 October 2026.\n\nTransportation will be arranged from the church premises. Accommodation and meals are covered. Please come prepared to be refreshed and renewed in the Lord.",
    image_path: "https://picsum.photos/seed/announce1/800/400",
    published_at: "2026-10-15T08:00:00+01:00",
    expires_at: "2026-11-09T23:59:00+01:00",
  },
  {
    id: "an2",
    title: "New Member Orientation — Sunday, 2 November",
    body: "We warmly welcome all new members and those who recently gave their lives to Christ. A New Member Orientation class will be held on Sunday, 2 November 2026 immediately after the morning service.\n\nThe session will cover the church's beliefs, membership commitments, and how to get connected with a department. Light refreshments will be served.\n\nPlease inform the church secretary of your attendance so that materials can be prepared for you.",
    image_path: null,
    published_at: "2026-10-13T10:00:00+01:00",
    expires_at: "2026-11-02T17:00:00+01:00",
  },
  {
    id: "an3",
    title: "Church Harvest & Thanksgiving — 22 November 2026",
    body: "Our annual Church Harvest and Thanksgiving Service holds on Sunday, 22 November 2026. We invite every member, family, and friend to come prepared to give generously and testify of God's faithfulness over the past year.\n\nDepartments are encouraged to plan their presentations and displays. The offering received will go towards the church building expansion fund.\n\nDress code: Traditional attire in church colours (White and Navy Blue).",
    image_path: "https://picsum.photos/seed/harvest1/800/400",
    published_at: "2026-10-10T07:00:00+01:00",
    expires_at: "2026-11-22T17:00:00+01:00",
  },
  {
    id: "an4",
    title: "Condolence: Bro. Segun Afolabi",
    body: "It is with deep sadness that we announce the passing of Brother Segun Afolabi, a faithful member of the Men's Fellowship for over 15 years. He went to be with the Lord on Wednesday, 8 October 2026.\n\nWe extend our heartfelt condolences to his wife, Sister Kemi Afolabi, and their children. The burial arrangements will be communicated in due course.\n\nPlease keep the family in your prayers during this time.",
    image_path: null,
    published_at: "2026-10-09T14:00:00+01:00",
    expires_at: null,
  },
];

// ── Gallery ───────────────────────────────────────────────────

export const MOCK_GALLERY_ALBUMS: GalleryAlbum[] = [
  { id: "g1", title: "Harvest & Thanksgiving 2025",            description: "Photos from our annual harvest thanksgiving service.", album_date: "2025-11-23", cover_image_path: "https://picsum.photos/seed/gal1cover/800/600", media_count: 42 },
  { id: "g2", title: "Youth Department Concert — July 2026",   description: "A memorable evening of praise and worship led by the youth.", album_date: "2026-07-05", cover_image_path: "https://picsum.photos/seed/gal2cover/800/600", media_count: 28 },
  { id: "g3", title: "Church Anniversary Celebrations 2026",   description: "24 years of God's faithfulness. Celebration photos.", album_date: "2026-07-07", cover_image_path: "https://picsum.photos/seed/gal3cover/800/600", media_count: 67 },
  { id: "g4", title: "Workers Retreat 2025 — Ibadan",          description: "Photos from our annual ministers and workers retreat.", album_date: "2025-09-12", cover_image_path: "https://picsum.photos/seed/gal4cover/800/600", media_count: 19 },
  { id: "g5", title: "Children's Church Outing — August 2026", description: "Annual outing for our children and teenagers.", album_date: "2026-08-16", cover_image_path: "https://picsum.photos/seed/gal5cover/800/600", media_count: 35 },
  { id: "g6", title: "Easter Sunday Service 2026",             description: "Resurrection Sunday celebration at the main sanctuary.", album_date: "2026-04-05", cover_image_path: "https://picsum.photos/seed/gal6cover/800/600", media_count: 24 },
];

export const MOCK_ALBUM_MEDIA = (albumId: string) => {
  const seeds = [
    "ph1","ph2","ph3","ph4","ph5","ph6","ph7","ph8","ph9","ph10","ph11","ph12",
  ].map((s, i) => ({
    id: `${albumId}-m${i + 1}`,
    file_path: `https://picsum.photos/seed/${albumId}${s}/600/800`,
    media_type: "image",
    caption: i % 4 === 0 ? `A beautiful moment from the event` : null,
    display_order: i + 1,
  }));
  return seeds;
};

// ── Departments ───────────────────────────────────────────────

export const MOCK_DEPARTMENTS: Department[] = [
  { id: "d1", name: "Men's Fellowship",    description: "A brotherhood committed to growing godly men who lead their families and communities with integrity.", leader_name: "Deacon Babatunde Ogunleye" },
  { id: "d2", name: "Women's Fellowship",  description: "Empowering women to walk in purpose, serve faithfully, and nurture a Christ-centred home and community.", leader_name: "Deaconess Adaeze Okonkwo" },
  { id: "d3", name: "Youth Department",    description: "Raising a generation of young people on fire for God, equipped for life and ministry in the 21st century.", leader_name: "Bro. Rotimi Adesanya" },
  { id: "d4", name: "Children's Church",   description: "Planting seeds of faith in the hearts of our youngest members through fun, Bible-based programmes.", leader_name: "Sis. Ngozi Umeh" },
  { id: "d5", name: "Choir",               description: "Ministering through music and song, leading the congregation into the presence of God each Sunday.", leader_name: "Bro. Kelechi Nwachukwu" },
  { id: "d6", name: "Ushers",              description: "Ensuring every worshipper is welcomed with warmth and that our services run decently and in order.", leader_name: "Bro. Oluwaseun Balogun" },
];

// ── Admin Overview ────────────────────────────────────────────

export const MOCK_ADMIN_OVERVIEW: AdminOverview = {
  total_active_members: 247,
  pending_registrations: 5,
  pending_photos: 3,
  upcoming_activities: 8,
  today_birthday_count: 2,
};

// ── Admin mock lists ──────────────────────────────────────────

export const MOCK_MEMBERS: Member[] = [
  { id: "m1",  member_number: "OIB-0001", full_name: "Olawale Adeyemi",      preferred_display_name: "Revd. Adeyemi",      membership_status: "active",   profile_photo_path: "https://i.pravatar.cc/150?img=60", profile_photo_status: "approved" },
  { id: "m2",  member_number: "OIB-0012", full_name: "Adaeze Okonkwo",      preferred_display_name: "Deaconess Adaeze",   membership_status: "active",   profile_photo_path: "https://i.pravatar.cc/150?img=47", profile_photo_status: "approved" },
  { id: "m3",  member_number: "OIB-0023", full_name: "Emmanuel Adeyemi",    preferred_display_name: "Bro. Emmanuel",      membership_status: "active",   profile_photo_path: "https://i.pravatar.cc/150?img=12", profile_photo_status: "approved" },
  { id: "m4",  member_number: "OIB-0034", full_name: "Grace Okeke",         preferred_display_name: "Sis. Grace",         membership_status: "active",   profile_photo_path: "https://i.pravatar.cc/150?img=5",  profile_photo_status: "approved" },
  { id: "m5",  member_number: "OIB-0045", full_name: "Chukwuemeka Eze",     preferred_display_name: "Deacon Emeka",       membership_status: "active",   profile_photo_path: "https://i.pravatar.cc/150?img=15", profile_photo_status: "approved" },
  { id: "m6",  member_number: "OIB-0056", full_name: "Blessing Nwosu",      preferred_display_name: "Sis. Blessing",      membership_status: "active",   profile_photo_path: null,                               profile_photo_status: "none"     },
  { id: "m7",  member_number: "OIB-0067", full_name: "Taiwo Olatunji",      preferred_display_name: "Bro. Taiwo",         membership_status: "active",   profile_photo_path: "https://i.pravatar.cc/150?img=33", profile_photo_status: "approved" },
  { id: "m8",  member_number: "OIB-0078", full_name: "Funmilayo Abiodun",   preferred_display_name: "Sis. Funmi",         membership_status: "active",   profile_photo_path: "https://i.pravatar.cc/150?img=44", profile_photo_status: "approved" },
  { id: "m9",  member_number: "OIB-0089", full_name: "Rotimi Adesanya",     preferred_display_name: "Bro. Rotimi",        membership_status: "active",   profile_photo_path: "https://i.pravatar.cc/150?img=20", profile_photo_status: "approved" },
  { id: "m10", member_number: "OIB-0100", full_name: "Kelechi Nwachukwu",   preferred_display_name: "Bro. Kelechi",       membership_status: "active",   profile_photo_path: "https://i.pravatar.cc/150?img=55", profile_photo_status: "approved" },
  { id: "m11", member_number: "OIB-0234", full_name: "Amara Obiechina",     preferred_display_name: "Sis. Amara",         membership_status: "pending",  profile_photo_path: null,                               profile_photo_status: "none"     },
  { id: "m12", member_number: "OIB-0235", full_name: "Gbenga Fashola",      preferred_display_name: "Bro. Gbenga",        membership_status: "pending",  profile_photo_path: "https://i.pravatar.cc/150?img=52", profile_photo_status: "pending"  },
];

// ── Mock visitor submissions ──────────────────────────────────

export const MOCK_VISITORS = [
  { id: "v1", name: "Tunde Martins",    email: "tunde@example.com", phone: "08012345678", service_attended: "Sunday Worship (9:00 AM)", message: "I really enjoyed the service and would love to know more about membership.", follow_up_permission: true,  visited_at: "2026-10-18T11:45:00+01:00", follow_up_status: "pending"   },
  { id: "v2", name: "Esther Obi",       email: null,               phone: "07098765432", service_attended: "Sunday Worship (9:00 AM)", message: null,                                                                      follow_up_permission: false, visited_at: "2026-10-11T12:10:00+01:00", follow_up_status: "not_needed" },
  { id: "v3", name: "Michael Adewale",  email: "mike@example.com", phone: null,           service_attended: "Bible Study (Wednesday)", message: "My wife attends this church. I joined for the first time last week.",       follow_up_permission: true,  visited_at: "2026-10-08T20:30:00+01:00", follow_up_status: "contacted" },
  { id: "v4", name: "Chiamaka Eze",     email: "chi@example.com",  phone: "09011223344", service_attended: "Sunday Worship (9:00 AM)", message: null,                                                                      follow_up_permission: true,  visited_at: "2026-10-04T11:50:00+01:00", follow_up_status: "pending"   },
];

// ── Pending photo submissions (admin) ─────────────────────────

export const MOCK_PENDING_PHOTOS = [
  { id: "ps1", member_id: "m6", member_name: "Blessing Nwosu",    member_number: "OIB-0056", file_path: "https://i.pravatar.cc/150?img=50", submitted_at: "2026-10-19T09:30:00+01:00", status: "pending", notes: null },
  { id: "ps2", member_id: "m11", member_name: "Amara Obiechina",  member_number: "OIB-0234", file_path: "https://i.pravatar.cc/150?img=49", submitted_at: "2026-10-18T15:20:00+01:00", status: "pending", notes: null },
  { id: "ps3", member_id: "m12", member_name: "Gbenga Fashola",   member_number: "OIB-0235", file_path: "https://i.pravatar.cc/150?img=52", submitted_at: "2026-10-17T11:00:00+01:00", status: "pending", notes: null },
];

// ── Pending registrations (admin) ────────────────────────────

export const MOCK_PENDING_REGISTRATIONS = [
  { id: "r1", full_name: "Amara Obiechina",   email: "amara@example.com",  phone: "08033445566", referral: "Sis. Grace Okeke",      date: "2026-10-10T09:00:00+01:00", status: "pending" },
  { id: "r2", full_name: "Gbenga Fashola",    email: "gbenga@example.com", phone: "07099887766", referral: "Bro. Taiwo Olatunji",   date: "2026-10-12T14:30:00+01:00", status: "pending" },
  { id: "r3", full_name: "Priscilla Nwoke",   email: null,                 phone: "08155667788", referral: "Deacon Emeka Eze",      date: "2026-10-14T10:00:00+01:00", status: "pending" },
  { id: "r4", full_name: "Samuel Olorunfemi", email: "sam@example.com",    phone: null,          referral: "Online — church website", date: "2026-10-15T08:00:00+01:00", status: "pending" },
  { id: "r5", full_name: "Veronica Asante",   email: "vero@example.com",   phone: "09066778899", referral: "Sis. Funmilayo Abiodun", date: "2026-10-17T16:00:00+01:00", status: "pending" },
];