import { useState } from "react";
import { observer } from "mobx-react-lite";
import axios from "axios";
import { 
  Box, Paper, Avatar, Typography, TextField, Button, MenuItem, Link 
} from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { authStore } from "./authStore";

const IDENTITY_URL = "http://localhost:5284/api/Auth"; 

const Login = observer(() => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member"); 
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleAuth = async () => {
    try {
        if (isRegisterMode) {
            await axios.post(`${IDENTITY_URL}/register`, { username, password, role });
            alert("Registration successful! Now please sign in.");
            setIsRegisterMode(false); 
        } else {
            const response = await axios.post(`${IDENTITY_URL}/login`, { username, password });
            authStore.login(response.data.token || response.data.Token); 
        }
    } catch (error: any) {
      console.error(error);
      alert(`Action failed: ${error.response?.data || "Unknown error:"}`);
    }
  };

  return (
    <Box sx={{ height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" }}>
      <Paper elevation={10} sx={{ p: 4, width: 350, textAlign: "center", borderRadius: 4 }}>
        <Avatar sx={{ m: "0 auto", bgcolor: isRegisterMode ? "#ed6c02" : "#1976d2", mb: 2 }}>
            {isRegisterMode ? <PersonAddIcon /> : <LockOutlinedIcon />}
        </Avatar>
        <Typography variant="h5" fontWeight="bold" color="#333" mb={3}>
            {isRegisterMode ? "Create Account" : "Smart Office"}
        </Typography>
        <TextField fullWidth label="Username" margin="normal" value={username} onChange={e => setUsername(e.target.value)} />
        <TextField fullWidth type="password" label="Password" margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        
        {isRegisterMode && (
             <TextField select fullWidth label="Select Role" margin="normal" value={role} onChange={e => setRole(e.target.value)}>
                <MenuItem value="Member">Member</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
             </TextField>
        )}

        <Button fullWidth variant="contained" size="large" sx={{ mt: 3, bgcolor: isRegisterMode ? "#ed6c02" : "#1976d2" }} onClick={handleAuth}>
            {isRegisterMode ? "Register" : "Sign In"}
        </Button>

        <Box mt={2}>
            <Link component="button" variant="body2" onClick={() => setIsRegisterMode(!isRegisterMode)}>
                {isRegisterMode ? "Already have an account? Sign In" : "Don't have an account? Register"}
            </Link>
        </Box>
      </Paper>
    </Box>
  );
});

export default Login;