import { useEffect, useState, useMemo } from "react";
import {
  Box, Button, Container, Typography, Dialog, DialogContent, DialogTitle,
  useMediaQuery, useTheme, Stack, IconButton, Tooltip, TextField, Tabs, Tab, Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import Swal from 'sweetalert2';

// Importamos las funciones de la API
import {
  getPayments,
  generatePayments,
  togglePayment,
  updatePaymentShare,
} from "../api/payment.api";
import { api } from "../api/axios";

import type { Payment, Share, Socio, GeneratePaymentDto } from "../types/payment.types";
import type { User } from "../types/user.types";
import { PaymentGenerateForm } from "../components/payment/PaymentGenerateForm";
import { PaymentTable } from "../components/payment/PaymentTable";

interface Props {
  user: User;
}

export const PaymentsPage = ({ user }: Props) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [shares, setShares] = useState<Share[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(false); 
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const loadData = async () => {
    try {
      const [paymentsData, sharesRes, sociosRes] = await Promise.all([
        getPayments(),
        api.get("/shares"),
        api.get("/socios"),
      ]);

      let filteredPayments = paymentsData;
      if (user.role === "ENTRENADOR") {
        filteredPayments = paymentsData.filter(
          (p: Payment) => p.socioId?.trainerId?.username === user.username
        );
      }

      setPayments(filteredPayments);
      setShares(sharesRes.data);
      setSocios(sociosRes.data);
    } catch (error) {
      Swal.fire('Error', 'No se pudo cargar la información', 'error');
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar pago?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/payments/${id}`);
        loadData();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  const processedPayments = useMemo(() => {
    const filtered = payments.filter((p) => {
      const search = searchTerm.toLowerCase();
      const socioFull = `${p.socioId?.nombre || ''} ${p.socioId?.apellido || ''}`.toLowerCase();
      const matchesSearch = socioFull.includes(search);
      const matchesStatus = statusFilter === "all" ? true : statusFilter === "paid" ? p.isPaid : !p.isPaid;
      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const totalA = (a.year * 12) + a.month;
      const totalB = (b.year * 12) + b.month;
      return sortAsc ? totalA - totalB : totalB - totalA;
    });
  }, [payments, searchTerm, sortAsc, statusFilter]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#1877F2" }}>Gestión de Pagos</Typography>
        <IconButton onClick={() => navigate("/")} color="primary"><HomeIcon /></IconButton>
      </Box>

      <Container maxWidth={false}>
        <Box sx={{ bgcolor: "white", borderRadius: 3, p: 2, boxShadow: 1 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField 
              size="small" 
              placeholder="Buscar socio..." 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <Button variant="contained" onClick={() => setOpen(true)}>Generar Pagos</Button>
          </Stack>

          <Tabs value={statusFilter} onChange={(_, v) => setStatusFilter(v)} sx={{ mb: 2 }}>
            <Tab label="Todos" value="all" />
            <Tab label="Pagados" value="paid" />
            <Tab label="Pendientes" value="unpaid" />
          </Tabs>

          <PaymentTable
            payments={processedPayments}
            shares={shares}
            onToggle={async (id) => {
              await togglePayment(id); // <--- Llama a la API
              loadData(); // <--- Refresca
            }}
            onUpdateShare={async (id, shareId) => {
              await updatePaymentShare(id, shareId); // <--- Llama a la API
              loadData(); // <--- Refresca
            }}
            onDelete={handleDelete}
          />
        </Box>
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Generar Cuotas</DialogTitle>
        <DialogContent>
          <PaymentGenerateForm
            shares={shares}
            socios={socios}
            onGenerate={async (data) => {
              await generatePayments(data);
              setOpen(false);
              loadData();
            }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};