// Runtime configuration. On self-hosted Docker deployments this file is
// overwritten at container start from TASKVIEW_* environment variables.
//
// Local dev: run deploy/visitor-demo/seed-local.ps1 once so the visitor account exists.
window.__TASKVIEW_CONFIG__ = {
  apiUrl: 'http://localhost:8080',
  demo: {
    login: 'visitor',
    password: 'visitor!!',
    hideRegistration: true,
  },
}
