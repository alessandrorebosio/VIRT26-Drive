
export default function SetupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[radial-gradient(circle_at_center,var(--muted)_0%,transparent_100%)]">
            <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {children}
            </div>
        </div>
    )
}
