// src/services/fcm.ts
// FCM stub — logs notification payload to console.
// Replace with Firebase Admin SDK when FIREBASE_SERVICE_ACCOUNT_JSON is available.

export interface FCMPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Send an FCM push notification to a device token.
 * Currently a stub — logs to console and resolves immediately.
 */
export async function sendFCMNotification(
  deviceToken: string,
  payload: FCMPayload,
): Promise<void> {
  console.log(
    `[FCM STUB] → token=${deviceToken.slice(0, 12)}...`,
    JSON.stringify(payload),
  );
  // TODO: Replace with Firebase Admin SDK:
  //   await admin.messaging().send({ token: deviceToken, notification: payload });
}
