import HomePage from "../modules/club/pages/HomePage.vue";
import ClubPage from "../modules/club/pages/ClubPage.vue";
import DepartmentsPage from "../modules/department/pages/DepartmentsPage.vue";
import EventsPage from "../modules/events/pages/EventsPage.vue";
import JoinPage from "../modules/submit/pages/JoinPage.vue";
import MilestonesPage from "../modules/milestone/pages/MilestonesPage.vue";
import AdminEventsPage from "../modules/admin/pages/EventsPage.vue";
import AdminSubmitsPage from "../modules/admin/pages/SubmitsPage.vue";
import AdminMilestonesPage from "../modules/admin/pages/MilestonesPage.vue";
import AdminProfilePage from "../modules/admin/pages/ProfilePage.vue";
import AdminManagersPage from "../modules/admin/pages/ManagersPage.vue";

export const routeViews = {
  "/": HomePage,
  "/about": ClubPage,
  "/departments": DepartmentsPage,
  "/events": EventsPage,
  "/join": JoinPage,
  "/milestones": MilestonesPage,
  "/admin/events": AdminEventsPage,
  "/admin/submits": AdminSubmitsPage,
  "/admin/milestones": AdminMilestonesPage,
  "/admin/profile": AdminProfilePage,
  "/admin/managers": AdminManagersPage,
};

export const legacyRoutes = {
  home: "/",
  club: "/about",
  works: "/departments",
  departments: "/departments",
  events: "/events",
  join: "/join",
  milestones: "/milestones",
  "admin-events": "/admin/events",
  "admin-submits": "/admin/submits",
  "admin-milestones": "/admin/milestones",
  "admin-profile": "/admin/profile",
  "admin-managers": "/admin/managers",
};

export const routeMeta = {
  "/": { index: "01", code: "INDEX", title: "BASE CAMP" },
  "/about": { index: "02", code: "ABOUT", title: "PROFILE" },
  "/departments": { index: "03", code: "UNITS", title: "DEPARTMENTS" },
  "/events": { index: "04", code: "EVENTS", title: "SCHEDULE" },
  "/join": { index: "05", code: "JOIN", title: "OPEN CALL" },
  "/milestones": { index: "06", code: "ARCHIVE", title: "MILESTONES" },
  "/admin/events": { index: "A1", code: "EVENTS", title: "ADMIN CONSOLE" },
  "/admin/submits": { index: "A2", code: "SUBMITS", title: "ADMIN CONSOLE" },
  "/admin/milestones": { index: "A3", code: "ARCHIVE", title: "ADMIN CONSOLE" },
  "/admin/profile": { index: "A4", code: "PROFILE", title: "ADMIN CONSOLE" },
  "/admin/managers": { index: "A5", code: "ADMINS", title: "ADMIN CONSOLE" },
};
