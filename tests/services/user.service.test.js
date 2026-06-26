import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/api", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/api";
import {
  getUsers,
  getUsersFiscalizadores,
  createUser,
  revokeUser,
  activateUser,
  updateUserRole,
  updateUser,
} from "@/services/user.service";

describe("user.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("calls apiFetch with default page and size", async () => {
      apiFetch.mockResolvedValue({ content: [], totalPages: 0 });
      await getUsers();
      expect(apiFetch).toHaveBeenCalledWith("/auth/api/v1/users?page=0&size=10");
    });

    it("uses custom page and size from params", async () => {
      apiFetch.mockResolvedValue({ content: [], totalPages: 0 });
      await getUsers({ page: 2, size: 25 });
      expect(apiFetch).toHaveBeenCalledWith("/auth/api/v1/users?page=2&size=25");
    });

    it("returns the raw apiFetch response", async () => {
      const expected = { content: [{ id: "1" }], totalPages: 1, totalElements: 1 };
      apiFetch.mockResolvedValue(expected);
      const result = await getUsers({ page: 0, size: 10 });
      expect(result).toEqual(expected);
    });

    it("propagates errors from apiFetch", async () => {
      apiFetch.mockRejectedValue(new Error("Network error"));
      await expect(getUsers()).rejects.toThrow("Network error");
    });
  });

  describe("getUsersFiscalizadores", () => {
    it("calls apiFetch with the fiscalizadores endpoint", async () => {
      apiFetch.mockResolvedValue([]);
      await getUsersFiscalizadores();
      expect(apiFetch).toHaveBeenCalledWith("auth/api/v1/users/fiscalizadores");
    });

    it("returns the list of fiscalizadores", async () => {
      const expected = [{ rut: "1", name: "Juan" }];
      apiFetch.mockResolvedValue(expected);
      const result = await getUsersFiscalizadores();
      expect(result).toEqual(expected);
    });
  });

  describe("createUser", () => {
    it("sends POST with user data as JSON body", async () => {
      const userData = { rut: "12345678", dv: "9", name: "Juan", role: "USER_ADMIN" };
      apiFetch.mockResolvedValue({ id: 1 });

      await createUser(userData);

      expect(apiFetch).toHaveBeenCalledWith("/auth/api/v1/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    });

    it("returns the created user from apiFetch", async () => {
      const created = { id: 1, rut: "12345678" };
      apiFetch.mockResolvedValue(created);
      const result = await createUser({ rut: "12345678", name: "Test" });
      expect(result).toEqual(created);
    });
  });

  describe("revokeUser", () => {
    it("sends DELETE with rut as query param", async () => {
      apiFetch.mockResolvedValue(null);
      await revokeUser("12345678");
      expect(apiFetch).toHaveBeenCalledWith("/auth/api/v1/users?rut=12345678", {
        method: "DELETE",
      });
    });
  });

  describe("activateUser", () => {
    it("sends PATCH to activate endpoint", async () => {
      apiFetch.mockResolvedValue(null);
      await activateUser("12345678");
      expect(apiFetch).toHaveBeenCalledWith("/auth/api/v1/users/12345678/activate", {
        method: "PATCH",
      });
    });
  });

  describe("updateUserRole", () => {
    it("sends PATCH with role in body", async () => {
      apiFetch.mockResolvedValue(null);
      await updateUserRole("12345678", "USER_ADMIN");
      expect(apiFetch).toHaveBeenCalledWith("/auth/api/v1/users/12345678/role", {
        method: "PATCH",
        body: JSON.stringify({ role: "USER_ADMIN" }),
      });
    });
  });

  describe("updateUser", () => {
    it("sends PUT with user data as JSON body", async () => {
      const userData = { name: "Juan Updated", email: "juan@test.cl" };
      apiFetch.mockResolvedValue({ id: 1 });

      await updateUser("12345678", userData);

      expect(apiFetch).toHaveBeenCalledWith("/auth/api/v1/users/12345678", {
        method: "PUT",
        body: JSON.stringify(userData),
      });
    });
  });
});
