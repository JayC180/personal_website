I'm currently looking for internships — the company rescinded the offer due to "unexpected shift in business demands" at the end of April, hooray. While that sorts itself out, here's something I've been building that I'm genuinely excited about. It's not in the resume because it isn't done yet.

It is an advanced metronome Android app that goes far beyond the scope of a normal metronome app, which is basically a simple time machine with UI wrappers. This app, however, targets very advanced musicians who need to practice to rhythmic chaos from bands like Car Bomb or composers like Tigran Hamasyan, and so on. *No existing app can meet such demand*. So I'm doing it myself.

A few things under the hood:

- Unconventional rational arithmetic that is BPM based, breaks free of limitations of traditional western theories
- Multiple independent tracks run in parallel with no forced alignment, making things like polymeter very simple
- Built in metric modulation: tempo transformed by any ratio mid-session
- Arbitrary tuplets nest freely: a triplet inside a quintuplet inside a 7-beat phrase? As valid as a standard eighth note
- Audio pipeline built on Oboe (Google's low-latency audio library) with a C++ mixing layer, keeping trigger timing under 2ms

The architecture ended up closer to a lightweight DAW focused entirely on rhythm than anything you'd call a metronome. The engine is mostly done and tested. UI is next.

Still in development. More soon.

