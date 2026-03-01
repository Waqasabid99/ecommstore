import { prisma } from "../config/prisma.js";
import { ensureInvoiceForOrder } from "../services/invoice.service.js";

const getInvoiceByOrderId = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, deletedAt: true },
    });

    if (!order || order.deletedAt) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const isOwner = order.userId === userId;
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to view this invoice",
      });
    }

    const invoice = await ensureInvoiceForOrder(orderId);

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Get invoice by order error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch invoice",
    });
  }
};

const regenerateInvoicePdf = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, deletedAt: true },
    });

    if (!order || order.deletedAt) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const isOwner = order.userId === userId;
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to regenerate this invoice",
      });
    }

    const invoice = await ensureInvoiceForOrder(orderId);

    return res.status(200).json({
      success: true,
      message: "Invoice generated successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Regenerate invoice error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to regenerate invoice",
    });
  }
};

export { getInvoiceByOrderId, regenerateInvoicePdf };
