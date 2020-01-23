module.exports = {
    "root": true,
    "extends": [
        "eslint:recommended"
    ],
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "env": {
        "es6": true,
        "node": true
    },
    "globals": {},
    "rules": {
        "comma-style": [
            2,
            "last"
        ],
        "no-unused-vars": "warn",
    },
};