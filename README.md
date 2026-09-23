# BBD Resale Calculator

A simple offline phone resale calculator made with plain HTML, CSS and JavaScript.

## Files

- `index.html` - application UI
- `style.css` - styling
- `app.js` - calculator logic
- `phones.js` - phone list and local market prices

## How to use

1. Open `index.html` in Chrome, Edge, Safari or Firefox.
2. Select a phone.
3. Enter the BBD purchase price.
4. Enter card discount and cashback.
5. Enter the number of units.
6. The app calculates:
   - Effective purchase cost
   - Expected profit per phone
   - Profit percentage
   - Total expected profit
   - BUY / NEGOTIATE / SKIP decision

## Updating market prices

Open `phones.js` and change the `marketPrice` values.

Example:

```js
{
  id: 1,
  name: "Apple iPhone 17",
  category: "iPhone",
  marketPrice: 72000
}
```

The market price should be the realistic price you expect to receive from your local buyer/dealer.

## Decision rules

Current defaults:

- BUY: >= 8% margin
- NEGOTIATE: 4% to <8%
- SKIP: <4%

Change these values at the top of `app.js`.

This version intentionally does not use a backend or external API, so it works offline.
# bbd_resale_calculator
