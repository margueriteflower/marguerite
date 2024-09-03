import { openai } from '$lib/openai.js';
import { Buffer } from 'buffer';

export async function POST({ request }) {
	try {
		const { text } = await request.json();

		// Appel à l'API OpenAI pour générer la voix
		const mp3 = await openai.audio.speech.create({
			model: 'tts-1',
			voice: 'nova',
			input: text
		});

		// Convertir les données reçues en Buffer
		const buffer = Buffer.from(await mp3.arrayBuffer());

		// Retourner les données audio au client
		return new Response(buffer, {
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
