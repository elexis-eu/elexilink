# Elexilink

Before continuing, you should make sure to use `npm install` to install the dependencies.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` or `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Config

Create a `config.json` file in the root directory of the project. The file should contain the following properties:
```
{
  "production": {
    "useCache": false,
    "cacheRefreshRate": 60,
    "clientUrl": "https://lexonomy.elex.is",
    "serverUrl": "",
    "email": "YOUR_EMAIL_ADDRESS",
    "apiKey": "YOUR_API_KEY"
  },
  "testing": {
    "useCache": true,
    "cacheRefreshRate": 43200,
    "clientUrl": "",
    "serverUrl": "https://lexonomy.elex.is",
    "email": "YOUR_EMAIL_ADDRESS",
    "apiKey": "YOUR_API_KEY"
  },
  "development": {
    "useCache": true,
    "cacheRefreshRate": 43200,
    "clientUrl": "",
    "serverUrl": "https://lexonomy.elex.is",
    "email": "YOUR_EMAIL_ADDRESS",
    "apiKey": "YOUR_API_KEY"
  }
}
```
Substitute "YOUR_EMAIL_ADDRESS" and "YOUR_API_KEY" with your own values.

## Explanation of configuration options

Application is built with three possible environment options.
 - `production`: The application is built for production. All production-related configuration is set.
 - `testing`: The application is built for testing. This means that it's deployed with the supplied Node.js server.
 - `development`: The application is built for development. This means it uses Angular's dev server.

For each of the three options, the following properties are set:
  * `useCache`: Whether to use the cache. If set to `false`, the cache is disabled. Used only with the supplied Node.js server.
  * `cacheRefreshRate`: The cache refresh rate in seconds. If set to `0`, the cache is disabled. Used only with the supplied Node.js server.
  * `clientUrl`: The URL of Lexonomy API used directly on the client side. If set to `""`, then application assumes that Lexonomy API is running on the same server as the application.
  * `serverUrl`: The URL of Lexonomy API used when the application is deployed with the supplied Node.js server.
  * `email`: The email address used to authenticate with Lexonomy API.
  * `apiKey`: The API key used to authenticate with Lexonomy API.
