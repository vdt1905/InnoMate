// Demo data for showing InnoMate off (e.g. in an interview).
//
//   npm run seed:demo -- --email you@example.com      seed around your account
//   npm run seed:demo -- --username harsh             …or find it by username
//   npm run seed:demo -- --email you@example.com --remove   delete it all again
//
// Everything created here is either owned by a demo user (email ends in
// DEMO_DOMAIN) or is one of your projects with a title from YOUR_PROJECTS, which
// is how --remove finds exactly what this script made. Re-running first removes
// the previous seed, so it is safe to run repeatedly.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
import { Idea } from '../models/Idea.js';
import { JoinRequest } from '../models/JoinRequest.js';
import { Message } from '../models/Message.js';
import { Conversation, conversationKey } from '../models/Conversation.js';
import { DirectMessage } from '../models/DirectMessage.js';
import { Notification } from '../models/Notification.js';

dotenv.config();

const DEMO_DOMAIN = '@demo.innomate.dev';
const daysAgo = (d, hours = 0) => new Date(Date.now() - (d * 24 + hours) * 60 * 60 * 1000);

const DEMO_USERS = [
  { key: 'aisha', name: 'Aisha Verma', bio: 'Product designer. I turn messy flows into simple screens.', skills: ['Figma', 'UI Design', 'React', 'Tailwind CSS'] },
  { key: 'rohan', name: 'Rohan Iyer', bio: 'Backend engineer. APIs, queues and databases that stay up.', skills: ['Node.js', 'Express.js', 'MongoDB', 'Docker'] },
  { key: 'meera', name: 'Meera Nair', bio: 'ML engineer working on applied NLP and health data.', skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'] },
  { key: 'kabir', name: 'Kabir Singh', bio: 'Mobile developer. Shipped 3 apps to the Play Store.', skills: ['React Native', 'Flutter', 'Firebase'] },
  { key: 'ananya', name: 'Ananya Das', bio: 'Cloud & DevOps. Automating everything twice.', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'] },
  { key: 'dev', name: 'Dev Malhotra', bio: 'Full-stack TypeScript developer and open-source contributor.', skills: ['TypeScript', 'Next.js', 'PostgreSQL', 'GraphQL'] },
];

// Projects owned by YOU. `members` are demo users already on the team;
// `requests` are demo users with a pending join request you can accept live.
const YOUR_PROJECTS = [
  {
    title: 'CampusConnect — Student Marketplace',
    description: 'A buy/sell/swap marketplace for students on the same campus. Sign-up is restricted to verified college emails, listings support photos and price negotiation, and buyers chat with sellers in real time.\n\nCurrently building: live chat on Socket.io and a moderation queue for reported listings.',
    skillsRequired: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'Tailwind CSS'],
    tags: ['Marketplace', 'Real-time', 'Students'],
    projectType: 'personal',
    members: ['aisha', 'rohan'],
    requests: ['dev'],
    likes: ['aisha', 'rohan', 'meera', 'kabir', 'dev'],
    comments: [
      ['meera', 'Would love a "free stuff" section at the end of each semester — hostel move-outs are chaos.', 20],
      ['dev', 'Are you planning escrow for payments or keeping it cash-on-meetup?', 12],
      ['aisha', 'First pass of the listing flow is up in Figma — feedback welcome!', 6],
    ],
    createdDaysAgo: 34,
  },
  {
    title: 'MediTrack — AI Medicine Reminders',
    description: 'Photograph a prescription and MediTrack reads it with OCR, extracts medicines and dosages, and schedules reminders for the patient and a caregiver. Built for elderly patients managing multiple prescriptions.',
    skillsRequired: ['Python', 'Machine Learning', 'React Native', 'Firebase'],
    tags: ['Healthcare', 'AI', 'Mobile'],
    projectType: 'hackathon',
    hackathon: { maxTeamSize: 4, description: 'Smart India Hackathon — Healthcare track. 36-hour build: prescription OCR → dosage extraction → caregiver alerts.' },
    members: ['meera', 'kabir'],
    requests: ['ananya'],
    likes: ['meera', 'kabir', 'aisha', 'rohan', 'ananya', 'dev'],
    comments: [
      ['rohan', 'Handwritten prescriptions are the hard part — which OCR model are you using?', 18],
      ['kabir', 'Reminder notifications are working on Android. iOS next.', 9],
    ],
    createdDaysAgo: 52,
  },
  {
    title: 'DevPulse — GitHub Analytics Dashboard',
    description: 'A dashboard that turns a team\'s GitHub activity into useful signals: PR review turnaround, stale branches, bus-factor per repo, and weekly contribution trends. No vanity metrics.',
    skillsRequired: ['TypeScript', 'Next.js', 'GraphQL', 'PostgreSQL'],
    tags: ['Developer Tools', 'Analytics', 'Open Source'],
    projectType: 'personal',
    members: ['dev'],
    requests: [],
    likes: ['dev', 'ananya', 'rohan'],
    comments: [['ananya', 'PR turnaround per reviewer would be super useful for our team.', 4]],
    createdDaysAgo: 15,
  },
  {
    title: 'GreenRoute — Carbon-aware Trip Planner',
    description: 'Compares routes by time, cost and CO₂ across metro, bus, cab and bike, then nudges users toward the lowest-emission option that still gets them there on time.',
    skillsRequired: ['React', 'Node.js', 'Python', 'Maps API'],
    tags: ['Sustainability', 'Maps', 'Social Impact'],
    projectType: 'hackathon',
    hackathon: { maxTeamSize: 5, description: 'Google Solution Challenge — UN SDG 11 & 13. Prototype due in 6 weeks.' },
    members: ['ananya', 'rohan', 'meera'],
    requests: [],
    likes: ['ananya', 'rohan', 'meera', 'aisha'],
    comments: [],
    createdDaysAgo: 70,
  },
];

// Projects owned by demo users. `withYou` puts you on the team (so the Teams
// "Member" tab and Messages have content); the rest just fill the feed.
const OTHER_PROJECTS = [
  {
    owner: 'aisha', withYou: true,
    title: 'Nirvana — Mental Wellness Journal',
    description: 'A private journaling app with mood tracking and gentle weekly reflections. Everything is encrypted on-device.',
    skillsRequired: ['React Native', 'UI Design', 'Firebase', 'Node.js'],
    tags: ['Wellness', 'Mobile', 'Privacy'],
    projectType: 'personal', members: ['kabir'], likes: ['kabir', 'meera', 'dev'], createdDaysAgo: 41,
  },
  {
    owner: 'rohan', withYou: true,
    title: 'OpenShelf — Community Library',
    description: 'Lend and borrow books within your neighbourhood. Tracks who has what, sends return reminders and builds a reading map of the community.',
    skillsRequired: ['Node.js', 'Express.js', 'MongoDB', 'React'],
    tags: ['Community', 'Books'],
    projectType: 'personal', members: [], likes: ['aisha', 'ananya'], createdDaysAgo: 26,
  },
  {
    owner: 'meera',
    title: 'LexiLearn — Vocabulary with Spaced Repetition',
    description: 'Learn words from what you actually read: paste an article and LexiLearn builds a spaced-repetition deck from the words you don\'t know yet.',
    skillsRequired: ['Python', 'Machine Learning', 'React'],
    tags: ['EdTech', 'NLP'],
    projectType: 'personal', members: [], likes: ['aisha', 'dev', 'kabir'], createdDaysAgo: 8,
  },
  {
    owner: 'ananya',
    title: 'ShipIt — Zero-config CI Pipelines',
    description: 'Point ShipIt at a repo and it detects the stack, then generates a working CI pipeline with tests, caching and preview deploys.',
    skillsRequired: ['Docker', 'Kubernetes', 'Node.js', 'CI/CD'],
    tags: ['DevOps', 'Developer Tools'],
    projectType: 'hackathon', hackathon: { maxTeamSize: 3, description: 'HackMIT — DevTools track.' },
    members: [], likes: ['rohan', 'dev'], createdDaysAgo: 3,
  },
  {
    owner: 'dev',
    title: 'Quill — Collaborative Markdown Editor',
    description: 'Google-Docs-style real-time editing for Markdown with comments, version history and export to PDF.',
    skillsRequired: ['TypeScript', 'React', 'Node.js', 'Socket.io'],
    tags: ['Productivity', 'Real-time'],
    projectType: 'personal', members: [], likes: ['aisha', 'rohan', 'meera', 'ananya'], createdDaysAgo: 1,
  },
];

// Team chat history. 'you' is the target account.
const CHATS = {
  'CampusConnect — Student Marketplace': [
    ['rohan', 'Listings API is merged. Pagination + filters by category are live on staging.', 5, 3],
    ['you', 'Nice! I\'ll wire the frontend grid to it today.', 5, 2],
    ['aisha', 'Pushed updated listing card designs — went with a denser grid like we discussed.', 3, 6],
    ['you', 'Looks great. Can we add a "sold" state to the card?', 3, 5],
    ['aisha', 'Yep, adding it now.', 3, 5],
    ['rohan', 'Heads up: chat needs a Redis adapter once we have more than one server instance.', 1, 4],
  ],
  'MediTrack — AI Medicine Reminders': [
    ['meera', 'OCR accuracy on printed prescriptions is ~94%. Handwritten is closer to 70%.', 4, 8],
    ['you', 'Let\'s ship printed-only for the demo and show handwritten as future work.', 4, 7],
    ['kabir', 'Agreed. Notifications fire correctly on Android 13 now.', 2, 3],
    ['you', 'I\'ll put together the pitch deck tonight.', 2, 2],
  ],
  'Nirvana — Mental Wellness Journal': [
    ['aisha', 'Welcome to the team! Onboarding doc is pinned in the repo README.', 10, 1],
    ['you', 'Thanks! I can take the weekly-reflection screen.', 10, 0],
    ['kabir', 'Encryption module is done — keys never leave the device.', 6, 4],
  ],
};

// Demo users inviting YOU to their projects — they show up as actionable
// notifications with a "Join team" button.
const INVITES_TO_YOU = [
  { from: 'ananya', project: 'ShipIt — Zero-config CI Pipelines', hoursAgo: 3 },
  { from: 'meera', project: 'LexiLearn — Vocabulary with Spaced Repetition', hoursAgo: 26 },
];

// One-to-one conversations with you. `read: false` leaves the last message
// unread so the Messages dot shows up in the demo.
const DIRECT_MESSAGES = [
  {
    with: 'dev', read: false,
    lines: [
      ['dev', 'Hi! I just sent a request to join CampusConnect.', 0, 5],
      ['dev', 'I built a marketplace with Next.js last semester — happy to own search and filters if that helps.', 0, 5],
    ],
  },
  {
    with: 'aisha', read: true,
    lines: [
      ['aisha', 'Hey! Do you have wireframes for the CampusConnect listing page yet?', 3, 9],
      ['you', 'Not yet — want to take a first pass?', 3, 8],
      ['aisha', "Sure, I'll share something by Friday.", 3, 8],
      ['you', 'Perfect, thanks!', 3, 7],
    ],
  },
  {
    with: 'meera', read: true,
    lines: [
      ['you', 'Could you share the OCR accuracy numbers before the MediTrack demo?', 5, 2],
      ['meera', 'Posted them in the team chat. Printed ~94%, handwritten ~70%.', 5, 1],
    ],
  },
];

const parseArgs = () => {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : undefined;
  };
  return { email: get('--email'), username: get('--username'), remove: args.includes('--remove') };
};

const removeSeed = async (target) => {
  const demoEmail = new RegExp(`${DEMO_DOMAIN.replace(/[.]/g, '[.]')}$`);
  const demoUsers = await User.find({ email: demoEmail }).select('_id');
  const demoIds = demoUsers.map((u) => u._id);
  const ideas = await Idea.find({
    $or: [
      { createdBy: { $in: demoIds } },
      { createdBy: target._id, title: { $in: YOUR_PROJECTS.map((p) => p.title) } },
    ],
  }).select('_id');
  const ideaIds = ideas.map((i) => i._id);

  const conversations = await Conversation.find({ participants: { $in: demoIds } }).select('_id');
  const conversationIds = conversations.map((c) => c._id);

  const [msgs, reqs, ideaRes, userRes, dms] = await Promise.all([
    Message.deleteMany({ teamId: { $in: ideaIds } }),
    JoinRequest.deleteMany({ $or: [{ ideaId: { $in: ideaIds } }, { requester: { $in: demoIds } }] }),
    Idea.deleteMany({ _id: { $in: ideaIds } }),
    User.deleteMany({ _id: { $in: demoIds } }),
    DirectMessage.deleteMany({ conversation: { $in: conversationIds } }),
  ]);
  await Conversation.deleteMany({ _id: { $in: conversationIds } });
  const notes = await Notification.deleteMany({
    $or: [{ actor: { $in: demoIds } }, { idea: { $in: ideaIds } }, { recipient: { $in: demoIds } }],
  });
  return {
    users: userRes.deletedCount, projects: ideaRes.deletedCount, requests: reqs.deletedCount,
    messages: msgs.deletedCount, conversations: conversationIds.length, directMessages: dms.deletedCount,
    notifications: notes.deletedCount,
  };
};

// Mongoose stamps createdAt with "now" on create; backdate through the driver.
const backdate = (Model, id, date) =>
  Model.collection.updateOne({ _id: id }, { $set: { createdAt: date, updatedAt: date } });

const seed = async (target) => {
  // Demo users
  const users = {};
  for (const [i, u] of DEMO_USERS.entries()) {
    users[u.key] = await User.create({
      name: u.name,
      username: `${u.key}.demo`,
      email: `${u.key}${DEMO_DOMAIN}`,
      password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
      bio: u.bio,
      skills: u.skills,
    });
    await backdate(User, users[u.key]._id, daysAgo(120 - i * 7));
  }
  users.you = target;

  const toIds = (keys) => keys.map((k) => users[k]._id);
  const buildComments = (list = []) =>
    list.map(([who, text, d]) => ({ user: users[who]._id, text, createdAt: daysAgo(d, 3) }));

  const createProject = async (owner, p, extraMembers = []) => {
    const idea = await Idea.create({
      title: p.title,
      description: p.description,
      skillsRequired: p.skillsRequired,
      tags: p.tags,
      projectType: p.projectType,
      hackathon: p.hackathon
        ? { isHackathon: true, maxTeamSize: p.hackathon.maxTeamSize, description: p.hackathon.description }
        : { isHackathon: false },
      createdBy: owner._id,
      teamMembers: [owner._id, ...toIds(p.members || []), ...extraMembers],
      likes: toIds(p.likes || []),
      comments: buildComments(p.comments),
    });
    await backdate(Idea, idea._id, daysAgo(p.createdDaysAgo));
    return idea;
  };

  const ideasByTitle = {};

  const notes = [];
  const note = (recipient, actor, type, idea, joinRequest, at, read) =>
    notes.push({ recipient, actor, type, idea, joinRequest, read, createdAt: at, updatedAt: at, __v: 0 });

  for (const p of YOUR_PROJECTS) {
    const idea = await createProject(target, p);
    ideasByTitle[p.title] = idea;
    for (const [i, who] of (p.requests || []).entries()) {
      const req = await JoinRequest.create({
        ideaId: idea._id,
        projectTitle: idea.title,
        leaderId: target._id,
        leaderName: target.name,
        requester: users[who]._id,
        requesterName: users[who].name,
        status: 'pending',
        type: 'request',
      });
      await backdate(JoinRequest, req._id, daysAgo(1 + i, 5));
      note(target._id, users[who]._id, 'join_request', idea._id, req._id, daysAgo(1 + i, 5), false);
    }
    // A teammate who came in through an invite, for a resolved history item.
    if (p.members?.length) {
      const joiner = users[p.members[p.members.length - 1]];
      note(target._id, joiner._id, 'invite_accepted', idea._id, null, daysAgo(p.createdDaysAgo - 3), true);
    }
  }

  for (const p of OTHER_PROJECTS) {
    const idea = await createProject(users[p.owner], p, p.withYou ? [target._id] : []);
    ideasByTitle[p.title] = idea;
    if (p.withYou) {
      // Record how you got onto the team, as the real join flow would.
      const req = await JoinRequest.create({
        ideaId: idea._id,
        projectTitle: idea.title,
        leaderId: users[p.owner]._id,
        leaderName: users[p.owner].name,
        requester: target._id,
        requesterName: target.name,
        status: 'accepted',
        type: 'request',
      });
      await backdate(JoinRequest, req._id, daysAgo(p.createdDaysAgo - 2));
      note(target._id, users[p.owner]._id, 'request_accepted', idea._id, req._id, daysAgo(p.createdDaysAgo - 2), true);
    }
  }

  for (const inv of INVITES_TO_YOU) {
    const idea = ideasByTitle[inv.project];
    const owner = users[inv.from];
    const at = daysAgo(0, inv.hoursAgo);
    const invite = await JoinRequest.create({
      ideaId: idea._id,
      projectTitle: idea.title,
      leaderId: owner._id,
      leaderName: owner.name,
      requester: target._id,
      requesterName: target.name,
      status: 'pending',
      type: 'invite',
    });
    await backdate(JoinRequest, invite._id, at);
    note(target._id, owner._id, 'invite', idea._id, invite._id, at, false);
  }

  let messageCount = 0;
  for (const [title, lines] of Object.entries(CHATS)) {
    const teamId = ideasByTitle[title]._id;
    const docs = lines.map(([who, text, d, h]) => {
      const sender = users[who];
      const at = daysAgo(d, h);
      return {
        teamId,
        senderId: sender._id,
        reqSender: { name: sender.name, username: sender.username, avatar: sender.avatar || '' },
        text,
        createdAt: at,
        updatedAt: at,
        __v: 0,
      };
    });
    await Message.collection.insertMany(docs);
    messageCount += docs.length;
  }

  await Notification.collection.insertMany(notes);

  let dmCount = 0;
  for (const convo of DIRECT_MESSAGES) {
    const other = users[convo.with];
    const docs = convo.lines.map(([who, text, d, h]) => {
      const at = daysAgo(d, h);
      return { sender: users[who]._id, text, createdAt: at, updatedAt: at };
    });
    const last = docs[docs.length - 1];
    const conversation = await Conversation.create({
      key: conversationKey(target._id, other._id),
      participants: [target._id, other._id],
      lastMessage: { text: last.text, sender: last.sender, createdAt: last.createdAt },
      // Mark read up to the last message, or to just before it for "unread".
      lastReadAt: {
        [target._id.toString()]: convo.read ? last.createdAt : new Date(docs[0].createdAt.getTime() - 60000),
        [other._id.toString()]: last.createdAt,
      },
    });
    await backdate(Conversation, conversation._id, last.createdAt);
    await DirectMessage.collection.insertMany(
      docs.map((doc) => ({ ...doc, conversation: conversation._id, __v: 0 }))
    );
    dmCount += docs.length;
  }

  // A profile with no skills or bio makes the feed and profile look empty in a
  // demo — fill them only if they are blank, never overwrite what you wrote.
  const profileUpdates = {};
  if (!target.skills?.length) profileUpdates.skills = ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'Tailwind CSS'];
  if (!target.bio) profileUpdates.bio = 'Full-stack developer building tools that help people find collaborators. Creator of InnoMate.';
  if (Object.keys(profileUpdates).length) await User.updateOne({ _id: target._id }, { $set: profileUpdates });

  return {
    users: DEMO_USERS.length,
    yourProjects: YOUR_PROJECTS.length,
    otherProjects: OTHER_PROJECTS.length,
    pendingRequests: YOUR_PROJECTS.reduce((n, p) => n + (p.requests?.length || 0), 0),
    messages: messageCount,
    directConversations: DIRECT_MESSAGES.length,
    invitesToYou: INVITES_TO_YOU.length,
    notifications: notes.length,
    directMessages: dmCount,
    profileFilled: Object.keys(profileUpdates),
  };
};

const main = async () => {
  const { email, username, remove } = parseArgs();
  if (!email && !username) {
    console.error('Tell me whose profile to seed: --email you@example.com  or  --username yourname');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

  const target = await User.findOne(email ? { email } : { username });
  if (!target) {
    console.error(`No account found for ${email || username}. Log in to the app once first so it exists.`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Account: ${target.name} (@${target.username}, ${target.email})`);

  const removed = await removeSeed(target);
  if (remove) {
    console.log('Removed demo data:', removed);
  } else {
    if (removed.projects || removed.users) console.log('Cleared previous demo data:', removed);
    console.log('Seeded:', await seed(target));
  }

  await mongoose.disconnect();
};

main().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
