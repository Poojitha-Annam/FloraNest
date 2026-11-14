// test-admin-routes.js
const express = require('express');
const app = express();
app.use(express.json());

const adminRoutes = require('./adminRoutes');
app.use('/api/admin', adminRoutes);

app.listen(5001, () => {
  console.log('Test server on 5001');
  // List all routes
  app._router.stack.forEach(r => {
    if (r.route) console.log(r.route.path);
    else if (r.name === 'router' && r.handle.stack) {
      r.handle.stack.forEach(rr => {
        if (rr.route) console.log('/api/admin' + rr.route.path);
      });
    }
  });
  setTimeout(() => process.exit(0), 500);
});
