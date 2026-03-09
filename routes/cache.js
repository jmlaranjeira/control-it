import { Router } from 'express';
import { getStats, del as cacheDel, flushAll as cacheFlushAll, getKeys as cacheGetKeys } from '../utils/cache.js';

const router = Router();

router.get('/cache/keys', (req, res) => {
  res.json({ keys: cacheGetKeys() });
});

router.get('/cache/stats', (req, res) => {
  res.json({ stats: getStats() });
});

router.post('/cache/flush', (req, res) => {
  cacheFlushAll();
  res.json({ ok: true });
});

router.delete('/cache', (req, res) => {
  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'key is required' });
  res.json({ ok: cacheDel(String(key)) });
});

export default router;
