import React from "react";
import { requestUser, sentUser } from "@full-stack/types";

interface InputProps {
  mail: requestUser | sentUser;
}

function isSentUser(m: requestUser | sentUser): m is sentUser {
  return (m as sentUser).sentUserUID !== undefined;
}

export default function RequestTradeMail({ mail }: InputProps) {
  const typeLabel = isSentUser(mail) ? "Sent Trade" : "Requested Trade";
  const otherUid = isSentUser(mail) ? mail.sentUserUID : mail.requestedUserUID;

  return (
    <div className="p-2 border rounded">
      <p className="font-semibold">{typeLabel}</p>
      <p className="text-sm">Other user UID: {otherUid}</p>
      <p className="text-sm">Wanted: {mail.wantedCard?.name}</p>
      <p className="text-sm">Given: {mail.givenCard?.name}</p>
      <p className="text-sm">Status: {mail.status}</p>
      <p className="text-xs text-gray-500">{new Date(mail.date).toLocaleString()}</p>
    </div>
  );
}
