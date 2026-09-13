# 微光漫摄 · 二次元社团网站

这是一个使用 Vue 3 + Vite 构建的社团展示站。项目采用“战术终端 / 动画档案”视觉方向：深色控制台、编号导航、状态标识、青色信号线和珊瑚色警示色共同组成页面骨架。

当前版本优先完成界面和交互框架，活动数据仍可按需录入；部门页面已采用无图片的部门档案布局，只展示部门名称与简介。

## 快速开始

环境要求：Node.js 18+，npm 9+。

```bash
npm install
npm run dev
```

开发服务器启动后，打开终端显示的本地地址（通常是 `http://localhost:5173`）。

常用命令：

```bash
npm run build    # 构建生产文件到 dist/
npm run preview  # 预览已构建的 dist/
npm run format   # 使用 Prettier 格式化 CSS 和 src/
```

## Docker 部署

项目根目录提供了 `docker-compose.yml`，会启动 MySQL、Spring Boot 和 Nginx 三个服务。服务器安装 Docker 和 Docker Compose 后执行：

```bash
cp .env.example .env
# 编辑 .env，至少修改 MYSQL_ROOT_PASSWORD
docker compose up -d --build
docker compose ps
```

浏览器访问服务器的 `80` 端口。Nginx 会托管前端静态文件，并把 `/api/**` 转发给后端；History 路由刷新也会回退到 `index.html`。如果服务器的 80 端口已被占用，将 `docker-compose.yml` 中的 `80:80` 改成例如 `8081:80`。

首次启动会创建 `siulightdatabase` 数据库，后端启动时会执行 `club/src/main/resources/schema.sql` 创建 `milestones` 表。要迁移现有本地数据，先导出数据库，再导入容器：

```bash
mysqldump -u root -p siulightdatabase > siulightdatabase.sql
docker compose up -d db
docker compose exec -T db sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' < siulightdatabase.sql
docker compose up -d --build backend frontend
```

数据库数据保存在 Docker volume `mysql_data` 中。不要使用 `docker compose down -v`，否则会删除数据库卷。

## 目录结构

```text
.
├─ index.html                 # Vite HTML 入口
├─ package.json               # 脚本和依赖
├─ vite.config.mjs            # Vite + Vue 插件配置
└─ src/
   ├─ main.js                 # 创建 Vue 应用并挂载全局 CSS
   ├─ app/                    # 应用外壳与路由配置
   │  ├─ App.vue
   │  └─ routes.js
   ├─ shared/                 # 跨业务域复用代码
   │  ├─ components/          # 通用排版组件
   │  ├─ layout/              # 顶部导航和页脚
   │  └─ services/api.js      # 统一 HTTP 请求
   ├─ modules/                # 按后端业务域组织功能
   │  ├─ club/                # 首页、关于社团和社团内容
   │  ├─ department/          # 部门页面、卡片和部门内容
   │  ├─ events/              # 活动页面、卡片和活动服务
   │  ├─ submit/              # 加入申请页面和提交服务
   │  ├─ milestone/           # 里程碑页面、时间轴和里程碑服务
   │  └─ admin/               # 后台页面、工作区和管理员服务
   └─ assets/                 # 图片和全局样式
```

## 页面和路由

项目没有使用 Vue Router，而是使用 History API 实现轻量单页导航。`src/app/routes.js` 中的 `routeViews` 是唯一的路由映射表。

| Path           | 页面                   | 顶栏编号 | 状态代码  |
| -------------- | ---------------------- | -------- | --------- |
| `/`            | 首页 / BASE CAMP       | 01       | `INDEX`   |
| `/about`       | 关于社团 / PROFILE     | 02       | `ABOUT`   |
| `/departments` | 部门档案 / DEPARTMENTS | 03       | `UNITS`   |
| `/events`      | 活动日历 / SCHEDULE    | 04       | `EVENTS`  |
| `/join`        | 加入我们 / OPEN CALL   | 05       | `JOIN`    |
| `/milestones`  | 里程碑 / MILESTONES    | 06       | `ARCHIVE` |

后台页面使用 `/admin/events`、`/admin/submits`、`/admin/profile` 和 `/admin/managers`。直接访问不存在的路径会回退到首页（`/admin` 下的未知路径回退到 `/admin/events`）。导航点击由 `SiteHeader` 发出 `navigate` 事件，应用外壳更新浏览器路径和当前页面；页面内部按钮也通过同一个事件切换页面。旧的 hash 地址会在首次访问时自动转换为对应的 history 地址。

## 核心运行机制

### 应用外壳：`src/app/App.vue`

- `route`：当前 pathname 路由。
- `currentView`：根据路由选择要渲染的 Vue 组件。
- `routeMeta`：为顶部状态栏提供编号、页面标题和代码。
- `theme`：当前主题，值为 `day` 或 `night`。
- `readTheme()` / `toggleTheme()`：从 `localStorage` 读取和保存主题，键名为 `weiguang-theme`。
- `Transition`：使用 Vue 内置 CSS 过渡处理路由切换动画。

### 主题

主题通过 `document.body.dataset.theme` 注入：

```html
<body data-theme="day"></body>
```

全局 CSS 使用变量控制颜色。夜间主题覆盖 `--paper`、`--ink`、`--muted`、`--coral` 等变量，因此新增组件时应优先使用这些变量，不要写死页面背景和文字颜色。

### 响应式布局

- 桌面端：顶部横向 command deck 导航。
- `880px` 以下：导航变为可横向滚动的第二行，内容区取消顶部留白。
- `620px` 以下：缩小标题、状态栏和导航项，并将多列内容压缩为单列。

样式遵循 Vue 单文件组件规范：组件和页面布局、响应式规则、动效都写在对应 `.vue` 文件的 `<style scoped>` 中；`src/app/App.vue` 的外壳和路由过渡使用普通 `<style>`，因为它们需要跨页面生效。`src/assets/styles/styles.css` 只负责字体、颜色变量、reset 和全局无障碍规则。新增组件时不要把局部选择器继续堆到全局 CSS。

## 数据模型

### 社团信息：`src/modules/club/club.js`

```js
{
  name: String,
  englishName: String,
  tagline: String,
  intro: String,
  stats: [{ value: String, label: String }]
}
```

首页和关于页面直接读取 `club.intro`、`club.stats` 等字段。

### 部门：`src/modules/department/departments.js`

```js
{
  id: String,        // 稳定的部门标识
  code: String,      // 档案编号，例如 GAME、VISUAL
  name: String,      // 部门名称
  intro: String      // 部门简介
}
```

`DepartmentsPage.vue` 会过滤掉缺少 `name` 或 `intro` 的记录，再遍历渲染 `DepartmentCard`。页面不依赖图片字段；如暂无部门资料，会显示明确的空状态而不是渲染空卡片。

### 里程碑：`src/modules/milestone/` + `/api/milestones`

- `config.js` 集中维护时间轴间距、留言长度和四季月份。
- `seasons.js` 根据每条铭文的真实日期判断季节，视口指示器跟随中心铭文更新。
- `src/modules/milestone/services/milestones.js` 通过后端 API 读取和提交铭文，后端按会话和学期执行留言限制。
- 里程碑列表和留言均通过后端 API 使用 MySQL 持久化；访问者身份由服务端会话维护。

### 活动：`src/modules/events/services/events.js`

```js
{
  id: String,       // 稳定且唯一的活动标识，用作 Vue 列表 key
  date: String,   // 日期数字
  title: String,  // 活动名称
  place: String,  // 地点
  brief: String    // 活动简介
}
```

首页展示前三条活动，活动日历展示全部活动。`id` 必须在活动之间保持唯一，不能使用日期作为 key，因为同一天可能有多个活动。活动内容由后台活动管理维护，不需要修改卡片组件。

## 组件通信约定

- `src/app/App.vue` 向 `SiteHeader` 传入 `activeRoute`、`isNight`。
- `SiteHeader` 只负责发出 `navigate` 和 `toggle-theme`，不直接修改全局状态。
- 各个页面通过 `defineEmits(["navigate"])` 将跳转请求交给应用外壳。
- `DepartmentCard` 和 `EventCard` 通过必填 prop 接收单条数据，保持无状态展示。

新增页面时，按以下顺序接入：

1. 在对应的 `src/modules/<domain>/pages/` 新建 `XxxPage.vue`。
2. 在 `src/app/routes.js` 导入页面并加入 `routeViews`。
3. 在同一文件的 `routeMeta` 增加页面元信息。
4. 在 `src/shared/layout/SiteHeader.vue` 的导航项中增加入口。
5. 页面切换动画由 `src/app/App.vue` 的 CSS `Transition` 统一处理。

## 图片资源

页面当前使用 `src/assets/images/1757438527327.png` 作为社团徽章，`src/assets/images/qq.jpg` 作为加入页面海报。Vue 组件通过相对路径导入图片，替换资源时保持导入变量和 `alt` 文本同步更新。

## 开发注意事项

- 业务代码集中放在 `src/modules/<domain>/`，跨域组件和请求工具放在 `src/shared/`。
- 新增颜色、间距或断点时，优先扩展 `src/assets/styles/styles.css` 顶部的 CSS 变量；局部布局规则写入所属 Vue 文件的 `<style>`。
- 导航依赖 History API。生产服务器需要将前端页面路径 fallback 到 `index.html`，同时保留 `/api/**` 给后端接口；不要把页面跳转改成绕过 `navigate()` 的硬编码逻辑。
- 主题读取有 `try/catch`，这是为了兼容禁用 `localStorage` 的 `file://` 环境。
- 里程碑留言通过 `/api/milestones` 保存到 MySQL；匿名访客身份由服务端 `HttpSession` 会话维护，不写入浏览器 `localStorage`。
- `dist/` 是构建产物，不建议直接编辑；修改源码后重新执行 `npm run build`。

## 验证清单

提交前建议执行：

```bash
npm run build
```

然后在浏览器中检查：

- 六个公共 history 页面都能通过顶部导航打开。
- 日间 / 夜间主题切换后刷新仍保持选择。
- 桌面端和窄屏端导航、卡片没有溢出。
- 部门或活动数据为空时，页面仍保持稳定布局；填入真实数据后卡片正常显示。
