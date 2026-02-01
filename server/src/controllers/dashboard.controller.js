import { prisma } from "../config/prisma.js";
import Decimal from "decimal.js";

// Helper: Get date ranges
const getDateRanges = (period = "30d") => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case "24h":
      start.setDate(now.getDate() - 1);
      break;
    case "7d":
      start.setDate(now.getDate() - 7);
      break;
    case "30d":
      start.setDate(now.getDate() - 30);
      break;
    case "90d":
      start.setDate(now.getDate() - 90);
      break;
    case "1y":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }
  
  return { start, end: now };
};

// Helper: Format currency
const formatCurrency = (value) => new Decimal(value).toFixed(2);

/**
 * Get main dashboard statistics (KPI cards)
 * GET /api/admin/dashboard/stats
 */
const getStatsOverview = async (req, res) => {
  const { period = "30d" } = req.query;
  const { start, end } = getDateRanges(period);
  
  try {
    const stats = await prisma.$transaction(async (tx) => {
      // 1. Revenue (completed orders only)
      const revenueStats = await tx.order.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
          deletedAt: null,
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      });

      // 2. Compare with previous period
      const prevPeriodStart = new Date(start);
      prevPeriodStart.setTime(start.getTime() - (end.getTime() - start.getTime()));
      
      const prevRevenueStats = await tx.order.aggregate({
        where: {
          createdAt: { gte: prevPeriodStart, lt: start },
          status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
          deletedAt: null,
        },
        _sum: { totalAmount: true },
      });

      // 3. Total customers (unique users who placed orders in period)
      const customerStats = await tx.order.groupBy({
        by: ["userId"],
        where: {
          createdAt: { gte: start, lte: end },
          deletedAt: null,
        },
        _count: { userId: true },
      });
      
      const newCustomers = await tx.user.count({
        where: {
          createdAt: { gte: start, lte: end },
          deletedAt: null,
        },
      });

      // 4. Total products sold
      const productsSold = await tx.orderItem.aggregate({
        where: {
          order: {
            createdAt: { gte: start, lte: end },
            status: { notIn: ["CANCELLED"] },
            deletedAt: null,
          },
        },
        _sum: { quantity: true },
      });

      // 5. Pending orders (current, not time-bound)
      const pendingOrders = await tx.order.count({
        where: {
          status: { in: ["PENDING", "AWAITING_PAYMENT"] },
          deletedAt: null,
        },
      });

      // 6. Inventory alerts
      const lowStockCount = await tx.inventory.count({
        where: {
          quantity: { lte: 10, gt: 0 },
        },
      });
      
      const outOfStockCount = await tx.inventory.count({
        where: {
          quantity: 0,
        },
      });

      // Calculate trend percentages
      const currentRevenue = new Decimal(revenueStats._sum.totalAmount || 0);
      const prevRevenue = new Decimal(prevRevenueStats._sum.totalAmount || 0);
      const revenueTrend = prevRevenue.isZero() 
        ? 100 
        : currentRevenue.minus(prevRevenue).dividedBy(prevRevenue).times(100).toFixed(1);

      return {
        revenue: {
          total: formatCurrency(currentRevenue),
          trend: Number(revenueTrend),
          orderCount: revenueStats._count.id,
        },
        customers: {
          active: customerStats.length,
          new: newCustomers,
          totalUsers: customerStats.reduce((sum, s) => sum + s._count.userId, 0),
        },
        products: {
          sold: productsSold._sum.quantity || 0,
        },
        orders: {
          pending: pendingOrders,
          completed: revenueStats._count.id,
          totalOrders: customerStats.reduce((sum, s) => sum + s._count.userId, 0),
        },
        inventory: {
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          total: lowStockCount + outOfStockCount,
        },
      };
    });

    return res.status(200).json({
      success: true,
      data: stats,
      period,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard statistics",
    });
  }
};

/**
 * Get sales chart data (daily/weekly aggregation)
 * GET /api/admin/dashboard/sales-chart
 */
const getSalesAnalytics = async (req, res) => {
  const { period = "30d", groupBy = "day" } = req.query;
  const { start, end } = getDateRanges(period);
  
  try {
    // For raw data, we fetch orders in range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        deletedAt: null,
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Aggregate data based on groupBy
    const chartData = [];
    const formatDate = (date) => {
      if (groupBy === "month") {
        return date.toISOString().slice(0, 7); // YYYY-MM
      }
      return date.toISOString().split("T")[0]; // YYYY-MM-DD
    };

    const grouped = orders.reduce((acc, order) => {
      const key = formatDate(order.createdAt);
      if (!acc[key]) {
        acc[key] = { date: key, revenue: new Decimal(0), orders: 0 };
      }
      acc[key].revenue = acc[key].revenue.plus(order.totalAmount);
      acc[key].orders += 1;
      return acc;
    }, {});

    // Fill missing dates with zeros
    const current = new Date(start);
    const endDate = new Date(end);
    
    while (current <= endDate) {
      const key = formatDate(current);
      if (grouped[key]) {
        chartData.push({
          date: key,
          revenue: formatCurrency(grouped[key].revenue),
          orders: grouped[key].orders,
        });
      } else {
        chartData.push({
          date: key,
          revenue: "0.00",
          orders: 0,
        });
      }
      
      if (groupBy === "month") {
        current.setMonth(current.getMonth() + 1);
      } else {
        current.setDate(current.getDate() + 1);
      }
    }

    return res.status(200).json({
      success: true,
      data: chartData,
      period,
      groupBy,
    });
  } catch (error) {
    console.error("Sales analytics error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch sales analytics",
    });
  }
};

/**
 * Get recent activity feed
 * GET /api/admin/dashboard/recent-activity
 */
const getRecentActivity = async (req, res) => {
  const { limit = 10 } = req.query;
  
  try {
    const [recentOrders, topProducts, recentUsers] = await prisma.$transaction([
      // Recent orders with user info
      prisma.order.findMany({
        where: { deletedAt: null },
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              userName: true,
              email: true,
            },
          },
          items: {
            take: 1,
            select: {
              quantity: true,
              variant: {
                select: {
                  product: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      }),
      
      // Top selling products
      prisma.orderItem.groupBy({
        by: ["variantId"],
        where: {
          order: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            status: { notIn: ["CANCELLED"] },
          },
        },
        _sum: { quantity: true },
        _count: { orderId: true },
        take: 5,
        orderBy: { _sum: { quantity: "desc" } },
      }),
      
      // Recent new users
      prisma.user.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userName: true,
          email: true,
          createdAt: true,
          role: true,
        },
      }),
    ]);

    // Enrich top products with details
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: {
              select: { name: true, images: { where: { isMain: true }, take: 1 } },
            },
          },
        });
        
        return {
          variantId: item.variantId,
          productName: variant?.product?.name || "Unknown Product",
          image: variant?.product?.images[0]?.url || null,
          quantitySold: item._sum.quantity,
          orderCount: item._count.orderId,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          customer: order.user?.userName || "Guest",
          email: order.user?.email,
          total: formatCurrency(order.totalAmount),
          status: order.status,
          itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
          createdAt: order.createdAt,
        })),
        topProducts: topProductsWithDetails,
        recentUsers: recentUsers.map(user => ({
          id: user.id,
          name: user.userName,
          email: user.email,
          role: user.role,
          joinedAt: user.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Recent activity error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch recent activity",
    });
  }
};

/**
 * Get inventory alerts dashboard
 * GET /api/admin/dashboard/inventory-alerts
 */
const getInventoryAlerts = async (req, res) => {
  const { type = "all", page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
  try {
    const where = {};
    
    if (type === "low") {
      where.quantity = { lte: 10, gt: 0 };
    } else if (type === "out") {
      where.quantity = 0;
    } else {
      where.OR = [
        { quantity: { lte: 10, gt: 0 } },
        { quantity: 0 },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: { where: { isMain: true }, take: 1 },
                },
              },
            },
          },
        },
        orderBy: { quantity: "asc" },
        skip: Number(skip),
        take: Number(limit),
      }),
      prisma.inventory.count({ where }),
    ]);

    const formatted = items.map(item => ({
      variantId: item.variantId,
      sku: item.variant.sku,
      productId: item.variant.product.id,
      productName: item.variant.product.name,
      image: item.variant.product.images[0]?.url || null,
      quantity: item.quantity,
      reserved: item.reserved,
      available: item.quantity - item.reserved,
      alertType: item.quantity === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      summary: {
        total,
        lowStock: await prisma.inventory.count({ where: { quantity: { lte: 10, gt: 0 } } }),
        outOfStock: await prisma.inventory.count({ where: { quantity: 0 } }),
      },
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Inventory alerts error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch inventory alerts",
    });
  }
};

/**
 * Get order status distribution for pie charts
 * GET /api/admin/dashboard/order-status
 */
const getOrderStatusDistribution = async (req, res) => {
  const { period = "30d" } = req.query;
  const { start, end } = getDateRanges(period);
  
  try {
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: start, lte: end },
        deletedAt: null,
      },
      _count: { status: true },
      _sum: { totalAmount: true },
    });

    const total = statusCounts.reduce((sum, s) => sum + s._count.status, 0);
    
    const distribution = statusCounts.map(item => ({
      status: item.status,
      count: item._count.status,
      percentage: total > 0 ? ((item._count.status / total) * 100).toFixed(1) : 0,
      revenue: formatCurrency(item._sum.totalAmount || 0),
    }));

    return res.status(200).json({
      success: true,
      data: {
        distribution,
        total,
        period,
      },
    });
  } catch (error) {
    console.error("Order status distribution error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch order status distribution",
    });
  }
};

/**
 * Get detailed analytics with comparisons
 * GET /api/admin/dashboard/detailed-analytics
 */
const getDetailedAnalytics = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      error: "Start date and end date are required",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  try {
    const analytics = await prisma.$transaction([
      // Revenue by category
      prisma.orderItem.groupBy({
        by: ["variantId"],
        where: {
          order: {
            createdAt: { gte: start, lte: end },
            status: { notIn: ["CANCELLED"] },
          },
        },
        _sum: {
          quantity: true,
          price: true,
        },
      }),
      
      // Payment method distribution
      prisma.payment.groupBy({
        by: ["provider"],
        where: {
          createdAt: { gte: start, lte: end },
        },
        _count: { id: true },
        _sum: { amount: true },
      }),
      
      // Coupon usage
      prisma.coupon.count({
        where: {
          usedCount: { gt: 0 },
        },
      }),
      
      // Average order value
      prisma.order.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          status: { notIn: ["CANCELLED"] },
        },
        _avg: { totalAmount: true },
        _count: { id: true },
      }),
    ]);

    // Process category revenue (requires additional fetch for category info)
    const categoryRevenues = {};
    for (const item of analytics[0]) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: {
            select: { category: { select: { name: true } } },
          },
        },
      });
      
      const categoryName = variant?.product?.category?.name || "Uncategorized";
      if (!categoryRevenues[categoryName]) {
        categoryRevenues[categoryName] = new Decimal(0);
      }
      categoryRevenues[categoryName] = categoryRevenues[categoryName].plus(
        new Decimal(item._sum.price || 0).times(item._sum.quantity || 0)
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        categoryBreakdown: Object.entries(categoryRevenues).map(([name, revenue]) => ({
          category: name,
          revenue: formatCurrency(revenue),
        })),
        paymentMethods: analytics[1].map(pm => ({
          provider: pm.provider,
          count: pm._count.id,
          revenue: formatCurrency(pm._sum.amount),
        })),
        couponStats: {
          totalUsed: analytics[2],
        },
        averageOrderValue: formatCurrency(analytics[3]._avg.totalAmount || 0),
        totalOrders: analytics[3]._count.id,
      },
      dateRange: { start, end },
    });
  } catch (error) {
    console.error("Detailed analytics error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch detailed analytics",
    });
  }
};

export {
  getStatsOverview,
  getSalesAnalytics,
  getRecentActivity,
  getInventoryAlerts,
  getOrderStatusDistribution,
  getDetailedAnalytics,
};