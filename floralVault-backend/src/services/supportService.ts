import prisma from '../prisma/client';

export const supportService = {
  // Support Tickets
  async createTicket(data: {
    subject: string;
    description: string;
    priority: string;
    category: string;
    userId: string;
    attachments?: string[];
  }) {
    return await prisma.supportTicket.create({
      data: {
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        category: data.category,
        userId: data.userId,
        attachments: data.attachments || [],
      },
    });
  },

  async getTickets(userId?: string, status?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    return await prisma.supportTicket.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getTicketById(id: string) {
    return await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },

  async updateTicketStatus(id: string, status: string, assignedTo?: string) {
    const updateData: any = { status };
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo;
    }

    return await prisma.supportTicket.update({
      where: { id },
      data: updateData,
    });
  },

  async addTicketMessage(data: {
    ticketId: string;
    userId: string;
    message: string;
    isStaff?: boolean;
  }) {
    return await prisma.ticketMessage.create({
      data: {
        ticketId: data.ticketId,
        userId: data.userId,
        message: data.message,
        isStaff: data.isStaff || false,
      },
    });
  },

  // User Suggestions
  async createSuggestion(data: {
    title: string;
    description: string;
    category: string;
    userId: string;
  }) {
    return await prisma.userSuggestion.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        userId: data.userId,
      },
    });
  },

  async getSuggestions(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return await prisma.userSuggestion.findMany({
      where,
      orderBy: [{ votes: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async voteSuggestion(id: string, increment: boolean = true) {
    return await prisma.userSuggestion.update({
      where: { id },
      data: {
        votes: {
          increment: increment ? 1 : -1,
        },
      },
    });
  },

  async updateSuggestionStatus(id: string, status: string, adminNotes?: string) {
    return await prisma.userSuggestion.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || undefined,
      },
    });
  },

  // Bug Reports
  async createBugReport(data: {
    title: string;
    description: string;
    stepsToReproduce?: string;
    severity: string;
    userId: string;
    screenshots?: string[];
    browserInfo?: string;
  }) {
    return await prisma.bugReport.create({
      data: {
        title: data.title,
        description: data.description,
        stepsToReproduce: data.stepsToReproduce,
        severity: data.severity,
        userId: data.userId,
        screenshots: data.screenshots || [],
        browserInfo: data.browserInfo,
      },
    });
  },

  async getBugReports(status?: string, severity?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;

    return await prisma.bugReport.findMany({
      where,
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async updateBugReportStatus(id: string, status: string) {
    return await prisma.bugReport.update({
      where: { id },
      data: { status },
    });
  },

  // Admin Stats
  async getAdminStats() {
    const [
      openTickets,
      resolvedTickets,
      pendingSuggestions,
      approvedSuggestions,
      newBugs,
      resolvedBugs,
    ] = await Promise.all([
      prisma.supportTicket.count({ where: { status: 'open' } }),
      prisma.supportTicket.count({ where: { status: 'resolved' } }),
      prisma.userSuggestion.count({ where: { status: 'pending' } }),
      prisma.userSuggestion.count({ where: { status: 'approved' } }),
      prisma.bugReport.count({ where: { status: 'new' } }),
      prisma.bugReport.count({ where: { status: 'resolved' } }),
    ]);

    return {
      tickets: {
        open: openTickets,
        resolved: resolvedTickets,
        total: openTickets + resolvedTickets,
      },
      suggestions: {
        pending: pendingSuggestions,
        approved: approvedSuggestions,
      },
      bugs: {
        new: newBugs,
        resolved: resolvedBugs,
      },
    };
  },
};
