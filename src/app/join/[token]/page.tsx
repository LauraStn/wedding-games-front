"use client";

import { useParams } from "next/navigation";
import { ErrorPanel } from "../../../components/ErrorPanel";
import { JoinTokenContent } from "./JoinTokenContent";

export default function JoinTokenPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  if (!token) {
    return (
      <div className="page page--centered">
        <ErrorPanel error={null} title="Lien d'invitation incomplet" />
      </div>
    );
  }

  return <JoinTokenContent token={token} />;
}
