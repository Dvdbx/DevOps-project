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
});
//requestCounter.labels('GET', '/users', 'istio').inc();

// Create a Gauge metric to track the current number of requests
const requestGauge = new promClient.Gauge({
  name: 'requests_in_progress',
  help: 'Number of requests in progress'
});

// Create a Summary metric to track the response times of requests
const responseTime = new promClient.Summary({
  name: 'response_time',
  help: 'Response time of requests',
});

// Create a Histogram metric to track the sizes of requests
const requestSize = new promClient.Histogram({
  name: 'request_size',
  help: 'Size of requests',
});

register.registerMetric(requestCounter);
register.registerMetric(requestGauge);
register.registerMetric(responseTime);
register.registerMetric(requestSize);

register.setDefaultLabels({
  app: 'my-app'
});

promClient.collectDefaultMetrics({register});


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
