import preact from 'preact';

export default class Item extends preact.Component {
  constructor(props) {
    super(props);
    this.state = { src: null };
  }

  componentWillMount() {
    const { image } = this.props.item;
    const imgBaseLink = `/${ image }`.replace('//', '/');
    const catLink = 'https://ridestore.imgix.net/catalog/product';
    const sdQuery = '?w=60&q=50&blur=60&auto=format,compress&cs=strip';
    this.state.src = `${ catLink }${ imgBaseLink }${ sdQuery }`;

    let dpr = 1;
    let w = 450;
    if (typeof window !== 'undefined') {
      dpr = window.devicePixelRatio;
      w = 450;
    }

    const hdQuery = `?auto=format&q=60&dpr=${ dpr }&usm=15&chromasub=444&w=${ w }&fit=max`;
    const imageHD = `${ catLink }${ imgBaseLink }${ hdQuery }`;
    const img = new Image();
    img.onload = () => this.setState({ src: imageHD });
    setTimeout(() => { img.src = imageHD }, 100);
  }

  render({ item }, { src }) {
    const { brand, shortname, productype, price, review_score, review_count, color } = item;
    const title = `${ brand } ${ shortname } ${ productype } ${ color }`;

    let dpr = 1;
    let w = 500;
    if (typeof window !== 'undefined') {
      dpr = window.devicePixelRatio;
      w = 550;
    }

    const ratingStars = [];

    for (let i = 0; i < Math.ceil(review_score); i++) {
      ratingStars.push((
        <path
          fill="#000"
          fill-opacity="1"
          d="M313.48411,760.08l2.00345,3.98178l4.48042,0.63868l-3.24205,3.09919l0.76531,4.37656l-4.00713,-2.06621l-4.00737,2.06621l0.76532,-4.37656l-3.24206,-3.09919l4.48043,-0.63868z"
          transform={ `matrix(1,0,0,1,${ -350 + (11 * 2 * i) },-760)` }
        />
      ));
    }

    return (
      <article className="rs-products-list-item visible">
        <div className="smooth-img">
          <img
            src={ src }
            alt={ title }
          />
        </div>
        <div className="rs-products-list-item__controls">
          <div className="rs-products-list-item__info">
            <div className="rs-products-list-item__title">
              { title }
            </div>
            <div className="rs-products-list-item__price">
              <span>{ price }&nbsp;€</span>
            </div>
          </div>
          <button data-like-btn="true" aria-label="Like" className="rs-products-list-item__like">
            <svg version="1.1" width="15.6" height="15" viewBox="0 0 21 20">
              <g transform="matrix(1,0,0,1,-337,-460)">
                <g>
                  <use xlinkHref="#lksvgp" fill-opacity="1" stroke-linejoin="miter" stroke-linecap="butt" stroke-opacity="1" stroke-miterlimit="50" stroke-width="4" clip-path="url('#lksvgcp')" />
                </g>
              </g>
            </svg>
          </button>
          { !!review_score && (
            <div className="rs-products-list-item__rating">
              <span>
                <svg viewBox="0 0 13 13" width="90" height="11">
                  { ratingStars }
                </svg>
              </span>
              <span>({ review_count })</span>
            </div>
          ) }
        </div>
      </article>
    )
  }
}