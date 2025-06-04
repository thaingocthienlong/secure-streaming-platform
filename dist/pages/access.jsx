// pages/access.tsx
import React, { useState, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { AppBar, Toolbar, Typography, Button, Box, TextField, Stack, IconButton, } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import GoogleIcon from '@mui/icons-material/Google';
import ReCAPTCHA from 'react-google-recaptcha';
export default function AccessPage() {
    var _a;
    const recaptchaRef = useRef(null);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [code, setCode] = useState('');
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleAccess = async (e) => {
        var _a, _b;
        e.preventDefault();
        if (!recaptchaToken) {
            setError('Please complete the reCAPTCHA');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        const res = await fetch('/api/verify-access', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code: code.toUpperCase(), recaptchaToken }),
        });
        const payload = await res.json();
        if (!res.ok) {
            // payload.error (or .message) comes from your API’s JSON
            setError(payload.error || payload.message || "Access denied");
            (_a = recaptchaRef.current) === null || _a === void 0 ? void 0 : _a.reset(); // Reset reCAPTCHA on error
            setRecaptchaToken(null); // Clear token
            setIsSubmitting(false);
            return;
        }
        // 4) On success…
        (_b = recaptchaRef.current) === null || _b === void 0 ? void 0 : _b.reset();
        setRecaptchaToken(null);
        router.push(`/course/${code}`);
    };
    // If not signed in, show login modal just like landing
    if (status === 'loading')
        return null;
    if (!session) {
        return (<Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <AppBar position="absolute" color="transparent" elevation={0} sx={{ bgcolor: 'rgba(0,0,0,0.7)' }}>
          <Toolbar sx={{ justifyContent: 'flex-end' }}>
            <Button color="inherit" onClick={() => signIn('google', { callbackUrl: '/access' })}>
              <GoogleIcon sx={{ mr: 1 }}/> Login
            </Button>
          </Toolbar>
        </AppBar>
        {/* Hero background only */}
        <Box sx={{
                height: '100%',
                backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1900&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}/>
      </Box>);
    }
    return (<Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {/* AppBar with email + logout */}
      <AppBar position="absolute" color="transparent" elevation={0} sx={{ bgcolor: 'rgba(0,0,0,0.7)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography color="white">{(_a = session.user) === null || _a === void 0 ? void 0 : _a.email}</Typography>
          <IconButton color="error" onClick={() => signOut()}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Hero background */}
      <Box sx={{
            height: '100%',
            backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1900&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}/>

      {/* Semi-transparent form overlay */}
      <Box component="form" onSubmit={handleAccess} sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'rgba(255,255,255,0.85)',
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
        }}>
        <Stack spacing={2}>
          <Typography variant="h6" textAlign="center">
            Enter Course Code
          </Typography>
          <TextField label="Course Code" variant="outlined" fullWidth disabled={isSubmitting} required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}/>
          <ReCAPTCHA ref={recaptchaRef} sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY} onChange={(token) => {
            setRecaptchaToken(token);
            setError(null);
        }} onExpired={() => {
            setRecaptchaToken(null);
        }}/>
          <Button disabled={isSubmitting || !recaptchaToken} type="submit" className="w-full py-2 rounded disabled:opacity-50" style={{ backgroundColor: '#3B82F6', color: 'white' }} variant="contained" fullWidth>
            {isSubmitting ? 'Accessing…' : 'ACCESS COURSE'}
          </Button>
          {error && (<Typography color="error" textAlign="center">
              {error}
            </Typography>)}
        </Stack>

      </Box>
    </Box>);
}
