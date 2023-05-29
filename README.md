# Food System Digital Twin Website

## Installation and Usage

The steps below will walk you through setting up your own instance of the project.

### Install Project Dependencies

To set up the development environment for this website, you'll need to install the following on your system:

- [Node](http://nodejs.org/) (see [.nvmrc](./.nvmrc)) (To manage multiple node versions we recommend [nvm](https://github.com/creationix/nvm))
- [Yarn](https://yarnpkg.com/) package manager
- [Docker](https://www.docker.com)

### Install Application Dependencies

If you use [`nvm`](https://github.com/creationix/nvm), activate the desired Node version:

```sh
nvm install
```

Install Node modules:

```sh
yarn install
```

Start development database with Docker:

```sh
docker-compose up
```

Migrate the database:

```sh
yarn migrate
```

Download [seed data](https://drive.google.com/file/d/10DsMpXzoqaF9sWhSentwO5ReZSCrPPA9/view?usp=sharing) and expand it in the root folder the cloned repository. The contents of the zip file should be located at `./app-data`.

Ingest downloaded data with:

```sh
yarn seed
```

Start development server:

```sh
yarn dev
```

✨ You can now login to the app at [http://localhost:3000](http://localhost:3000)

### API Docs

This app uses [Swagger](https://swagger.io/) to generate API docs. To access it, run the server and visit:

- [http://localhost:3000/docs/api](http://localhost:3000/docs/api)

The API docs page should be updated automatically after adding Swagger configuration as JSDoc in route files, as described in [next-swagger-doc documentation](https://www.npmjs.com/package/next-swagger-doc).

To validate the documentation, please run `yarn swagger:validate`, which will check for errors and add the application version found in package.json.

## License

[MIT](LICENSE)
