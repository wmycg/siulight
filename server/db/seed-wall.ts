import { rows, run } from './client';
import { noteColors } from '../../shared/types';

// Development-only sample content. Every sample is visibly labelled in the UI.
const notes = [
  ['路过的猫', '如果今天有点累，\n就在这里停一会儿。'],
  ['小夏', '今天的云，\n像动画电影的开场。'],
  ['空白', '画得慢也没关系。\n我的 OC 会等我。'],
  ['桃子', '想和你交换一张\n自己画的明信片。'],
  ['阿晴', '下次漫展，\n一起出发吧！'],
  ['林间', '普通的日子，也有值得按下快门的一秒。'],
  ['不熬夜同盟', '再画最后一笔就睡。\n……真的最后一笔。'],
  ['像素猫', '终于给小猫写好了跳跃。\n它现在会飞过整个屏幕了。'],
  ['放映室常客', '片尾曲响起的时候，\n总舍不得先走。'],
  ['新同学', '原来我喜欢的那部冷门番，真的有人看过！'],
  ['日落收集员', '把今天的落日\n分你一半。'],
  ['咕咕', '进度：线稿 100%\n上色 0%\n期待值 1000%'],
  ['铅笔', '不必一开始就很厉害。\n我们可以一起练习。'],
  ['留白', '愿每一个小小的喜欢，\n都被温柔地接住。'],
  ['快门', '照片里的风，\n刚好吹到了这里。'],
  ['青柠', '想组一个周末画画小队。\n画不好也欢迎加入！'],
  ['游戏存档', 'SAVE POINT\n在这里，保存一下今天的好心情。'],
  ['晚风', '写下一句喜欢的话，\n等一个同频的人。'],
  ['社团观察员', '我喜欢创作时，\n大家眼睛里那一点光。'],
  ['奶油面包', '赶完稿之后的第一口面包，世界第一好吃。'],
  ['慢慢来', '那些没有完成的草稿，\n也记录着你在努力。'],
  ['星星', '如果抓到这张纸条，\n祝你今天有一件小小的好事。'],
  ['纸飞机', '不确定会被谁看见，\n但还是想说：你好呀。'],
  ['微光编辑部', '欢迎来到留言墙。\n把你的一点心意，贴在这里。'],
];
export async function seedWall() {
  for (const [index, [nickname, body]] of notes.entries()) {
    const [found] = await rows(
      'SELECT id FROM wall_notes WHERE isDemo=1 AND nickname=? AND body=? LIMIT 1',
      [nickname, body],
    );
    if (!found)
      await run('INSERT INTO wall_notes (body,nickname,color,isDemo) VALUES (?,?,?,1)', [
        body,
        nickname,
        noteColors[index % noteColors.length],
      ]);
  }
}
