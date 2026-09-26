import { randomUUID } from 'node:crypto';
import { prisma, closeDatabase, toDatabaseDate } from './client';
import { hashPassword } from '../services/password';
import { saveMilestone } from '../services/milestones';
import type { Member } from '../../shared/types';
import { config } from '../config';
import { seedWall } from './seed-wall';
import { seedTimeline } from './seed-timeline';
if (config.production) throw new Error('演示种子禁止在 production 环境执行。');
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const memberPassword = process.env.SEED_MEMBER_PASSWORD;
if (!adminPassword || !memberPassword || adminPassword.length < 10 || memberPassword.length < 10)
  throw new Error('请在 .env 中配置至少 10 位的 SEED_ADMIN_PASSWORD 和 SEED_MEMBER_PASSWORD');
const accounts = [
  {
    email: 'admin@siulight.local',
    name: '微光编辑部',
    role: 'superadmin',
    color: '#698068',
    bio: '一起创作，一起相遇。这里记录着微光的每一次成长。',
  },
  {
    email: 'member@siulight.local',
    name: '小夏',
    role: 'member',
    color: '#c17d59',
    bio: '正在收集日落、好看的云，和一点点勇气。',
  },
  {
    email: 'lin@siulight.local',
    name: '林间',
    role: 'member',
    color: '#81967c',
    bio: '摄影练习生。把日常拍成电影，是我的小小愿望。',
  },
  {
    email: 'sora@siulight.local',
    name: '空白',
    role: 'member',
    color: '#8d9ba9',
    bio: '画画，打游戏，偶尔写一点故事。',
  },
  {
    email: 'momo@siulight.local',
    name: '桃子',
    role: 'member',
    color: '#c78b8a',
    bio: '想把喜欢的一切，都画下来。',
  },
  {
    email: 'haru@siulight.local',
    name: '阿晴',
    role: 'member',
    color: '#b49b65',
    bio: '下次一起去漫展吧！',
  },
];
try {
  const members: Member[] = [];
  for (const account of accounts) {
    let user = await prisma.user.findUnique({
      where: { email: account.email },
      select: { id: true, name: true, color: true, bio: true },
    });
    if (!user) {
      const id = randomUUID();
      await prisma.user.create({
        data: {
          id,
          email: account.email,
          name: account.name,
          role: account.role as 'member' | 'admin' | 'superadmin',
          color: account.color,
          bio: account.bio,
          passwordHash: await hashPassword(
            account.role === 'superadmin' ? adminPassword : memberPassword,
          ),
        },
      });
      user = { id, name: account.name, color: account.color, bio: account.bio };
    }
    members.push(user);
  }
  const events = [
    {
      title: '带上相机，去收集秋天的光',
      date: '2026-09-26',
      place: '校园集合 · 具体地点见社群',
      brief: '一场没有标准答案的校园漫游，手机、相机和好奇心都欢迎。',
      body: '演示活动，用于预览网站。\n\n周六下午 15:30，在社群确认集合点。带上相机或手机，我们一起在校园寻找秋天的光。结束后可以分享 3 张最喜欢的照片，聊聊它们背后的故事。\n\n无需摄影经验，请穿舒适的鞋；如遇下雨，活动时间会在社群另行通知。',
      image: '/images/summer.webp',
      category: '摄影',
      capacity: 30,
    },
    {
      title: '落笔成光 · 周末一起画画',
      date: '2026-10-03',
      place: '创作教室 · 社群预约',
      brief: '让脑洞落在纸上。带上你的 OC，我们把喜欢画成明信片。',
      body: '演示活动，用于预览网站。\n\n下午 14:00 开始，一起画画两小时。可以带自己的画具、数位板，或者简单的纸和笔。先分享一个最近的灵感，再一起完成一张小作品。\n\n新朋友也欢迎，不需要准备作品集。',
      image: '/images/studio.webp',
      category: '漫画',
      capacity: 20,
    },
    {
      title: '周五放映室 · 好故事值得一起看',
      date: '2026-10-09',
      place: '线上放映室 · 社群通知',
      brief: '留一个晚上给动画、零食，和散场后还想继续的聊天。',
      body: '演示活动，用于预览网站。\n\n周五晚上 19:30 相聚线上频道，交流喜欢的动画短片。片单与放映安排请以社群通知为准。\n\n欢迎带着想分享的作品来，我们一起聊聊喜欢的画面与台词。',
      image: '/images/evening.webp',
      category: '动画',
      capacity: 50,
    },
    {
      title: '夏日终章 · 我们的创作分享会',
      date: '2026-08-29',
      place: '线上社群',
      brief: '把一个夏天的练习、灵感和进步，分享给懂你的人。',
      body: '演示活动回顾。\n\n这一次，每个人都分享了一件自己喜欢的小作品。未完成的草稿、第一次剪辑的短片、练习中的游戏原型，都收到了认真回应。\n\n喜欢的事情，有人一起做，真好。',
      image: '/images/studio.webp',
      category: '社团',
      capacity: 60,
    },
  ];
  for (const e of events) {
    const found = await prisma.event.findFirst({ where: { title: e.title }, select: { id: true } });
    if (!found)
      await prisma.event.create({
        data: {
          id: randomUUID(),
          title: e.title,
          date: toDatabaseDate(e.date),
          place: e.place,
          brief: e.brief,
          body: e.body,
          image: e.image,
          category: e.category,
          capacity: e.capacity,
        },
      });
  }
  const memories = [
    {
      author: 0,
      title: '新的学期，故事继续。',
      date: '2026-09-10',
      kind: 'club' as const,
      category: '社团' as const,
      image: '/images/summer.webp',
      body: '又到了认识新朋友的季节。\n\n有人带来了画稿，有人举起了相机，也有人只是说了一句「我也喜欢」。原来相遇的开始，可以这样简单。\n\n新的一学期，愿微光继续照亮每一种小小的热爱。我们一起，把故事写下去。',
      participants: [0, 1, 2, 3, 4, 5],
    },
    {
      author: 1,
      title: '第一次，把「我想画」变成了「我画了」。',
      date: '2026-09-08',
      kind: 'personal' as const,
      category: '漫画' as const,
      image: '',
      body: '磨蹭了好久，终于完成了人生第一张原创插画。\n\n线条不够稳，上色也有点笨拙，但画里的那个夏天，确实是我想留下的夏天。\n\n谢谢桃子陪我改到最后。也谢谢那个一直没有放弃的自己。小小的一步，也值得庆祝，对吧？',
      participants: [1, 4],
    },
    {
      author: 4,
      title: '把喜欢，寄成一张明信片',
      date: '2026-09-06',
      kind: 'personal' as const,
      category: '漫画' as const,
      image: '/images/studio.webp',
      body: '自己的画印成了明信片，拿到手时，比想象中更开心。\n\n终于明白为什么大家会在创作时忘记时间。把脑海里的东西变成可以触摸的纸，真的很神奇。\n\n下一次，想把它送给远方的朋友。',
      participants: [4],
    },
    {
      author: 2,
      title: '我们追上了，那天最后一束光',
      date: '2026-08-28',
      kind: 'personal' as const,
      category: '摄影' as const,
      image: '/images/summer.webp',
      body: '本来只是随便走走，没想到一路走到了海边。\n\n太阳快落下的时候，大家都安静下来，只剩快门的声音。照片会褪色吗？不知道。但那天的风，应该会记得很久。',
      participants: [2, 1, 5],
    },
    {
      author: 3,
      title: '第一个能跑起来的游戏原型！',
      date: '2026-07-20',
      kind: 'personal' as const,
      category: '游戏' as const,
      image: '',
      body: '一只会跳的小猫，三个关卡，还有一个终于不穿墙的平台。\n\n这就是我们折腾了两个周末的成果。虽然还有好多 bug，但按下开始的那一刻，我们真的欢呼了。\n\n下一步，给小猫加一个更可爱的待机动画。',
      participants: [3, 4],
    },
    {
      author: 0,
      title: '这一年的微光，都在这里',
      date: '2025-12-28',
      kind: 'club' as const,
      category: '社团' as const,
      image: '/images/evening.webp',
      body: '把一年里散落的照片拼在一起，才发现原来我们已经走了这么远。\n\n有第一次站上舞台的紧张，有作品完成时的满足，也有散场之后一起吃的那碗面。\n\n谢谢每一个出现在微光里的你。下一年，也要一起发光。',
      participants: [0, 1, 2, 3, 4, 5],
    },
  ];
  for (const m of memories) {
    const found = await prisma.milestone.findFirst({
      where: { title: m.title },
      select: { id: true },
    });
    if (!found)
      await saveMilestone(
        randomUUID(),
        members[m.author].id,
        {
          title: m.title,
          body: m.body,
          date: m.date,
          kind: m.kind,
          category: m.category,
          image: m.image,
          participantIds: m.participants.map((i) => members[i].id),
        },
        false,
      );
  }
  await seedWall();
  await seedTimeline(members);
  console.log(
    'Demo seed complete: accounts, events, memories, shared story and message wall. Existing data/passwords left unchanged.',
  );
  console.log('演示内容不代表真实社团历史；上线前请替换。账号说明见 README.md。');
} finally {
  await closeDatabase();
}
