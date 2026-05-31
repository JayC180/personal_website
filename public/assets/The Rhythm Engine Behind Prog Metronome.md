Recently I have made a [metronome app](https://github.com/JayC180/prog-metronome) that is by far the most powerful metronome ever, which supports things like polyrhythm, polymeter, metric modulations, nested groupings, and more, which is able to entirely encompass the rhythmic system of western, west African, and the Carnatic music. And I want to talk about the part of this project I'm most proud of: the rhythm engine. Specifically, the backend architecture and the interpreter that takes a flat list of track items and turns it into a nanosecond-precision event timeline.

## Beyond the Western System

In terms of rhythm, the Western classical music is built on a hierarchical pulse structure - a BPM, divided into beats with 2 as the main concern, as it is the simplest and most straightforward way to get subdivisions. In a way, mathematically, it works similarly to harmony: we get more notes out from the fifth because it is the easiest to get (multiply by 3) that does not bring out an octave (x 2) of the base note. For rhythm, it is like folding papers; it is much easier to fold a piece of paper by halfs rather than dividing it to 3 or more at once. And all the even number folds are derived from the 2-fold, therefore always working as the power of 2. This is why the western classical system's subdivision is heavily relied to "eighth notes", "sixteenth notes", etc., and technically doesn't allow a time signature of something like 20/20 although it is the same thing as a 4/4 or a 2/2. Instead, if we want to have something like 20/20, we must use something like 4/4 but splitting each quarter note into a quintuplet instead, or multiply the bpm by 5/4 then set the time signature as 5/4. It is very unintuitive for the raw rhythmic ideas and often limiting; for this reason, you can't cleanly express somethiing like 2 quarter notes (with subdivision of sixteenth notes) followed by 2 quarter-note-quintuplets, becuse you then need to fill in 1 more quintuplet to "complete" the meter. A way to deal with this is to split the meter into two, then change the tempo in between, which is an absolutely horrible representation, or we can go further to make this meter something like 18/20; but the issue wth this is that it implies all the groupings are divided by 5s, but the first 2 quarter notes have the subdivision of 4. 

The Western Classical theory originally had very little to do with rhythm; for hundreds of years, its rhythmic evolution was no where close to African or Indian music. Even with the injection of African influences later (Blues and after), the Western system was still largely unchanged. But when it comes to progressive metal, with bands like Car Bomb exploring new ideas, the Western music annotation and many limitations fail to embrace the innovations in a clean way. Musicians could move forward without thinking in such a system, but an essential tools for musicians is a metronome. Since almost *all* the existing metronome apps are bounded by traditional Western theory, it is frustrating for prog musicians to mess around in a DAW just to set up something for practice, therefore the birth of this software. It's goal is to be able to encompass the rhythmic theories beyond the traditional Western music, being fully compatible with the modern progressive metal scene, West African music, and Carnatic music (as those are what I am the most familiar with). 

## Not the Timer-Based Metronomes

Now, the software side. Most metronome apps are, at their core, a timer. A BPM of 120 translates to fire an event every 500ms. For subdivisions, it can simply multiply the event firing rate. For example, a "16th note" in Western music theory is 4 times shorter than the "quarter note" (often the pulse), so the metronome can just fire every 125ms for it. For polyrhythms, just run two timers. This works for simple cases but is far from handling more complicated polymeters with time-signature-changes, tempo changes mid-pattern, metric modulations, etc.

If you stick to the normal metronome structure, you will end up with a pile of special cases and mutable state everywhere, and the timing drifts because you're accumulating floating point errors across thousands of timer callbacks. More fundamentally, you're conflating two things that should be separate: the *description* of the rhythm, and the *execution* of it.

Any rhythmic patterns, including stuff by Meshuggah, Animals as Leaders, etc., can be grouped into underlying patterns that are repeated and connected. So if we have the entire mapping/score, why don't we compute the whole thing upfront? It will produce a list of timestamps where the machine iterates through. For a computer, none of the theory stuff matters; it is just durations and properties of each element/event. When the clock enters at performance time, all the decisions are already made.

## The Track Item Model

The building block is `TrackItem`, a sealed class:

```kotlin
sealed class TrackItem {
    data class Beat(
        val value:   Int,
        val denom:   Int,
        val volume:  Float,
        val active:  Boolean,
        val soundId: String?,
    ) : TrackItem()
    data class BracketOpen()                       : TrackItem()
    data class BracketClose()                      : TrackItem()
    data class Repeat(val count: Int)              : TrackItem()  // -1 = infinite
    data class Modulation(val p: Int, val q: Int)  : TrackItem()
    data class SetBpm(val bpm: Double)             : TrackItem()
}
```

A track is just a `List<TrackItem>`. The user builds this list through the UI. `÷N` sets the subdivision/denominator to `N`. For example, the default subdivision is set to `÷4`, so when the user presses `3` on the numpad, it appends `Beat(value=3, denom=4, ...)`. Press `[`, add some beats, press `]`, press `×N`, enter, for example,  `4`, and you've got a section that repeats four times. The flat list is the source of truth for the entire track. 

A beat with value 3 at subdivision 4 means a duration of 3/4 of a quarter note at the current BPM, or a dotted-eighth-note in Western theory. This maps to how a prog drummer (at least myself) thinks: with the subdivision of 4 (or sixteenth note), I'm playing "3" for four times or "3333". The item list *is* the musical description.

This subdivision system also directly implements the Carnatic nadai concept. ÷4 is chatusra-nadai (groups of 4), ÷3 is tisra (groups of 3), ÷5 is khanda (groups of 5), etc. You can switch subdivision freely between beats, which means you can build any tala and any gati combination just by sequencing beats with different ÷N values. Nested brackets then give you the cyclic grouping — a bracket with a repeat is exactly a tala cycle. It is also easy to input korvai at the end of groupings. You can do it the *exact way* how a Carnatic musician thinks: calculate the karvai length, remove that amount from the end of the repetition, maybe add an arudi, then append the karvai. I might be using terms incorrectly as I didn't come from the Carnatic background, but you should get the idea.

For West African music where it's all about polyrhythm and polymeter, you just use multiple tracks. Each track runs its own independent loop. There's no formal/standard distinction for polyrhythm and polymeter, but for polymeter (as the tactus/lowest-perceived-subdivision is the same), simply keep the subdivision and enter your first number on one track and second number on another. For example, 4/4 and 5/4 on two tracks gives the 4:5 polymeter. For polyrhythm, keep the beat value the same (4) but set the subdivision to 4 and 5 on each track. 

## The Interpreter

At play time, `interpretTrackDraft()` walks the flat list and produces a `List<PrecomputedEvent>`. Each event has an `offsetNanos: Long` — nanoseconds from the start of the loop when this beat fires — along with `soundId`, `volume`, and which item index it corresponds to for the playhead highlight.

The interpreter maintains a small state struct as it walks:

```kotlin
data class InterpState(
    val cursor: Long,     // current time offset in nanoseconds
    val bpm:    Double,   // current tempo — can change via mm or =bpm
    val fired:  Int,      // how many beats have fired
)
```

For a plain beat, the math is:

```kotlin
val nanosPerPulse = 60_000_000_000.0 / bpm / denom
val duration      = (nanosPerPulse * value).toLong()
```

`nanosPerPulse` is stored as `Double` before converting, and this is important. Integer division first means you accumulate rounding errors that compound over long patterns. A 120 BPM 16th note is 125,000,000 nanoseconds exactly, but a triplet eighth at 120 BPM is 166,666,666.666... You need to carry the fractional part through the multiplication and only discretize at the very end.

Brackets, which allow groupings (meters, hypermeters, etc.) are where it gets interesting. When the interpreter hits a `BracketOpen`, it finds the matching `BracketClose` and the `Repeat` count after it, then recursively interprets the contents `count` times, threading the state through each pass. Any tempo change inside the bracket compounds across passes. So if you have a bracket containing `mm ×3/2` repeated 4 times starting at 120 BPM, you get 120 → 180 → 270 → 405 across the four passes. This a design choice that helps musician to practice stacked-modulations, or continuous-modulation within the same groupings of beats.

When the full track loops back to the beginning, the interpreter runs fresh, starting from `baseBpm`. No accumulated state, no drift. The reset behavior is also a design choice, also to avoid the BPM to get infinitely large or zero from metric modulation blocks. If the user wish to keep the modulated bpm, they can use the infinite repeat option or simply set a very large number of repeats for the grouping.

For infinite repeats, the interpreter produces one pass of events and marks the result as `isInfinite = true`. The playback engine handles the actual looping by reusing the precomputed single-pass timeline, just resetting the loop origin each time it reaches the end.

## Metric Modulation Semantics

A `Modulation(p=3, q=2)` means multiply the current BPM by 3/2 at this position. The current BPM is whatever tempo is in effect at this position in the track — not the global base BPM. So if you've already done `=bpm 100` or modulated bpm to 100, a subsequent `mm ×3/2` gives you 150, not 3/2 of the original.

This means the interpreter threads tempo as local state through the walk, not reading from any global. The tempo at any position is a function of all tempo events preceding it in linearized execution order — which, for nested brackets with repeats, is not the same as their order in the flat list. This is the key reason you can't just scan linearly; you actually have to simulate the execution.

The one hard constraint is that mm is not allowed inside an infinite repeat group. If you compound a tempo change across infinite passes, the BPM goes to infinity or zero depending on direction. The app enforces this at build time. `buildErrors()` catches it before play is even allowed, so the interpreter never sees an invalid structure.

`=bpm` is allowed inside infinite groups because it sets an absolute tempo rather than a relative one. It just means "at this point in the cycle, jump to this BPM," which is well-defined even across infinite repetitions.

## The StreamClock

The drift must not accumulate. The precomputed event list feeds into `StreamClock`, which runs on a `MAX_PRIORITY` thread (for Android). It maintains a `loopOriginNanos` — the wall-clock time when the current loop started — and walks the precomputed list, firing events when `System.nanoTime() >= loopOriginNanos + event.offsetNanos`. When the list is exhausted, it updates `loopOriginNanos` by adding the total loop duration, and starts again from the top.

The drift-prevention detail is in that last step. When the loop ends, I do `loopOriginNanos += totalLoopDuration` instead of `loopOriginNanos = System.nanoTime()`. If you recompute the origin from the current wall clock at each loop boundary, you bake the scheduling jitter from the previous pass into the next one. Every loop starts slightly late, and those lates accumulate. By adding a fixed duration to the previous origin, the loop boundary is always at exactly where it mathematically should be, regardless of when the thread actually woke up to notice. The jitter from one pass doesn't carry forward.

`Transport` then takes each fired event and hands it to the Oboe audio engine (for Android) with the target timestamp. Oboe can accept a future timestamp and schedule the sound at the hardware level. By the time the audio fires, the decision was already made nanoseconds earlier, and the hardware handles the rest at the driver level. This is where the actual precision comes from: software scheduling is approximate, hardware scheduling is not.

## The Clean Separation

Another thing I really like about this architecture is the layering:
- **Item list**: the musical description of what to play, in what order, with what structure. No time, no BPM yet.
- **Interpreter**: it takes the description and produces a list of `(offsetNanos, soundId, volume)` tuples. Pure arithmetic, no real time involved. Completely unit-testable without any audio hardware.
- **StreamClock**: the executor that iterates the timestamp list against a wall clock and fires events at the right moment.
- **Audio engine** (Oboe/C++): just plays a sound at a given nanosecond. 

Each layer has only one job. The musical intelligence lives entirely in the interpreter, and everything below it is just plumbing. A [friend of mine](https://github.com/null102) was able to re-implement the engine cleanly in C++ for a JUCE desktop port; the engine is language-agnostic. A beat is a duration. A modulation is a ratio. The interpreter is just arithmetic over a list.

The engine also naturally represents things that are hard to express as timers. Polyrhythm is just two tracks with different item lists running in parallel: no synchronization required, no shared state, they just loop independently and the rhythmic relationship emerges from their relative lengths. Metric modulation is just a `Modulation` item in the list at the right position. Infinite loops are a flag on a bracket. The musical concepts map directly to data, and the interpreter's job is to linearize that data into time.

That simpleness and directness is what I'm proud of. The engine doesn't have rocket science engineering for the super complicated rhythmic ideas. It doesn't have a special case for metric modulation or for Carnatic tuplets or for West African cross-rhythms. It has beats, brackets, repeats, and tempo events - and from those four primitives, everything else follows. What this really reveals is not just a software implementation of a metronome that makes more sense to rhythm, but also the system of rhythm itself.
