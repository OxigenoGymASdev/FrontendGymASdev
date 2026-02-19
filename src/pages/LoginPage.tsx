import { useState } from "react";
import {
  Box, Paper, TextField, Typography, Button,
  Container, Alert, InputAdornment, Stack,
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
// 1. Importamos tu función de servicio
import { loginUser } from "../api/auth.api";

export default function LoginPage({ onLogin }: any) {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Estado para feedback visual

  const handleLogin = async () => {
    if (!dni || !password) {
      setError("Por favor, completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 2. Usamos la función que ya tiene Axios configurado
      const userData = await loginUser(Number(dni), password);
      onLogin(userData);
    } catch (err: any) {
      // Axios pone el mensaje del servidor en err.response.data
      const message = err.response?.data?.message || "Error de conexión con el servidor";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ /* ... tus estilos de fondo ... */ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #023e8a 0%, #0077b6 100%)", px: 2, py: 4 }}>
      <Container sx={{ maxWidth: "1000px !important" }}>
        <Paper elevation={24} sx={{ /* ... tus estilos de Paper ... */ position: "relative", p: { xs: 4, sm: 10, md: 12 }, borderRadius: 10, overflow: "hidden", bgcolor: "white", minHeight: "750px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          
          {/* ... Imágenes de fondo y overlays ... */}
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url("/gym.jpg")', backgroundSize: "cover", backgroundPosition: "center", opacity: 0.9, zIndex: 0 }} />
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255, 255, 255, 0.75)", zIndex: 1 }} />

          <Box sx={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "600px", mx: "auto", textAlign: "center" }}>
            <Box mb={8}>
              <Typography variant="h1" sx={{ fontWeight: 950, color: "#023e8a", letterSpacing: -3, mb: 1, fontSize: { xs: "4rem", sm: "5.5rem", md: "6.5rem" }, lineHeight: 1 }}>
                Oxígeno
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#4b5563", textTransform: "uppercase", letterSpacing: { xs: 5, sm: 10 }, fontSize: { xs: "0.9rem", sm: "1.3rem" } }}>
                Espacio Deportivo
              </Typography>
            </Box>

            <Stack spacing={4}>
              <TextField
                label="Número de DNI"
                variant="filled"
                fullWidth
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#023e8a", fontSize: "1.8rem" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiFilledInput-root": { borderRadius: 4, bgcolor: "white", boxShadow: "0 6px 15px rgba(0,0,0,0.06)", fontSize: "1.1rem" } }}
              />

              <TextField
                label="Contraseña"
                type="password"
                variant="filled"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#023e8a", fontSize: "1.8rem" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiFilledInput-root": { borderRadius: 4, bgcolor: "white", boxShadow: "0 6px 15px rgba(0,0,0,0.06)", fontSize: "1.1rem" } }}
              />

              {error && (
                <Alert severity="error" variant="filled" sx={{ borderRadius: 3, fontWeight: 700, fontSize: "1rem" }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                onClick={handleLogin}
                disabled={loading} // Desactivar mientras carga
                sx={{
                  mt: 4, py: 3, fontWeight: 900, fontSize: "1.5rem", borderRadius: 5, textTransform: "uppercase",
                  background: "linear-gradient(90deg, #023e8a, #0077b6)",
                  boxShadow: "0 15px 35px rgba(2, 62, 138, 0.45)",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 20px 45px rgba(2, 62, 138, 0.55)" },
                }}
              >
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}