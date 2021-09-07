import preact from 'preact';
import App from './app';

let link = null;
(async () => {
  const simple = await (await fetch("https://rq1foh2c4f-dsn.algolia.net/1/indexes/ct_products_en_postnord/query?x-algolia-agent=Algolia%20for%20JavaScript%20(4.10.2)%3B%20Browser%20(lite)&x-algolia-api-key=0d25e78e0acf09ee712eb5c482cf56d5&x-algolia-application-id=RQ1FOH2C4F", {
    "headers": {
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded",
    },
    "body": "{\"query\":\"\",\"facets\":[\"*\"],\"facetFilters\":[[\"category_ids:3e76a6bf-3e87-40e1-97f8-35fe20dafed1\"]],\"hitsPerPage\":28,\"page\":0,\"analyticsTags\":[\"ridestore-dope\"],\"attributesToRetrieve\":[\"*\",\"-description\"],\"attributesToHighlight\":[]}",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  })).json();
  // const filtered = await (await fetch('https://www.ridestore.com/rest-api/v2/categories/409?lang=en&filter[129]=18')).json();
  const filtered = [];
  // simple.products.splice(3, 0, {
  //   productype: 'promo-1',
  // });
  // simple.products.splice(5, 0, {
  //   productype: 'promo-2',
  // });
  /** @jsx preact.h */
  link = preact.render(<App products={ simple.hits } filtered={ filtered && filtered.products } />, document.body);
})();
