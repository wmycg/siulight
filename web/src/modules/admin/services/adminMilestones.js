import { ref } from "vue";
import { request } from "../../../shared/services/api.js";

const ADMIN_MILESTONES_URL = "/api/admin/milestones";

export const adminMilestones = ref([]);
export const adminMilestonesLoading = ref(false);
export const adminMilestonesMutating = ref(false);
export const adminMilestonesError = ref("");

export async function loadAdminMilestones() {
  adminMilestonesLoading.value = true;
  adminMilestonesError.value = "";

  try {
    const data = await request(ADMIN_MILESTONES_URL);
    if (!Array.isArray(data)) {
      throw new TypeError("里程碑接口返回的数据不是数组");
    }
    adminMilestones.value = data;
    return data;
  } catch (error) {
    adminMilestonesError.value =
      error instanceof Error ? error.message : "里程碑列表加载失败";
    return null;
  } finally {
    adminMilestonesLoading.value = false;
  }
}

export async function deleteAdminMilestone(id) {
  adminMilestonesMutating.value = true;
  adminMilestonesError.value = "";

  try {
    const deleted = await request(`${ADMIN_MILESTONES_URL}/${id}`, {
      method: "DELETE",
    });
    if (deleted === true) {
      adminMilestones.value = adminMilestones.value.filter(
        (milestone) => milestone.id !== id,
      );
    }
    return deleted;
  } catch (error) {
    adminMilestonesError.value =
      error instanceof Error ? error.message : "删除里程碑失败";
    return false;
  } finally {
    adminMilestonesMutating.value = false;
  }
}
