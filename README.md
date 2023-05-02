
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

Start development server:

```sh
yarn dev
```

✨ You can now login to the app at [http://localhost:3000](http://localhost:3000)

## License

[MIT](LICENSE)
