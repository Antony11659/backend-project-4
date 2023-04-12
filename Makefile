install:
	npm ci

page-loader:
	node bin/page-loader.js

test:
	npm test

lint:
	npx eslint .

test-coverage:
	npm test -- --coverage --coverageProvider=v8