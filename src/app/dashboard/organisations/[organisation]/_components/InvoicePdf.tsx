import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import Decimal from "decimal.js";
import { InvoiceData } from "@/lib/types";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Roboto",
    fontSize: 10,
    backgroundColor: "#ffffff",
    color: "#2d3748",
  },
  
  // Header section with blue background
  headerSection: {
    backgroundColor: "#2563eb",
    padding: 40,
    color: "white",
  },
  
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  
  companyInfo: {
    flexDirection: "column",
  },
  
  companyName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
  },
  
  companyEmail: {
    fontSize: 12,
    color: "#e2e8f0",
    fontWeight: 300,
  },
  
  invoiceHeader: {
    alignItems: "flex-end",
  },
  
  invoiceTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "white",
  },
  
  invoiceNumber: {
    fontSize: 14,
    fontWeight: "medium",
    marginBottom: 15,
    color: "#e2e8f0",
  },
  
  balanceDueLabel: {
    fontSize: 12,
    fontWeight: "medium",
    marginBottom: 5,
    color: "#e2e8f0",
  },
  
  balanceDueAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fbbf24",
  },

  // Main content area
  contentSection: {
    padding: 40,
  },
  
  // Invoice details section
  detailsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 35,
    paddingBottom: 25,
    borderBottom: "1 solid #e5e7eb",
  },
  
  billToSection: {
    flex: 1,
  },
  
  billToLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  
  customerName: {
    fontSize: 16,
    fontWeight: "medium",
    marginBottom: 5,
    color: "#1f2937",
  },
  
  customerDetails: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  
  invoiceDetailsSection: {
    alignItems: "flex-end",
    minWidth: 200,
  },
  
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  
  detailLabel: {
    fontSize: 11,
    fontWeight: "medium",
    width: 80,
    textAlign: "right",
    marginRight: 15,
    color: "#6b7280",
  },
  
  detailValue: {
    fontSize: 11,
    fontWeight: "medium",
    color: "#1f2937",
  },

  // Table styles
  tableContainer: {
    marginBottom: 30,
    border: "1 solid #e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    padding: 15,
    borderBottom: "1 solid #e5e7eb",
  },
  
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  
  tableRow: {
    flexDirection: "row",
    padding: 15,
    borderBottom: "1 solid #f3f4f6",
  },
  
  tableRowLast: {
    flexDirection: "row",
    padding: 15,
  },
  
  tableCell: {
    fontSize: 11,
    color: "#4b5563",
  },
  
  tableCellBold: {
    fontSize: 11,
    fontWeight: "medium",
    color: "#1f2937",
  },
  
  // Column widths
  colIndex: { width: "8%" },
  colDescription: { width: "40%" },
  colQty: { width: "12%" },
  colUnit: { width: "12%" },
  colRate: { width: "14%" },
  colAmount: { width: "14%", textAlign: "right" },

  // Summary section
  summarySection: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: "2 solid #e5e7eb",
  },
  
  summaryContainer: {
    alignItems: "flex-end",
  },
  
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
    minWidth: 250,
  },
  
  summaryLabel: {
    fontSize: 12,
    fontWeight: "medium",
    width: 120,
    textAlign: "right",
    marginRight: 20,
    color: "#6b7280",
  },
  
  summaryValue: {
    fontSize: 12,
    fontWeight: "medium",
    width: 80,
    textAlign: "right",
    color: "#1f2937",
  },
  
  paymentMadeValue: {
    fontSize: 12,
    fontWeight: "medium",
    width: 80,
    textAlign: "right",
    color: "#dc2626",
  },
  
  finalBalanceRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 12,
    borderTop: "1 solid #e5e7eb",
    marginTop: 8,
    minWidth: 250,
  },
  
  finalBalanceLabel: {
    fontSize: 14,
    fontWeight: "bold",
    width: 120,
    textAlign: "right",
    marginRight: 20,
    color: "#1f2937",
  },
  
  finalBalanceValue: {
    fontSize: 16,
    fontWeight: "bold",
    width: 80,
    textAlign: "right",
    color: "#2563eb",
  },

  // Notes section
  notesSection: {
    marginTop: 40,
    padding: 25,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderLeft: "4 solid #2563eb",
  },
  
  notesLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  
  notesText: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: "1 solid #e5e7eb",
    textAlign: "center",
  },
  
  footerText: {
    fontSize: 9,
    color: "#9ca3af",
  },
});

interface InvoicePDFProps {
  invoice: InvoiceData;
  orgslug: string;
}

const InvoicePDF = ({ invoice, orgslug }: InvoicePDFProps) => {
  const duebalance = new Decimal(invoice.total)
    .minus(invoice.paidAmount)
    .toNumber()
    .toFixed(2);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{orgslug}</Text>
              <Text style={styles.companyEmail}>alikhwa@gmail.com</Text>
            </View>
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
              <Text style={styles.balanceDueLabel}>Balance Due</Text>
              <Text style={styles.balanceDueAmount}>${duebalance}</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          {/* Details Section */}
          <View style={styles.detailsSection}>
            <View style={styles.billToSection}>
              <Text style={styles.billToLabel}>Bill To</Text>
              <Text style={styles.customerName}>{invoice.name}</Text>
              <Text style={styles.customerDetails}>{invoice.email}</Text>
              <Text style={styles.customerDetails}>{invoice.phone}</Text>
            </View>
            
            <View style={styles.invoiceDetailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Invoice Date:</Text>
                <Text style={styles.detailValue}>{formatDate(invoice.invoiceDate)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailValue}>{formatDate(invoice.dueDate)}</Text>
              </View>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colIndex]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>Item & Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnit]}>U/M</Text>
              <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
            </View>
            
            {invoice.items.map((item, index) => {
              const itemTotal = new Decimal(item.quantity)
                .times(item.unit_price)
                .toNumber()
                .toFixed(2);
              const isLast = index === invoice.items.length - 1;
              
              return (
                <View key={index} style={isLast ? styles.tableRowLast : styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colIndex]}>{index + 1}</Text>
                  <Text style={[styles.tableCellBold, styles.colDescription]}>{item.product_name}</Text>
                  <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                  <Text style={[styles.tableCell, styles.colUnit]}>{item.unitOfMeasure}</Text>
                  <Text style={[styles.tableCell, styles.colRate]}>${item.unit_price}</Text>
                  <Text style={[styles.tableCellBold, styles.colAmount]}>${itemTotal}</Text>
                </View>
              );
            })}
          </View>

          {/* Summary Section */}
          <View style={styles.summarySection}>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>${invoice.total}</Text>
              </View>
              
              {invoice.payments && invoice.payments.length > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Payment Made:</Text>
                  <Text style={styles.paymentMadeValue}>-${invoice.paidAmount}</Text>
                </View>
              )}
              
              <View style={styles.finalBalanceRow}>
                <Text style={styles.finalBalanceLabel}>Balance Due:</Text>
                <Text style={styles.finalBalanceValue}>${duebalance}</Text>
              </View>
            </View>
          </View>

          {/* Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>
              Thank you for your business! We appreciate your prompt payment. 
              If you have any questions about this invoice, please contact us.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This invoice was generated automatically. Please retain for your records.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
