import { randomUUID } from 'node:crypto';
import { prisma, toDatabaseDate } from './client';
import { saveMilestone } from '../services/milestones';
import type { Member } from '../../shared/types';

export async function seedTimeline(members: Member[]) {
  const title = '社团创作日 · 把夏天装进画框';
  let event = await prisma.event.findFirst({ where: { title }, select: { id: true } });
  if (!event) {
    event = { id: randomUUID() };
    await prisma.event.create({
      data: {
        id: event.id,
        title,
        date: toDatabaseDate('2026-09-07'),
        place: '创作教室 · 演示活动',
        brief: '画稿、相机和伙伴，一起留下夏末的一天。',
        body: '演示活动，用于预览共同故事时间轴，不代表真实社团历史。',
        image: '/images/studio.webp',
        category: '社团',
        capacity: 30,
      },
    });
  }
  const stories = [
    {
      author: 1,
      title: '第一次把自己的画送给朋友',
      body: '演示纪念，用于预览共同活动的不同视角。\n\n画得有点慢，但大家一直等我。把那张小小的明信片递出去时，忽然觉得，创作最好的部分是可以分享。',
      image: '/images/studio.webp',
    },
    {
      author: 2,
      title: '照片里，大家都在认真发光',
      body: '演示纪念，用于预览共同活动的不同视角。\n\n我负责记录今天。画画的人、递颜料的人，还有窗边正在聊天的人，都成了这卷照片里最喜欢的瞬间。',
      image: '/images/club-days.webp',
    },
    {
      author: 4,
      title: '一起创作的下午，比想象中更短',
      body: '演示纪念，用于预览共同活动的不同视角。\n\n本来只想来坐坐，结果画完了一张新草稿，还认识了两位同好。下次也想继续来。',
      image: '',
    },
  ];
  for (const story of stories) {
    const found = await prisma.milestone.findFirst({
      where: { title: story.title },
      select: { id: true },
    });
    if (!found)
      await saveMilestone(
        randomUUID(),
        members[story.author].id,
        {
          title: story.title,
          body: story.body,
          date: '2026-09-07',
          kind: 'personal',
          category: '漫画',
          image: story.image,
          eventId: event.id,
          participantIds: [],
        },
        false,
      );
  }
}
