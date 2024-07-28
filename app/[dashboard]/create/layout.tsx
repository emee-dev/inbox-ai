export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-2 sm:py-0 md:gap-8 w-full">
      {children}
    </main>
  );
}
