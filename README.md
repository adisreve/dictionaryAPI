# About

Web Scraping API for Babla Dictionary, which includes word translations for all of the languages supported on the site, as well as pronounciations and explanations of the words.

## Installation

Use the command npm install to install all of the required packages.

```bash
npm install
```

## Configuration

In the .env file enter the url of your mongodb database server and random secret token which you want to use.
## Usage

### /languages

Get list of all supported languages

### /language/word

In the endpoint, you pass the full name of the language and the word that you need translated.
