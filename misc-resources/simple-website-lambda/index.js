(() => {
	const btn = document.querySelector('#show-users-btn');
	const output = document.querySelector('#show-users-list');
	const url = 'https://npm41pe7qk.execute-api.us-east-1.amazonaws.com/alpha/';
	let showUsers = false;

	async function getUsers(url) {
		const res = await fetch(url);
		const users = await res.json();

		createUserList(users);
	}

	function createUserList(users) {
		showUsers = !showUsers;

		if (showUsers) {
			users.forEach(user => {
				output.innerHTML += `<li class="user-box__item"><p>name: ${
					user.name
				}</p><p>age: ${user.age}</p></li>`;
			});
		} else {
			output.innerHTML = '';
		}
	}

	btn.addEventListener('click', event => {
		getUsers(url);
	});
})();
