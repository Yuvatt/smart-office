import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { authStore } from "./authStore";
import axios from "axios";
import { 
  Container, TextField, Button, Typography, Box, Paper, 
  Table, TableBody, TableCell, TableHead, TableRow, AppBar, Toolbar, 
  IconButton, Tooltip, Dialog, DialogTitle, 
  DialogContent, DialogActions, Grid, Avatar, Link
} from "@mui/material";

// --- Icons ---
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ComputerIcon from '@mui/icons-material/Computer';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import ChairIcon from '@mui/icons-material/Chair';
import KitchenIcon from '@mui/icons-material/Kitchen';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; 
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // New Icon for Register

// --- Configuration ---
const IDENTITY_URL = "http://localhost:5284/api/Auth"; 
const RESOURCE_URL = "http://localhost:5018/api/assets";

// --- Login / Register Component ---
const Login = observer(() => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Optional: Add if your backend requires email
  
  // Toggle between Login and Register mode
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleAuth = async () => {
    try {
        if (isRegisterMode) {
            // --- REGISTER LOGIC ---
            // Note: Ensure your IdentityService has an endpoint: [HttpPost("register")]
            await axios.post(`${IDENTITY_URL}/register`, { 
                username, 
                password,
                email: email || "user@example.com" // Default email if not used
            });
            alert("Registration successful! Now please sign in.");
            setIsRegisterMode(false); // Switch back to login mode
        } else {
            // --- LOGIN LOGIC ---
            const response = await axios.post(`${IDENTITY_URL}/login`, { username, password });
            authStore.login(response.data); 
        }
    } catch (error: any) {
      console.error(error);
      alert(`Action failed: ${error.response?.data || "Server error"}`);
    }
  };

  return (
    <Box sx={{ height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" }}>
      <Paper elevation={10} sx={{ p: 4, width: 350, textAlign: "center", borderRadius: 4 }}>
        
        {/* Icon Changes based on mode */}
        <Avatar sx={{ m: "0 auto", bgcolor: isRegisterMode ? "#ed6c02" : "#1976d2", mb: 2 }}>
            {isRegisterMode ? <PersonAddIcon /> : <LockOutlinedIcon />}
        </Avatar>
        
        <Typography variant="h5" fontWeight="bold" color="#333" mb={3}>
            {isRegisterMode ? "Create Account" : "Smart Office"}
        </Typography>

        <TextField fullWidth label="Username" margin="normal" value={username} onChange={e => setUsername(e.target.value)} />
        <TextField fullWidth type="password" label="Password" margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        
        {/* If you want an Email field for registration, uncomment this: */}
        {/* {isRegisterMode && (
             <TextField fullWidth label="Email" margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
        )} */}

        <Button fullWidth variant="contained" size="large" sx={{ mt: 3, bgcolor: isRegisterMode ? "#ed6c02" : "#1976d2" }} onClick={handleAuth}>
            {isRegisterMode ? "Register" : "Sign In"}
        </Button>

        {/* Toggle Button */}
        <Box mt={2}>
            <Link 
                component="button" 
                variant="body2" 
                onClick={() => setIsRegisterMode(!isRegisterMode)}
            >
                {isRegisterMode 
                    ? "Already have an account? Sign In" 
                    : "Don't have an account? Register"}
            </Link>
        </Box>

      </Paper>
    </Box>
  );
});

// --- Dashboard Component ---
const Dashboard = observer(() => {
  const [assets, setAssets] = useState<any[]>([]);
  const [newAsset, setNewAsset] = useState({ name: "", type: "", location: "" });
  const [openEdit, setOpenEdit] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(RESOURCE_URL, {
        headers: { Authorization: `Bearer ${authStore.token}` } 
      });
      setAssets(response.data);
    } catch (error) { console.error("Error fetching assets:", error); }
  };

  const handleAddAsset = async () => {
    try {
      await axios.post(RESOURCE_URL, newAsset, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      fetchAssets(); 
      setNewAsset({ name: "", type: "", location: "" }); 
    } catch (error) { alert("Error adding asset. Check permissions."); }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Are you sure you want to delete this item?")) return;
    try {
        await axios.delete(`${RESOURCE_URL}/${id}`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
        });
        fetchAssets(); 
    } catch (error) { alert("Error deleting. Are you an admin?"); }
  };

  const handleOpenEdit = (asset: any) => {
      setEditingAsset({ ...asset });
      setOpenEdit(true);
  };

  const handleSaveEdit = async () => {
      if (!editingAsset) return;
      try {
          await axios.put(`${RESOURCE_URL}/${editingAsset.id}`, editingAsset, {
              headers: { Authorization: `Bearer ${authStore.token}` }
          });
          setOpenEdit(false);
          fetchAssets(); 
      } catch (error) {
          alert("Error updating. Check backend implementation.");
      }
  };

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("laptop") || t.includes("pc")) return <ComputerIcon color="primary"/>;
    if (t.includes("chair") || t.includes("desk")) return <ChairIcon color="secondary"/>;
    return <KitchenIcon color="action"/>;
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", width: "100%" }}>
      <AppBar position="static" sx={{ background: "#1e3c72" }}>
        <Toolbar>
          <ComputerIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Smart Office Manager</Typography>
          <Typography sx={{ mr: 2 }}>Hello, {authStore.user?.unique_name}</Typography>
          <IconButton color="inherit" onClick={authStore.logout}><LogoutIcon /></IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ mt: 4, pb: 4, width: "95%" }}>
        
        {authStore.isAdmin && (
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2, borderLeft: '6px solid #1976d2' }}>
            <Box display="flex" alignItems="center" mb={2}>
                <AddCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">Add New Asset</Typography>
            </Box>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                    <TextField fullWidth label="Name" size="small" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField fullWidth label="Type" size="small" value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} />
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField fullWidth label="Location" size="small" value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})} />
                </Grid>
                <Grid item xs={12} md={3}>
                    <Button fullWidth variant="contained" onClick={handleAddAsset}>Add to Inventory</Button>
                </Grid>
            </Grid>
          </Paper>
        )}

        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: "#eceff1" }}>
              <TableRow>
                <TableCell><b>Icon</b></TableCell>
                <TableCell><b>Type</b></TableCell>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Location</b></TableCell>
                {authStore.isAdmin && <TableCell align="center"><b>Actions</b></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.map((asset: any) => (
                <TableRow key={asset.id} hover>
                  <TableCell>{getIcon(asset.type)}</TableCell>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>{asset.name}</TableCell>
                  <TableCell>{asset.location}</TableCell>
                  {authStore.isAdmin && (
                      <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton color="primary" onClick={() => handleOpenEdit(asset)} sx={{ mr: 1 }}>
                                <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton color="error" onClick={() => handleDelete(asset.id)}>
                                <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                      </TableCell>
                  )}
                </TableRow>
              ))}
              {assets.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>No assets found. Try adding some!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
            <DialogTitle>Edit Asset Details</DialogTitle>
            <DialogContent dividers>
                <TextField 
                    margin="normal" label="Asset Name" fullWidth 
                    value={editingAsset?.name || ""} 
                    onChange={(e) => setEditingAsset({...editingAsset, name: e.target.value})}
                />
                <TextField 
                    margin="normal" label="Type" fullWidth 
                    value={editingAsset?.type || ""} 
                    onChange={(e) => setEditingAsset({...editingAsset, type: e.target.value})}
                />
                <TextField 
                    margin="normal" label="Location" fullWidth 
                    value={editingAsset?.location || ""} 
                    onChange={(e) => setEditingAsset({...editingAsset, location: e.target.value})}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit} variant="contained" color="primary">Save Changes</Button>
            </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
});

const App = observer(() => {
  return authStore.isAuthenticated ? <Dashboard /> : <Login />;
});

export default App;