import { ref } from "vue";
import { request } from "../../../shared/services/api.js";

const SUBMITS_URL = "/api/submits";
const ADMIN_SUBMITS_URL = "/api/admin/submits";

export const submits = ref([]);
export const submitLoading = ref(false);
export const submitError = ref("");
export const submitReceipt = ref(null);
export const submitDetailLoading = ref(false);
export const submitDetailError = ref("");

export async function createSubmit(form) {
  submitLoading.value = true;
  submitError.value = "";
  submitReceipt.value = null;

  try {
    const receipt = await request(SUBMITS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    submitReceipt.value = receipt;
    return receipt;
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : "提交申请失败";
    return null;
  } finally {
    submitLoading.value = false;
  }
}

export async function loadSubmits(force = false) {
  if (submitLoading.value && !force) {
    return submits.value;
  }

  submitLoading.value = true;
  submitError.value = "";

  try {
    const data = await request(ADMIN_SUBMITS_URL);
    if (!Array.isArray(data)) {
      throw new TypeError("提交接口返回的数据不是数组");
    }
    submits.value = data;
    return data;
  } catch (error) {
    submitError.value =
      error instanceof Error ? error.message : "提交列表加载失败";
    return null;
  } finally {
    submitLoading.value = false;
  }
}

export async function getSubmit(id) {
  submitDetailLoading.value = true;
  submitDetailError.value = "";

  try {
    return await request(`${ADMIN_SUBMITS_URL}/${id}`);
  } catch (error) {
    submitDetailError.value =
      error instanceof Error ? error.message : "提交详情加载失败";
    return null;
  } finally {
    submitDetailLoading.value = false;
  }
}
