import WorkMapView from "@/features/workmap/WorkMapView";
import { sampleWorkMap } from "@/data/sampleWorkMap";

export default function MapPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <WorkMapView map={sampleWorkMap} />
    </div>
  );
}
