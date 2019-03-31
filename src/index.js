import preact from 'preact';
import App from './app';

let link = null;
(async () => {
  const { products } = await (await fetch('https://www.ridestore.com/rest-api/v2/categories/1057?lang=en')).json();
  /** @jsx preact.h */
  link = preact.render(<App products={ products } />, document.body);
})();
