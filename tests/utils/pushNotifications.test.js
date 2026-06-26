import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/pushNotifications.service", () => ({
  getAllDevices: vi.fn(),
  sendSelectPush: vi.fn(),
}));

import { getAllDevices, sendSelectPush } from "@/services/pushNotifications.service";
import { sendPushToEmail } from "@/utils/pushNotifications";

function extractDeviceList(response) {
  if (Array.isArray(response)) return response;
  if (response?.content && Array.isArray(response.content)) return response.content;
  return [];
}

describe("extractDeviceList — normaliza la respuesta de getAllDevices()", () => {
  it("devuelve el arreglo tal cual si la API ya responde con una lista plana", () => {
    const data = [{ id: 1, emailUsuario: "a@b.cl" }];
    expect(extractDeviceList(data)).toBe(data);
  });

  it("extrae .content cuando la API responde con paginación { content, totalPages, ... }", () => {
    const items = [{ id: 2, emailUsuario: "b@c.cl" }];
    const paginated = { content: items, totalPages: 1, totalElements: 1 };
    expect(extractDeviceList(paginated)).toBe(items);
  });

  it("retorna [] si la API responde null (ej. error 204 sin datos)", () => {
    expect(extractDeviceList(null)).toEqual([]);
  });

  it("retorna [] si la API responde undefined", () => {
    expect(extractDeviceList(undefined)).toEqual([]);
  });

  it("retorna [] si la API responde un objeto sin la propiedad .content", () => {
    expect(extractDeviceList({ foo: "bar" })).toEqual([]);
  });

  it("retorna [] si la paginación viene vacía (content: [])", () => {
    expect(extractDeviceList({ content: [], totalPages: 0 })).toEqual([]);
  });
});

describe("sendPushToEmail — envía notificación push al dispositivo de un email específico", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("busca el dispositivo por email (sin distinguir mayúsculas) y envía la push a su id", async () => {
    const devices = [
      { id: 10, emailUsuario: "Fiscalizador@Test.Cl" },
      { id: 20, emailUsuario: "otro@test.cl" },
    ];
    getAllDevices.mockResolvedValue(devices);
    sendSelectPush.mockResolvedValue({ sent: 1 });

    await sendPushToEmail("fiscalizador@test.cl", "Titulo", "Cuerpo");

    expect(sendSelectPush).toHaveBeenCalledWith({
      deviceIds: [10],
      title: "Titulo",
      body: "Cuerpo",
    });
  });

  it("usa el título 'Notificación SIFA' si no se provee uno", async () => {
    getAllDevices.mockResolvedValue([
      { id: 1, emailUsuario: "x@y.cl" },
    ]);
    sendSelectPush.mockResolvedValue({ sent: 1 });

    await sendPushToEmail("x@y.cl", "", "body");

    expect(sendSelectPush).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Notificación SIFA" }),
    );
  });

  it("lanza DEVICE_NOT_FOUND si ningún dispositivo tiene ese email", async () => {
    getAllDevices.mockResolvedValue([
      { id: 1, emailUsuario: "a@b.cl" },
    ]);

    await expect(
      sendPushToEmail("noexiste@test.cl", "T", "B"),
    ).rejects.toThrow("DEVICE_NOT_FOUND");
  });

  it("lanza DEVICE_NOT_FOUND si la lista de dispositivos está vacía", async () => {
    getAllDevices.mockResolvedValue([]);

    await expect(
      sendPushToEmail("cualquiera@test.cl", "T", "B"),
    ).rejects.toThrow("DEVICE_NOT_FOUND");
  });

  it("funciona cuando getAllDevices responde con paginación { content: [...] }", async () => {
    getAllDevices.mockResolvedValue({
      content: [{ id: 99, emailUsuario: "paginated@test.cl" }],
      totalPages: 1,
    });
    sendSelectPush.mockResolvedValue({ sent: 1 });

    await sendPushToEmail("paginated@test.cl", "T", "B");

    expect(sendSelectPush).toHaveBeenCalledWith({
      deviceIds: [99],
      title: "T",
      body: "B",
    });
  });

  it("recorta espacios alrededor del email antes de comparar", async () => {
    getAllDevices.mockResolvedValue([
      { id: 7, emailUsuario: "  spaced@test.cl  " },
    ]);
    sendSelectPush.mockResolvedValue({ sent: 1 });

    await sendPushToEmail("spaced@test.cl", "T", "B");

    expect(sendSelectPush).toHaveBeenCalledWith(
      expect.objectContaining({ deviceIds: [7] }),
    );
  });

  it("propaga el error si getAllDevices falla (ej. red caída)", async () => {
    getAllDevices.mockRejectedValue(new Error("Network error"));

    await expect(
      sendPushToEmail("x@y.cl", "T", "B"),
    ).rejects.toThrow("Network error");
  });

  it("propaga el error si sendSelectPush falla (ej. FCM no disponible)", async () => {
    getAllDevices.mockResolvedValue([
      { id: 1, emailUsuario: "x@y.cl" },
    ]);
    sendSelectPush.mockRejectedValue(new Error("FCM error"));

    await expect(
      sendPushToEmail("x@y.cl", "T", "B"),
    ).rejects.toThrow("FCM error");
  });
});
