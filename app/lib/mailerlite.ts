"use server";

export async function subscribeToMailerLite(
  email: string,
  fields: Record<string, string>
): Promise<{ success: boolean }> {
  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.NEXT_PUBLIC_ML_APP_GROUP_ID;

  if (!apiKey || !groupId) return { success: false };

  try {
    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email, fields, groups: [groupId] }),
    });
    return { success: res.ok };
  } catch {
    return { success: false };
  }
}
