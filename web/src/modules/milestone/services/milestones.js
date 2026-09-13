import { ref } from "vue";
import { request } from "../../../shared/services/api.js";

const MILESTONES_URL = "/api/milestones";

export const milestones = ref([]);
export const milestonesLoading = ref(false);
export const milestonesMutating = ref(false);
export const milestonesError = ref("");
export const milestoneStatus = ref({ semester: "", posted: false });

let milestonesLoaded = false;
let milestonesRequest = null;

export async function loadMilestones(force = false) {
  if (milestonesRequest) return milestonesRequest;
  if (milestonesLoaded && !force) return milestones.value;
  milestonesLoading.value = true;
  milestonesError.value = "";
  milestonesRequest = request(MILESTONES_URL)
    .then((data) => {
      if (!Array.isArray(data))
        throw new TypeError("里程碑接口返回的数据不是数组");
      milestones.value = data;
      milestonesLoaded = true;
      return data;
    })
    .catch((error) => {
      milestonesError.value =
        error instanceof Error ? error.message : "里程碑加载失败";
      return null;
    })
    .finally(() => {
      milestonesLoading.value = false;
      milestonesRequest = null;
    });
  return milestonesRequest;
}

export async function loadMilestoneStatus() {
  try {
    const status = await request(`${MILESTONES_URL}/status`);
    if (!status || typeof status.posted !== "boolean") {
      throw new TypeError("里程碑状态接口返回格式错误");
    }
    milestoneStatus.value = status;
    return status;
  } catch (error) {
    milestonesError.value =
      error instanceof Error ? error.message : "里程碑状态加载失败";
    return null;
  }
}

export async function createMilestone(content) {
  milestonesMutating.value = true;
  milestonesError.value = "";
  try {
    const created = await request(MILESTONES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    milestones.value = [...milestones.value, created].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );
    milestoneStatus.value = { semester: created.semester, posted: true };
    milestonesLoaded = true;
    return created;
  } catch (error) {
    milestonesError.value =
      error instanceof Error ? error.message : "铭文提交失败";
    return null;
  } finally {
    milestonesMutating.value = false;
  }
}
