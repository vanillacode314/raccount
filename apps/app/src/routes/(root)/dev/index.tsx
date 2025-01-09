import { A } from '@solidjs/router';

import { Button } from '~/components/ui/button';

export default function DevHomePage() {
	return (
		<div class="flex h-full flex-col gap-4 overflow-hidden py-4">
			<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
				<Button
					as={A}
					class="flex items-center justify-start gap-2"
					href="/dev/apps"
					variant="outline"
				>
					<span class="i-heroicons:rectangle-group-solid text-lg" />
					<span>Registered Apps</span>
				</Button>
			</div>
		</div>
	);
}
