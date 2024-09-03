<script>
	import Audio from '../lib/components/global/Audio.svelte';

	let textInput = $state('');
	let textAnswer = $state('');
	let audioChunks = $state([]);
	let textAnswer2 = $state([]);

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

				// Envoie la partie du texte au TTS pour synthèse
				const ttsResponse = await fetch('/api/voice', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ text: textAnswer })
				});

				const audioBlob = await ttsResponse.blob();
				audioChunks.push(audioBlob);

				// Joue le morceau de l'audio généré
				const audioUrl = URL.createObjectURL(new Blob(audioChunks));
				const audio = new window.Audio(audioUrl);
				audio.play();
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
