<script>
	let { fetchStream } = $props();

	let isRecording = $state(false);
	let mediaRecorder;
	let audioChunks = $state([]);

	async function startRecording() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder = new MediaRecorder(stream);
			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};
			mediaRecorder.start();
			isRecording = true;
		} catch (error) {
			console.error('Error accessing microphone:', error);
		}
	}

	function stopRecording() {
		return new Promise((resolve, reject) => {
			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
				resolve(audioBlob);
			};
			mediaRecorder.stop();
			isRecording = false;
		});
	}

	async function handleRecording() {
		if (!isRecording) {
			startRecording();
		} else {
			const audioBlob = await stopRecording();
			sendToServer(audioBlob);
		}
	}

	async function sendToServer(audioBlob) {
		const formData = new FormData();
		formData.append('audio', audioBlob, 'recording.mp3');

		const response = await fetch('/api/transcription', {
			method: 'POST',
			body: formData
		});

		const data = await response.json();

		console.log('Transcription:', data.transcription);

		fetchStream(data.transcription);
	}
</script>

<button onclick={handleRecording}>
	{isRecording ? 'Stop Recording' : 'Start Recording'}
</button>
