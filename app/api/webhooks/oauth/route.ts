import { createClient } from "@/utils/supabase/server";
import axios from "axios";
import { NextResponse } from "next/server";
import {
  AccountData,
  ApiKey,
  clientId,
  clientSecret,
  frontend,
  GetZohoAccountDetails,
  redirectUri,
  scope,
} from "./controller";

export async function GET(req: Request) {
  try {
    const supabase = createClient();

    let request_url = new URL(req.url);
    let code = request_url.searchParams.get("code");

    if (!code || typeof code !== "string") {
      return Response.json({ error: "Invalid request" }, { status: 404 });
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("redirect_uri", redirectUri);
    params.append("scope", scope);
    params.append("code", code);

    const url = "https://accounts.zoho.com/oauth/v2/token?" + params.toString();

    let config = {
      method: "POST",
      maxBodyLength: Infinity,
      url: url,
      headers: {},
    };

    const response = await axios.request(config);

    const { access_token } = response.data;
    // console.log("oauth token", response.data);

    if (!access_token) {
      throw new Error("No token was returned");
    }

    // Fetch the user's email using the access token
    const getAllAccountsOfAUser = await axios.get(
      "https://mail.zoho.com/api/accounts",
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${access_token}`,
          Accept: "application/json",
        },
      }
    );

    let tokenData: ApiKey = response.data;
    let allAccountsResponse: GetZohoAccountDetails = getAllAccountsOfAUser.data;
    let allAccounts: AccountData = allAccountsResponse.data[0];

    // Find the user if it exists
    const findUser = await supabase
      .from("users")
      .select("*")
      .eq("email", allAccounts.mailboxAddress)
      .eq("primaryemailaddress", allAccounts.primaryEmailAddress);

    if (findUser.error) {
      console.log(findUser.error.message);
      throw findUser.error;
    }

    if (findUser.data) {
      console.log("found user", findUser.data);
    }
    //   Add new user
    const newUser = await supabase
      .from("users")
      .insert([
        {
          firstname: allAccounts.firstName,
          lastname: allAccounts.lastName,
          primaryemailaddress: allAccounts.primaryEmailAddress,
          email: allAccounts.mailboxAddress,
          zoho_zuid: allAccounts.zuid,
          accountid: allAccounts.accountId,
          passwordhash: "hashedpassword123",
        },
      ])
      .select();

    if (newUser.error) {
      console.log(newUser.error.message);
      return Response.json(
        {
          message: "Internal server error, please try again later",
        },
        { status: 500 }
      );
    }

    if (!newUser.data) {
      console.log("Could not return user data");
      return Response.json(
        {
          message: "Internal server error, please try again later",
        },
        { status: 500 }
      );
    }

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    //   Add the token
    const token = await supabase
      .from("user_tokens")
      .insert([
        {
          user_id: newUser.data[0].id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: expiresAt,
        },
      ])
      .select();

    if (token.error) {
      console.log(token.error.message);
      return Response.json(
        {
          message: "Internal server error, please try again later",
        },
        { status: 500 }
      );
    }

    return NextResponse.redirect(
      new URL(`${frontend}/dashboard?email=${allAccounts.mailboxAddress}`)
    );
  } catch (error: any) {
    let err = handleAxiosError(error);

    console.error("Error fetching tokens from Zoho", err);
    return Response.json(
      { message: "Error fetching tokens from Zoho" },
      { status: 500 }
    );
  }
}

function handleAxiosError(error: any) {
  // Check if it's an Axios error
  if (axios.isAxiosError(error)) {
    const serverErrorMessage = error.response?.data || "No response data";
    const statusCode = error.response?.status || "No status code";
    console.error("Server error message:", serverErrorMessage);
    console.error("Status code:", statusCode);

    return {
      message: "Error fetching tokens from Zoho",
      error: serverErrorMessage,
      status: statusCode,
    };
  } else {
    // Handle non-Axios errors
    console.error("Non-Axios error:", error);
    return {
      message: "Non-Axios error",
      error: error.message,
    };
  }
}
