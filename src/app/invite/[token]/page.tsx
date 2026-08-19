"use client";

import { useParams } from "next/navigation";
import { ErrorPanel } from "../../../components/ErrorPanel";
import { InviteTokenContent } from "./InviteTokenContent";

export default function InviteTokenPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  if (!token) {
    return (
      <div className="page page--centered">
        <ErrorPanel error={null} title="Lien d'invitation incomplet" />
      </div>
    );
  }

  return <InviteTokenContent token={token} />;
}
