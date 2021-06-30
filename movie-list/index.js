//API相關變數
const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
// 當前頁數(預設第一頁)
let page = 1;
// 一頁的電影數量
const MOVIES_PER_PAGE = 12;
//Data
const movies = [];
let filteredMovies = [];
//選取dom節點變數
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const viewSwitcher = document.querySelector("#view-switcher");
const paginator = document.querySelector("#paginator");

//顯示模式，預設卡片
let viewType = "card";

//...............事件監聽器...............//
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault();
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase();

  //錯誤處理：輸入無效字串
  if (!keyword.length) {
    return alert("請輸入有效字串！");
  }
  //條件篩選
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合的電影`);
  }
  renderPaginator(filteredMovies.length);
  //renderMode()會根據 變數viewType的值，顯示該樣式
  renderMode();
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  //<a></a>
  if (event.target.tagName !== "A") return;
  page = Number(event.target.dataset.page);
  //renderMode()會根據 變數viewType的值，顯示該樣式
  renderMode();
});

viewSwitcher.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".card")) {
    viewType = "card";
  } else if (event.target.matches(".list")) {
    viewType = "list";
  }
  renderMode();
});

//...............函式...............//

//viewType === "Card" 執行renderMovieCard(moviepage)
//viewType === "list" 執行renderMovieList(moviepage)
function renderMode() {
  const moviepage = getMovieByPage(page);
  viewType === "card" ? renderMovieCard(moviepage) : renderMovieList(moviepage);
}

//渲染 card 模式
function renderMovieCard(data) {
  let rawHTML = "";
  data.forEach((item) => {
    // title, image
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card" style="min-height:430px;">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id
      }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
        </div>
      </div>
    </div>
  </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

//渲染 list 模式
function renderMovieList(data) {
  let rawHTML = `
    <div class="col-12 mb-2">
      <ul class="list-group">
  `;
  data.forEach((item) => {
    rawHTML += `
        <li
          class="
            list-group-item
            border-right-0 border-left-0
            d-flex
            justify-content-between
            align-items-center
            font-weight-bold
          "
        >
          ${item.title}
          <div class="list-action mr-5">
            <button
              class="btn btn-primary btn-show-movie"
              data-toggle="modal"
              data-target="#movie-modal"
              data-id=${item.id}
            >
              More
            </button>
            <button class="btn btn-info btn-add-favorite" data-id=${item.id}>
              +
            </button>
          </div>
        </li>
    `;
  });
  rawHTML += `
      </ul>
    </div>
  `;
  dataPanel.innerHTML = rawHTML;
}

//渲染 page
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
  });
}

function addToFavorite(id) {
  //JSON.parse() 取出時，會將 JSON 格式的字串轉回 JavaScript 原生物件
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  // || 運算子會優先 其中一個是true的東西
  //若 a || b 的 a與b 都是true ，則優先回傳左邊
  const movie = movies.find((movie) => movie.id === id);
  // find 在找到第一個符合條件的 item 後就回停下來回傳該 item。
  //some 只會回報「陣列裡有沒有 item 通過檢查條件」，有的話回傳 true ，到最後都沒有就回傳 false
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

//...............請求API資料...............//
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMode();
  })
  .catch((err) => console.log(err));
