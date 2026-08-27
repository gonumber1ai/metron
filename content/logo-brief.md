# Metron logo — generation brief

## Read this first

**Generate the SYMBOL only. Do not ask the model for the word "Metron".**

Image models still mangle letterforms — you will get MERTON, METR0N, or a fifth
leg on the M, and you will not notice until it is on a thousand phone screens.
Generate the mark, then set the wordmark yourself in a real typeface (below).

**The mark has to pass one test that has nothing to do with taste:** a man's
girlfriend picks up his phone and sees this icon on his home screen. If she can
guess what the app is for, the mark has failed and the product's core promise
along with it. Boring is correct here. It should look like a running app.

---

## The prompt

> A minimal, geometric app icon symbol. An upward-stepping line — three
> segments rising left to right, like a simple progress chart — drawn with
> uniform rounded stroke ends and even stroke weight. The line sits inside an
> implied square with generous margin. Flat vector style, no gradients, no
> shading, no 3D, no bevel, no glow, no drop shadow. Single colour: a
> desaturated teal-green (#17B890) on a near-black background (#0E1417).
> Clean, medical-instrument precision. Swiss graphic design. No text, no
> letters, no numbers, no human figures, no anatomy, no flames, no lightning
> bolts, no hearts, no arrows. Centred, symmetrical margins, high contrast,
> suitable for a 32-pixel favicon.

**Negative prompt** (if the tool takes one separately):

> text, letters, words, typography, human figure, body, anatomy, flame, fire,
> lightning bolt, heart, arrow, droplet, gradient, glow, drop shadow, 3D,
> bevel, glossy, realistic, photograph, busy detail, thin hairlines

---

## Variations worth running

Run all four, then judge them shrunk to 32px, not at full size.

1. **The rising line.** As above. Reads as progress and as measurement, which
   is literally what "metron" means. Safest and most on-brand.
2. **The gauge.** A three-quarter arc with a single tick mark at one point
   along it. Reads as an instrument. Add: *"a partial ring, open at the
   bottom, with one short radial tick at the upper right."*
3. **The scale.** Four vertical strokes of increasing height, evenly spaced,
   the tallest on the right. Simplest to render well at small sizes. Add:
   *"four vertical rounded bars of increasing height, even gaps."*
4. **The interval.** Two short vertical end-caps joined by a horizontal line —
   a measurement span, like a dimension marker on a drawing. Most distinctive,
   least obvious. Add: *"a horizontal line with a short vertical cap at each
   end, like a dimension marker in technical drawing."*

---

## How to judge

Do this before you fall in love with one:

- **Shrink it to 32×32.** Most marks die here. If the strokes merge or the
  shape turns to mush, reject it however good it looked large.
- **Squint.** If you cannot tell what shape it is at a glance, it is too busy.
- **Show it to someone who knows nothing about the product** and ask what kind
  of app it is. Answers like "fitness", "finance", "some tracker" are a pass.
  Any hesitation or smirk is a fail.
- **Check it in one colour.** It must work solid white on dark and solid black
  on white, because it will end up in both.

---

## Finishing it

1. **Vectorise.** Whatever the model gives you is a raster. Trace it in
   Illustrator, Figma, or free at vectorizer.ai, then rebuild it by hand as
   clean paths — AI output has wobbly curves that show at large sizes.
2. **Set the wordmark separately.** A geometric sans with a distinctive R and
   an even colour: **Inter Tight**, **General Sans**, **Space Grotesk**, or
   **Geist**. Medium or Semibold. Letter-spacing around +2%. All caps
   (`METRON`) reads more instrument-like; sentence case reads friendlier.
3. **Lock the lockups.** You need four files:
   - symbol only, square — app icon and favicon
   - symbol + wordmark, horizontal — site header, emails
   - wordmark only — footers
   - one-colour white version — for dark placements and print
4. **Export:** SVG for the site, plus PNG at 512, 192, 180 (Apple touch), 32.

---

## Palette

```
Symbol      #17B890   teal-green, our jade
Background  #0E1417   near-black, cool undertone
Wordmark    #F2F5F4   bone, on dark
            #16191B   graphite, on light
```

Never use red anywhere in the identity. In this category red reads as pills.

---

## What must never appear in the mark

Flames, lightning bolts, rockets, hearts, droplets, arrows pointing up,
silhouettes, anything vaguely anatomical, anything that could be read as a
body part at a squint, and any letterform that could be mistaken for a V or an
M with attitude. This is a measurement instrument, not an energy drink.
