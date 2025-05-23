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
    padding: 30,
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: "1 solid #e0e0e0",
  },
  logo: {
    width: 60,
    height: 60,
  },
  receiptTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4a4a4a",
  },
  receiptNumber: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoColumn: {
    flexDirection: "column",
  },
  infoLabel: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#555",
  },
  infoValue: {
    marginBottom: 5,
  },
  table: {
    flexDirection: "column",
    marginBottom: 20,
    borderRadius: 5,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4a4a4a",
    color: "#fff",
    padding: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 10,
  },
  tableCol: {
    flex: 1,
  },
  tableCell: {
    fontSize: 10,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    paddingTop: 10,
    borderTop: "1 solid #e0e0e0",
  },
  totalLabel: {
    width: 100,
    textAlign: "right",
    paddingRight: 10,
    fontWeight: "bold",
    color: "#4a4a4a",
  },
  totalValue: {
    width: 100,
    textAlign: "right",
    fontWeight: "bold",
    color: "#4a4a4a",
  },
  footer: {
    marginTop: 30,
    borderTop: "1 solid #e0e0e0",
    paddingTop: 20,
    fontSize: 9,
    color: "#888",
    textAlign: "center",
  },
});

interface ReceiptPDFProps {
  receipt: ReceiptData;
  orgSlug: string;
}

const ReceiptPDF = ({ receipt, orgSlug }: ReceiptPDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.receiptTitle}>Receipt</Text>
            <Text style={styles.receiptNumber}>{receipt.receiptNumber}</Text>
          </View>
          {/* <Image style={styles.logo} src="/api/placeholder/60/60" /> */}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>From:</Text>
            <Text>{orgSlug}</Text>
            <Text>alikhwa@gmail.com</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>To:</Text>
            <Text>{receipt.customerName}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Receipt Date:</Text>
            <Text>{receipt.receiptDate}</Text>
            <Text style={styles.infoLabel}>Payment Method:</Text>
            <Text>{receipt.paymentMethod}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCol, styles.tableCell]}>Item</Text>
            <Text style={[styles.tableCol, styles.tableCell]}>Qty</Text>
            <Text style={[styles.tableCol, styles.tableCell]}>U/M</Text>
            <Text style={[styles.tableCol, styles.tableCell]}>Price</Text>
            <Text style={[styles.tableCol, styles.tableCell]}>Amount</Text>
          </View>
          {receipt.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.tableCell]}>
                {item.product_name}
              </Text>
              <Text style={[styles.tableCol, styles.tableCell]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCol, styles.tableCell]}>
                {item.unitOfMeasure}
              </Text>
              <Text style={[styles.tableCol, styles.tableCell]}>
                ${item.unit_price}
              </Text>
              <Text style={[styles.tableCol, styles.tableCell]}>
                ${parseFloat(item.quantity) * parseFloat(item.unit_price)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Paid:</Text>
          <Text style={styles.totalValue}>${receipt.total}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text>
            This receipt is your proof of purchase. Please retain for your
            records.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPDF;
