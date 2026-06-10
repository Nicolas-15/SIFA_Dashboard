import { getAllDevices, sendSelectPush } from "@/services/pushNotifications.service";

export async function sendPushToEmail(email, title, body) {
  const devices = await getAllDevices();
  const device = Array.isArray(devices)
    ? devices.find((d) => d.emailUsuario === email)
    : null;

  if (!device?.id) {
    throw new Error("DEVICE_NOT_FOUND");
  }

  await sendSelectPush({
    deviceIds: [device.id],
    title: title || "Notificación SIFA",
    body,
  });
}
