"""Builds the voiceover for the home-page explainer (VSL): assets/vsl/scene-NN.mp3 + assets/vsl/manifest.json.

    pip install edge-tts mutagen
    python tools/build-vsl-audio.py

The voice is a Microsoft neural voice (edge-tts). It is generated online from this script text; only this public marketing copy is sent.
To use a different voice (for example ElevenLabs), keep the same file names: replace the scene-NN.mp3 files and update the
"duration" and "words" (start/end seconds per word) in manifest.json. The player reads everything from the manifest.
"""
import asyncio
import json
import os

import edge_tts
from mutagen.mp3 import MP3

VOICE = 'en-US-AndrewNeural'
RATE = '+0%'
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'vsl')

# id drives the animation in js/vsl.js. `text` is both spoken and shown as captions.
SCENES = [
    dict(id='hook', tag='The moment', headline="They don't browse. They Google.", sub='7:03 PM. The water heater just died.',
         text="When a homeowner's water heater dies at seven p.m., they don't browse. They search Google, glance at the stars, and call the first business they trust."),
    dict(id='problem', tag='The problem', headline='Fewer stars. Fewer calls.', sub='Illustrative example',
         text="If that business isn't you, that job goes to a competitor. And so does the next one. Not because they're better at the work. Because they look better on Google."),
    dict(id='intro', tag='The solution', headline='Four systems. One goal.', sub='Your phone ringing.',
         text='Review Dominators helps home service businesses turn Google into a steady source of calls, jobs, and five-star reviews. Four simple systems, built for one goal: your phone ringing.'),
    dict(id='reputation', tag='System 1 · Reputation', headline='Reviews on autopilot.', sub='Automated review requests',
         text='First, reputation management. After every job, your customer gets a friendly text with a one-tap link to review you on Google. Five-star reviews roll in automatically, and we help you reply to every one.'),
    dict(id='website', tag='System 2 · Smart websites', headline='A website that books jobs.', sub='Fast, mobile-first, built to convert',
         text='Second, a smart website. Fast on any phone, and built to turn visitors into calls and booked jobs, with your best reviews right where people decide.'),
    dict(id='seo', tag='System 3 · Google SEO', headline='Climb the map pack.', sub='Illustrative ranking map',
         text='Third, SEO. We tune your Google Business Profile so you climb the local map, right where customers are looking for you.'),
    dict(id='ads', tag='System 4 · Google Ads', headline='Top of Google. Today.', sub='Judged by booked jobs, not clicks',
         text='Fourth, Google Ads. Show up at the top of the page for high-intent searches, and we measure what matters: the cost of every booked job, not just clicks.'),
    dict(id='paths', tag='Two paths, one goal', headline='Build for tomorrow. Win today.', sub='Long-term growth + immediate leads',
         text='Reviews, SEO, and your website build assets that compound over time. Ads bring results right now. Together, you get both: leads today, and a stronger business every month.'),
    dict(id='why', tag='Why Review Dominators', headline='No contracts. No games.', sub='',
         text="And we do things differently. No contracts. No hidden fees. Your systems are ready to launch within a week. You stay with us because it's working, not because you're locked in."),
    dict(id='cta', tag='Next step', headline='Ready for more calls?', sub='Book a free growth call',
         text="Ready for more calls, more jobs, and more five-star reviews? Book a free growth call, and we'll show you exactly what we'd do for your business. Click the button below."),
]


async def synth(scene, path):
    comm = edge_tts.Communicate(scene['text'], VOICE, rate=RATE, boundary='WordBoundary')
    audio, words = bytearray(), []
    async for chunk in comm.stream():
        if chunk['type'] == 'audio':
            audio.extend(chunk['data'])
        elif chunk['type'] == 'WordBoundary':
            words.append([chunk['text'], round(chunk['offset'] / 1e7, 3), round((chunk['offset'] + chunk['duration']) / 1e7, 3)])
    with open(path, 'wb') as fh:
        fh.write(audio)
    return words


async def main():
    os.makedirs(OUT, exist_ok=True)
    manifest = {'voice': VOICE, 'scenes': []}
    total = 0.0
    for i, scene in enumerate(SCENES, start=1):
        name = f'scene-{i:02d}.mp3'
        path = os.path.join(OUT, name)
        words = await synth(scene, path)
        dur = round(MP3(path).info.length, 3)
        total += dur
        manifest['scenes'].append({**scene, 'audio': f'assets/vsl/{name}', 'duration': dur, 'words': words})
        print(f'{name}  {dur:6.2f}s  {len(words):3d} words')
    manifest['total'] = round(total, 3)
    with open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8') as fh:
        json.dump(manifest, fh, ensure_ascii=False, separators=(',', ':'))
    print(f'total {total:.1f}s')


asyncio.run(main())
