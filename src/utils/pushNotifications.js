import { getAllDevices, sendSelectPush } from "@/services/pushNotifications.service";

function extractDeviceList(response) {
  if (Array.isArray(response)) return response;
  if (response?.content && Array.isArray(response.content)) return response.content;
  return [];
}

export async function sendPushToEmail(email, title, body) {
  const raw = await getAllDevices();
  const deviceList = extractDeviceList(raw);

  const normalizedEmail = email?.trim().toLowerCase();
  const device = deviceList.find(
    (d) => d.emailUsuario?.trim().toLowerCase() === normalizedEmail,
  );

  if (!device?.id) {
    throw new Error("DEVICE_NOT_FOUND");
  }

  await sendSelectPush({
    deviceIds: [device.id],
    title: title || "Notificación SIFA",
    body,
  });
}
