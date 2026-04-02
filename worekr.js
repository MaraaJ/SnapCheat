export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }
    const url = new URL(request.url);
    if (url.pathname === '/removebg') {
      const body = await request.json();
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': '2h23hXG4HPtV64wGf2sALCzx',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: body.image_base64,
          size: 'auto',
          format: 'png',
        })
      });
      const buffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      return new Response(JSON.stringify({ result_b64: base64 }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    const body = await request.json();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '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',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        ...body,
        model: 'claude-haiku-4-5-20251001',
      })
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};
