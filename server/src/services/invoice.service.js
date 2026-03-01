import PDFDocument from "pdfkit";
import { prisma } from "../config/prisma.js";
import { uploadBuffer } from "../constants/uploadToCloudinary.js";

const formatMoney = (value, currency = "PKR") => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const statusFromOrder = (order) => {
  if (order.status === "REFUNDED") return "REFUNDED";
  if (order.status === "CANCELLED") return "CANCELLED";

  const isPaidOrderStatus = ["PAID", "SHIPPED", "DELIVERED"].includes(order.status);
  const isPaidPayment = order.payment?.status === "SUCCESS";

  return isPaidOrderStatus || isPaidPayment ? "PAID" : "UNPAID";
};

const generateInvoiceNumber = () => {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${y}${m}${d}-${random}`;
};

const buildAddressLines = (addr = {}) => {
  const lines = [];
  if (addr.fullName) lines.push(addr.fullName);
  if (addr.line1) lines.push(addr.line1);
  if (addr.line2) lines.push(addr.line2);

  const locality = [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", ");
  if (locality) lines.push(locality);
  if (addr.country) lines.push(addr.country);
  if (addr.phone) lines.push(`Phone: ${addr.phone}`);

  return lines;
};

const createInvoicePdfBuffer = ({ invoice, order, currency }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const company = {
      name: process.env.INVOICE_COMPANY_NAME || "Ecomm Store",
      email: process.env.INVOICE_COMPANY_EMAIL || "support@ecommstore.com",
      phone: process.env.INVOICE_COMPANY_PHONE || "+1 000 000 0000",
      address: process.env.INVOICE_COMPANY_ADDRESS || "123 Commerce St, Business City",
      website: process.env.INVOICE_COMPANY_WEBSITE || "www.ecommstore.com",
    };

    const pageWidth = doc.page.width - 100;
    let y = 50;

    doc.fillColor("#111827").fontSize(24).font("Helvetica-Bold").text("INVOICE", 50, y);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#6B7280")
      .text(`Invoice #: ${invoice.invoiceNumber}`, 50, y + 30)
      .text(`Issue Date: ${new Date(invoice.issuedAt).toLocaleDateString("en-US")}`, 50, y + 45)
      .text(`Order ID: ${order.id}`, 50, y + 60);

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text(company.name, 350, y, { width: 190, align: "right" })
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#374151")
      .text(company.address, 350, y + 20, { width: 190, align: "right" })
      .text(company.email, 350, y + 48, { width: 190, align: "right" })
      .text(company.phone, 350, y + 62, { width: 190, align: "right" })
      .text(company.website, 350, y + 76, { width: 190, align: "right" });

    y = 155;
    doc.moveTo(50, y).lineTo(550, y).strokeColor("#E5E7EB").stroke();

    const shippingLines = buildAddressLines(order.shippingAddr);
    const billingLines = buildAddressLines(order.billingAddr);

    y += 20;
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#111827").text("Bill To", 50, y);
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#111827").text("Ship To", 300, y);

    y += 18;
    doc.fontSize(10).font("Helvetica").fillColor("#374151");
    doc.text(billingLines.join("\n"), 50, y, { width: 210 });
    doc.text(shippingLines.join("\n"), 300, y, { width: 210 });

    y = Math.max(doc.y, y + 75) + 24;
    doc.moveTo(50, y).lineTo(550, y).strokeColor("#E5E7EB").stroke();

    y += 12;
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#111827");
    doc.text("Item", 50, y, { width: 220 });
    doc.text("Qty", 290, y, { width: 40, align: "right" });
    doc.text("Unit Price", 340, y, { width: 90, align: "right" });
    doc.text("Total", 450, y, { width: 100, align: "right" });

    y += 16;
    doc.moveTo(50, y).lineTo(550, y).strokeColor("#E5E7EB").stroke();
    y += 10;

    doc.font("Helvetica").fillColor("#374151");
    for (const item of invoice.items) {
      const rowTop = y;
      const lineTotal = Number(item.total || 0);

      doc.text(item.productName, 50, rowTop, { width: 220 });
      doc.text(String(item.quantity), 290, rowTop, { width: 40, align: "right" });
      doc.text(formatMoney(item.price, currency), 340, rowTop, { width: 90, align: "right" });
      doc.text(formatMoney(lineTotal, currency), 450, rowTop, { width: 100, align: "right" });

      y = doc.y + 8;
      if (y > 680) {
        doc.addPage();
        y = 50;
      }
    }

    y += 8;
    doc.moveTo(300, y).lineTo(550, y).strokeColor("#E5E7EB").stroke();
    y += 12;

    const labelX = 300;
    const valueX = 450;
    doc.font("Helvetica").fontSize(10).fillColor("#374151");
    doc.text("Subtotal", labelX, y, { width: 120, align: "right" });
    doc.text(formatMoney(invoice.subtotal, currency), valueX, y, { width: 100, align: "right" });

    y += 16;
    doc.text("Tax", labelX, y, { width: 120, align: "right" });
    doc.text(formatMoney(invoice.tax, currency), valueX, y, { width: 100, align: "right" });

    y += 16;
    doc.text("Shipping", labelX, y, { width: 120, align: "right" });
    doc.text(formatMoney(invoice.shipping, currency), valueX, y, { width: 100, align: "right" });

    y += 18;
    doc.moveTo(300, y).lineTo(550, y).strokeColor("#D1D5DB").stroke();
    y += 10;
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827");
    doc.text("Total", labelX, y, { width: 120, align: "right" });
    doc.text(formatMoney(invoice.total, currency), valueX, y, { width: 100, align: "right" });

    y += 32;
    doc.font("Helvetica").fontSize(10).fillColor("#6B7280");
    doc.text(
      "Thank you for your purchase. Keep this invoice for your records.",
      50,
      y,
      { width: pageWidth, align: "left" }
    );

    doc.end();
  });

const invoiceInclude = {
  items: true,
  order: {
    include: {
      payment: true,
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  },
  user: true,
};

const createInvoiceRecord = async (order) => {
  const invoiceNumber = generateInvoiceNumber();
  const currency = process.env.INVOICE_CURRENCY || "PKR";
  const status = statusFromOrder(order);

  return prisma.invoice.create({
    data: {
      invoiceNumber,
      orderId: order.id,
      userId: order.userId,
      subtotal: order.subtotal,
      tax: order.taxAmount,
      shipping: order.shippingAmount,
      total: order.total,
      currency,
      status,
      items: {
        create: order.items.map((item) => ({
          productName: item.variant?.product?.name || "Product",
          price: item.price,
          quantity: item.quantity,
          total: Number(item.price) * item.quantity,
        })),
      },
    },
    include: invoiceInclude,
  });
};

export const ensureInvoiceForOrder = async (orderId) => {
  const existing = await prisma.invoice.findFirst({
    where: { orderId },
    include: invoiceInclude,
    orderBy: { createdAt: "desc" },
  });

  if (existing?.pdfUrl) {
    return existing;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payment: true,
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
      user: true,
    },
  });

  if (!order || order.deletedAt) {
    throw new Error("ORDER_NOT_FOUND");
  }

  let invoice = existing;
  if (!invoice) {
    // Retry on very rare invoice number collision.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        invoice = await createInvoiceRecord(order);
        break;
      } catch (error) {
        if (attempt === 2) throw error;
      }
    }
  }

  const pdfBuffer = await createInvoicePdfBuffer({
    invoice,
    order,
    currency: invoice.currency || "PKR",
  });

  const uploadResult = await uploadBuffer(pdfBuffer, "invoices", {
    resourceType: "raw",
    publicId: invoice.invoiceNumber,
    format: "pdf",
  });

  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfUrl: uploadResult.secure_url },
    include: invoiceInclude,
  });

  return updated;
};

export const syncInvoiceStatusForOrder = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) return null;

  const invoice = await prisma.invoice.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });

  if (!invoice) return null;

  const nextStatus = statusFromOrder(order);

  if (invoice.status === nextStatus) {
    return invoice;
  }

  return prisma.invoice.update({
    where: { id: invoice.id },
    data: { status: nextStatus },
  });
};
