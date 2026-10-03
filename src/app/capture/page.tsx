import LedgerlineFrame from "@/features/erp/LedgerlineFrame";
import VoiceAgentPanel from "@/features/capture/VoiceAgentPanel";

export default function CapturePage() {
  return (
    <div className="grid h-full grid-cols-[68%_32%] grid-rows-[100%]">
      <LedgerlineFrame query="user=sabine" />
      <aside className="flex min-h-0 flex-col border-l border-line bg-panel p-3">
        <VoiceAgentPanel />
      </aside>
    </div>
  );
}
