import MockErp from "@/features/erp/MockErp";
import EventLog from "@/features/capture/EventLog";
import VoiceAgentPanel from "@/features/capture/VoiceAgentPanel";
import { expertInvoices } from "@/data/invoices";

export default function CapturePage() {
  return (
    <div className="grid h-[calc(100vh-7rem)] gap-6 lg:grid-cols-[2fr_1fr]">
      <MockErp invoices={expertInvoices} />
      <aside className="flex min-h-0 flex-col gap-4">
        <VoiceAgentPanel />
        <EventLog />
      </aside>
    </div>
  );
}
