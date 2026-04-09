export function requireAuth(req, res, next) {
  if (req.session && req.session.credentials) {
    return next();
  }
  if (req.xhr || req.headers.accept?.includes('application/json') || req.headers['content-type']?.includes('application/json')) {
    return res.status(401).json({ success: false, error: 'No autenticado' });
  }
  return res.redirect('/login');
}
