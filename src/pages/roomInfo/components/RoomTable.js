import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  styled,
  tableCellClasses,
} from "@mui/material";

// Table 相關組件: TableContainer, Table, TableHead, TableBody, TableRow, TableCell, tableCellClasses

const StyledHeaderTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}));

const RoomTable = ({ id, price }) => {
  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid #E5E5E5" }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledHeaderTableCell>時段</StyledHeaderTableCell>
              <StyledHeaderTableCell>上午 09:00 - 12:00</StyledHeaderTableCell>
              <StyledHeaderTableCell>下午 13:00 -15:00</StyledHeaderTableCell>
              <StyledHeaderTableCell>晚上 18:00 - 22:00</StyledHeaderTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              sx={{
                "&:last-child td": {
                  borderRight: 1,
                  borderRightColor: "#E5E5E5",
                },
              }}
            >
              <TableCell>場地費用</TableCell>
              <TableCell>{price.morning}元</TableCell>
              <TableCell>{price.afternoon}元</TableCell>
              <TableCell>{price.night}元</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default RoomTable;
