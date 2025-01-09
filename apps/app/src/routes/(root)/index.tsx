import { A } from '@solidjs/router';

import { Button } from '~/components/ui/button';

export default function HomePage() {
	return (
		<div class="flex h-full flex-col gap-4 overflow-hidden py-4">
			<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
				<Button as={A} class="flex items-center justify-start gap-2" href="/apps" variant="outline">
					<span class="i-heroicons:rectangle-group-solid text-lg" />
					<span>Apps</span>
				</Button>
				{/* <Button */}
				{/* 	as={A} */}
				{/* 	class="flex items-center justify-start gap-2" */}
				{/* 	href="/settings" */}
				{/* 	variant="outline" */}
				{/* > */}
				{/* 	<span class="i-heroicons:cog text-lg" /> */}
				{/* 	<span>Settings</span> */}
				{/* </Button> */}
				<Button as={A} class="flex items-center justify-start gap-2" href="/dev" variant="outline">
					<span class="i-heroicons:rectangle-group-solid text-lg" />
					<span>Developer Area</span>
				</Button>
			</div>
		</div>
	);
}
