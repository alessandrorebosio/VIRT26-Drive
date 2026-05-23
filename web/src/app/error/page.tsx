"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Suspense, use } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ErrorContent({
	searchParams,
}: {
	searchParams: Promise<{ error: string }>;
}) {
	const params = use(searchParams);

	return (
		<>
			{params?.error ? (
				<p className="text-sm rounded-md bg-destructive/10 p-4 font-mono text-destructive break-all">
					Error details: {params.error}
				</p>
			) : (
				<p className="text-sm rounded-md bg-muted p-4 text-muted-foreground">
					An unspecified error occurred.
				</p>
			)}
		</>
	);
}

export default function ErrorPage({
	searchParams,
}: {
	searchParams: Promise<{ error: string }>;
}) {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[radial-gradient(circle_at_center,var(--muted)_0%,transparent_100%)]">
			<div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-1000">
				<Card className="border-2 border-destructive/20 shadow-lg">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
							<AlertTriangle size={32} />
						</div>
						<CardTitle className="text-3xl font-bold tracking-tight">
							Oops, something went wrong!
						</CardTitle>
						<CardDescription className="mt-2 text-lg text-muted-foreground">
							Don&apos;t worry, it&apos;s not your fault. There was a technical problem
							on our end.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<Suspense fallback={<div className="text-sm text-center text-muted-foreground">Loading error details...</div>}>
							<ErrorContent searchParams={searchParams} />
						</Suspense>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 w-full">
							<Button asChild size="lg" className="w-full">
								<Link href="/">
									<Home className="mr-2 size-5" />
									Back to Home
								</Link>
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="w-full"
								onClick={() => window.location.reload()}
							>
								<RefreshCw className="mr-2 size-5" />
								Retry
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
