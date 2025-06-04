// pages/index.tsx
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
} from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import CloseIcon from '@mui/icons-material/Close'

export default function Home() {
  const [open, setOpen] = useState(false)

  return (
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {/* Nav (absolute over hero) */}
      <AppBar
        position="absolute"
        color="transparent"
        elevation={0}
        sx={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
          <Typography variant="h6" color="white">
            Viện Phương Nam
          </Typography>
          <Button color="info" onClick={() => setOpen(true)}>
            Đăng nhập
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero: full-window */}
      <Box
        sx={{
          height: '100%',
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1900&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* Dark overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.4)',
          }}
        />
        {/* Centered content */}
        <Stack
          spacing={2}
          sx={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'white',
            px: 2,
          }}
        >
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' } }}>
            Viện Phương Nam
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 600 }}>
            Đăng nhập để truy cập các khoá học.
          </Typography>
        </Stack>
      </Box>

      {/* Login Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Đăng nhậpIn
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => signIn('google', { callbackUrl: '/access' })}
            sx={{ textTransform: 'none', py: 1.5 }}
          >
            Đăng nhập với Google
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
