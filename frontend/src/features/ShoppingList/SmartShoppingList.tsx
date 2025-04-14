import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Container,
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Box,
  Grid,
  Divider,
  Chip,
  Tooltip,
  Alert,
  Snackbar,
  Paper,
  Box,
  Grid,
  Divider,
  Chip,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import PrintIcon from '@mui/icons-material/Print'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import PrintIcon from '@mui/icons-material/Print'
import { jsPDF } from 'jspdf'
import shoppingListImage from './image/shopping-list.jpg'
import { useTheme } from '../Themes/themeContext'

interface ShoppingItem {
  _id: string
  name: string
  quantity: number
  unit: string
  checked: boolean
  category?: string
}

const SmartShoppingList: React.FC = () => {
  const { theme } = useTheme();
  const [listItems, setListItems] = useState<ShoppingItem[]>([])
  const [newItem, setNewItem] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [unit, setUnit] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const units = [
    'kg', 'g', 'lb', 'oz', 'liter', 'ml', 'dozen', 'bunch', 'head', 'loaf',
    'piece', 'cup', 'tablespoon', 'teaspoon', 'can', 'pack', 'box', 'jar',
    'bottle', 'slice', 'packet'
  ]

  const categories = [
    'Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Frozen', 'Beverages',
    'Snacks', 'Household', 'Other'
  ]

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchListItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:8000/recipe/shopping-list');
      console.log('Shopping list response:', response.data); // Debug log
      
      if (response.data && Array.isArray(response.data.shopping_list)) {
        setListItems(response.data.shopping_list);
      } else {
        console.error('Invalid shopping list response format:', response.data);
        setError('Received invalid data format from server');
        showSnackbar('Error: Invalid data format', 'error');
      }
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      setError('Failed to load shopping list. Please try again later.');
      showSnackbar('Error loading shopping list', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListItems();
  }, []);

  const addItemToList = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    
    if (!newItem.trim() || !unit.trim()) {
      showSnackbar('Please fill in all required fields', 'error')
      showSnackbar('Please fill in all required fields', 'error')
      return
    }

    try {
      setIsLoading(true);
      const newItemData = {
        name: newItem,
        quantity,
        unit,
        category,
        category,
        checked: false,
      }

      console.log('Sending item to add:', newItemData); // Debug log
      const response = await axios.post(
        'http://localhost:8000/recipe/shopping-list/update',
        [newItemData]
      )
      console.log('Add item response:', response.data); // Debug log

      if (response.data && Array.isArray(response.data.shopping_list)) {
        setListItems(response.data.shopping_list);
        setNewItem('')
        setQuantity(1)
        setUnit('')
        setCategory('')
        showSnackbar('Item added successfully', 'success')
      } else {
        console.error('Invalid response format:', response.data);
        showSnackbar('Error: Invalid response format', 'error')
      }
    } catch (error) {
      console.error('Error adding item:', error);
      showSnackbar('Error adding item', 'error')
    } finally {
      setIsLoading(false);
    }
  }

  const toggleItemCheck = async (itemId: string) => {
    const itemIndex = listItems.findIndex((item) => item._id === itemId)
    if (itemIndex === -1) return

    const updatedItem = {
      ...listItems[itemIndex],
      checked: !listItems[itemIndex].checked,
    }

    try {
      await axios.put(
        `http://localhost:8000/recipe/shopping-list/${itemId}`,
        updatedItem
      )

      const updatedItems = [...listItems]
      updatedItems[itemIndex] = updatedItem
      setListItems(updatedItems)
    } catch (error) {
      showSnackbar('Error updating item', 'error')
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      await axios.delete(`http://localhost:8000/recipe/shopping-list/${itemId}`)
      setListItems((prevItems) =>
        prevItems.filter((item) => item._id !== itemId)
      )
      showSnackbar('Item deleted successfully', 'success')
      showSnackbar('Item deleted successfully', 'success')
    } catch (error) {
      showSnackbar('Error deleting item', 'error')
      showSnackbar('Error deleting item', 'error')
    }
  }

  const exportListToPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Add header
    doc.setFontSize(24)
    doc.text('Shopping List', pageWidth / 2, 20, { align: 'center' })
    
    // Add date
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' })
    
    // Group items by category
    const itemsByCategory = listItems.reduce((acc, item) => {
      const cat = item.category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, ShoppingItem[]>)

    let yOffset = 50
    Object.entries(itemsByCategory).forEach(([category, items]) => {
      // Add category header
      doc.setFontSize(16)
      doc.text(category, 20, yOffset)
      yOffset += 10

      // Add items
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Add header
    doc.setFontSize(24)
    doc.text('Shopping List', pageWidth / 2, 20, { align: 'center' })
    
    // Add date
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' })
    
    // Group items by category
    const itemsByCategory = listItems.reduce((acc, item) => {
      const cat = item.category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, ShoppingItem[]>)

    let yOffset = 50
    Object.entries(itemsByCategory).forEach(([category, items]) => {
      // Add category header
      doc.setFontSize(16)
      doc.text(category, 20, yOffset)
      yOffset += 10

      // Add items
      doc.setFontSize(12)
      items.forEach((item) => {
        const text = `${item.checked ? '✓' : '☐'} ${item.name} - ${item.quantity} ${item.unit}`
        if (yOffset > 270) {
          doc.addPage()
          yOffset = 20
        }
        doc.text(text, 20, yOffset)
        yOffset += 10
      })
      items.forEach((item) => {
        const text = `${item.checked ? '✓' : '☐'} ${item.name} - ${item.quantity} ${item.unit}`
        if (yOffset > 270) {
          doc.addPage()
          yOffset = 20
        }
        doc.text(text, 20, yOffset)
        yOffset += 10
      })
      yOffset += 10
    })

    doc.save('shopping_list.pdf')
    showSnackbar('Shopping list exported to PDF', 'success')
  }

  const getItemsByCategory = () => {
    return listItems.reduce((acc, item) => {
      const cat = item.category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, ShoppingItem[]>)
    showSnackbar('Shopping list exported to PDF', 'success')
  }

  const getItemsByCategory = () => {
    return listItems.reduce((acc, item) => {
      const cat = item.category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, ShoppingItem[]>)
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: theme.background }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: theme.color }}>
          Shopping List
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box component="form" onSubmit={addItemToList} sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Add a shopping item"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    fullWidth
                    variant="outlined"
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: theme.color },
                        '&:hover fieldset': { borderColor: theme.headerColor },
                        '&.Mui-focused fieldset': { borderColor: theme.color },
                        '& .MuiInputBase-input': { color: theme.color },
                      },
                      '& .MuiInputLabel-root': { color: theme.color },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: theme.color },
                        '&:hover fieldset': { borderColor: theme.headerColor },
                        '&.Mui-focused fieldset': { borderColor: theme.color },
                        '& .MuiInputBase-input': { color: theme.color },
                      },
                      '& .MuiInputLabel-root': { color: theme.color },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Unit</InputLabel>
                    <Select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      label="Unit"
                      sx={{
                        color: theme.color,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.color,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.headerColor,
                        },
                      }}
                    >
                      {units.map((u) => (
                        <MenuItem key={u} value={u}>{u}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      label="Category"
                      sx={{
                        color: theme.color,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.color,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.headerColor,
                        },
                      }}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={<AddIcon />}
                    disabled={isLoading}
                    sx={{
                      backgroundColor: theme.headerColor,
                      color: theme.color,
                      '&:hover': {
                        backgroundColor: theme.background,
                      },
                    }}
                  >
                    Add Item
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: theme.headerColor }}>
                Your Shopping List
              </Typography>
              <Button
                variant="outlined"
                onClick={exportListToPDF}
                startIcon={<PrintIcon />}
                sx={{
                  borderColor: theme.headerColor,
                  color: theme.color,
                  '&:hover': {
                    borderColor: theme.color,
                    backgroundColor: theme.headerColor,
                  },
                }}
              >
                Export to PDF
              </Button>
            </Box>

            <Divider sx={{ mb: 2, borderColor: theme.headerColor }} />

            {listItems.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', color: theme.color }}>
                Your shopping list is empty. Add items to get started!
              </Typography>
            ) : (
              Object.entries(getItemsByCategory()).map(([category, items]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme.headerColor,
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Chip 
                      label={category} 
                      size="small"
                      sx={{ 
                        backgroundColor: theme.headerColor,
                        color: theme.color
                      }}
                    />
                  </Typography>
                  <List>
                    {items.map((item) => (
                      <ListItem
                        key={item._id}
                        sx={{
                          backgroundColor: item.checked ? theme.headerColor : 'transparent',
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': {
                            backgroundColor: theme.headerColor,
                          },
                        }}
                      >
                        <Checkbox
                          checked={item.checked}
                          onChange={() => toggleItemCheck(item._id)}
                          sx={{
                            color: theme.color,
                            '&.Mui-checked': {
                              color: theme.color,
                            },
                          }}
                        />
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                textDecoration: item.checked ? 'line-through' : 'none',
                                color: theme.color,
                              }}
                            >
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ color: theme.color }}>
                              {item.quantity} {item.unit}
                            </Typography>
                          }
                        />
                        <Tooltip title="Delete item">
                          <IconButton
                            onClick={() => deleteItem(item._id)}
                            sx={{ color: theme.color }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))
            )}
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default SmartShoppingList;
