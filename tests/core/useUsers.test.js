import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUsers } from "@/core/useUsers";
import * as userService from "@/services/user.service";
import { SYSTEM_ROLES } from "@/constants/roles";

vi.mock("@/services/user.service");
vi.mock("@/core/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

function createMockUser(overrides = {}) {
  return {
    rut: "12345678",
    dv: "9",
    name: "Juan",
    lastName: "Pérez",
    email: "juan@test.cl",
    phone: "+56912345678",
    role: "USER_JPL",
    active: true,
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    ...overrides,
  };
}

function mockPageResponse(users) {
  const list = users ?? [createMockUser()];
  return {
    content: list,
    totalPages: 1,
    totalElements: list.length,
    number: 0,
    first: true,
    last: true,
  };
}

describe("useUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userService.getUsers.mockResolvedValue(mockPageResponse());
  });

  describe("fetchUsers (initial load)", () => {
    it("fetches users on mount and returns normalized list", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(userService.getUsers).toHaveBeenCalledWith({ page: 0, size: 10 });
      expect(result.current.users).toHaveLength(1);
    });

    it("maps active user fields correctly", async () => {
      const raw = createMockUser({ active: true, isActive: true });
      userService.getUsers.mockResolvedValue(mockPageResponse([raw]));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const user = result.current.users[0];
      expect(user.name).toBe("Juan");
      expect(user.lastname).toBe("Pérez");
      expect(user.rut).toBe("12345678-9");
      expect(user.email).toBe("juan@test.cl");
      expect(user.phone).toBe("+56912345678");
      expect(user.status).toBe("active");
      expect(user.role).toBe(SYSTEM_ROLES.DEFAULT);
    });

    it("maps ADMIN role to SYSTEM_ROLES.ADMIN", async () => {
      const raw = createMockUser({ role: "USER_ADMIN" });
      userService.getUsers.mockResolvedValue(mockPageResponse([raw]));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users[0].role).toBe(SYSTEM_ROLES.ADMIN);
    });

    it("maps SUPERVISOR role to SYSTEM_ROLES.SUPERVISOR", async () => {
      const raw = createMockUser({ role: "USER_SUPERVISOR" });
      userService.getUsers.mockResolvedValue(mockPageResponse([raw]));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users[0].role).toBe(SYSTEM_ROLES.SUPERVISOR);
    });

    it("maps USER_APP role to SYSTEM_ROLES.USER_APP", async () => {
      const raw = createMockUser({ role: "USER_APP" });
      userService.getUsers.mockResolvedValue(mockPageResponse([raw]));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users[0].role).toBe(SYSTEM_ROLES.USER_APP);
    });

    it("detects revoked user (active=false)", async () => {
      const raw = createMockUser({ active: false, isActive: false });
      userService.getUsers.mockResolvedValue(mockPageResponse([raw]));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users[0].status).toBe("revoked");
    });

    it("sets error state when getUsers rejects", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      userService.getUsers.mockRejectedValue(new Error("API error"));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(true);
      expect(result.current.users).toEqual([]);
    });

    it("sets pagination fields from server response", async () => {
      const pageResp = {
        content: [createMockUser()],
        totalPages: 5,
        totalElements: 50,
        number: 2,
        first: false,
        last: false,
      };
      userService.getUsers.mockResolvedValue(pageResp);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.totalPages).toBe(5);
      });

      expect(result.current.totalElements).toBe(50);
      expect(result.current.page).toBe(2);
      expect(result.current.first).toBe(false);
      expect(result.current.last).toBe(false);
    });
  });

  describe("createUser", () => {
    it("formats RUT (removes dots, splits dv) and maps role USER_JPL by default", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.createUser.mockResolvedValue({ id: 1 });
      userService.getUsers.mockResolvedValue(mockPageResponse([]));

      const formData = {
        rut: "12.345.678-9",
        name: "María",
        lastname: "González",
        email: "maria@test.cl",
        phone: "87654321",
        password: "secret123",
        role: SYSTEM_ROLES.DEFAULT,
      };

      await act(async () => {
        await result.current.createUser(formData);
      });

      expect(userService.createUser).toHaveBeenCalledWith({
        rut: "12345678",
        dv: "9",
        name: "María",
        lastName: "González",
        birthDate: "1990-01-01",
        email: "maria@test.cl",
        phone: "+56987654321",
        password: "secret123",
        role: "USER_JPL",
      });
    });

    it("maps role ADMIN to USER_ADMIN", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.createUser.mockResolvedValue({ id: 1 });
      userService.getUsers.mockResolvedValue(mockPageResponse([]));

      await act(async () => {
        await result.current.createUser({
          rut: "1-9",
          name: "Admin",
          lastname: "",
          email: "admin@test.cl",
          phone: "",
          password: "pass",
          role: SYSTEM_ROLES.ADMIN,
        });
      });

      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: "USER_ADMIN" }),
      );
    });

    it("maps role SUPERVISOR to USER_SUPERVISOR", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.createUser.mockResolvedValue({ id: 1 });
      userService.getUsers.mockResolvedValue(mockPageResponse([]));

      await act(async () => {
        await result.current.createUser({
          rut: "1-9",
          name: "Sup",
          lastname: "",
          email: "sup@test.cl",
          phone: "",
          password: "pass",
          role: SYSTEM_ROLES.SUPERVISOR,
        });
      });

      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: "USER_SUPERVISOR" }),
      );
    });

    it("maps role USER_APP correctly", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.createUser.mockResolvedValue({ id: 1 });
      userService.getUsers.mockResolvedValue(mockPageResponse([]));

      await act(async () => {
        await result.current.createUser({
          rut: "1-9",
          name: "Fiscal",
          lastname: "",
          email: "fiscal@test.cl",
          phone: "",
          password: "pass",
          role: SYSTEM_ROLES.USER_APP,
        });
      });

      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: "USER_APP" }),
      );
    });

    it("refetches users with page 0 after creation", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.createUser.mockResolvedValue({ id: 1 });
      userService.getUsers.mockResolvedValue(mockPageResponse([]));

      const callsBefore = userService.getUsers.mock.calls.length;

      await act(async () => {
        await result.current.createUser({
          rut: "1-9",
          name: "Test",
          lastname: "",
          email: "t@t.cl",
          phone: "",
          password: "pass",
          role: SYSTEM_ROLES.DEFAULT,
        });
      });

      expect(userService.getUsers.mock.calls.length).toBeGreaterThan(callsBefore);
      expect(userService.getUsers).toHaveBeenLastCalledWith({ page: 0, size: 10 });
    });
  });

  describe("updateUser", () => {
    const selectedUser = {
      id: "12345678",
      name: "Juan",
      lastname: "Pérez",
      rut: "12.345.678-9",
      email: "juan@test.cl",
      phone: "+56912345678",
      role: SYSTEM_ROLES.DEFAULT,
      status: "active",
    };

    it("calls updateUser with cleaned RUT and mapped fields", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.updateUser.mockResolvedValue({ id: 1 });

      const formData = {
        name: "Juan Carlos",
        lastname: "Pérez",
        rut: "12.345.678-9",
        email: "juanc@test.cl",
        phone: "87654321",
        password: "",
        confirmPassword: "",
        role: SYSTEM_ROLES.DEFAULT,
        status: "active",
      };

      await act(async () => {
        await result.current.updateUser(selectedUser, formData);
      });

      expect(userService.updateUser).toHaveBeenCalledWith("12345678", {
        name: "Juan Carlos",
        lastName: "Pérez",
        email: "juanc@test.cl",
        phone: "+56987654321",
      });
    });

    it("includes password in payload when provided", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.updateUser.mockResolvedValue({ id: 1 });

      await act(async () => {
        await result.current.updateUser(selectedUser, {
          ...selectedUser,
          password: "newpass123",
          status: "active",
        });
      });

      expect(userService.updateUser).toHaveBeenCalledWith(
        "12345678",
        expect.objectContaining({ password: "newpass123" }),
      );
    });

    it("calls updateUserRole when role changed", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.updateUser.mockResolvedValue({ id: 1 });
      userService.updateUserRole.mockResolvedValue(null);

      await act(async () => {
        await result.current.updateUser(selectedUser, {
          ...selectedUser,
          role: SYSTEM_ROLES.ADMIN,
          status: "active",
        });
      });

      expect(userService.updateUserRole).toHaveBeenCalledWith("12345678", "USER_ADMIN");
    });

    it("does NOT call updateUserRole when role is unchanged", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.updateUser.mockResolvedValue({ id: 1 });

      await act(async () => {
        await result.current.updateUser(selectedUser, {
          ...selectedUser,
          role: SYSTEM_ROLES.DEFAULT,
          status: "active",
        });
      });

      expect(userService.updateUserRole).not.toHaveBeenCalled();
    });

    it("refetches users after update", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.updateUser.mockResolvedValue({ id: 1 });

      const callsBefore = userService.getUsers.mock.calls.length;

      await act(async () => {
        await result.current.updateUser(selectedUser, {
          ...selectedUser,
          name: "Updated",
          status: "active",
        });
      });

      expect(userService.getUsers.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  describe("toggleUserStatus", () => {
    it("calls revokeUser when current status is active", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.revokeUser.mockResolvedValue(null);

      await act(async () => {
        await result.current.toggleUserStatus("12345678", "active");
      });

      expect(userService.revokeUser).toHaveBeenCalledWith("12345678");
    });

    it("calls activateUser when current status is revoked", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.activateUser.mockResolvedValue(null);

      await act(async () => {
        await result.current.toggleUserStatus("12345678", "revoked");
      });

      expect(userService.activateUser).toHaveBeenCalledWith("12345678");
    });

    it("refetches users after status toggle", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.revokeUser.mockResolvedValue(null);

      const callsBefore = userService.getUsers.mock.calls.length;

      await act(async () => {
        await result.current.toggleUserStatus("12345678", "active");
      });

      expect(userService.getUsers.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  describe("goToPage", () => {
    it("cambia la página y dispara una nueva consulta al servidor", async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      userService.getUsers.mockClear();
      userService.getUsers.mockResolvedValue(mockPageResponse([]));

      act(() => {
        result.current.goToPage(3);
      });

      await waitFor(() => {
        expect(result.current.page).toBe(3);
      });

      await waitFor(() => {
        expect(userService.getUsers).toHaveBeenCalledWith({ page: 3, size: 10 });
      });
    });
  });

  describe("fetchUsersFiscalizadores", () => {
    it("fetches fiscalizadores list and normalizes users", async () => {
      userService.getUsersFiscalizadores.mockResolvedValue([
        createMockUser({ rut: "87654321", dv: "0", name: "Pedro", lastName: "López" }),
      ]);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.fetchUsersFiscalizadores();
      });

      expect(userService.getUsersFiscalizadores).toHaveBeenCalled();
      expect(result.current.users).toHaveLength(1);
      expect(result.current.users[0].name).toBe("Pedro");
      expect(result.current.users[0].lastname).toBe("López");
      expect(result.current.users[0].rut).toBe("87654321-0");
    });

    it("handles error when fetch fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      userService.getUsersFiscalizadores.mockRejectedValue(new Error("Error"));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.fetchUsersFiscalizadores();
      });

      expect(result.current.error).toBe(true);
      expect(result.current.users).toEqual([]);
    });
  });
});
