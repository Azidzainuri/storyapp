import { 
  generateLoadingAbsolute,
  generateStoriesEmpty,
  generateStoriesError,
  generateListStories
 } from "../../templates";
 import BookmarkPresenter from "./bookmark-presenter";
 import Database from '../../data/database';

 export default class BookmarkPage {
   #presenter = null;
   #map = null;
 
   async render() {
     return `
       <section class="container">
         <h1 class="title center">My Bookmark</h1>
 
         <div class="stories-list-container">
           <div id="stories-list"></div>
           <div id="stories-list-loading-container"></div>
           <div id="load-more-container"></div>
         </div>
       </section>
     `;
   }
 
   async afterRender() {
     this.#presenter = new BookmarkPresenter({
       view: this,
       model: Database,
     });
 
     await this.#presenter.initialStories();
   }

   bookmarkStories(message, stories) {
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
    if (listContainer) {
       listContainer.innerHTML = `<div class="stories-list">${html}</div>`;
       const bookmarkButtons = document.querySelectorAll('.button-bookmark');
       bookmarkButtons.forEach(container => {
        container.innerHTML = '<button class="event-bookmark"><i class="fas fa-bookmark"></i></button>';
      });
       this.removeStoryEvents();
    }
  }

  removeStoryEvents() {
    const buttons = document.querySelectorAll('.event-bookmark');
    buttons.forEach((button) => {
      button.addEventListener('click', async (event) => {
        const storyItem = button.closest('.story-item');
        const storyId = storyItem?.dataset?.reportid;
        if (!storyId) return;  
        await this.#presenter.removeStory(storyId);
        await this.#presenter.initialStories(); // Refresh list
      });
    });
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