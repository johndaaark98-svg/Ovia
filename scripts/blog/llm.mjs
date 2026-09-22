// Chiamata all'API Anthropic con output strutturato (tool use forzato).
import { CONFIG } from './config.mjs';

export async function chiamaStrutturato({ system, prompt, nomeTool, schema, maxTokens = 16000 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY mancante (impostala nei Secrets del repository GitHub).');
  let ultimoErrore;
  for (let tentativo = 1; tentativo <= 3; tentativo++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: CONFIG.model,
        max_tokens: maxTokens,
        system,
        tools: [{ name: nomeTool, description: 'Restituisce il risultato strutturato.', input_schema: schema }],
        tool_choice: { type: 'tool', name: nomeTool },
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(300000),
    });
    if (r.ok) {
      const data = await r.json();
      const blocco = (data.content || []).find(b => b.type === 'tool_use');
      if (!blocco) throw new Error('Risposta senza output strutturato');
      if (data.stop_reason === 'max_tokens') throw new Error('Output troncato (max_tokens)');
      return blocco.input;
    }
    ultimoErrore = new Error(`API ${r.status}: ${(await r.text()).slice(0, 400)}`);
    if (![429, 500, 502, 503, 529].includes(r.status)) break;
    await new Promise(res => setTimeout(res, 15000 * tentativo));
  }
  throw ultimoErrore;
}
