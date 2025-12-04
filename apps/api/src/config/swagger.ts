import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Spendly API',
      version: '1.0.0',
      description: 'API documentation for Spendly - Family Budget Management App',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            homeId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Home: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            code: { type: 'string', example: 'X7K2M9' },
            name: { type: 'string' },
            currency: { type: 'string', enum: ['TRY', 'USD', 'EUR'] },
            ownerId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            title: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date-time' },
            categoryId: { type: 'string' },
            assignedCardId: { type: 'string', nullable: true },
            isShared: { type: 'boolean' },
            isRecurring: { type: 'boolean' },
            recurringDay: { type: 'number', nullable: true },
            createdById: { type: 'string' },
            homeId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            icon: { type: 'string' },
            color: { type: 'string' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE', 'BOTH'] },
            isDefault: { type: 'boolean' },
            homeId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreditCard: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            userId: { type: 'string' },
            billingDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Loan: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            userId: { type: 'string' },
            totalAmount: { type: 'number', description: 'Total amount to be paid (principal + interest)' },
            principalAmount: { type: 'number', description: 'Original borrowed amount' },
            monthlyPayment: { type: 'number', description: 'Monthly installment amount' },
            totalInstallments: { type: 'integer', description: 'Total number of installments' },
            paidInstallments: { type: 'integer', description: 'Number of paid installments' },
            startDate: { type: 'string', format: 'date-time', description: 'First payment date' },
            interestRate: { type: 'number', description: 'Annual interest rate' },
            notes: { type: 'string' },
            remainingInstallments: { type: 'integer', description: 'Remaining installments (virtual)' },
            remainingAmount: { type: 'number', description: 'Remaining amount to pay (virtual)' },
            paidAmount: { type: 'number', description: 'Total paid amount (virtual)' },
            progressPercentage: { type: 'integer', description: 'Payment progress percentage (virtual)' },
            endDate: { type: 'string', format: 'date-time', description: 'Last payment date (virtual)' },
            nextPaymentDate: { type: 'string', format: 'date-time', nullable: true, description: 'Next payment date (virtual)' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                home: { $ref: '#/components/schemas/Home' },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
              },
            },
            message: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            name: { type: 'string', minLength: 2 },
            homeName: { type: 'string', description: 'Name for new home' },
            homeCode: { type: 'string', description: 'Code to join existing home', minLength: 6, maxLength: 6 },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        MonthlySummary: {
          type: 'object',
          properties: {
            month: { type: 'number' },
            year: { type: 'number' },
            totalIncome: { type: 'number' },
            totalExpense: { type: 'number' },
            balance: { type: 'number' },
            byCategory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  categoryId: { type: 'string' },
                  categoryName: { type: 'string' },
                  categoryIcon: { type: 'string' },
                  categoryColor: { type: 'string' },
                  total: { type: 'number' },
                  percentage: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
