/**
 * Auth is handled by Supabase Auth on the frontend.
 * Frontend uses supabase.auth.signInWithPassword(), signUp(), etc.
 * Backend validates the JWT via middleware on protected routes.
 */
const router = require('express').Router();

router.get('/config', (req, res) => {
  res.json({
    message: 'Use Supabase Auth on frontend. Set SUPABASE_URL and SUPABASE_ANON_KEY in frontend .env',
  });
});

module.exports = router;
