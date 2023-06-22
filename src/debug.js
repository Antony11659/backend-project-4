// import debug from 'debug';
import conf from 'axios-debug-log';
// import debug from 'debug';
import { exit } from 'node:process';
import axios from 'axios';

// С точки зрения axios, этот файл содержит клиентский код
// То есть код, который использует axios.

const runProgram = async () => {
  // const logger = debug('logger');
  // await logger('start debugging...');
  const url = 'https://googdfdle.com';
  // Вызов библиотеки идет в клиентском коде
  const response = await axios.get(url);
  console.log(response.data);
};
// conf(runProgram());

// Log content type
conf({
  request(debug, config) {
    debug(`Request with ${config.headers['content-type']}`);
  },
  response(debug, response) {
    debug(
      `Response with ${response.headers['content-type']}`,
      `from ${response.config.url}`,
    );
  },
  error(debug, error) {
    // Read https://www.npmjs.com/package/axios#handling-errors for more info
    debug('Boom', error);
  },
});

// axios.get('https://page-loader.hexlet.repl.co/').then((response) => console.log(response.data));

console.log(exit(0));
