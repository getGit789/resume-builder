import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a mock implementation for development without a real database
class MockPrismaClient {
  private mockData = {
    resumes: [] as any[],
    exports: [] as any[],
    users: [] as any[]
  };

  resume = {
    findMany: async () => this.mockData.resumes,
    findUnique: async ({ where }: any) => this.mockData.resumes.find(r => r.id === where.id),
    findFirst: async ({ where }: any) => {
      if (where.AND) {
        return this.mockData.resumes.find(r => 
          where.AND.every((condition: any) => 
            Object.entries(condition).every(([key, value]) => r[key] === value)
          )
        );
      }
      return this.mockData.resumes[0];
    },
    create: async ({ data }: any) => {
      const newResume = {
        id: `mock-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      this.mockData.resumes.push(newResume);
      return newResume;
    },
    update: async ({ where, data }: any) => {
      const index = this.mockData.resumes.findIndex(r => r.id === where.id);
      if (index === -1) throw new Error('Resume not found');
      
      this.mockData.resumes[index] = {
        ...this.mockData.resumes[index],
        ...data,
        updatedAt: new Date()
      };
      return this.mockData.resumes[index];
    },
    delete: async ({ where }: any) => {
      const index = this.mockData.resumes.findIndex(r => r.id === where.id);
      if (index === -1) throw new Error('Resume not found');
      
      const deleted = this.mockData.resumes[index];
      this.mockData.resumes.splice(index, 1);
      return deleted;
    }
  };

  export = {
    findMany: async () => this.mockData.exports,
    findUnique: async ({ where }: any) => this.mockData.exports.find(e => e.id === where.id),
    findFirst: async ({ where }: any) => {
      if (where.AND) {
        return this.mockData.exports.find(e => 
          where.AND.every((condition: any) => 
            Object.entries(condition).every(([key, value]) => e[key] === value)
          )
        );
      }
      return this.mockData.exports[0];
    },
    create: async ({ data }: any) => {
      const newExport = {
        id: `mock-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
        ...data
      };
      this.mockData.exports.push(newExport);
      return newExport;
    },
    update: async ({ where, data }: any) => {
      const index = this.mockData.exports.findIndex(e => e.id === where.id);
      if (index === -1) throw new Error('Export not found');
      
      this.mockData.exports[index] = {
        ...this.mockData.exports[index],
        ...data,
        updatedAt: new Date()
      };
      return this.mockData.exports[index];
    },
    delete: async ({ where }: any) => {
      const index = this.mockData.exports.findIndex(e => e.id === where.id);
      if (index === -1) throw new Error('Export not found');
      
      const deleted = this.mockData.exports[index];
      this.mockData.exports.splice(index, 1);
      return deleted;
    }
  };

  user = {
    findMany: async () => this.mockData.users,
    findUnique: async ({ where }: any) => {
      if (where.id) {
        return this.mockData.users.find(u => u.id === where.id);
      }
      if (where.email) {
        return this.mockData.users.find(u => u.email === where.email);
      }
      return null;
    },
    findFirst: async ({ where }: any) => {
      if (where.AND) {
        return this.mockData.users.find(u => 
          where.AND.every((condition: any) => 
            Object.entries(condition).every(([key, value]) => u[key] === value)
          )
        );
      }
      return this.mockData.users[0];
    },
    create: async ({ data, select }: any) => {
      const newUser = {
        id: `mock-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      this.mockData.users.push(newUser);
      
      // Handle select if provided
      if (select) {
        const selectedFields: any = {};
        Object.keys(select).forEach(key => {
          if (select[key] && newUser[key] !== undefined) {
            selectedFields[key] = newUser[key];
          }
        });
        return selectedFields;
      }
      
      return newUser;
    },
    update: async ({ where, data }: any) => {
      const index = this.mockData.users.findIndex(u => u.id === where.id);
      if (index === -1) throw new Error('User not found');
      
      this.mockData.users[index] = {
        ...this.mockData.users[index],
        ...data,
        updatedAt: new Date()
      };
      return this.mockData.users[index];
    }
  };
}

// Try to use real Prisma client, fall back to mock if there's an error
let prismaInstance: PrismaClient | MockPrismaClient;

try {
  prismaInstance = global.prisma || new PrismaClient();
  
  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prismaInstance as PrismaClient;
  }
} catch (error) {
  console.warn('Using mock Prisma client due to database connection issues');
  prismaInstance = new MockPrismaClient();
}

export const prisma = prismaInstance; 