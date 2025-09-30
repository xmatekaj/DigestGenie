// jobs/processor.ts - Background job processor
import { PrismaClient } from '@prisma/client'
import { EmailProcessor } from '../lib/email-processor'

const prisma = new PrismaClient()

async function processJobs() {
  console.log('Starting job processor...')
  
  while (true) {
    try {
      // Get pending jobs
      const jobs = await prisma.processingJob.findMany({
        where: {
          status: 'pending',
          attempts: { lt: 3 }
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5
      })

      for (const job of jobs) {
        console.log(`Processing job ${job.id} (${job.jobType})`)
        
        try {
          // Mark as processing
          await prisma.processingJob.update({
            where: { id: job.id },
            data: {
              status: 'processing',
              startedAt: new Date(),
              attempts: { increment: 1 }
            }
          })

          // Process based on job type
          switch (job.jobType) {
            case 'email_processing':
              // TODO
              //await EmailProcessor.processEmail(job.payload.rawEmailId)
              break
            
            case 'thumbnail_generation':
              // Handle thumbnail generation
              break
            
            default:
              throw new Error(`Unknown job type: ${job.jobType}`)
          }

          // Mark as completed
          await prisma.processingJob.update({
            where: { id: job.id },
            data: {
              status: 'completed',
              // TODO
              //completedAt: new Date()
            }
          })

          console.log(`Job ${job.id} completed successfully`)

        } catch (error) {
          console.error(`Job ${job.id} failed:`, error)
          
          // Mark as failed or retry
          const shouldRetry = job.attempts < 2
          await prisma.processingJob.update({
            where: { id: job.id },
            data: {
              status: shouldRetry ? 'pending' : 'failed',
              // TODO
              // errorMessage: error.message,
              // ...(shouldRetry && { 
              //   scheduledAt: new Date(Date.now() + 5 * 60 * 1000) // Retry in 5 minutes
              // })
            }
          })
        }
      }

      // Clean up old completed jobs
      await prisma.processingJob.deleteMany({
        where: {
          status: 'completed',
          // TODO
          // completedAt: {
          //   lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days old
          // }
        }
      })

      // Sleep for 30 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 30000))
      
    } catch (error) {
      console.error('Job processor error:', error)
      await new Promise(resolve => setTimeout(resolve, 60000)) // Wait 1 minute on error
    }
  }
}

processJobs().catch(console.error)