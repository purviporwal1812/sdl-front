The application ensures students can mark their attendance only once per hour within specific room coordinates set by the admin, preventing proxy attendance and ensuring accurate records.

### Dependencies

**nodemon** : `npm i -D nodemon`
automatically restarts the node application when file changes are detected .

**express** : `npm i express`
minimalist web framework for Node.js.

**pg** : `npm i pg`
postgresql for node.js

for dynamic content , render method can take object as second parameter

**dotenv** : `npm i dotenv`
Dotenv is a zero-dependency module that loads environment variables from a .env file into `process.env`

_default port for postgreSql is 5432_

**passport** : `npm i passport`
used for authentication and maintaining sessions , using app.use(passport.initialize()) and app.use(passport.session())

**rate-limit** : `npm i express-rate-limit`

### Useful Resources

- [Connection Pooling in Postgres](https://www.ashnik.com/everything-you-need-to-know-about-connection-pooling-in-postgres/#:~:text=5%20MIN%20READ,new%20connection%20to%20the%20database.) - This article tells on how PostgreSQL creates a connection pool to cache and reuse database connections, reducing the overhead of establishing new connections.Pool maintains a set of open connections that can be reused.
- [Middleware Functions](https://expressjs.com/en/guide/using-middleware.html.).- `app.use()` to add a middleware function to our Express.Express executes middleware in the order they are added.Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle.
- [Express Sessions](https://www.npmjs.com/package/express-session.).- Express sessions manage user state by storing session data on the server and using a session ID cookie to track user interactions across requests. Sessions are Stateful and uses "Secret" for encryption.

[Flow](public\Flow Diagram.drawio.png)

[models for face unlock](https://github.com/justadudewhohacks/face-api.js-models/tree/master)
<br>
[backend code](https://github.com/purviporwal1812/sdl-back)
