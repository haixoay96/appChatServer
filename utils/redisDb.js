var redis = require("redis");
var redisClient = redis.createClient();
redisClient.on('connect', () => {
	console.log('Redis connect succesfull!');
	redisClient.del('listUser', (error, rely) => {
		console.log('del listUser!');
	});
});
redisClient.on('error', (error) => {
	console.log('Redis error!');
	console.error(error);
	process.exit(0);
});
module.exports.redisClient = redisClient;