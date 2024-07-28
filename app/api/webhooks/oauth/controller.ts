export interface ApiKey {
  access_token: string;
  refresh_token: string;
  scope: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
}

let api_key: ApiKey = {
  access_token:
    "1000.747df1fc7470309bec579f937bf3156e.185cf622e9aaf10e251d6677d2f111be",
  refresh_token:
    "1000.9e1fba6fee2d23f04d9e7a3b6fba6524.92126ee7f2918b91e36e7f92c5473e1c",
  scope: "ZohoMail.messages.ALL ZohoMail.accounts.ALL",
  api_domain: "https://www.zohoapis.com",
  token_type: "Bearer",
  expires_in: 3600,
};

export interface EmailAddress {
  isAlias: boolean;
  isPrimary: boolean;
  mailId: string;
  isConfirmed: boolean;
}

export interface SendMailDetail {
  sendMailId: string;
  displayName: string;
  serverName: string;
  signatureId: string;
  serverPort: number;
  userName: string;
  connectionType: string;
  mode: string;
  validated: boolean;
  fromAddress: string;
  smtpConnection: number;
  validationRequired: boolean;
  validationState: number;
  status: boolean;
}

interface PolicyId {
  zoid: number;
  [key: string]: string | number;
}

export interface AccountData {
  country: string;
  lastLogin: number;
  mxStatus: boolean;
  activeSyncEnabled: boolean;
  incomingBlocked: boolean;
  language: string;
  type: string;
  extraStorage: object;
  incomingUserName: string;
  emailAddress: EmailAddress[];
  mailboxStatus: string;
  popBlocked: boolean;
  usedStorage: number;
  spamcheckEnabled: boolean;
  imapAccessEnabled: boolean;
  timeZone: string;
  accountCreationTime: number;
  zuid: number;
  webBlocked: boolean;
  planStorage: number;
  firstName: string;
  accountId: string;
  sequence: number;
  mailboxAddress: string;
  lastPasswordReset: number;
  tfaEnabled: boolean;
  iamStatus: number;
  status: boolean;
  lastName: string;
  accountDisplayName: string;
  role: string;
  gender: string;
  accountName: string;
  displayName: string;
  isLogoExist: boolean;
  URI: string;
  primaryEmailAddress: string;
  enabled: boolean;
  mailboxCreationTime: number;
  basicStorage: string;
  lastClient: string;
  allowedStorage: number;
  sendMailDetails: SendMailDetail[];
  popFetchTime: number;
  address: object;
  planType: number;
  userExpiry: number;
  popAccessEnabled: boolean;
  imapBlocked: boolean;
  iamUserRole: string;
  outgoingBlocked: boolean;
  policyId: PolicyId;
  smtpStatus: boolean;
  extraEDiscoveryStorage: object;
}

interface ZohoAccountDetailsStatus {
  code: number;
  description: string;
}

export interface GetZohoAccountDetails {
  status: ZohoAccountDetailsStatus;
  data: AccountData[];
}

let getZohoAccountDetails: GetZohoAccountDetails = {
  status: {
    code: 200,
    description: "success",
  },
  data: [
    {
      country: "ng",
      lastLogin: 1722113564885,
      mxStatus: true,
      activeSyncEnabled: false,
      incomingBlocked: false,
      language: "en",
      type: "ZOHO_ACCOUNT",
      extraStorage: {},
      incomingUserName: "emee-dev@zohomail.com",
      emailAddress: [
        {
          isAlias: false,
          isPrimary: false,
          mailId: "emee-dev@zohomail.com",
          isConfirmed: true,
        },
        {
          isAlias: false,
          isPrimary: true,
          mailId: "emmanuelajike2000@gmail.com",
          isConfirmed: true,
        },
      ],
      mailboxStatus: "enabled",
      popBlocked: false,
      usedStorage: 210,
      spamcheckEnabled: true,
      imapAccessEnabled: false,
      timeZone: "Africa/Lagos",
      accountCreationTime: 1669930365197,
      zuid: 797009692,
      webBlocked: false,
      planStorage: 5,
      firstName: "Emmanuel",
      accountId: "639307000000008002",
      sequence: 1,
      mailboxAddress: "emee-dev@zohomail.com",
      lastPasswordReset: -1,
      tfaEnabled: false,
      iamStatus: 1,
      status: false,
      lastName: "Ajike",
      accountDisplayName: "emee-dev",
      role: "member",
      gender: "MALE",
      accountName: "zohomail",
      displayName: "emee-dev",
      isLogoExist: true,
      URI: "https://mail.zoho.com/api/accounts/639307000000008002",
      primaryEmailAddress: "emmanuelajike2000@gmail.com",
      enabled: true,
      mailboxCreationTime: 1720247909888,
      basicStorage: "free",
      lastClient: "WEB_ZM",
      allowedStorage: 5242880,
      sendMailDetails: [
        {
          sendMailId: "639307000000008004",
          displayName: "Emmanuel Ajike",
          serverName: "smtpout.mail.zoho.com",
          signatureId: "639307000000008030",
          serverPort: 25,
          userName: "emee-dev@zohomail.com",
          connectionType: "plain",
          mode: "mailbox",
          validated: false,
          fromAddress: "emee-dev@zohomail.com",
          smtpConnection: 0,
          validationRequired: true,
          validationState: 0,
          status: true,
        },
      ],
      popFetchTime: -1,
      address: {},
      planType: 0,
      userExpiry: -1,
      popAccessEnabled: false,
      imapBlocked: false,
      iamUserRole: "member",
      outgoingBlocked: false,
      policyId: {
        zoid: -1,
        "1082700000000623001": "Zoho Mail Policy",
      },
      smtpStatus: true,
      extraEDiscoveryStorage: {},
    },
  ],
};

export const clientId = process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID as string;
export const redirectUri = process.env.NEXT_PUBLIC_ZOHO_REDIRECT_URL as string;
export const scope = process.env.NEXT_PUBLIC_ZOHO_OAUTH_SCOPE as string;
export const clientSecret = process.env.ZOHO_CLIENT_SECRET as string;
export const frontend =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : (process.env.NEXT_PUBLIC_URL as string);
