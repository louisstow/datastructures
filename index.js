var path = require("path");

exports.load = function() {
	return {
		paths: [
			path.resolve(__dirname, "lib")
		]
	};
};
