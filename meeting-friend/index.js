const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 16

const users = []
let searchUser = []
const usersCurrentPage = JSON.parse(localStorage.getItem('usersCurrentPages')) || 1


const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


function renderUserList(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `<div class="col-sm-auto">
        <div class="card mb-5">
          <div class="card-body">
            <img src="${item.avatar
      }" class="card-img mb-2" alt="avatar"
              data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">
            <h4 class="card-title">${item.name}</h4>
          </div>
          <div class="card-footer">
            <button class="btn btn-add-track love-icon" data-id="${item.id}">♥</button>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getUsersByPage(page) {
  const data = searchUser.length ? searchUser : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  const endIndex = startIndex + USERS_PER_PAGE
  return data.slice(startIndex, endIndex)
}

function showUserModal(id) {
  const userName = document.querySelector('#user-modal-name');
  const userGender = document.querySelector('#user-modal-gender');
  const userAge = document.querySelector('#user-modal-age');
  const userBirthday = document.querySelector('#user-modal-birthday');
  const userRegion = document.querySelector('#user-modal-region');
  const userEmail = document.querySelector('#user-modal-email');
  const userAvatar = document.querySelector('#user-modal-img');

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data
    userAvatar.innerHTML = `<img src="${data.avatar}" alt="avatar" class="avatar-img-modal">`;
    userName.innerText = data.name + ' ' + data.surname;
    userGender.innerText = `➺ ` + data.gender;
    userAge.innerText = `Age: ` + data.age;
    userRegion.innerText = `Region: ` + data.region;
    userBirthday.innerText = `Birthday: ` + data.birthday;
    userEmail.innerText = `Email: ` + data.email;
  });
}

function addToTrack(id) {
  const list = JSON.parse(localStorage.getItem('trackUsers')) || []
  const user = users.find(user => user.id === id)
  if (list.some(user => user.id === id)) {
    return alert('已追蹤')
  }
  list.push(user)
  localStorage.setItem('trackUsers', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.card-img')) {
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches('.btn-add-track')) {
    addToTrack(Number(event.target.dataset.id))
  }
});

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
  localStorage.setItem('usersCurrentPages', JSON.stringify(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  if (!keyword.length) {
    return alert('請輸入姓名相關字詞')
  }
  searchUser = users.filter((user) => user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))
  if (searchUser.length === 0) {
    return alert('找不到您所輸入的關鍵詞 ' + keyword)
  }
  renderPaginator(searchUser.length)
  renderUserList(getUsersByPage(1))
})

axios.get(INDEX_URL).then((response) => {
  users.push(...response.data.results);
  renderPaginator(users.length)
  renderUserList(getUsersByPage(usersCurrentPage));
}).catch((err) => console.log(err))


function changeHeart(target) {
  if (target.classList.toggle('love-icon')) {
    target.classList.toggle('far')
    target.classList.toggle('fas')
  }
  addToTrack.addEventListener('click')
}
