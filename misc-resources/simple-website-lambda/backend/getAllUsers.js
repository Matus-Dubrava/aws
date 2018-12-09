exports.handler = async event => {
	const users = [
		{
			name: 'Matus',
			age: 30
		},
		{
			name: 'Sue',
			age: 42
		},
		{
			name: 'Jim',
			age: 19
		}
	];

	const response = {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify(users)
	};
	return response;
};
