import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-hero px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,102,204,0.08),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(13,148,136,0.06),_transparent_60%)]" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
              <span className="text-lg font-bold text-primary-foreground">
                B
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              BloodInsight
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
