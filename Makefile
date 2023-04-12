install:
	npm ci

page-loader:
	node bin/page-loader.js

test:
	npm test

lint:
	npx eslint .