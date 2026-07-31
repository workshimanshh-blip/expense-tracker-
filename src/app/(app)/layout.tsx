import { Sidebar } from "@/components/Sidebar";
import { DataProvider } from "@/lib/data-context";
import { isCloudSyncEnabled } from "@/lib/config";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <div className="flex min-h-screen flex-1">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          {!isCloudSyncEnabled && (
            <div className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              Demo mode — data is saved only in this browser. Deploy with
              cloud sync enabled (see README) to use the Telegram bot and
              access your data from any device.
            </div>
          )}
          <main className="flex-1 px-4 pb-20 pt-6 md:px-8 md:pb-8">
            {children}
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
