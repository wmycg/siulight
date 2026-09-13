# 视觉方向与素材

视觉主张：夏日动画电影的空气感，与纸质社团纪念册的温度。暖白纸面、植物灰绿、大幅原创插画，以朱红作为唯一主要操作色。品牌名在首屏保持最高识别度，中文正文优先系统黑体，情绪句使用系统宋体，不依赖外部字体服务。

内容顺序：首页主视觉与加入入口 → 社团主张 → 活动 → 纪念册 → 部门 → 加入邀请。每段只承担一个内容目的。手机首屏重新安排插画和文字，活动与纪念改为单列；导航折叠，表单与弹窗保持可滚动。

动效：首屏文字淡入、图片随滚动轻微位移、段落进入视口显现、照片悬停缩放。尊重 prefers-reduced-motion。

## 原创插画

使用内置 imagegen 工具生成三个独立素材，并将项目实际引用的 WebP 文件存入 public/images。没有使用外链图片或第三方动漫角色。

- `summer.webp`：首页和夏日纪念。原稿约 1672×941，WebP 约 282 KB。
- `studio.webp`：创作活动和加入页。原稿 1536×1024，WebP 约 328 KB。
- `evening.webp`：放映室和年末纪念。原稿约 1672×941，WebP 约 262 KB。
- `qq.jpg`、`club-original.png`：来自旧站的原有社团素材。QQ 海报保留原样，实际群是否仍有效需社团确认。

### 最终生成提示词

**summer** — Use case: illustration-story. Create a premium original anime background illustration for the full-width hero of a Chinese university anime, manga and photography club website. Wide landscape 3:2 or 16:9. Cinematic hand-painted animation movie aesthetic, soft watercolor textures, fine pencil detail, beautiful nostalgic summer afternoon light. A quiet coastal hilltop overlooking a pale turquoise sea, gigantic soft white cumulus clouds in a washed light blue sky, lush deep green summer grass. On the RIGHT HALF, two university age friends from behind, one in white shirt carrying a camera and one in cream summer dress and straw hat, admiring the sea; a tiny orange cat near the path, a few wildflowers. Upper left and left middle are calm pale almost ivory blue open sky and distant sea, suitable for dark text overlay. Characters small relative to vast landscape. Composition has horizon around 60% down, with the hill, grass and characters concentrated on the right and bottom. Feels like a treasured summer memory, quietly adventurous, restrained and sophisticated. No text, no letters, no logos, no UI, no borders, no panels, no watermark. Harmonious muted celadon, cream, airy sky blue with tiny warm coral accents.

**studio** — Use case illustration-story. Original premium hand-painted anime movie background illustration for a university anime and photography club memory album. Landscape 3:2 composition. Nostalgic Japanese anime background art, gouache textures, fine detailed painting, soft warm late afternoon light. Close up of a wooden desk in a student art studio, several small hand-drawn original anime girl character postcards with no writing, a watercolor palette, jar with brushes, an open sketchbook of a female anime character, camera partly visible, a small orange daisy in a ceramic cup. Soft sunshine casts leaf shadows from a nearby open window. Background out of focus with green summer leaves outside, natural muted warm cream, peach and sage palette. Human touch and lovely imperfect analog material. Cinematic editorial crop. No people visible, no text, no writing, no logos, no watermark, no UI, no collage panels. Beautiful convincing tactile art making still life.

**evening** — Use case illustration-story. Original hand painted cinematic anime background illustration for university anime club movie night event cover and memory album. Wide landscape 16:9. Cozy empty small university club room at summer blue hour, large window on left overlooks trees and soft distant evening city lights, warm strings of tiny amber fairy lights hang near window, a white projector screen on the right showing an impressionistic blue sky with soft cloud (no text). Several mismatched low chairs and floor cushions arranged around a small wooden coffee table with cups and a bowl of popcorn. A camera and sketchbooks on a side shelf. Indigo twilight outside, warm soft amber lighting inside, restrained rich muted greens, navy and cream. Beautiful hand drawn anime art with soft gouache paper textures, painterly details, nostalgic cozy youth film feeling. No people, no text, no letters, no logos, no watermark, no UI, no panels. Strong composition suitable as an editorial cover photograph substitute, warm gathering place with air and room to breathe.

## UI 来源

基础组件采用 shadcn/ui 的源码式组件模式，参考官方 [Vite 安装文档](https://ui.shadcn.com/docs/installation/vite) 和 [手动安装文档](https://ui.shadcn.com/docs/installation/manual)，Radix 负责弹窗/标签的键盘操作与焦点管理；主题、间距和圆角按网站品牌定制。配置位于根目录 components.json，可继续使用 shadcn CLI 扩展。

## 2026-09-13 活动与纪念册视觉更新

以现有社团 logo 的绯红、奶油、深棕为统一色系。删除首页海岸大图、sticky 过渡和缩放裁切，社团介绍直接接活动。首页活动采用可手动切换的海报与票根；活动列表复用票根卡片。纪念册采用红色纸签、照片纸边、横线信纸与轻微错落布局，个人/多人仍使用真实参与者。动画限定为海报交叉淡入、文案轻移、列表错落入场、纸页悬停抬起；减少动态效果时停用位移。关闭详情时保留正文到退出动画结束，避免白框闪烁。未引入 3D。

新增项目资产：`public/images/club-days.webp`。使用内置 image_gen 生成，WebP 压缩后随项目保存。用于活动页首图和桌面纪念册封面，不覆盖用户上传的活动或纪念图片。

生成提示词：

> Use case: illustration-story. Asset: wide editorial illustration for a Chinese university anime/comics/photography club event page and memory scrapbook. Draw a beautiful contemporary Japanese anime promotional scene, crisp expressive cel shading and precise line art, not watercolor. Two fully clothed university-age friends at a sunlit creative club desk, one dark-haired girl sketching an original anime character in a sketchbook and one short-haired boy inspecting a camera beside her; friendly natural interaction, tasteful modern casual outfits in cream, cocoa and muted red. A small adorable honey blonde cat-ear hoodie mascot plush with red eyes sits on the desk between postcards, red event tickets without text, a camera, ink pens and washi tape. Compose characters in the right two thirds, desk fills foreground, clubroom shelves softly detailed in background, warm cream sunlight and muted crimson paper decorations, leafy courtyard visible through window, confident polished anime art direction. Clean harmonious composition, youthful, welcoming, bright and warm; strong vermilion accents reflecting a red circular club emblem, no green cast, no huge empty sky. Wide 1536x1024, no text, no typography, no logos, no watermarks, no UI.
