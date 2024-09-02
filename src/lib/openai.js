import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const assistant = await openai.beta.assistants.create({
	name: 'temp_Bill',
	instructions: 'Always answer with a joke, never more.',
	model: 'gpt-4o-mini'
});

const thread = await openai.beta.threads.create();

export { openai, assistant, thread };
