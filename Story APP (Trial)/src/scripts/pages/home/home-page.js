import { 
  generateLoadingAbsolute,
  generateStoriesEmpty,
  generateStoriesError,
  generateListStories
 } from "../../templates";
import HomePresenter from './home-presenter';
import * as storiesAPI from '../../data/api';

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section class="container">
        <h1 class="title center">Story Lists</h1>

        <div class="stories-list-container">
          <div id="stories-list"></div>
          <div id="stories-list-loading-container"></div>
          <div id="load-more-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: storiesAPI,
    });

    await this.#presenter.initialStories();
  }

  appendStories(message, stories) {
    if (!stories.length) {
      this.listIsEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      if (this.#map) {
        // for map
      }
      return accumulator.concat(
        generateListStories({
          ...story,
          storiesName: story.name,
        }),
      );
    }, '');

    const listContainer = document.getElementById('stories-list');
    if (!listContainer.querySelector('.stories-list')) {
      listContainer.innerHTML = `<div class="stories-list">${html}</div>`;
    } else {
      listContainer.querySelector('.stories-list').insertAdjacentHTML('beforeend', html);
    }
  }

  showLoadMoreButton() {
    let btn = document.getElementById('load-more-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'load-more-btn';
      btn.innerHTML = `Load More </i> <i class="fas fa-caret-down"></i>`;
      btn.className = 'button loadmore-btn';
      btn.addEventListener('click', () => {
        btn.innerHTML = `<i class="fas fa-spinner loader-button"></i>`;
        this.#presenter.loadStories();
        setTimeout(function () {
          btn.innerHTML = `Load More </i> <i class="fas fa-caret-down"></i>`;
        }, 1000);
      });
      document.querySelector('.stories-list-container').appendChild(btn);
    } else {
      btn.style.display = 'flex';
    }
  }

  hideLoadMoreButton() {
    const btn = document.getElementById('load-more-btn');
    if (btn) btn.style.display = 'none';
  }

  listIsEmpty() {
    document.getElementById('stories-list').innerHTML = generateStoriesEmpty();
  }
  
  listIsError(message) {
    document.getElementById('stories-list').innerHTML = generateStoriesError(message);
  }

  showLoading() {
    document.getElementById('stories-list-loading-container').innerHTML = generateLoadingAbsolute();
  }

  hideLoading() {
    document.getElementById('stories-list-loading-container').innerHTML = '';
  }
}


