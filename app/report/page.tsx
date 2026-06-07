import ReportForm from "@/components/Report/ReportForm";

interface ReportPageProps {
  searchParams: Promise<{ lat?: string; lng?: string }>;
}

// QR 코드(/report?lat=xx&lng=xx)로 진입한 경우 위치를 미리 채워준다.
function parseLocation(lat?: string, lng?: string) {
  if (!lat || !lng) return null;

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return null;

  return { lat: parsedLat, lng: parsedLng };
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const { lat, lng } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold">위험 제보하기</h1>
        <p className="mt-1 text-sm text-zinc-500">
          현장 사진과 위치 정보를 보내주시면 위험도 분석에 즉시 반영됩니다.
        </p>
      </div>
      <ReportForm initialLocation={parseLocation(lat, lng)} />
    </div>
  );
}
