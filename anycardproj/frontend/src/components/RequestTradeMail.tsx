import { requestUser, sentUser } from "@full-stack/types";
import { respondTrade } from "../api/cards";

interface InputProps {
  mail: requestUser | sentUser;
  userUid: string;
}

function isSentUser(m: requestUser | sentUser): m is sentUser {
  return (m as sentUser).sentUserUID !== undefined;
}

export default function RequestTradeMail({ mail, userUid }: InputProps) {
  const otherUid = isSentUser(mail) ? mail.sentUserUID : mail.requestedUserUID;

  function handleDecline(): void {
    respondTrade("rejected", userUid);
  }

  function handleAccept(): void {
    respondTrade("accepted", userUid);
  }

  return (
    <div className="relative p-2 border rounded pb-16">
      {mail.type === "requestUser" ? (
        // Layout for requestUser
        <>
          <p className="font-semibold">Request</p>
          <p className="text-sm">Other user UID: {otherUid}</p>
          <p className="text-sm">Wanted: {mail.wantedCard?.name}</p>
          <p className="text-sm">Status: {mail.status}</p>
        </>
      ) : (
        // Layout for other types
        <>
          <p className="font-semibold">Sent Request</p>
          <p className="text-sm">Other user UID: {otherUid}</p>
          <p className="text-sm">Given: {mail.givenCard?.name}</p>
          {/* Bottom buttons */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between">
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleAccept()}
            >
              Accept
            </button>
            <button
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => handleDecline()}
            >
              Decline
            </button>
          </div>
        </>
      )}
      <p className="text-xs text-gray-500">
        {new Date(mail.date).toLocaleString()}
      </p>
    </div>
  );

  //   return (

  //     <div className="p-2 border rounded">
  //       <p className="font-semibold">{typeLabel}</p>
  //       <p className="text-sm">Other user UID: {otherUid}</p>
  //       <p className="text-sm">Wanted: {mail.wantedCard?.name}</p>
  //       <p className="text-sm">Given: {mail.givenCard?.name}</p>
  //       <p className="text-sm">Status: {mail.status}</p>
  //       <p className="text-xs text-gray-500">{new Date(mail.date).toLocaleString()}</p>
  //     </div>
  //   );
}
