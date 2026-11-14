import { ActionPageView } from "@/modules/studio/view/ActionPageView";

export default async function StudioActionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ActionPageView id={id} />;
}
