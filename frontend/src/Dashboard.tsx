import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import axios from "axios";
import { 
  Container, TextField, Button, Typography, Box, Paper, 
  Table, TableBody, TableCell, TableHead, TableRow, AppBar, Toolbar, 
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Grid 
} from "@mui/material";
import ComputerIcon from '@mui/icons-material/Computer';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; 
import { authStore } from "./authStore";

const RESOURCE_URL = "http://localhost:5018/api/assets";

const Dashboard = observer(() => {
  const [assets, setAssets] = useState<any[]>([]);
  const [newAsset, setNewAsset] = useState({ name: "", type: "", location: "" });
  const [openEdit, setOpenEdit] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(RESOURCE_URL, {headers: { Authorization: `Bearer ${authStore.token}` } 
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
      alert("Asset added successfully!");
    } catch (error: any) { 
        if (error.response && error.response.status === 409) {
            alert("Error: Asset already exists.");
        } else if (error.response && error.response.status === 403) {
            alert("Only Admins can add assets");
        } else {
            console.error(error);
            alert("Can't edit asset.");
        }
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Are you sure you want to delete this item?")) return;
    try {
        await axios.delete(`${RESOURCE_URL}/${id}`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
        });
        fetchAssets(); 
    } catch (error) { alert("Error deleting"); }
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
      } catch (error: any) {
          if (error.response && error.response.status === 409) {
             alert("Asset already exists.");
          } else {
             alert("Error updating asset.");
          }
      }
  };

  /*----------------------UI--------------------------------------- */

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", width: "100%" }}>
      <AppBar position="static" sx={{ background: "#1e3c72" }}>
        <Toolbar>
          <ComputerIcon sx={{ mr: 2}} />
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
                <TableCell><b>Type</b></TableCell>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Location</b></TableCell>
                {authStore.isAdmin && <TableCell align="center"><b>Actions</b></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.map((asset: any) => (
                <TableRow key={asset.id} hover>
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
            </TableBody>
          </Table>
        </Paper>

        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogContent dividers>
                <TextField margin="normal" label="Name" fullWidth value={editingAsset?.name || ""} onChange={(e) => setEditingAsset({...editingAsset, name: e.target.value})} />
                <TextField margin="normal" label="Type" fullWidth value={editingAsset?.type || ""} onChange={(e) => setEditingAsset({...editingAsset, type: e.target.value})} />
                <TextField margin="normal" label="Location" fullWidth value={editingAsset?.location || ""} onChange={(e) => setEditingAsset({...editingAsset, location: e.target.value})} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
});

export default Dashboard;