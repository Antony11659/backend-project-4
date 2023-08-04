install:
	npm ci

page-loader:
	node bin/page-loader.js

test:
	DEBUG=page-loader,nock npm test

lint:
	npx eslint .

test-coverage:
	npm test -- --coverage --coverageProvider=v8