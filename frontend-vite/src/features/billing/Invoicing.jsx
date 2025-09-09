import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, TextField,
  IconButton, TablePagination, Tabs, Tab, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, useTheme, useMediaQuery
} from '@mui/material';
import {
  Receipt as InvoiceIcon, Add as AddIcon, Edit as EditIcon, 
  Delete as DeleteIcon, Email as EmailIcon, Payment as PaymentIcon,
  Search as SearchIcon, Clear as ClearIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Sample data
const invoices = [
  { id: 'INV-1001', client: 'Acme Corp', date: '2023-06-15', dueDate: '2023-07-15', amount: 1250.00, status: 'paid' },
  { id: 'INV-1002', client: 'Globex', date: '2023-06-20', dueDate: '2023-07-20', amount: 850.50, status: 'sent' },
  { id: 'INV-1003', client: 'Initech', date: '2023-06-25', dueDate: '2023-07-25', amount: 2100.00, status: 'overdue' },
  { id: 'INV-1004', client: 'Umbrella Corp', date: '2023-07-01', dueDate: '2023-08-01', amount: 1750.75, status: 'draft' },
  { id: 'INV-1005', client: 'Stark Industries', date: '2023-07-05', dueDate: '2023-08-05', amount: 3200.00, status: 'sent' },
];

const Invoicing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || invoice.status === activeTab;
    return matchesSearch && matchesTab;
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  // Handle view invoice
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setOpenDialog(true);
  };

  // Handle delete invoice
  const handleDeleteClick = (invoice) => {
    setSelectedInvoice(invoice);
    setOpenDeleteDialog(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" component="h2">Invoices</Typography>
          <Typography variant="body2" color="text.secondary">Manage and track your invoices</Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          New Invoice
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" value="all" />
          <Tab label="Draft" value="draft" />
          <Tab label="Sent" value="sent" />
          <Tab label="Paid" value="paid" />
          <Tab label="Overdue" value="overdue" />
        </Tabs>
      </Card>

      {/* Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            endAdornment: searchTerm && (
              <IconButton size="small" onClick={() => setSearchTerm('')}>
                <ClearIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />
      </Card>

      {/* Invoices Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((invoice) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>{format(new Date(invoice.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell align="right">
                        ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          color={getStatusColor(invoice.status)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" gap={1} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => handleViewInvoice(invoice)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {invoice.status === 'draft' && (
                            <IconButton size="small" color="info">
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          )}
                          {invoice.status === 'sent' && (
                            <IconButton size="small" color="success">
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteClick(invoice)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Box textAlign="center">
                      <InvoiceIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        No invoices found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredInvoices.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredInvoices.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </Card>

      {/* Invoice Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Invoice {selectedInvoice?.id}</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              <Typography variant="h6" gutterBottom>Invoice Details</Typography>
              <Typography>Client: {selectedInvoice.client}</Typography>
              <Typography>Date: {format(new Date(selectedInvoice.date), 'MMM d, yyyy')}</Typography>
              <Typography>Due Date: {format(new Date(selectedInvoice.dueDate), 'MMM d, yyyy')}</Typography>
              <Typography>Amount: ${selectedInvoice.amount.toFixed(2)}</Typography>
              <Typography>Status: {selectedInvoice.status}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete invoice {selectedInvoice?.id}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => {
              // Handle delete logic here
              setOpenDeleteDialog(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoicing;
