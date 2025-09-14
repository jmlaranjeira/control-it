import promClient from 'prom-client';

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'control-it-panel'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const cacheHitsTotal = new promClient.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits'
});

const cacheMissesTotal = new promClient.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses'
});

const apiCallsTotal = new promClient.Counter({
  name: 'api_calls_total',
  help: 'Total number of external API calls',
  labelNames: ['endpoint', 'status']
});

const errorsTotal = new promClient.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'route']
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(cacheHitsTotal);
register.registerMetric(cacheMissesTotal);
register.registerMetric(apiCallsTotal);
register.registerMetric(errorsTotal);

// Middleware to collect HTTP metrics
export function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const route = req.route ? req.route.path : req.path;

    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);

    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });

  next();
}

// Metrics collection functions
export function recordCacheHit() {
  cacheHitsTotal.inc();
}

export function recordCacheMiss() {
  cacheMissesTotal.inc();
}

export function recordApiCall(endpoint, status = 'success') {
  apiCallsTotal.labels(endpoint, status).inc();
}

export function recordError(type, route = 'unknown') {
  errorsTotal.labels(type, route).inc();
}

// Get metrics in Prometheus format
export function getMetrics() {
  return register.metrics();
}

// Get registry for advanced operations
export { register };