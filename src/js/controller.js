import { async } from 'regenerator-runtime';
import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return; //modern way
    recipeView.renderSpinner(); //old way ;
    // 0)update result view
    resultsView.update(model.getSearchResultsPage());
    //1)load model
    await model.loadRecipe(id);

    //2) Rendering Recipe
    recipeView.render(model.state.recipe);
    //test
    bookmarksView.update(model.state.bookmarks);
    // controlServings();
  } catch (err) {
    recipeView.renderError();
    // console.error(err);
  }
};

const controlSearchReults = async function () {
  resultsView.renderSpinner();
  try {
    //1 get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2 load search results

    await model.loadSearchResults(query);

    //3) render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //render the inital pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    resultsView.renderError();
  }
};

const controlPagination = function (gotoPage) {
  // render new results
  resultsView.render(model.getSearchResultsPage(gotoPage));

  //render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe servings
  model.updateServings(newServings);
  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //update recipe view
  recipeView.update(model.state.recipe);

  // render the bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  // console.log(newRecipe);
  try {
    //show loading spinner\
    // show loading spinner
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log('RRR', model.state.recipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //sucess message
    addRecipeView.renderMessage();

    //render the bookmarkview
    bookmarksView.render(model.state.bookmarks);

    //change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close the form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
  //upload the new recipe data
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandelerUpdateServings(controlServings);
  recipeView.addHandelerBookmark(controlAddBookmark);
  searchView.addHandelerSearch(controlSearchReults);
  paginationView.addHandelerClick(controlPagination);
  addRecipeView.addHandelerUpload(controlAddRecipe);
};
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();
