import { openai } from '$lib/openai.js';

export async function POST({ request }) {
	try {
		const { text } = await request.json();

		const stream = new ReadableStream({
			async start(controller) {
				try {
					const mp3 = await openai.audio.speech.create({
						model: 'tts-1',
						voice: 'alloy',
						input: text
					});

					const buffer = Buffer.from(await mp3.arrayBuffer());
					controller.enqueue(buffer);
					controller.close();
				} catch (error) {
					console.error('Error during TTS:', error);
					controller.error(error); // Signaler l'erreur et fermer correctement
				}
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'audio/mpeg'
			}
		});
	} catch (error) {
		console.error('Error during TTS:', error);
		return new Response(
			JSON.stringify({ success: false, message: 'Something went wrong with TTS' }),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
}
