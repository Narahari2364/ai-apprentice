import LedgerlineFrame from "@/features/erp/LedgerlineFrame";
import EventLog from "@/features/capture/EventLog";
import VoiceAgentPanel from "@/features/capture/VoiceAgentPanel";

export default function CapturePage() {
  return (
    <div className="grid h-[calc(100vh-7rem)] gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <LedgerlineFrame user="sabine" />
      <aside className="flex min-h-0 flex-col gap-4">
        <VoiceAgentPanel />
        <EventLog />
      </aside>
    </div>
  );
}
