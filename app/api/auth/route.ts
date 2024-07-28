import { cookies } from "next/headers";

export const POST = async (req: Request) => {
  let cookie = cookies();
  let sid = cookie.get("sid");

  console.log("sid", sid);

  if (!sid) {
    cookie.set(
      "sid",
      JSON.stringify({
        email: "emee-dev@gmail.com",
      })
    );
  }
  

  return Response.json({ message: "Cookies" });
};
