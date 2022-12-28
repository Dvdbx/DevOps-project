const express = require('express')
const userRouter = require('./routes/user')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const promClient = require('prom-client');

let register = new promClient.Registry();

const db = require('./dbClient')
db.on("error", (err) => {
//  console.error(err)
})

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Hello World!'))

app.use('/user', userRouter)

// Create a Counter metric to track the number of requests
const requestCounter = new promClient.Counter({
  name: 'requests_total',
  help: 'Total number of requests',
  labelNames: ['method', 'path']
});

// Create a Gauge metric to track the current number of requests
const requestGauge = new promClient.Gauge({
  name: 'requests_in_progress',
  help: 'Number of requests in progress'
});

// Create a Summary metric to track the response times of requests
const responseTime = new promClient.Summary({
  name: 'response_time',
  help: 'Response time of requests',
  labelNames: ['code'],
});

// Create a Histogram metric to track the sizes of requests
const requestSize = new promClient.Histogram({
  name: 'request_size',
  help: 'Size of requests',
  labelNames: ['code'],
});

register.registerMetric(requestCounter);
register.registerMetric(requestGauge);
register.registerMetric(responseTime);
register.registerMetric(requestSize);

register.setDefaultLabels({
  app: 'my-app'
});

promClient.collectDefaultMetrics({register});

app.use((req, res, next) => {
  requestCounter.inc({ method: req.method, path: req.path });
  requestGauge.inc();
  requestSize.labels('200').observe(0.1);
  next();
});

app.use((req, res, next) => {
  res.on('finish', () => {
    requestGauge.dec();
  });
  next();
});


// Expose the metrics endpoint
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});


const server = app.listen(port, (err) => {
  if (err) throw err
  console.log("Server listening the port " + port)
})

process.on('SIGINT', () => {
  server.close()
})


module.exports = server
