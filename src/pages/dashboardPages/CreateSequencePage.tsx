import SequenceConfigForm from "@/components/sequences/SequenceConfigForm";
import GeneratedSequenceList from "@/components/sequences/GeneratedSequenceList";
import SequenceSidebar from "@/components/sequences/SequenceSidebar";

export default function CreateSequencePage() {
  return (
    <div className="flex flex-col space-y-6 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create Follow-up Sequence
        </h1>
        <p className="text-sm text-slate-500">
          Generate a multi-channel follow-up in seconds.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          <SequenceConfigForm />
          <GeneratedSequenceList />
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <SequenceSidebar />
        </div>
      </div>
    </div>
  );
}
