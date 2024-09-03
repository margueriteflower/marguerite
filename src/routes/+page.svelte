<script>
	import Audio from '../lib/components/global/Audio.svelte';

	let textInput = $state('');
	let textAnswer = $state('');
	let processedText = $state(''); // Stocke le texte déjà traité
	let audioChunks = $state([]);
	let isPlaying = false; // Indicateur pour savoir si un morceau est en cours de lecture

	async function fetchStream(input) {
		try {
			const response = await fetch('/api/assistant', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ input: input })
			});

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let done = false;

			while (!done) {
				const { value, done: readerDone } = await reader.read();
				done = readerDone;
				textAnswer += decoder.decode(value, { stream: true });

				// Découpe le texte en phrases, mais seulement les nouvelles
				const newText = textAnswer.substring(processedText.length); // Prendre seulement le nouveau texte
				const sentences = newText.match(/[^.!?]+[.!?]+[\s]*/g);

				if (sentences) {
					for (const sentence of sentences) {
						await processSentence(sentence);
					}
					processedText += newText; // Mettre à jour processedText après avoir traité
				}
			}
		} catch (error) {
			console.error('Error fetching stream:', error);
			textAnswer = 'Error fetching data';
		}
	}

	async function processSentence(sentence) {
		if (!sentence) return;

		console.log(sentence);

		// Envoie la phrase au TTS pour synthèse
		const ttsResponse = await fetch('/api/voice', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text: sentence })
		});

		const audioBlob = await ttsResponse.blob();
		audioChunks.push(audioBlob);

		// Vérifier si nous sommes déjà en train de jouer un morceau
		if (!isPlaying) {
			playAudioChunks();
		}
	}

	async function playAudioChunks() {
		if (audioChunks.length === 0) {
			isPlaying = false;
			return;
		}

		isPlaying = true;
		const audioUrl = URL.createObjectURL(audioChunks.shift());
		const audio = new window.Audio(audioUrl);

		// Lorsque l'audio actuel se termine, jouer le suivant
		audio.onended = playAudioChunks;

		audio.play();
	}
</script>

<div>
	<p>{textAnswer}</p>
</div>

<form on:submit|preventDefault={() => fetchStream(textInput)}>
	<input type="text" bind:value={textInput} />
	<button type="submit">submit</button>
</form>

<Audio {fetchStream} />
