const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 24

const users = JSON.parse(localStorage.getItem('trackUsers')) || []
const currentPage = JSON.parse(localStorage.getItem('currentPages')) || 1
let filteredUsers = []

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
            <h4 class="card-title">${item.surname}</h4>
          </div>
          <div class="card-footer">
            <button class="btn btn-danger btn-remove-track x-icon" data-id="${item.id}">X</button>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(users) {
  const numberOfPages = Math.ceil(users.length / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
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

function removeFromTrack(id) {
  if (!users) return
  const list = users.findIndex(user => user.id === id)
  if (list === -1) return
  users.splice(list, 1)
  localStorage.setItem('trackUsers', JSON.stringify(users))
  renderUserList(users)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.card-img')) {
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches('.btn-remove-track')) {
    removeFromTrack(Number(event.target.dataset.id))
  }
});

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
  localStorage.setItem('currentPages', JSON.stringify(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  if (!keyword.length) {
    return alert('請輸入姓名相關字詞')
  }
  filteredUsers = users.filter((user) => user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))
  if (filteredUsers.length === 0) {
    return alert('找不到您所輸入的關鍵詞 ' + keyword)
  }
  renderPaginator(filteredUsers)
  renderUserList(getUsersByPage(1))
})


renderUserList(getUsersByPage(currentPage))
renderPaginator(users)