import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter.js';
import { loginUser } from '../logic.js';

export default function createAuthRouter() {
  const router = Router();

  router.get('/login', (req, res) => {
    if (req.session?.credentials) return res.redirect('/');
    res.render('login', { error: null });
  });

  router.post('/login', authLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('login', { error: 'Usuario y contraseña son obligatorios' });
    }

    try {
      await loginUser(username, password);
      req.session.credentials = { username, password };
      return res.redirect('/');
    } catch {
      return res.render('login', { error: 'Credenciales incorrectas. Por favor, inténtalo de nuevo.' });
    }
  });

  router.post('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  });

  return router;
}
