# Life Logistics Tracker

A small single-page app that tracks how many days it's been since you last did each of a fixed set of recurring life-admin tasks, and ranks them by an urgency weight so you know what to prioritize.

## Running it

No build step or dependencies — it's plain HTML/CSS/JS.

- Open `index.html` directly in a browser, or
- Serve the folder with any static file server, e.g. `python3 -m http.server` from this directory, then visit `http://localhost:8000`.

All data is stored in the browser's `localStorage`, scoped to whatever origin/URL you open it from. There is no backend and no account — it's meant for one person using one browser.

## Tasks tracked

| Task | Urgency (0–1) | Interval |
|---|---|---|
| Fully Getting Ready | 0.73 | every day |
| Haircuts | 0.35 | every 28 days |
| Food / Toiletry / Other Supplies Shopping | 0.63 | every 5 days |
| Acquiring Medication | 0.9 | every 20 days |
| House Cleaning | 0.45 | every 7 days |
| Laundry | 0.63 | every 7 days |
| Making Sure I Have Fitting Clothes | 0.25 | every 28 days |
| Checking Email | 0.8 | every day |
| Budgeting | 0.5 | every 14 days |

## How it works

**Basic:** each task shows the number of days since it was last marked done. Clicking **Done** resets that count to zero.

**Urgency weight:** each card shows

```
weight = urgency × (days since done) ÷ interval
```

Cards are sorted by weight (highest first) so the most pressing task floats to the top. A task also gets a red "at/past interval limit" flag once days-since-done reaches its interval, shown separately from the weight so you can always see raw elapsed-time-vs-interval even if the weighting is favoring something else.

**Partial completion:** clicking **Partial** (instead of **Done**) does *not* reset the day count — some of the task is still outstanding, so days-since-fully-done keeps accumulating from whenever it was last fully done. What it does instead is double the interval used in the weight calculation going forward, since you've chipped away at it and it can reasonably be considered less urgent for the same elapsed time. The doubling is undone the next time you click **Done**.

**Medication exception:** because "some medication" isn't the same as "the medication that's actually about to run out," clicking **Partial** on Acquiring Medication first asks you to confirm whether what you got was the consequential one. The interval only doubles if you confirm yes; if you say no, nothing changes (the day count keeps counting and the interval stays at its normal 20 days).

**Editing a date:** click the pencil icon next to "Last done" on any card to correct its date manually (useful for initial setup, or fixing a mistaken click).
