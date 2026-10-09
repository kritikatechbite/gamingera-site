
export default async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { success: false, error: "Method not allowed" },
      { status: 405 }
    );
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return Response.json(
      { success: false, error: "Missing server configuration" },
      { status: 500 }
    );
  }

  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return Response.json(
        { success: false, error: "Token required" },
        { status: 400 }
      );
    }

    const form = new FormData();
    form.append("secret", secret);
    form.append("response", token);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: form
      }
    );

    if (!response.ok) {
      return Response.json(
        { success: false, error: "Verification service unavailable" },
        { status: 502 }
      );
    }

    const result = await response.json();

    const success =
      result.success === true &&
      result.hostname === "gamingeraa.netlify.app";

    return Response.json(
      { success },
      { status: success ? 200 : 403 }
    );

  } catch {
    return Response.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
};
