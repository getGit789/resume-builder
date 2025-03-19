import Bull from 'bull';
import { prisma } from './prisma';
import { EventEmitter } from 'events';

// Mock queue implementation for development without Redis
class MockQueue extends EventEmitter {
  private name: string;
  private processors: Record<string, (job: any) => Promise<any>> = {};
  private jobs: any[] = [];
  
  constructor(name: string, options?: any) {
    super();
    this.name = name;
    console.log(`Mock queue "${name}" created`);
  }
  
  process(jobName: string, processor: (job: any) => Promise<any>) {
    this.processors[jobName] = processor;
    return this;
  }
  
  async add(jobName: string, data: any, options?: any) {
    const job = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: jobName,
      data,
      opts: options || {},
      timestamp: Date.now(),
      attemptsMade: 0,
      finished: false,
      result: null,
      error: null
    };
    
    this.jobs.push(job);
    
    // Process the job asynchronously
    setTimeout(async () => {
      try {
        if (this.processors[jobName]) {
          job.result = await this.processors[jobName](job);
          job.finished = true;
          this.emit('completed', job);
        }
      } catch (error: any) {
        job.error = error;
        job.attemptsMade += 1;
        
        if (job.attemptsMade < (job.opts.attempts || 3)) {
          // Retry the job
          setTimeout(() => {
            this.add(jobName, data, options);
          }, 1000);
        } else {
          job.finished = true;
          this.emit('failed', job, error);
        }
      }
    }, 100);
    
    return job;
  }
  
  on(event: string, listener: (...args: any[]) => void) {
    super.on(event, listener);
    return this;
  }
}

// Try to create a real Bull queue, fall back to mock if there's an error
let exportQueue: Bull.Queue | MockQueue;

try {
  // Create queues
  exportQueue = new Bull('resume-exports', {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });
} catch (error) {
  console.warn('Using mock queue due to Redis connection issues');
  exportQueue = new MockQueue('resume-exports');
}

// Process PDF exports
exportQueue.process('process-pdf-export', async (job) => {
  const { resumeId } = job.data;
  
  try {
    // Update export status to processing
    await prisma.export.update({
      where: { id: job.data.exportId },
      data: { status: 'processing' },
    });
    
    // Get resume data
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });
    
    if (!resume) {
      throw new Error('Resume not found');
    }
    
    // Generate PDF (placeholder - will implement actual generation later)
    console.log(`Generating PDF for resume ${resumeId}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update export record
    await prisma.export.update({
      where: { id: job.data.exportId },
      data: {
        status: 'completed',
        url: `https://example.com/exports/${job.data.exportId}.pdf`, // Placeholder URL
      },
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('PDF export error:', error);
    
    // Update export record with error
    await prisma.export.update({
      where: { id: job.data.exportId },
      data: {
        status: 'failed',
        error: error.message || 'Unknown error',
      },
    });
    
    throw error;
  }
});

// Process DOCX exports
exportQueue.process('process-docx-export', async (job) => {
  const { resumeId } = job.data;
  
  try {
    // Update export status to processing
    await prisma.export.update({
      where: { id: job.data.exportId },
      data: { status: 'processing' },
    });
    
    // Get resume data
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });
    
    if (!resume) {
      throw new Error('Resume not found');
    }
    
    // Generate DOCX (placeholder - will implement actual generation later)
    console.log(`Generating DOCX for resume ${resumeId}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update export record
    await prisma.export.update({
      where: { id: job.data.exportId },
      data: {
        status: 'completed',
        url: `https://example.com/exports/${job.data.exportId}.docx`, // Placeholder URL
      },
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('DOCX export error:', error);
    
    // Update export record with error
    await prisma.export.update({
      where: { id: job.data.exportId },
      data: {
        status: 'failed',
        error: error.message || 'Unknown error',
      },
    });
    
    throw error;
  }
});

export { exportQueue }; 