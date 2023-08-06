import path from 'path';
const callInterceptor = (address) => {
  const testDomain = 'https://ru.hexlet.io';

  const server = [
    { domain: '/courses', data: '<h1>Hello, world!</h1>' },
    { domain: '/assets/application.css', data: 'margin: 0; padding: 0' },
    { domain: '/assets/professions/nodejs.png', data: 'any image file' },
    { domain: '/packs/js/runtime.js', data: 'console.log(\'Hello, hexlet\'):' },
  ];

  const { pathname } = new URL(address);
  const { data } = server.filter((el) => el.domain === pathname)[0];
  return data;
  nock(testDomain)
    .persist()
    .get(dir)
    .reply(200, data);
};

console.log(callInterceptor('https://ru.hexlet.io/courses'));
