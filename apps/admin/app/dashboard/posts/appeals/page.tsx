import { getPendingAppeals } from "@/app/actions/appeals";
import { AppealsDataTable } from "@/components/appeals/AppealsDataTable";

export default async function AppealsPage() {
  const initialData = await getPendingAppeals(1, 15);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Xử lý khiếu nại</h2>
      </div>

      <AppealsDataTable initialData={initialData} />
    </div>
  );
}
