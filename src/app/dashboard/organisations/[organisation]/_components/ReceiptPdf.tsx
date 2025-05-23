import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { ReceiptData } from "../receipts/[id]/page";

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
  
  // Header section with green background for receipts
  headerSection: {
    backgroundColor: "#059669",
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
    color: "#d1fae5",
    fontWeight: 300,
  },
  
  receiptHeader: {
    alignItems: "flex-end",
  },
  
  receiptTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "white",
  },
  
  receiptNumber: {
    fontSize: 14,
    fontWeight: "medium",
    marginBottom: 15,
    color: "#d1fae5",
  },
  
  totalPaidLabel: {
    fontSize: 12,
    fontWeight: "medium",
    marginBottom: 5,
    color: "#d1fae5",
  },
  
  totalPaidAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fbbf24",
  },

  // Main content area
  contentSection: {
    padding: 40,
  },
  
  // Receipt details section
  detailsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 35,
    paddingBottom: 25,
    borderBottom: "1 solid #e5e7eb",
  },
  
  fromSection: {
    flex: 1,
    marginRight: 30,
  },
  
  toSection: {
    flex: 1,
    marginRight: 30,
  },
  
  receiptDetailsSection: {
    flex: 1,
  },
  
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  
  organizationName: {
    fontSize: 16,
    fontWeight: "medium",
    marginBottom: 5,
    color: "#1f2937",
  },
  
  customerName: {
    fontSize: 16,
    fontWeight: "medium",
    marginBottom: 5,
    color: "#1f2937",
  },
  
  contactDetails: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  
  detailLabel: {
    fontSize: 11,
    fontWeight: "medium",
    width: 100,
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
  colItem: { width: "35%" },
  colQty: { width: "15%" },
  colUnit: { width: "15%" },
  colPrice: { width: "17.5%" },
  colAmount: { width: "17.5%", textAlign: "right" },

  // Total section
  totalSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: "2 solid #e5e7eb",
    alignItems: "flex-end",
  },
  
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 12,
    minWidth: 250,
  },
  
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    width: 120,
    textAlign: "right",
    marginRight: 20,
    color: "#1f2937",
  },
  
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    width: 80,
    textAlign: "right",
    color: "#059669",
  },

  // Thank you section
  thankYouSection: {
    marginTop: 40,
    padding: 25,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    borderLeft: "4 solid #059669",
    textAlign: "center",
  },
  
  thankYouText: {
    fontSize: 14,
    fontWeight: "medium",
    marginBottom: 8,
    color: "#166534",
  },
  
  receiptNote: {
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

interface ReceiptPDFProps {
  receipt: ReceiptData;
  orgSlug: string;
}

const ReceiptPDF = ({ receipt, orgSlug }: ReceiptPDFProps) => {
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
              <Text style={styles.companyName}>{orgSlug}</Text>
              <Text style={styles.companyEmail}>alikhwa@gmail.com</Text>
            </View>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>RECEIPT</Text>
              <Text style={styles.receiptNumber}>{receipt.receiptNumber}</Text>
              <Text style={styles.totalPaidLabel}>Total Paid</Text>
              <Text style={styles.totalPaidAmount}>${receipt.total}</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          {/* Details Section */}
          <View style={styles.detailsSection}>
            <View style={styles.fromSection}>
              <Text style={styles.sectionLabel}>From</Text>
              <Text style={styles.organizationName}>{orgSlug}</Text>
              <Text style={styles.contactDetails}>alikhwa@gmail.com</Text>
            </View>
            
            <View style={styles.toSection}>
              <Text style={styles.sectionLabel}>To</Text>
              <Text style={styles.customerName}>{receipt.customerName}</Text>
            </View>
            
            <View style={styles.receiptDetailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Receipt Date:</Text>
                <Text style={styles.detailValue}>{formatDate(receipt.receiptDate)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method:</Text>
                <Text style={styles.detailValue}>{receipt.paymentMethod}</Text>
              </View>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colItem]}>Item</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnit]}>U/M</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
            </View>
            
            {receipt.items.map((item, index) => {
              const itemTotal = (parseFloat(item.quantity) * parseFloat(item.unit_price)).toFixed(2);
              const isLast = index === receipt.items.length - 1;
              
              return (
                <View key={index} style={isLast ? styles.tableRowLast : styles.tableRow}>
                  <Text style={[styles.tableCellBold, styles.colItem]}>{item.product_name}</Text>
                  <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                  <Text style={[styles.tableCell, styles.colUnit]}>{item.unitOfMeasure}</Text>
                  <Text style={[styles.tableCell, styles.colPrice]}>${item.unit_price}</Text>
                  <Text style={[styles.tableCellBold, styles.colAmount]}>${itemTotal}</Text>
                </View>
              );
            })}
          </View>

          {/* Total Section */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid:</Text>
              <Text style={styles.totalValue}>${receipt.total}</Text>
            </View>
          </View>

          {/* Thank You Section */}
          <View style={styles.thankYouSection}>
            <Text style={styles.thankYouText}>Thank you for your business!</Text>
            <Text style={styles.receiptNote}>
              This receipt is your proof of purchase. Please retain for your records.
              If you have any questions, please don't hesitate to contact us.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This receipt was generated automatically on {formatDate(receipt.receiptDate)}.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPDF;
