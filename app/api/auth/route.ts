import { cookies as cookies_server } from "next/headers";

export const POST = async (req: Request) => {
  const cookieHeader = req.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((cookie) => {
      const [name, ...rest] = cookie.split("=");
      return [name, rest.join("=")];
    })
  );

  const sid = cookies["sid"];

  console.log("Incoming cookies:", cookies);

  const cookieStore = cookies_server();
  let sid_server = cookieStore.get("sid");

  if (!sid_server) {
    cookieStore.set("sid", JSON.stringify({ email: "emee-dev@gmail.com" }));
    sid_server = cookieStore.get("sid");
  }

  try {
    const parsedSid = JSON.parse(sid);
    const parsedSidServer = JSON.parse(sid_server);

    if (parsedSid.email && parsedSid.email === parsedSidServer.email) {
      return Response.json({
        message: "Email validated",
        email: parsedSid.email,
      });
    } else {
      return Response.redirect(new URL("/login", req.url));
    }
  } catch (error) {
    console.error("Error parsing SID:", error);
    return Response.redirect(new URL("/login", req.url));
  }
};
