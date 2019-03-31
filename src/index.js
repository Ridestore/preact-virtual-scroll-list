import preact from 'preact';
import App from './app';

let link = null;
(async () => {
  const simple = await (await fetch('https://www.ridestore.com/rest-api/v2/categories/1057?lang=en')).json();
  const filtered = await (await fetch('https://www.ridestore.com/rest-api/v2/categories/409?lang=en&filter[129]=18')).json();
  simple.products.splice(3, 0, {
    productype: 'promo-1',
  });
  simple.products.splice(5, 0, {
    productype: 'promo-2',
  });
  /** @jsx preact.h */
  link = preact.render(<App products={ simple.products } filtered={ filtered.products } />, document.body);
})();
