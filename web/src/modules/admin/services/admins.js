import { ref } from "vue";
import { request as apiRequest } from "../../../shared/services/api.js";

const ADMIN_URL = "/api/admin";

export const currentAdmin = ref(null);
export const admins = ref([]);
export const adminLoading = ref(false);
export const adminMutating = ref(false);
export const adminError = ref("");

let adminsLoaded = false;
let adminsRequest = null;

const request = (path, options) => apiRequest(`${ADMIN_URL}${path}`, options);

export async function checkSession() {
  if (currentAdmin.value) return currentAdmin.value;

  try {
    const admin = await request("/me");
    currentAdmin.value = admin;
    return admin;
  } catch {
    currentAdmin.value = null;
    return null;
  }
}

export async function login(credentials) {
  adminMutating.value = true;
  adminError.value = "";

  try {
    const admin = await request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    currentAdmin.value = admin;
    adminsLoaded = false;
    return admin;
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : "登录失败";
    return null;
  } finally {
    adminMutating.value = false;
  }
}

export async function logout() {
  adminMutating.value = true;
  adminError.value = "";

  try {
    await request("/logout", { method: "POST" });
    return true;
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : "退出登录失败";
    return false;
  } finally {
    currentAdmin.value = null;
    admins.value = [];
    adminsLoaded = false;
    adminMutating.value = false;
  }
}

export async function loadAdmins(force = false) {
  if (adminsRequest) {
    return adminsRequest;
  }

  if (adminsLoaded && !force) {
    return admins.value;
  }

  adminLoading.value = true;
  adminError.value = "";

  adminsRequest = request("/admins")
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new TypeError("管理员接口返回的数据不是数组");
      }
      admins.value = data;
      adminsLoaded = true;
      return data;
    })
    .catch((error) => {
      adminError.value =
        error instanceof Error ? error.message : "管理员列表加载失败";
      return null;
    })
    .finally(() => {
      adminLoading.value = false;
      adminsRequest = null;
    });

  return adminsRequest;
}

export async function createAdmin(admin) {
  adminMutating.value = true;
  adminError.value = "";

  try {
    const created = await request("/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(admin),
    });
    await loadAdmins(true);
    return created;
  } catch (error) {
    adminError.value =
      error instanceof Error ? error.message : "创建管理员失败";
    return null;
  } finally {
    adminMutating.value = false;
  }
}

export async function deleteAdmin(id) {
  adminMutating.value = true;
  adminError.value = "";

  try {
    const deleted = await request(`/admins/${id}`, { method: "DELETE" });
    if (deleted === true) {
      admins.value = admins.value.filter((admin) => admin.id !== id);
    }
    return deleted;
  } catch (error) {
    adminError.value =
      error instanceof Error ? error.message : "删除管理员失败";
    return false;
  } finally {
    adminMutating.value = false;
  }
}

export async function updatePassword(passwords) {
  adminMutating.value = true;
  adminError.value = "";

  try {
    return await request("/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwords),
    });
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : "修改密码失败";
    return false;
  } finally {
    adminMutating.value = false;
  }
}
