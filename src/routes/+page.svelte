<script>
	import Audio from '../lib/components/global/Audio.svelte';

	let textInput = $state('');
	let textAnswer = $state('');

	async function fetchStream(input) {
		try {
			const response = await fetch('/api/assistant', {
				method: 'POST', // Specify the HTTP method
				headers: {
					'Content-Type': 'application/json' // Set the content type to JSON
				},
				body: JSON.stringify({ input: input }) // Include a body with the POST request
			});

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let done = false;

			while (!done) {
				const { value, done: readerDone } = await reader.read();
				done = readerDone;
				textAnswer += decoder.decode(value, { stream: true });
			}
		} catch (error) {
			console.error('Error fetching stream:', error);
			textAnswer = 'Error fetching data';
		}
	}
</script>

<div>
	<p>{textAnswer}</p>
</div>

<form onsubmit={() => fetchStream(textInput)}>
	<input type="text" bind:value={textInput} />
	<button type="submit">submit</button>
</form>

<Audio {fetchStream} />
