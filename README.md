### Hexlet tests and linter status:
[![Actions Status](https://github.com/Antony11659/backend-project-4/workflows/hexlet-check/badge.svg)](https://github.com/Antony11659/backend-project-4/actions)  [![Maintainability](https://api.codeclimate.com/v1/badges/5436c6a52672f89b72a8/maintainability)](https://codeclimate.com/github/Antony11659/backend-project-4/maintainability)  [![Test Coverage](https://api.codeclimate.com/v1/badges/5436c6a52672f89b72a8/test_coverage)](https://codeclimate.com/github/Antony11659/backend-project-4/test_coverage)


# Description

*Page loader* is a command-line tool for downloading web pages and their resources,
such as images, styles, and JS files, for offline use on your computer.
After downloading the page, you can open it even without an internet connection.


## Installation

```bash
git clone git@github.com:Antony11659/page-loader.git
cd page-loader    
npm ci    
npm link    
```

## Usage:

To use Page Loader, follow the instructions below:

1. Open your terminal and navigate to the directory where you want to save the downloaded web page.

2. To download the web page run the following command:

```bash
page-loader <url>
```
This will download the web page and all of its assets to your current working directory.

3. To specify the output directory for the downloaded web page, use the `--output` flag followed by the desired output directory:

```bash
page-loader --output <output directory> <url>
```

4. To enable debugging, use the `--debug` flag:

```bash
page-loader --debug <url>
```
This will output additional information about the download process, including any errors that occur.

5. To get help information about Page Loader, run the following command:

```bash
page-loader -h
```

## See example:

[![see example](https://asciinema.org/a/1eEA6xBQDyHEj0IN5gaehoJj5.svg)](https://asciinema.org/a/1eEA6xBQDyHEj0IN5gaehoJj5)


