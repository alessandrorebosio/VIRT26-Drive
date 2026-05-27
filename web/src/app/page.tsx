"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export default function Home() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1800);
		return () => clearTimeout(timer);
	}, []);

	return (
		<main className="flex min-h-screen w-full items-center justify-center">
			{isLoading ? (
				<Skeleton className="h-12 w-64" />
			) : (
				<h1 className="text-3xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
					Home
				</h1>
			)}
		</main>
	);
}
