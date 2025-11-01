This is an app to manage the community production of "David Copperfield" by the Theatre Royal, Bath.

## Requirements

- Gel database (`http://www.geldata.com`)
- Node.js

## Installing the Gel database

First you need to install the Gel database. On a Windows server, you need to use Windows Powershell. Note that Gel on Windows requires WSL 2 because the Gel server runs on Linux.

Here are the steps:

- Open Windows Powershell.
- Run the following command: `iwr https://www.geldata.com/ps1 -useb | iex`
- Follow the prompts on screen to complete the installation. 

The script will download the gel command built for your OS and add a path to it to your shell environment.

After installation, test it by running: `gel --version`

If you encounter a command not found error, try opening a new shell window.

## The data

There's an encrypted zip file `/data/data.zip` with a dump of the database (`data.dump`). Unzip this (the Theatre Royal has the password) and use the the Gel CLI to import the dump into your target instance:

`gel restore --all data.dump/ --dsn <target dsn>`

Replace <target dsn> with the Gel database's DSN.

This process will import both the schema and the data into the new database.

(If you want to try the app without the Theatre Royal's data, there a schema file - `default.gel`- in `/data` to bootstrap the databse. You'll need to manually create a system admin user via the Gel UI to get going.)

## Installing the App

After installing Node.js, download the source from GitHub into a directory. There's a 

Then `run npm run` build to build the app and `npm run start` to start the Node.js server. If you've already installed Gel and Node.js and Gel are running to the same environment, the Gel client in the app will automatically pick up the database location from the environment variables set up by the gel instsallation. If Node.js is in a different environment to Gel, set an environment variable `GEL_DSN` with the value `gel://<host>:<port>`.

## Using the App

You'll need to provide the URL of the Node.js server to users. There's a system admin user "Charles Dickens" (they know the passsword)that the Theatre Royal can use to start configuring other users.
