import { ref } from "vue";
import { request } from "../../../shared/services/api.js";

const EVENTS_URL = "/api/events";
const ADMIN_EVENTS_URL = "/api/admin/events";

export const events = ref([]);
export const eventsLoading = ref(false);
export const eventsMutating = ref(false);
export const eventsError = ref("");

let eventsLoaded = false;
let eventsRequest = null;

export async function loadEvents(force = false) {
  if (eventsRequest) {
    return eventsRequest;
  }

  if (eventsLoaded && !force) {
    return events.value;
  }

  eventsLoading.value = true;
  eventsError.value = "";

  eventsRequest = request(EVENTS_URL)
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new TypeError("活动接口返回的数据不是数组");
      }
      events.value = data;
      eventsLoaded = true;
      return data;
    })
    .catch((error) => {
      eventsError.value =
        error instanceof Error ? error.message : "活动数据加载失败";
      return null;
    })
    .finally(() => {
      eventsLoading.value = false;
      eventsRequest = null;
    });

  return eventsRequest;
}

async function mutateEvents(url, options) {
  eventsMutating.value = true;
  eventsError.value = "";

  try {
    return await request(url, options);
  } catch (error) {
    eventsError.value = error instanceof Error ? error.message : "活动操作失败";
    return null;
  } finally {
    eventsMutating.value = false;
  }
}

export async function createEvent(event) {
  const created = await mutateEvents(ADMIN_EVENTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (created) {
    events.value = [...events.value, created];
    eventsLoaded = true;
  }

  return created;
}

export async function updateEvent(id, event) {
  const updated = await mutateEvents(`${ADMIN_EVENTS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (updated) {
    events.value = events.value.map((item) =>
      item.id === id ? updated : item,
    );
  }

  return updated;
}

export async function deleteEvent(id) {
  const deleted = await mutateEvents(`${ADMIN_EVENTS_URL}/${id}`, {
    method: "DELETE",
  });

  if (deleted === true) {
    events.value = events.value.filter((item) => item.id !== id);
  }

  return deleted;
}
