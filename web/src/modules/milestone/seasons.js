import { seasons } from "./config.js";

const projectTimeZone = "Asia/Shanghai";

function dateParts(timestamp) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: projectTimeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
}

export function seasonFromTimestamp(timestamp) {
  const month = dateParts(timestamp)?.month || dateParts(new Date()).month;
  return (
    Object.entries(seasons).find(([, season]) =>
      season.months.includes(month),
    )?.[0] || "spring"
  );
}

export function formatMilestoneDate(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "未知日期";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: projectTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("/", ".");
}

export function currentSemester(date = new Date()) {
  const parts = dateParts(date) || dateParts(new Date());
  const semester = parts.month <= 6 ? "春季" : "秋季";
  return `${parts.year}-${semester}`;
}
