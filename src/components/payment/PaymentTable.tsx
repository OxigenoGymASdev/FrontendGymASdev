import {
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import { useState, useMemo } from "react";
import { Edit, Delete } from "@mui/icons-material";
import type { Payment, Share } from "../../types/payment.types";

const MONTHS = [
  "",
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const formatDate = (date: any) => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("es-AR", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

interface Props {
  payments: Payment[];
  shares: Share[];
  onToggle: (id: string) => void;
  onUpdateShare: (id: string, shareId: string) => void;
  onDelete: (id: string) => void;
}

export const PaymentTable = ({
  payments,
  shares,
  onToggle,
  onUpdateShare,
  onDelete,
}: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedShares = useMemo(() => {
    return [...shares].sort((a, b) => 
      new Date(b.quoteDate).getTime() - new Date(a.quoteDate).getTime()
    );
  }, [shares]);

  return (
    <Paper elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.05)" }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8f9fa" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Socio</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Entrenador</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Cuota / Monto</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Año</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Mes</TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="center">Pagado</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Fecha Pago</TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {payments.map((p) => (
            <TableRow key={p._id} hover sx={{ bgcolor: p.isPaid ? "rgba(76, 175, 80, 0.02)" : "inherit" }}>
              <TableCell sx={{ fontWeight: 600 }}>
                {p.socioId ? `${p.socioId.apellido}, ${p.socioId.nombre}` : "Sin socio"}
              </TableCell>

              <TableCell>{p.socioId?.trainerId?.username ?? "-"}</TableCell>

              <TableCell>
                {editingId === p._id ? (
                  <Select
                    size="small"
                    value={p.shareId?._id ?? ""}
                    onChange={(e) => {
                      onUpdateShare(p._id, e.target.value as string);
                      setEditingId(null);
                    }}
                    onBlur={() => setEditingId(null)}
                    autoFocus
                    sx={{ minWidth: 150 }}
                  >
                    {sortedShares.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        ${s.amount} - {s.numberDays}d
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      ${p.shareId?.amount ?? 0}
                    </Typography>
                    {/* Solo permitimos editar si NO está pagado */}
                    {!p.isPaid && (
                      <IconButton size="small" onClick={() => setEditingId(p._id)} sx={{ color: '#1877F2' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                )}
              </TableCell>

              <TableCell>{p.year}</TableCell>
              <TableCell>{MONTHS[p.month]}</TableCell>

              <TableCell align="center">
                <Checkbox
                  checked={p.isPaid}
                  onChange={() => onToggle(p._id)}
                  color="primary"
                />
              </TableCell>

              <TableCell>
                <Typography variant="body2" sx={{ color: p.isPaid ? "#2e7d32" : "text.disabled", fontWeight: p.isPaid ? 600 : 400 }}>
                  {p.isPaid ? formatDate(p.paymentDate) : "Pendiente"}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <IconButton color="error" onClick={() => onDelete(p._id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};