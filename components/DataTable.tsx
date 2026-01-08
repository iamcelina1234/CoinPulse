import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import React from 'react'

const DataTable = <T,>({columns,data,rowKey,tableClassName,headerRowClassName,headerCellClassName,bodyRowClassName,bodyCellClassName,headerClassName}: DataTableProps<T>) => {
  return(
  <Table className={cn('custom-scrollbar',tableClassName)}><TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader className={headerClassName}>
    <TableRow className={cn('hover:bg-transparent!',headerRowClassName)}>
      {columns.map((column,i)=> (
        <TableHead key={i} className={cn('bg-dark-400 text-purple-100 py-4 first:pl-5 last:pr-5')}>

          {column.header}
        </TableHead>
      ))}
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((row,rowIndex)=> (
    <TableRow>
      {columns.map((column,i)=> (
        <TableCell>
          {column.cell(row,rowIndex)}
        </TableCell>
      ))}
    </TableRow>
    ))}
  </TableBody>
</Table>
  );
}

export default DataTable


